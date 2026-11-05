"""按源码实际用字给 Noto Sans SC（SIL OFL 1.1）做子集，输出 public/fonts/QiyueSans-*.woff2。

用法：python3 scripts/subset-fonts.py <NotoSansSC TTF 所在目录>
（TTF 来自 Google Fonts：fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700）
改了任何画面文案后重跑一次，再渲染。
"""
import pathlib
import sys

from fontTools import subset

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC_DIR = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '~/.local/share/fonts').expanduser()

chars = set(chr(c) for c in range(0x20, 0x7F))  # ASCII 全集
chars |= set('，。、：；！？（）《》「」“”‘’·—…％￥')
for path in list((ROOT / 'src').rglob('*.ts')) + list((ROOT / 'src').rglob('*.tsx')) + [ROOT / 'src' / 'layout.json']:
    chars |= set(path.read_text(encoding='utf-8'))
chars = {c for c in chars if c.isprintable()}
text = ''.join(sorted(chars))

out_dir = ROOT / 'public' / 'fonts'
out_dir.mkdir(parents=True, exist_ok=True)
for weight in ('Regular', 'Medium', 'Bold'):
    src = SRC_DIR / f'NotoSansSC-{weight}.ttf'
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    font = subset.load_font(str(src), opts)
    sub = subset.Subsetter(opts)
    sub.populate(text=text)
    sub.subset(font)
    dst = out_dir / f'QiyueSans-{weight}.woff2'
    subset.save_font(font, str(dst), opts)
    print(f'{dst.relative_to(ROOT)}  {dst.stat().st_size // 1024} KB  ({len(text)} chars)')

(out_dir / 'OFL.txt').write_text(
    'Noto Sans SC — Copyright 2014-2021 Adobe (http://www.adobe.com/), with Reserved Font Name "Source".\n'
    'Subsetted copies bundled here as "QiyueSans-*.woff2" for rendering this film.\n'
    'Licensed under the SIL Open Font License, Version 1.1: https://openfontlicense.org\n',
    encoding='utf-8',
)
