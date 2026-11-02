// Records a slow full-page scroll to video at the brief's two widths. Usage: node scripts/record.mjs <url> <outDir>
import { chromium } from "playwright";
import { mkdirSync, renameSync } from "node:fs";
const [url = "http://127.0.0.1:3100", out = "checkpoints/3"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, recordVideo: { dir: out, size: { width: w, height: h } } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    const H = document.documentElement.scrollHeight - innerHeight;
    const speed = 900; // px per second
    const t0 = performance.now();
    await new Promise((res) => { const f = (t) => { const y = ((t - t0) / 1000) * speed; scrollTo({ top: y, behavior: "instant" }); y < H ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
  });
  await page.waitForTimeout(800);
  const v = page.video();
  await ctx.close();
  renameSync(await v.path(), `${out}/scroll-${w}.webm`);
  console.log("recorded", w);
}
await browser.close();
