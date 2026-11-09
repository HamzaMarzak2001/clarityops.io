#!/usr/bin/env python3
"""ClarityOps LinkedIn visual renderer.

Usage: python3 render.py spec.json OUT_DIR
Writes slide-01.png ... into OUT_DIR. If spec "kind" is "carousel" it also writes carousel.pdf.

Spec:
{
  "kind": "image" | "carousel",
  "tag": "CLARITYOPS · AI OPS",                 # eyebrow on the first slide (optional)
  "slides": [
    {"layout": "statement", "eyebrow": "...", "title": "Big line. [[Highlighted words.]]", "body": "optional sub line"},
    {"layout": "list", "eyebrow": "...", "title": "...", "body": "...", "items": [{"title": "...", "text": "..."}]},
    {"layout": "compare", "eyebrow": "...", "title": "...", "left": {"label": "Before", "items": ["..."]}, "right": {"label": "After", "items": ["..."]}},
    {"layout": "stat", "eyebrow": "...", "stat": "5h", "title": "...", "body": "..."},
    {"layout": "quote", "eyebrow": "...", "quote": "...", "who": "A founder on a sales call"},
    {"layout": "flow", "eyebrow": "...", "title": "...", "steps": ["Lead comes in", "CRM record", "Proposal", "Invoice"]},
    {"layout": "cta", "title": "...", "body": "...", "action": "Comment SYSTEM"}
  ]
}
Text in [[double brackets]] renders in the lime highlight. Keep slide text short.
"""
import html, json, os, sys, pathlib, base64

HERE = pathlib.Path(__file__).resolve().parent
FONT_SORA = (HERE / "fonts/Sora.ttf").as_uri()
FONT_MONO = (HERE / "fonts/JetBrainsMono.ttf").as_uri()
LOGO = "data:image/png;base64," + base64.b64encode((HERE / "assets/logo.png").read_bytes()).decode()

W, H = 1080, 1350


def hl(text):
    t = html.escape(text or "")
    return t.replace("[[", '<span class="hl">').replace("]]", "</span>")


def para(text, cls="body"):
    return f'<p class="{cls}">{hl(text)}</p>' if text else ""


def eyebrow(t):
    return f'<div class="eyebrow"><span class="rule"></span>{html.escape(t)}</div>' if t else ""


def title_size(t, base=92):
    n = len((t or "").replace("[[", "").replace("]]", ""))
    if n > 90: return base - 34
    if n > 60: return base - 22
    if n > 38: return base - 10
    return base


def slide_body(s):
    L = s.get("layout", "statement")
    if L == "statement":
        return (eyebrow(s.get("eyebrow")) +
                f'<h1 style="font-size:{title_size(s.get("title"), 104)}px">{hl(s.get("title"))}</h1>' +
                para(s.get("body")))
    if L == "list":
        items = "".join(
            f'<div class="item"><div class="num">{i:02d}</div><div><div class="it">{hl(x.get("title"))}</div>'
            f'{para(x.get("text"), "itx")}</div></div>' for i, x in enumerate(s.get("items", []), 1))
        return (eyebrow(s.get("eyebrow")) + f'<h2 style="font-size:{title_size(s.get("title"), 76)}px">{hl(s.get("title"))}</h2>' +
                para(s.get("body")) + f'<div class="items">{items}</div>')
    if L == "compare":
        def col(c, good):
            lis = "".join(f'<li><span class="mk {"ok" if good else "no"}">{"✓" if good else "✕"}</span>{hl(x)}</li>' for x in c.get("items", []))
            return f'<div class="col {"good" if good else ""}"><div class="cl">{html.escape(c.get("label", ""))}</div><ul>{lis}</ul></div>'
        return (eyebrow(s.get("eyebrow")) + f'<h2 style="font-size:{title_size(s.get("title"), 76)}px">{hl(s.get("title"))}</h2>' +
                f'<div class="cmp">{col(s.get("left", {}), False)}{col(s.get("right", {}), True)}</div>')
    if L == "stat":
        return (eyebrow(s.get("eyebrow")) + f'<div class="stat">{hl(s.get("stat"))}</div>' +
                f'<h2 style="font-size:{title_size(s.get("title"), 70)}px">{hl(s.get("title"))}</h2>' + para(s.get("body")))
    if L == "quote":
        return (eyebrow(s.get("eyebrow")) + '<div class="qm">“</div>' +
                f'<div class="quote">{hl(s.get("quote"))}</div>' +
                (f'<div class="who">{html.escape(s.get("who", ""))}</div>' if s.get("who") else ""))
    if L == "flow":
        steps = s.get("steps", [])
        st = "".join(f'<div class="step"><div class="sn">{i:02d}</div><div class="stx">{hl(x)}</div></div>'
                     + ('<div class="arrow"></div>' if i < len(steps) else "") for i, x in enumerate(steps, 1))
        return (eyebrow(s.get("eyebrow")) + f'<h2 style="font-size:{title_size(s.get("title"), 76)}px">{hl(s.get("title"))}</h2>' +
                para(s.get("body")) + f'<div class="flow">{st}</div>')
    if L == "cta":
        return ('<div class="ctawrap">' + eyebrow(s.get("eyebrow") or "Your move") +
                f'<h1 style="font-size:{title_size(s.get("title"), 96)}px">{hl(s.get("title"))}</h1>' + para(s.get("body")) +
                (f'<div class="action">{html.escape(s.get("action"))}</div>' if s.get("action") else "") + '</div>')
    raise SystemExit(f"unknown layout {L}")


