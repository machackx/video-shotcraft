"""企悦宣传片 SFX 生成器（确定性合成，固定随机种子）。

为什么不是 Freesound：本片制作环境访问 freesound.org / apiv2 / cdn.freesound.org 均被站点返回 HTTP 403
（2026-11-05 实测，代理 CONNECT 正常、由目标站拒绝），按 references/sfx-sourcing.md 不绕过、不改用旧库。
因此 SFX 用本脚本从噪声 / 正弦 / 非谐分音合成为原创素材（无第三方许可约束），音色按电影系词汇设计
（whoosh / riser / impact / shimmer / 真实物件拟音），避开游戏音包式的合成提示音（aesthetic-rules S1）。
每条声音在 audio-manifest.json 里附 Freesound 检索词，网络可用时可按 sfx-sourcing.md 换成实录素材。

用法：python3 scripts/make-sfx.py   →  public/audio/sfx/*.wav（48 kHz / 16-bit / 单声道）
依赖：numpy、scipy、soundfile
"""
import hashlib
import json
import pathlib

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, stft, istft

SR = 48000
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'audio' / 'sfx'
OUT.mkdir(parents=True, exist_ok=True)


def rng(seed):
    return np.random.default_rng(seed)


def tvec(dur):
    return np.arange(int(dur * SR)) / SR


def bp(x, lo, hi, order=4):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)


def lp(x, f, order=4):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f, order=4):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


def norm(x, peak_db=-1.0):
    m = np.max(np.abs(x)) or 1.0
    return x / m * (10 ** (peak_db / 20))


def fade(x, fin=0.003, fout=0.02):
    n = len(x)
    a, b = int(fin * SR), int(fout * SR)
    if a:
        x[:a] *= np.linspace(0, 1, a)
    if b:
        x[n - b:] *= np.linspace(1, 0, b)
    return x


def reverb(x, mix=0.25, decay=0.45, seed=7):
    """小房间 Schroeder：4 梳状 + 2 全通，给 impact / 拟音一点空间尾音。"""
    y = np.zeros(len(x) + int(SR * 1.2))
    y[: len(x)] = x
    out = np.zeros_like(y)
    for d_ms, g in [(29.7, decay), (37.1, decay * 0.95), (41.1, decay * 0.9), (43.7, decay * 0.85)]:
        d = int(SR * d_ms / 1000)
        buf = np.copy(y)
        for i in range(d, len(buf)):
            buf[i] += g * buf[i - d]
        out += buf
    for d_ms, g in [(5.0, 0.7), (1.7, 0.7)]:
        d = int(SR * d_ms / 1000)
        z = np.zeros_like(out)
        for i in range(len(out)):
            xin = out[i]
            z[i] = -g * xin + (out[i - d] if i >= d else 0) + g * (z[i - d] if i >= d else 0)
        out = z
    out = out / (np.max(np.abs(out)) or 1) * np.max(np.abs(x))
    return (1 - mix) * y + mix * out


def moving_band_noise(dur, centers, width_oct, seed):
    """噪声经随时间移动的对数高斯带通（STFT 掩膜），centers = 关键帧中心频率列表（等分时间）。"""
    n = rng(seed).standard_normal(int(dur * SR))
    f, tt, Z = stft(n, fs=SR, nperseg=1024, noverlap=768)
    ks = np.linspace(0, 1, len(centers))
    c = np.exp(np.interp(np.linspace(0, 1, len(tt)), ks, np.log(centers)))
    lf = np.log2(np.maximum(f, 1))[:, None]
    mask = np.exp(-0.5 * ((lf - np.log2(c)[None, :]) / width_oct) ** 2)
    _, y = istft(Z * mask, fs=SR, nperseg=1024, noverlap=768)
    return y[: int(dur * SR)]


def env_peak(dur, peak_at, a_pow=2.2, d_pow=1.6):
    t = np.linspace(0, 1, int(dur * SR))
    up = np.clip(t / peak_at, 0, 1) ** a_pow
    down = np.clip((1 - t) / (1 - peak_at), 0, 1) ** d_pow
    return np.where(t < peak_at, up, down)


SOUNDS = {}


def sound(name, desc, queries):
    def deco(fn):
        SOUNDS[name] = (fn, desc, queries)
        return fn
    return deco


@sound('whoosh-soft', '柔和空气 whoosh（运镜 / 手机升起 / 构件炸开）', ['soft air whoosh', 'gentle swish transition'])
def whoosh_soft():
    d = 0.9
    x = moving_band_noise(d, [350, 1100, 1900, 700], 0.55, 11) * env_peak(d, 0.55)
    return fade(norm(lp(x, 6000), -3))


