"use client";
import { useEffect, useRef } from "react";
import { motionOn } from "@/lib/ease";

/* The ClarityOps name across the bottom of the footer, drawn in the site's dots. A slow light passes along it. */
export function FooterMark() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let dots: [number, number][] = [], W = 0, H = 0, step = 4, raf = 0, on = false;
    const build = () => {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      W = canvas.width = Math.round(r.width * dpr); H = canvas.height = Math.round(r.height * dpr);
      if (!W || !H) return;
      const off = document.createElement("canvas"); off.width = W; off.height = H;
      const o = off.getContext("2d")!;
      const family = getComputedStyle(document.body).fontFamily;
      let fs = H; o.font = `600 ${fs}px ${family}`;
      fs *= (W * 0.97) / o.measureText("ClarityOps").width; o.font = `600 ${fs}px ${family}`;
      o.fillStyle = "#fff"; o.textBaseline = "alphabetic";
      o.fillText("ClarityOps", W * 0.015, H * 0.98);
      const img = o.getImageData(0, 0, W, H).data;
      step = Math.max(3, Math.round(W / 220)); dots = [];
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (img[(y * W + x) * 4 + 3] > 128) dots.push([x, y]);
    };
    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const r = step * 0.3;
      for (const [x, y] of dots) {
        const w = 0.5 + 0.5 * Math.sin(x * 0.01 + y * 0.003 - t * 0.0011);
        ctx.fillStyle = `rgba(232,237,225,${((0.18 + 0.4 * w) * Math.min(1, 0.3 + y / H)).toFixed(3)})`;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    };
    const loop = (t: number) => { draw(t); if (on) raf = requestAnimationFrame(loop); };
    const start = () => { build(); if (motionOn()) { cancelAnimationFrame(raf); on = true; raf = requestAnimationFrame(loop); } else draw(0); };
    const watch = new IntersectionObserver(([e]) => { on = e.isIntersecting && motionOn(); cancelAnimationFrame(raf); if (on) raf = requestAnimationFrame(loop); });
    void document.fonts.ready.then(() => { start(); watch.observe(canvas); });
    const ro = new ResizeObserver(() => { build(); if (!on) draw(0); });
    ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); watch.disconnect(); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} aria-hidden className="ft2-mark" />;
}
