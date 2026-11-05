"""BGM 节奏分析（music-beat-sync §1–§3）：beat_track + 最小二乘网格拟合，kick 能量、RMS 结构。
用法：python3 scripts/analyze-bgm.py <bgm.mp3> [out.json]"""
import json, sys
import numpy as np, librosa
from scipy.signal import butter, sosfilt

path = sys.argv[1]
y, sr = librosa.load(path, sr=None, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, tightness=400, units='time')
i = np.arange(len(beats))
A = np.vstack([i, np.ones_like(i)]).T
(T, t0), *_ = np.linalg.lstsq(A, beats, rcond=None)
res = beats - (t0 + i * T)
# 用最早的整拍把 t0 平移到曲首附近
k0 = int(np.floor(t0 / T)); t0 = t0 - k0 * T

def band_env(lo, hi):
    sos = butter(4, [lo, hi], btype='band', fs=sr, output='sos')
    env = librosa.onset.onset_strength(y=sosfilt(sos, y), sr=sr)
    return env, librosa.times_like(env, sr=sr)
kick, times = band_env(40, 160)
nb = int((len(y) / sr - t0) / T)
kick_at = [float(kick[np.argmin(np.abs(times - (t0 + n * T)))]) for n in range(nb)]
off = [float(kick[np.argmin(np.abs(times - (t0 + (n + 0.5) * T)))]) for n in range(nb)]
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=sr // 2)[0]  # 0.5s 窗
out = {
    'file': path, 'bpm': 60 / T, 'T': T, 't0': t0, 'beats_detected': len(beats),
    'residual_ms_max': float(np.abs(res).max() * 1000), 'residual_ms_mean': float(np.abs(res).mean() * 1000),
    'kick_on_beat_mean': float(np.mean(kick_at)), 'kick_off_beat_mean': float(np.mean(off)),
    'rms_halfsec': [round(float(v), 4) for v in rms],
    'kick_per_beat': [round(v, 3) for v in kick_at],
}
print(f"{path}: BPM={out['bpm']:.2f} t0={t0:.4f}s T={T:.5f}s resid max {out['residual_ms_max']:.0f}ms mean {out['residual_ms_mean']:.1f}ms  kick on/off beat {out['kick_on_beat_mean']:.2f}/{out['kick_off_beat_mean']:.2f}")
# 每 4 拍（一小节）平均 RMS，打印前 64 小节的能量轮廓
bar = []
for b in range(0, nb - 4, 4):
    s, e = t0 + b * T, t0 + (b + 4) * T
    seg = y[int(s * sr):int(e * sr)]
    bar.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0)
out['bar_rms'] = [round(v, 4) for v in bar]
print('bar RMS:', ' '.join(f'{v:.2f}' for v in bar[:64]))
if len(sys.argv) > 2:
    json.dump(out, open(sys.argv[2], 'w'), indent=1)
