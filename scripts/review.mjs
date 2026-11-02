// Frames through a scroll sequence, for critique. Usage:
// node scripts/review.mjs <url> <outDir> <selector> <w> <h> <mobile:0|1> <f1,f2,...>
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [url, out, sel, w, h, mobile, list] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, isMobile: mobile === "1", hasTouch: mobile === "1" });
const page = await ctx.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const name = sel.replace(/[^a-z0-9]/gi, "");
for (const f of list.split(",").map(Number)) {
  await page.evaluate(([s, f]) => {
    const el = document.querySelector(s); const r = el.getBoundingClientRect();
    const top = r.top + scrollY; const span = Math.max(r.height - innerHeight, 0);
    window.__lenis?.scrollTo?.(top + f * span, { immediate: true });
    scrollTo({ top: top + f * span, behavior: "instant" });
  }, [sel, f]);
  await page.waitForTimeout(550);
  await page.screenshot({ path: `${out}/${name}-${w}-${String(Math.round(f * 100)).padStart(3, "0")}.png` });
}
console.log(name, w, errs.length ? errs.slice(0, 4) : "no errors");
await browser.close();