@sound('whoosh-fast', '短促 whoosh（白闪盖切 / 字标退场）', ['fast short whoosh', 'quick swoosh cinematic'])
def whoosh_fast():
    d = 0.5
    x = moving_band_noise(d, [600, 2600, 4200, 1300], 0.5, 12) * env_peak(d, 0.48, 2.6, 2.0)
    return fade(norm(x, -2))


@sound('swell-soft', '低调空气起伏（品牌落定 / 段落切入）', ['soft cinematic swell', 'airy transition pad'])
def swell_soft():
    d = 1.3
    t = tvec(d)
    x = lp(rng(13).standard_normal(len(t)), 1400) * env_peak(d, 0.55, 1.8, 1.4)
    pad = (np.sin(2 * np.pi * 220 * t) + 0.6 * np.sin(2 * np.pi * 330 * t) + 0.35 * np.sin(2 * np.pi * 440 * t)) * env_peak(d, 0.6, 1.5, 1.2)
    return fade(norm(x + 0.08 * pad, -4), 0.01, 0.1)


@sound('riser', '电影式 riser（收尾合影组装铺垫，末端直落 impact）', ['cinematic riser', 'tension riser short'])
def riser():
    d = 1.55
    t = tvec(d)
    x = moving_band_noise(d, [380, 700, 1500, 3200, 6000], 0.6, 14)
    sweep_f = 160 * (6.0 ** (t / d))
    tone = np.sin(2 * np.pi * np.cumsum(sweep_f) / SR + 0.15 * np.sin(2 * np.pi * 5.5 * t))
    amp = (t / d) ** 2.4
    y = (x + 0.18 * tone) * amp
    return fade(norm(y, -2), 0.01, 0.015)


@sound('impact-deep', '低频电影 impact（收尾字标压印）', ['deep cinematic impact', 'boom hit trailer'])
def impact_deep():
    d = 1.6
    t = tvec(d)
    f = 42 + 58 * np.exp(-t / 0.08)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.42)
    knock = lp(rng(15).standard_normal(len(t)), 1800) * np.exp(-t / 0.035)
    body = bp(rng(16).standard_normal(len(t)), 90, 500) * np.exp(-t / 0.16)
    y = 1.0 * sub + 0.55 * knock + 0.35 * body
    y = reverb(y, mix=0.22, decay=0.5)[: int(2.2 * SR)]
    return fade(norm(y, -1), 0.002, 0.3)


@sound('thud-soft', '轻柔落地 thud（汇聚吞并 / 构件合体落座）', ['soft thud', 'muffled impact soft'])
def thud_soft():
    d = 0.8
    t = tvec(d)
    f = 70 + 70 * np.exp(-t / 0.05)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13) + 0.3 * lp(rng(17).standard_normal(len(t)), 2500) * np.exp(-t / 0.012)
    return fade(norm(reverb(y, 0.12, 0.35)[: int(0.9 * SR)], -3), 0.002, 0.15)


@sound('shimmer', '高频余韵 shimmer（扫光 / 收尾 rule 长出）', ['subtle shimmer', 'magic sparkle soft'])
def shimmer():
    d = 1.5
    t = tvec(d)
    r = rng(18)
    y = np.zeros(len(t))
    for k in range(10):
        f0 = r.uniform(2600, 7200)
        t0 = r.uniform(0, 0.4)
        tau = r.uniform(0.18, 0.45)
        on = t >= t0
        y[on] += r.uniform(0.4, 1.0) * np.sin(2 * np.pi * f0 * (t[on] - t0)) * np.exp(-(t[on] - t0) / tau)
    air = hp(r.standard_normal(len(t)), 6500) * env_peak(d, 0.25, 1.5, 2.0) * 0.25
    return fade(norm(y * (1 + 0.15 * np.sin(2 * np.pi * 9 * t)) + air, -6), 0.004, 0.2)


@sound('glass-tap', '玻璃轻触（胶囊弹出 / 悬浮卡弹出 A）', ['glass tap soft', 'light glass tick'])
def glass_tap():
    d = 0.35
    t = tvec(d)
    click = bp(rng(19).standard_normal(len(t)), 1800, 5200) * np.exp(-t / 0.004)
    ring = (np.sin(2 * np.pi * 1480 * t) + 0.45 * np.sin(2 * np.pi * 3990 * t)) * np.exp(-t / 0.05)
    return fade(norm(click + 0.35 * ring, -4), 0.001, 0.05)


@sound('glass-tap-b', '玻璃轻触（悬浮卡弹出 B，与 A 交替防复读）', ['glass tap soft', 'light glass tick'])
def glass_tap_b():
    d = 0.35
    t = tvec(d)
    click = bp(rng(20).standard_normal(len(t)), 1500, 4500) * np.exp(-t / 0.005)
    ring = (np.sin(2 * np.pi * 1760 * t) + 0.4 * np.sin(2 * np.pi * 4620 * t)) * np.exp(-t / 0.045)
    return fade(norm(click + 0.3 * ring, -4), 0.001, 0.05)


