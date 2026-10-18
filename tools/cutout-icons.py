"""Drop the white page behind each icon so it sits on the plate cleanly.

We flood in from the four edges over near-white pixels and make those
transparent. Flooding (rather than a plain colour test) keeps white *inside*
the dish — a coffee cup, a bowl rim, an egg — fully opaque.
"""
import sys, glob, os
from collections import deque
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
TOL = int(sys.argv[3]) if len(sys.argv) > 3 else 26
os.makedirs(OUT, exist_ok=True)

def cutout(img):
    img = img.convert('RGBA')
    w, h = img.size
    px = img.load()
    seen = bytearray(w * h)
    q = deque()

    # the page is usually white, but some tiles sit on a pastel badge. Sample the
    # whole border ring and keep the few colours that actually show up there.
    border = []
    for x in range(0, w, 2):
        border.append(px[x, 0][:3])
        border.append(px[x, h - 1][:3])
    for y in range(0, h, 2):
        border.append(px[0, y][:3])
        border.append(px[w - 1, y][:3])

    tally = {}
    for c in border:
        bucket = tuple(v // 8 for v in c)
        tally.setdefault(bucket, []).append(c)
    common = sorted(tally.values(), key=len, reverse=True)[:4]

    keys = [(255, 255, 255)]
    for group in common:
        if len(group) < len(border) * 0.04:
            continue
        avg = tuple(sum(c[i] for c in group) // len(group) for i in range(3))
        if all(sum(abs(a - b) for a, b in zip(avg, k)) > TOL for k in keys):
            keys.append(avg)

    def near_white(x, y):
        r, g, b, _ = px[x, y]
        return any(sum(abs(a - c) for a, c in zip((r, g, b), k)) < TOL * 2.4 for k in keys)

    for x in range(w):
        for y in (0, h - 1):
            if not seen[y * w + x] and near_white(x, y):
                seen[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not seen[y * w + x] and near_white(x, y):
                seen[y * w + x] = 1
                q.append((x, y))

    while q:
        x, y = q.popleft()
        px[x, y] = (255, 255, 255, 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and near_white(nx, ny):
                seen[ny * w + nx] = 1
                q.append((nx, ny))
    return img

count = 0
for path in sorted(glob.glob(os.path.join(SRC, '*.jpg'))):
    out = os.path.join(OUT, os.path.splitext(os.path.basename(path))[0] + '.png')
    cutout(Image.open(path)).save(out, 'PNG', optimize=True)
    count += 1

print(f'{count} icons cut out into {OUT}')
