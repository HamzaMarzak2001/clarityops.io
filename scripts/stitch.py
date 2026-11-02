# Stitch chunk-<w>-NN.png into full-<w>.png. Usage: python3 scripts/stitch.py captures
import glob, re, sys, fitz, os
d = sys.argv[1]
for w in sorted({int(re.search(r"chunk-(\d+)-", f).group(1)) for f in glob.glob(f"{d}/chunk-*.png")}):
    parts = [fitz.Pixmap(f) for f in sorted(glob.glob(f"{d}/chunk-{w}-*.png"))]
    H = sum(p.height for p in parts)
    out = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, w, H), False)
    y = 0
    for p in parts:
        p2 = fitz.Pixmap(fitz.csRGB, p) if p.alpha or p.n != 3 else p
        if p2.alpha: p2 = fitz.Pixmap(p2, 0)
        p2.set_origin(0, y)
        out.copy(p2, fitz.IRect(0, y, w, y + p.height))
        y += p.height
    out.save(f"{d}/full-{w}.png")
    print(f"full-{w}.png", w, H)
for f in glob.glob(f"{d}/chunk-*.png"): os.remove(f)
