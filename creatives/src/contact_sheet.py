#!/usr/bin/env python3
"""Контакт-лист всех статик: creatives/contact-sheet.jpg"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

CR = Path("/home/karpushin/WebinarK/karina/creatives")
import subprocess, tempfile
files = sorted((CR / "out").glob("*.png"))
# кадр 1 с из каждого видео — чтобы видео тоже было на листе
tmp = Path(tempfile.mkdtemp())
for v in sorted((CR / "out").glob("*.mp4")):
    fr = tmp / f"{v.stem} (видео, кадр 1 с).png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "1", "-i", str(v), "-frames:v", "1", str(fr)], check=True)
    files.append(fr)
TH = 640                      # высота превью
PAD, LABEL = 36, 64
cols = 6
thumbs = []
for f in files:
    im = Image.open(f).convert("RGB")
    w = round(im.width * TH / im.height)
    thumbs.append((f.stem, im.resize((w, TH), Image.LANCZOS)))
colw = max(t.width for _, t in thumbs)
rows = (len(thumbs) + cols - 1) // cols
W = PAD + cols * (colw + PAD)
H = 150 + rows * (TH + LABEL + PAD) + PAD
sheet = Image.new("RGB", (W, H), "#F5F5F5")
d = ImageDraw.Draw(sheet)
def font(sz, bold=False):
    for p in (["/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"] if bold else []) + ["/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"]:
        try:
            return ImageFont.truetype(p, sz)
        except OSError:
            pass
    return ImageFont.load_default()
d.text((PAD, 40), "Outsistent · «Очима банку» · креативи Meta · 2026-10-26", fill="#11141B", font=font(44, True))
d.text((PAD, 98), "A — банк ще нічого не запитував · B — кілька ФОП · C — бухгалтер каже, що все гаразд · D — 14 листопада", fill="#5B6462", font=font(26))
for i, (name, t) in enumerate(thumbs):
    r, c = divmod(i, cols)
    x = PAD + c * (colw + PAD) + (colw - t.width) // 2
    y = 150 + r * (TH + LABEL + PAD)
    sheet.paste(t, (x, y))
    d.rectangle([x - 1, y - 1, x + t.width, y + TH], outline="#DEE4E2")
    d.text((PAD + c * (colw + PAD), y + TH + 12), name, fill="#11141B", font=font(22, True))
sheet.save(CR / "contact-sheet.jpg", quality=88)
print(CR / "contact-sheet.jpg", sheet.size)
