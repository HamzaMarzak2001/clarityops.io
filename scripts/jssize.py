# Initial JS referenced by the built page, gzip -9. Usage: python3 scripts/jssize.py
import re, gzip, sys
html = open(".next/server/app/index.html").read()
nomodule = set(re.findall(r"<script[^>]*src=\"([^\"]+\.js)[^\"]*\"[^>]*noModule[^>]*>", html)) | set(re.findall(r"<script[^>]*noModule[^>]*src=\"([^\"]+\.js)", html))
seen = sorted(set(re.findall(r"/_next/static/[^\"'\\ ]+?\.js", html)) - nomodule)
tot = 0
rows = []
for u in seen:
    d = open(".next" + u.replace("/_next", ""), "rb").read()
    g = len(gzip.compress(d, 9)); tot += g; rows.append((g, len(d), u.split("/")[-1][:30]))
for g, r, n in sorted(rows, reverse=True): print(f"{g/1024:7.1f} KB gz {r/1024:8.1f} KB raw  {n}")
print(f"initial JS: {tot/1024:.1f} KB gzip, {len(seen)} files")
