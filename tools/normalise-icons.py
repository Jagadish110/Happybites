"""Give every dish icon the same framing.

The supplied tiles put the food at wildly different sizes: some fill the frame,
some float in a pastel disc. We find the food itself — the pixels that are
either colourful or dark, which skips the pale badge behind it — crop to that,
then pad back out to a square so the food always covers the same share of the
tile. Everything lands on white, which the round plate on the card then frames.
"""
import sys, glob, os
from PIL import Image

SRC = sys.argv[1]
OUT = sys.argv[2]
MARGIN = float(sys.argv[3]) if len(sys.argv) > 3 else 0.07
os.makedirs(OUT, exist_ok=True)

def food_box(img):
    small = img.resize((128, 128), Image.BILINEAR)
    px = small.load()
    xs, ys = [], []
    for y in range(128):
        for x in range(128):
            r, g, b = px[x, y]
            sat = max(r, g, b) - min(r, g, b)
            lum = (r * 299 + g * 587 + b * 114) // 1000
            if sat > 35 or lum < 210:            # the food, not the pale badge
                xs.append(x)
                ys.append(y)
    if not xs:
        return None
    sx = img.width / 128
    sy = img.height / 128
    return int(min(xs) * sx), int(min(ys) * sy), int((max(xs) + 1) * sx), int((max(ys) + 1) * sy)

count = 0
for path in sorted(glob.glob(os.path.join(SRC, '*.jpg'))):
    img = Image.open(path).convert('RGB')
    box = food_box(img)
    if box is None:
        tile = img
    else:
        food = img.crop(box)
        fw, fh = food.size
        side = int(max(fw, fh) * (1 + MARGIN * 2))
        tile = Image.new('RGB', (side, side), (255, 255, 255))
        tile.paste(food, ((side - fw) // 2, (side - fh) // 2))

    tile.resize((256, 256), Image.LANCZOS).save(
        os.path.join(OUT, os.path.basename(path)), 'JPEG', quality=88, optimize=True)
    count += 1

print(f'{count} icons normalised into {OUT}')
