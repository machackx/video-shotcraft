"""capture.cjs 之后的素材后处理（需要 Pillow）：

1. 门户工作台纹理裁掉窗口下方留白（高度 = layout.portal.cropH，4x）。
2. 首页手机截图（qiyuee.com/assets/qiyue/mobile-home-reference.png）抹去问候语里的用户姓名
   与挥手表情，只留「晚上好」——个人信息不进片（SPEC §0 数据口径）。

用法：python3 scripts/crop-portal.py [mobile-home-reference.png 路径]
"""
import json
import pathlib
import sys
import urllib.request

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
TEX = ROOT / 'public' / 'textures'
L = json.loads((ROOT / 'src' / 'layout.json').read_text(encoding='utf-8'))
S = 4
H = L['portal']['cropH']
for name in ('portal-window', 'portal-base'):
    im = Image.open(TEX / f'{name}.png')
    if im.height > round(H * S):
        im.crop((0, 0, im.width, round(H * S))).save(TEX / f'{name}.png')
sb = L['portal']['sidebar']
im = Image.open(TEX / 'portal-sidebar.png')
target = round((H - sb['y']) * S)
if im.height > target:
    im.crop((0, 0, im.width, target)).save(TEX / 'portal-sidebar.png')
print('portal textures cropped to', H, 'css px')

src = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'analysis' / 'mobile-home-reference.png'
if not src.exists():
    src.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve('https://qiyuee.com/assets/qiyue/mobile-home-reference.png', src)
im = Image.open(src).convert('RGB')
px = im.load()
x0, x1, y0, y1 = 196, 452, 128, 212  # 问候语「晚上好」之后的逗号 + 用户姓名 + 挥手表情（853×1844 原图坐标）
for y in range(y0, y1):
    samp = [px[x, y] for x in range(470, 520)]  # 同行右侧干净底色
    c = tuple(sum(p[i] for p in samp) // len(samp) for i in range(3))
    for x in range(x0, x1):
        px[x, y] = c
im.save(TEX / 'phone-home.png')
print('phone-home.png redacted')
