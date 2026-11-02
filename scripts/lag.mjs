// Frame timing with real wheel input in a visible window, at Retina scale, normally and at 4x CPU slowdown.
// A window opens on screen for about a minute. Usage: node scripts/lag.mjs <url>
import { chromium } from "playwright";
const [url = "http://127.0.0.1:3100"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", headless: false, args: ["--window-position=0,0", "--window-size=1440,960"] });
for (const [label, rate] of [["normal", 1], ["4x slower CPU", 4]]) {
  const c = await b.newContext({ viewport: { width: 1440, height: 860 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  const cdp = await c.newCDPSession(p);
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForFunction(() => document.documentElement.classList.contains("machine-on"), null, { timeout: 30000 });
  await p.bringToFront();
  await p.waitForTimeout(800);
  if (rate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate });
  await p.evaluate(() => {
    window.__f = []; let l = performance.now();
    const f = (t) => { window.__f.push([t - l, scrollY]); l = t; requestAnimationFrame(f); };
    requestAnimationFrame(f);
    window.__lt = 0; new PerformanceObserver((o) => { for (const e of o.getEntries()) window.__lt = Math.max(window.__lt, e.duration); }).observe({ type: "longtask" });
  });
  await p.mouse.move(700, 450);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  const t0 = Date.now();
  while ((await p.evaluate(() => scrollY)) < H - 900 && Date.now() - t0 < 42000) { await p.mouse.wheel(0, 90); await p.waitForTimeout(14); }
  const r = await p.evaluate(() => {
    const d = window.__f.map((x) => x[0]).slice(5).sort((a, b) => a - b), pct = (q) => d[Math.floor(d.length * q)];
    return { frames: d.length, fps: +(1000 / (d.reduce((a, b) => a + b, 0) / d.length)).toFixed(1), p95: +pct(0.95).toFixed(1), p99: +pct(0.99).toFixed(1), over33: d.filter((x) => x > 33.4).length, over50: d.filter((x) => x > 50).length, longestTask: Math.round(window.__lt), reached: Math.round(scrollY) };
  });
  console.log(label, JSON.stringify(r));
  await c.close();
}
await b.close();
