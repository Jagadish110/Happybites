"""Cut each supplied tile down to just its icon.

The tiles were sliced off a sheet, so most carry a caption band underneath and
sometimes a strip of the neighbouring tile. Strategy: drop the caption band,
find the flat gutters that separate tiles and cut there, then trim the flat
background off every edge and square the result.
"""
import sys, glob, os
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

FLAT = 26          # luminance spread that still counts as "flat background"

# Two sheet slices put the heading over the bowl; crop those by hand.
MANUAL = {
    'simple_pack': (8, 52, 190, 234),
    'basic_pack': (10, 34, 142, 166),
}

def lum_grid(img):
    g = img.convert('L')
    w, h = g.size
    px = g.load()
    return [[px[x, y] for y in range(h)] for x in range(w)], w, h

def flat_cols(grid, w, h):
    return [max(col) - min(col) < FLAT for col in grid]

def flat_rows(grid, w, h):
    out = []
    for y in range(h):
        row = [grid[x][y] for x in range(w)]
        out.append(max(row) - min(row) < FLAT)
    return out

def runs(flags):
    out, start = [], None
    for i, f in enumerate(flags):
        if f and start is None:
            start = i
        elif not f and start is not None:
            out.append((start, i)); start = None
    if start is not None:
        out.append((start, len(flags)))
    return out

def drop_band(img, x0, x1, y0, y1, step):
    """Walk in from one edge while rows are a single saturated colour."""
    px = img.convert('RGB').load()
    span = y1 - y0
    limit = int(span * 0.22)
    y = y0 if step > 0 else y1 - 1
    moved = 0
    while moved < limit:
        row = [px[x, y] for x in range(x0, x1, max(1, (x1 - x0) // 40))]
        mid = sorted(row)[len(row) // 2]
        close = sum(1 for c in row if sum(abs(a - b) for a, b in zip(c, mid)) < 60)
        sat = max(mid) - min(mid)
        if close > len(row) * 0.6 and sat > 55:      # a solid colour band
            y += step
            moved += 1
            continue
        break
    return (y if step > 0 else y + 1)


report = []
for path in sorted(glob.glob(os.path.join(SRC, '**', '*.jpg'), recursive=True)):
    img = Image.open(path).convert('RGB')
    W, H = img.size
    stem = os.path.splitext(os.path.basename(path))[0]

    if stem in MANUAL:
        box = MANUAL[stem]
        tile = img.crop(box).resize((256, 256), Image.LANCZOS)
        tile.save(os.path.join(OUT, stem + '.jpg'), 'JPEG', quality=88, optimize=True)
        report.append(f"{stem}: hand crop {box}")
        continue

    body = img.crop((0, 0, W, int(H * 0.78)))          # caption gone
    grid, w, h = lum_grid(body)

    fc = flat_cols(grid, w, h)
    left, right = 0, w
    for a, b in runs(fc):
        if b - a < 2:
            continue
        if b <= w * 0.42 and b > left:                  # gutter on the left side
            left = b
        if a >= w * 0.58 and a < right:                 # gutter on the right side
            right = a
    if right - left < w * 0.35:                         # bad guess, keep it all
        left, right = 0, w

    inner = body.crop((left, 0, right, h))
    g2, w2, h2 = lum_grid(inner)
    fc2, fr2 = flat_cols(g2, w2, h2), flat_rows(g2, w2, h2)
    x0 = next((i for i, f in enumerate(fc2) if not f), 0)
    x1 = next((i for i in range(w2 - 1, -1, -1) if not fc2[i]), w2 - 1) + 1
    y0 = next((i for i, f in enumerate(fr2) if not f), 0)
    y1 = next((i for i in range(h2 - 1, -1, -1) if not fr2[i]), h2 - 1) + 1

    # the sheet puts a rounded colour pill above some tiles; its rows mix with
    # the page so the flat-trim above leaves them. Shave those bands off.
    y0 = drop_band(inner, x0, x1, y0, y1, 1)
    y1 = drop_band(inner, x0, x1, y0, y1, -1)

    # keep exactly what we found, then pad out to a square instead of growing
    # the crop — growing would pull the neighbouring tile back in.
    tight = inner.crop((x0, y0, x1, y1))
    tw, th = tight.size
    side = int(max(tw, th) * 1.06)
    canvas = Image.new('RGB', (side, side), (255, 255, 255))
    canvas.paste(tight, ((side - tw) // 2, (side - th) // 2))
    tile = canvas.resize((256, 256), Image.LANCZOS)

    name = os.path.splitext(os.path.basename(path))[0] + '.jpg'
    tile.save(os.path.join(OUT, name), 'JPEG', quality=88, optimize=True)
    report.append(f"{name}: cols {left}-{right} of {w}, box {x1-x0}x{y1-y0}")

print('\n'.join(report[:6]))
print(f"...{len(report)} tiles written")
