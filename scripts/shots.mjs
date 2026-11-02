// Full-page screenshots at the brief's widths, using the installed Chrome.
// Chrome cannot paint above 16384px in one surface, so tall pages are shot in chunks and stitched by scripts/stitch.py.
// Usage: node scripts/shots.mjs <url> <outDir>
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [url = "http://127.0.0.1:3100", out = "captures"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const CHUNK = 6000;

const browser = await chromium.launch({ channel: "chrome" });
for (const [w, h, mobile] of [[1440, 900, false], [1024, 768, false], [768, 1024, true], [390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    scrollTo(0, 0);
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => ({
    w: innerWidth, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight,
    over: [...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest(".frame")).slice(0, 6).map((e) => `${e.tagName}.${String(e.className).slice(0, 40)}`),
    broken: [...document.images].filter((i) => !i.naturalWidth).map((i) => i.src),
    h1: document.querySelectorAll("h1").length,
  }));
  let i = 0;
  for (let y = 0; y < info.sh; y += CHUNK, i++) {
    await page.screenshot({ path: `${out}/chunk-${w}-${String(i).padStart(2, "0")}.png`, fullPage: true, clip: { x: 0, y, width: w, height: Math.min(CHUNK, info.sh - y) } });
  }
  console.log(w, JSON.stringify(info), errors.length ? errors.slice(0, 3) : "no console errors");
  await ctx.close();
}
await browser.close();