CSS = f"""
@font-face {{ font-family: Sora; src: url('{FONT_SORA}'); font-weight: 100 900; }}
@font-face {{ font-family: JBM; src: url('{FONT_MONO}'); font-weight: 100 900; }}
* {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ width: {W}px; height: {H}px; background: #000; }}
.s {{ position: relative; width: {W}px; height: {H}px; overflow: hidden; background: #000; color: #E8EDE1; font-family: Sora, sans-serif; }}
.glow {{ position: absolute; width: 900px; height: 900px; right: -320px; top: 380px; background: radial-gradient(circle, rgba(169,213,4,0.16), rgba(0,0,0,0) 62%); }}
.grid {{ position: absolute; inset: 0; background-image: linear-gradient(#0f130b 1px, transparent 1px), linear-gradient(90deg, #0f130b 1px, transparent 1px); background-size: 60px 60px; opacity: .55;
  -webkit-mask-image: radial-gradient(ellipse at 70% 70%, #000 0%, transparent 60%); }}
.top {{ position: absolute; left: 80px; right: 80px; top: 72px; display: flex; justify-content: space-between; align-items: center; }}
.top img {{ height: 46px; }}
.pg {{ font-family: JBM; font-size: 22px; letter-spacing: 4px; color: #9AA48C; }}
.main {{ position: absolute; left: 80px; right: 80px; top: 210px; bottom: 170px; display: flex; flex-direction: column; justify-content: center; }}
.eyebrow {{ font-family: JBM; font-size: 22px; letter-spacing: 6px; text-transform: uppercase; color: #E5F202; display: flex; align-items: center; margin-bottom: 34px; }}
.rule {{ display: inline-block; width: 44px; height: 2px; background: #A9D504; margin-right: 18px; }}
h1, h2 {{ font-weight: 700; letter-spacing: -0.035em; line-height: 1.04; color: #E8EDE1; }}
.hl {{ background: linear-gradient(90deg,#E5F202,#C8E404,#A9D504); -webkit-background-clip: text; background-clip: text; color: transparent; }}
.body {{ margin-top: 34px; font-size: 34px; line-height: 1.45; color: #9AA48C; max-width: 900px; }}
.items {{ margin-top: 46px; display: flex; flex-direction: column; gap: 30px; }}
.item {{ display: flex; gap: 28px; align-items: flex-start; padding: 28px 30px; background: #0A0C08; border: 1px solid #1F2618; border-radius: 22px; }}
.num {{ font-family: JBM; font-size: 24px; color: #E5F202; padding-top: 6px; min-width: 40px; }}
.it {{ font-size: 36px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2; }}
.itx {{ margin-top: 8px; font-size: 27px; line-height: 1.45; color: #9AA48C; }}
.cmp {{ margin-top: 50px; display: flex; gap: 24px; }}
.col {{ flex: 1; background: #0A0C08; border: 1px solid #1F2618; border-radius: 24px; padding: 34px 30px; }}
.col.good {{ border-color: #84B526; box-shadow: 0 0 60px rgba(169,213,4,0.12); }}
.cl {{ font-family: JBM; font-size: 22px; letter-spacing: 5px; text-transform: uppercase; color: #9AA48C; margin-bottom: 24px; }}
.col.good .cl {{ color: #E5F202; }}
.col ul {{ list-style: none; display: flex; flex-direction: column; gap: 22px; }}
.col li {{ font-size: 29px; line-height: 1.35; display: flex; gap: 14px; }}
.col:not(.good) li {{ color: #9AA48C; }}
.mk {{ font-family: JBM; font-size: 24px; padding-top: 3px; }}
.mk.no {{ color: #5F6857; }} .mk.ok {{ color: #E5F202; }}
.stat {{ font-size: 260px; font-weight: 800; letter-spacing: -0.06em; line-height: .95; margin-bottom: 30px; }}
.qm {{ font-size: 220px; line-height: .6; height: 110px; color: #A9D504; font-weight: 700; }}
.quote {{ font-size: 62px; line-height: 1.22; font-weight: 600; letter-spacing: -0.025em; }}
.who {{ margin-top: 40px; font-family: JBM; font-size: 22px; letter-spacing: 4px; text-transform: uppercase; color: #9AA48C; }}
.flow {{ margin-top: 52px; display: flex; flex-direction: column; }}
.step {{ display: flex; align-items: center; gap: 26px; padding: 24px 30px; background: #0A0C08; border: 1px solid #1F2618; border-radius: 20px; }}
.step:last-child {{ border-color: #84B526; }}
.sn {{ font-family: JBM; font-size: 22px; color: #E5F202; }}
.stx {{ font-size: 33px; font-weight: 600; letter-spacing: -0.02em; }}
.arrow {{ width: 2px; height: 30px; margin-left: 52px; background: repeating-linear-gradient(#84B526 0 6px, transparent 6px 12px); }}
.action {{ margin-top: 54px; display: inline-block; align-self: flex-start; font-family: JBM; font-size: 28px; letter-spacing: 3px; color: #000;
  background: linear-gradient(90deg,#E5F202,#A9D504,#84B526); padding: 22px 34px; border-radius: 16px; font-weight: 700; }}
.ctawrap {{ display: flex; flex-direction: column; }}
.foot {{ position: absolute; left: 80px; right: 80px; bottom: 72px; display: flex; justify-content: space-between; align-items: center;
  font-family: JBM; font-size: 22px; letter-spacing: 6px; color: #9AA48C; }}
.dots {{ display: flex; gap: 10px; align-items: center; }}
.dot {{ width: 10px; height: 10px; border-radius: 5px; background: #2a3322; }}
.dot.on {{ width: 46px; background: linear-gradient(90deg,#E5F202,#A9D504); }}
"""


