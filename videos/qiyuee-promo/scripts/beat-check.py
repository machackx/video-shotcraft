"""渲后卡点回测（music-beat-sync §5b）：从成片抽音轨，对 BGM 重做网格拟合，逐个硬切点比较
「设计帧号」与「成片音轨里最近一拍的帧号」。用法：python3 scripts/beat-check.py out/xxx.mp4"""
import json, pathlib, subprocess, sys, tempfile
import numpy as np, librosa

ROOT = pathlib.Path(__file__).resolve().parent.parent
mp4 = sys.argv[1]
wav = pathlib.Path(tempfile.mkdtemp()) / 'a.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-vn', '-ac', '1', '-ar', '44100', str(wav)], check=True)
y, sr = librosa.load(wav, sr=None)
y_perc = librosa.effects.hpss(y)[1]
_, beats = librosa.beat.beat_track(y=y_perc, sr=sr, tightness=400, units='time', start_bpm=130)
i = np.arange(len(beats)); A = np.vstack([i, np.ones_like(i)]).T
(T, t0), *_ = np.linalg.lstsq(A, beats, rcond=None)
res = beats - (t0 + i * T)
print(f'rendered BGM grid: BPM={60 / T:.2f} t0={t0:.4f}s residual max {np.abs(res).max() * 1000:.0f}ms')
# 设计切点（帧）：硬切 + 收尾字标压印
# 设计切点（帧）= 片内拍号 × T，与 src/timeline.ts 的 beatF() 同式（T 取源分析值）
T_SRC = 0.46156
beatF = lambda k: round(k * T_SRC * 30)
cuts = {'白闪#1 S3 (beat 22)': beatF(22), 'S4 (beat 34)': beatF(34), 'S5 (beat 41)': beatF(41), '白闪#2 S6 drop (beat 48)': beatF(48),
        'S7 (beat 66)': beatF(66), 'S8 (beat 78)': beatF(78), 'S9 字标压印 (beat 94)': beatF(94)}
rows = []
for name, f in cuts.items():
    t = f / 30
    k = round((t - t0) / T)
    tb = t0 + k * T
    err_f = (f / 30 - tb) * 30
    rows.append({'cut': name, 'design_f': f, 'nearest_beat_f': round(tb * 30, 2), 'error_f': round(err_f, 2)})
    print(f'{name:28s} design {f:5d}f  beat {tb * 30:8.2f}f  err {err_f:+.2f}f')
# drop：成片音轨 RMS 跃升点
hop = int(sr * 0.01)
r = librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop)[0]
win = slice(int(21.5 / 0.01), int(23.0 / 0.01))
j = np.argmax(np.diff(r[win])) + win.start
print(f'drop RMS jump at {j * 0.01:.3f}s = frame {j * 0.01 * 30:.1f} (design 665)')
json.dump({'bpm': 60 / T, 't0': t0, 'rows': rows, 'drop_rms_jump_f': j * 0.3}, open(ROOT / 'analysis' / 'beat-check.json', 'w'), indent=1)
