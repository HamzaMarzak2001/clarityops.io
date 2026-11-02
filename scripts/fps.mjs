// Frame timing during a scripted scroll, plus layout shift and long tasks. Usage: node scripts/fps.mjs <url> [chrome|webkit]
import { chromium, webkit } from "playwright";
const [url = "http://127.0.0.1:3100", engine = "chrome"] = process.argv.slice(2);
const browser = engine === "webkit" ? await webkit.launch() : await chromium.launch({ channel: "chrome", headless: false, args: ["--window-position=3000,0"] });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(async () => {
    let cls = 0;
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch {}
    const H = document.documentElement.scrollHeight - innerHeight;
    const d = [];
    let last = performance.now();
    const t0 = last;
    await new Promise((res) => {
      const f = (t) => { d.push(t - last); last = t; const y = ((t - t0) / 1000) * 1400; scrollTo({ top: y, behavior: "instant" }); y < H ? requestAnimationFrame(f) : res(); };
      requestAnimationFrame(f);
    });
    d.shift();
    d.sort((a, b) => a - b);
    const pct = (p) => d[Math.floor(d.length * p)];
    return { frames: d.length, avgFps: +(1000 / (d.reduce((a, b) => a + b, 0) / d.length)).toFixed(1), p50ms: +pct(0.5).toFixed(1), p95ms: +pct(0.95).toFixed(1), p99ms: +pct(0.99).toFixed(1), over33ms: d.filter((x) => x > 33.4).length, cls: +cls.toFixed(4) };
  });
  console.log(engine, w, JSON.stringify(r));
  await page.close();
}
await browser.close();
