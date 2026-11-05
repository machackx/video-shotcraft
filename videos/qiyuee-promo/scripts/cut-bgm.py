"""把 BGM 预裁成本片用的那一段（无损 FLAC），成片与动效工作台共用同一文件、都不需要 trimBefore。

起点 = SOURCE_BEAT0 + BGM_FIRST_BEAT × BEAT_INT（片头对齐歌曲第 15 拍）+ 输出音轨偏移补偿（OUTPUT_AUDIO_OFFSET_F 帧）。
常量直接从 src/timeline.ts 与 src/audio.tsx 读取，改了时间轴或重测了偏移后重跑本脚本。
用法：python3 scripts/cut-bgm.py   （源：../../assets/audio/bgm/cat-walk.mp3）
"""
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
tl = (ROOT / 'src' / 'timeline.ts').read_text(encoding='utf-8')
au = (ROOT / 'src' / 'audio.tsx').read_text(encoding='utf-8')
num = lambda pat, s: float(re.search(pat, s).group(1))
beat0 = num(r'SOURCE_BEAT0 = ([\d.]+)', tl)
T = num(r'BEAT_INT = ([\d.]+)', tl)
first = num(r'BGM_FIRST_BEAT = ([\d.]+)', tl)
offset_f = num(r'OUTPUT_AUDIO_OFFSET_F = ([\d.]+)', au)
start = beat0 + first * T + offset_f / 30
src = ROOT.parent.parent / 'assets' / 'audio' / 'bgm' / 'cat-walk.mp3'
dst = ROOT / 'public' / 'audio' / 'bgm' / 'cat-walk-cut.flac'
dst.parent.mkdir(parents=True, exist_ok=True)
# -ss 放在 -i 之后 = 解码后按样本精确裁切
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-ss', f'{start:.5f}', '-t', '48.5', '-c:a', 'flac', str(dst)], check=True)
print(f'{dst.relative_to(ROOT)}  start={start:.5f}s')
