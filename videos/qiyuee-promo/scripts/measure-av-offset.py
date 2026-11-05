"""渲后实测输出音轨偏移（sound-design §4.6）：取 2–3 个尖锐 SFX 原文件，与无 BGM 成片音轨做归一化互相关，
测得的实际起点 − 设计起点（Sequence.from）= 输出偏移。用法：python3 scripts/measure-av-offset.py out/xxx-nobgm.mp4"""
import json, subprocess, sys, tempfile, pathlib
import numpy as np, soundfile as sf
from scipy.signal import resample_poly

mp4 = sys.argv[1]
ROOT = pathlib.Path(__file__).resolve().parent.parent
tmp = pathlib.Path(tempfile.mkdtemp()) / 'a.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-vn', '-ac', '1', '-ar', '48000', '-acodec', 'pcm_s16le', str(tmp)], check=True)
mix, sr = sf.read(tmp)
# 设计起点：从 Remotion 打包的 SFX 表读（node 计算），这里按探针文件名查找
bundle = ROOT / 'out' / 'qa' / 'cues.mjs'  # 放在工程内，external 的 remotion/react 才能从 node_modules 解析
subprocess.run(['npx', 'esbuild', 'src/audio-cues.ts', '--bundle', '--platform=node', '--format=esm', '--loader:.json=json',
                '--external:remotion', '--external:react', '--log-level=error', f'--outfile={bundle}'], cwd=ROOT, check=True)
cues = json.loads(subprocess.run(['node', '-e', f"import('{bundle}').then(m=>console.log(JSON.stringify(m.CUES)))"],
                                 cwd=ROOT, capture_output=True, text=True, check=True).stdout)
probes = [c for c in cues if c['src'].endswith(('glass-tap.wav', 'glass-tap-b.wav', 'thud-soft.wav', 'impact-deep.wav', 'tick-a.wav'))]
res = []
for c in probes:
    x, xsr = sf.read(ROOT / 'public' / c['src'])
    if x.ndim > 1: x = x.mean(axis=1)
    x = x[: int(0.25 * sr)] * c['volume']
    start = c['from'] / 30
    a, b = int((start - 0.25) * sr), int((start + 0.35) * sr)
    seg = mix[max(0, a): b]
    corr = np.correlate(seg, x, mode='valid')
    norm = np.sqrt(np.convolve(seg ** 2, np.ones(len(x)), mode='valid')) * np.sqrt(np.sum(x ** 2)) + 1e-12
    k = int(np.argmax(corr / norm))
    t_found = (max(0, a) + k) / sr
    res.append({'src': c['src'], 'design_from_f': c['from'], 'found_s': round(t_found, 5), 'offset_f': round((t_found - start) * 30, 3),
                'score': round(float((corr / norm)[k]), 3)})
for r in res: print(r)
offs = [r['offset_f'] for r in res if r['score'] > 0.5]
out = {'pipeline': 'Remotion 4.0.484 · h264 + AAC 48kHz stereo · mp4', 'probes': res,
       'offset_f_median': float(np.median(offs)) if offs else None, 'offset_f_spread': float(np.ptp(offs)) if offs else None}
print('median offset frames:', out['offset_f_median'], 'spread', out['offset_f_spread'])
json.dump(out, open(ROOT / 'analysis' / 'av-offset.json', 'w'), indent=1)
