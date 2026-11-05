"""拼接 QA 静帧为一张对照图：python3 scripts/sheet.py out.png a.png b.png ... [--w 640]"""
import sys
from PIL import Image
args = sys.argv[1:]
w = 640
if '--w' in args:
    i = args.index('--w'); w = int(args[i + 1]); del args[i:i + 2]
out, files = args[0], args[1:]
ims = [Image.open(f).convert('RGB') for f in files]
ims = [im.resize((w, int(im.height * w / im.width)), Image.LANCZOS) for im in ims]
cols = 2 if len(ims) > 1 else 1
rows = (len(ims) + cols - 1) // cols
h = ims[0].height
sheet = Image.new('RGB', (cols * w + (cols - 1) * 8, rows * h + (rows - 1) * 8), (40, 40, 40))
for k, im in enumerate(ims):
    sheet.paste(im, ((k % cols) * (w + 8), (k // cols) * (h + 8)))
sheet.save(out)