def page(s, i, n, kind, tag):
    if i == 1 and tag and not s.get("eyebrow"):
        s = dict(s, eyebrow=tag)
    pg = f'<div class="pg">{i:02d} / {n:02d}</div>' if kind == "carousel" else ""
    if kind == "carousel":
        right = "SWIPE →" if i == 1 else '<div class="dots">' + "".join(
            f'<span class="dot{" on" if k == i else ""}"></span>' for k in range(1, n + 1)) + "</div>"
    else:
        right = ""
    return (f'<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="s">'
            f'<div class="grid"></div><div class="glow"></div>'
            f'<div class="top"><img src="{LOGO}">{pg}</div>'
            f'<div class="main">{slide_body(s)}</div>'
            f'<div class="foot"><span>CLARITYOPS.IO</span>{right}</div></div></body></html>')


def main():
    spec = json.load(open(sys.argv[1]))
    out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
    kind = spec.get("kind", "image")
    slides = spec["slides"] if kind == "carousel" else spec["slides"][:1]
    from playwright.sync_api import sync_playwright
    paths = []
    with sync_playwright() as p:
        exe = "/usr/bin/google-chrome" if os.path.exists("/usr/bin/google-chrome") else None
        b = p.chromium.launch(executable_path=exe, args=["--allow-file-access-from-files"]) if exe else p.chromium.launch()
        pg = b.new_page(viewport={"width": W, "height": H})
        for i, s in enumerate(slides, 1):
            f = out / f"_s{i}.html"
            f.write_text(page(s, i, len(slides), kind, spec.get("tag")))
            pg.goto(f.as_uri()); pg.wait_for_timeout(250)
            # shrink overflowing content
            pg.evaluate("""() => { const m = document.querySelector('.main'); let k = 1;
              while ((m.scrollHeight > m.clientHeight + 2) && k > 0.6) { k -= 0.04; m.style.zoom = k; } }""")
            png = out / f"slide-{i:02d}.png"
            pg.screenshot(path=str(png)); f.unlink(); paths.append(png)
        b.close()
    if kind == "carousel":
        from PIL import Image
        ims = [Image.open(x).convert("RGB") for x in paths]
        ims[0].save(out / "carousel.pdf", save_all=True, append_images=ims[1:], resolution=150)
    print("\n".join(str(x) for x in paths + ([out / "carousel.pdf"] if kind == "carousel" else [])))


if __name__ == "__main__":
    main()