def key(seed, body_f):
    d = 0.09
    t = tvec(d)
    tick = hp(rng(seed).standard_normal(len(t)), 1800) * np.exp(-t / 0.005)
    thock = np.sin(2 * np.pi * body_f * t) * np.exp(-t / 0.014)
    rel = np.zeros(len(t))
    j = int(0.045 * SR)
    rel[j:] = hp(rng(seed + 50).standard_normal(len(t) - j), 2500) * np.exp(-(t[j:] - t[j]) / 0.003) * 0.35
    return tick + 0.5 * thock + rel


@sound('typing-query', '10 键轻键盘打字（AI 胶囊 10 字，5f/字，确定性微抖）', ['soft keyboard typing', 'laptop typing short'])
def typing_query():
    gap = 5 / 30
    d = 10 * gap + 0.3
    y = np.zeros(int(d * SR))
    r = rng(21)
    for i in range(10):
        k = key(100 + i, r.uniform(180, 260))
        s = int((i * gap + r.uniform(-0.012, 0.012) + 0.012) * SR)
        y[s:s + len(k)] += k * r.uniform(0.65, 1.0)
    return fade(norm(reverb(y, 0.08, 0.3)[: len(y)], -6), 0.001, 0.05)


def switch(seed, f_body):
    d = 0.18
    t = tvec(d)
    press = bp(rng(seed).standard_normal(len(t)), 2500, 7000) * np.exp(-t / 0.0025)
    body = np.sin(2 * np.pi * f_body * t) * np.exp(-t / 0.012)
    rel = np.zeros(len(t))
    j = int(0.011 * SR)
    rel[j:] = bp(rng(seed + 9).standard_normal(len(t) - j), 3000, 8000) * np.exp(-(t[j:] - t[j]) / 0.002) * 0.5
    return press + 0.4 * body + rel


@sound('tick-a', '机械开关 tick A（行业滚轮落定）', ['mechanical switch click', 'small toggle click'])
def tick_a():
    return fade(norm(switch(22, 820), -5), 0.0005, 0.03)


@sound('tick-b', '机械开关 tick B（与 A 交替）', ['mechanical switch click', 'small toggle click'])
def tick_b():
    return fade(norm(switch(23, 960), -5), 0.0005, 0.03)


@sound('bell-soft', '柔和提示铃（看板铃铛红点：画面本身是一条系统提醒，叙事上需要提示音）', ['soft notification bell', 'gentle chime single'])
def bell_soft():
    d = 1.4
    t = tvec(d)
    f0 = 1318.5
    parts = [(1.0, 1.0, 0.9), (2.0, 0.35, 0.5), (2.76, 0.22, 0.35), (4.07, 0.08, 0.2)]
    y = sum(a * np.sin(2 * np.pi * f0 * m * t) * np.exp(-t / tau) for m, a, tau in parts)
    y *= 1 - np.exp(-t / 0.002)
    return fade(norm(y, -8), 0.001, 0.2)


def main():
    manifest = []
    for name, (fn, desc, queries) in SOUNDS.items():
        x = np.asarray(fn(), dtype=np.float64)
        path = OUT / f'{name}.wav'
        sf.write(path, x.astype(np.float32), SR, subtype='PCM_16')
        data = path.read_bytes()
        # 10ms RMS 能量峰（用于峰值滞后补偿，sound-design §4.6）
        hop = SR // 100
        frames = len(x) // hop
        rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(frames)])
        pk = int(np.argmax(rms))
        manifest.append({
            'file': path.name,
            'kind': 'synthesized (original, scripts/make-sfx.py, fixed seed)',
            'description': desc,
            'license': 'Original work for this project (no third-party material)',
            'sha256': hashlib.sha256(data).hexdigest(),
            'duration_s': round(len(x) / SR, 3),
            'sample_rate': SR,
            'peak_rms_time_s': round(pk / 100 + 0.005, 3),
            'sample_peak_dbfs': round(20 * np.log10(np.max(np.abs(x)) + 1e-12), 2),
            'freesound_queries_for_replacement': queries,
        })
        print(f'{path.name:22s} {len(x) / SR:5.2f}s  rms-peak {pk / 100:.2f}s')
    (OUT / 'audio-manifest.json').write_text(json.dumps({
        'source_note': 'freesound.org (site, apiv2, cdn) returned HTTP 403 to this production environment on 2026-11-05; '
                       'SFX were synthesized instead. Replace with Freesound recordings via references/sfx-sourcing.md when reachable.',
        'files': manifest,
    }, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
