"use client";
import { useEffect, useRef } from "react";
import type { CatmullRomCurve3 as Curve, Vector3 as V3 } from "three";
import { motionOn } from "@/lib/ease";

const top = (el: Element) => el.getBoundingClientRect().top + scrollY;
const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
type Stop = { y: number; pos: [number, number, number]; look: [number, number, number]; dim: number; rest: number; veil?: number; fog?: number };

/* The page's one moving world: the machine you fly through, plus the gear chain that runs down the last sections. Everything else is ordinary DOM in front of it. */
export function Machine() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stopped = false, raf = 0, dispose = () => {};
    const root = document.documentElement;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (!motionOn() || conn?.saveData || !document.createElement("canvas").getContext("webgl2")) return;
    const frozen = process.env.NODE_ENV === "development" ? new URLSearchParams(location.search).get("t") : null;
    const start = async () => {
      const [{ createMachine }, { CatmullRomCurve3, Vector3 }] = await Promise.all([import("@/components/machine-scene"), import("three")]);
      const canvas = ref.current;
      if (stopped || !canvas) return;
      const wide = innerWidth >= 1024;
      const m = createMachine(canvas, { mobile: innerWidth < 768 });
      dispose = () => m.dispose();
      let stops: Stop[] = [], posC: Curve, lookC: Curve, th = { y: 0, S: 1 }, wwd = { y: 0, S: 1 };
      const work = document.querySelector("#work") as HTMLElement;
      const layout = () => {
        m.resize();
        const q = (s: string) => document.querySelector(s) as HTMLElement, vh = innerHeight;
        const thEl = q(".th"), thT = top(thEl), S = thEl.offsetHeight - vh, w = top(work), wEnd = w + work.offsetHeight, tr = q(".wwd-track"), pT = top(tr), pS = tr.offsetHeight - vh, ap = top(q("#approach")), co = top(q("#contact")), end = root.scrollHeight - vh;
        th = { y: thT, S }; wwd = { y: pT, S: pS };
        /* dim is its strength while you travel. rest is its strength once you stop to read. */
        const around = (x: number, y: number, z: number): [number, number, number] => { const k = wide ? 1 : 1.5; return [x * k, y * k, -82 + z * k]; };
        stops = [
          /* The drive, clear of the words. It's the one place the machine stays at full strength. */
          { y: 0, pos: wide ? [30.5, 25, 54] : [10, 9, 36], look: wide ? [10.5, -1, 1] : [3, 0, 2], dim: 1.3, rest: wide ? 1.3 : 0.3, veil: 1, fog: 130 },
          { y: vh * 0.45, pos: [8, 6, 26], look: [2, 0.5, 2], dim: 1.1, rest: wide ? 1 : 0.3, veil: 0.8, fog: 90 },
          /* Straight at the big gear, then in through its centre. */
          { y: thT, pos: [0, 0, 11], look: [0, 0, -12], dim: 1, rest: 0.14, fog: 50 },
          { y: thT + S * 0.14, pos: [0.6, -0.4, -6], look: [wide ? -2 : 0, 0, -24], dim: 0.8, rest: 0.1 },
          /* Inside the tangle, which straightens out as the section closes. */
          { y: thT + S * 0.7, pos: [-1.4, 1.1, -14], look: [wide ? -2 : 0, 0, -30], dim: 0.8, rest: 0.1 },
          { y: thT + S, pos: [0, 0, -23], look: [0, 0, -40], dim: 0.9, rest: 0.14 },
          /* Out of the tangle, into the gear room. */
          { y: w - vh * 0.1, pos: [0.5, -0.5, -30], look: [0, 0, -41], dim: 1, rest: 0.26, fog: 34 },
          { y: w + vh * 0.5, pos: [-0.8, 0.8, -36], look: [0.4, 0, -44], dim: 1, rest: 0.2, fog: 34 },
          /* Past the gears, along the conveyor. */
          { y: wEnd - vh * 0.8, pos: [0.6, -1.6, -50], look: [0, -2, -64], dim: 1, rest: 0.2 },
          { y: pT - vh * 0.25, pos: around(13, 11, 24), look: [0, -0.5, -82], dim: 1, rest: 0.22, veil: 0.3, fog: 46 },
          /* The layers build up here, beside the copy. The camera drifts round them as they do. */
          { y: pT + pS * 0.1, pos: around(12, 9, 17), look: [0, -0.8, -82], dim: 1, rest: wide ? 1 : 0.5, veil: 0.3 },
          { y: pT + pS * 0.85, pos: around(-6.5, 10.5, 18.5), look: [0, -0.4, -82], dim: 1.1, rest: wide ? 1.1 : 0.6, veil: 0.3 },
          { y: pT + pS, pos: around(-8, 11, 19), look: [0, -0.4, -82], dim: 1.1, rest: wide ? 1.1 : 0.6, veil: 0.3 },
          /* Then over the top of the finished system and on, down into the corridor. */
          { y: pT + pS + vh * 0.55, pos: [0, 7, -78], look: [0, -1, -98], dim: 1, rest: 0.25 },
          /* Into the long corridor as the page moves on. */
          { y: ap, pos: [0, 0.4, -92], look: [0, 0, -108], dim: 0.65, rest: 0.07 },
          { y: co - vh * 0.5, pos: [0, -0.2, -124], look: [0, 0, -137], dim: 0.6, rest: 0.06 },
          /* The core. */
          { y: end, pos: [wide ? 2.6 : 0, 0.2, -124.5], look: [wide ? -3.6 : 0, 0, -137], dim: 0.5, rest: 0.05, fog: 34 },
        ];
        scheduleChain();
        for (let i = 1; i < stops.length; i++) if (stops[i].y <= stops[i - 1].y) stops[i].y = stops[i - 1].y + 1;
        posC = new CatmullRomCurve3(stops.map((s) => new Vector3(...s.pos)), false, "centripetal");
        lookC = new CatmullRomCurve3(stops.map((s) => new Vector3(...s.look)), false, "centripetal");
      };
      /* The drive line: anchored in the empty space each section leaves, ending at Contact. */
      let chainSig = "", chainTimer = 0;
      const buildChain = () => {
        const vw = innerWidth, vh = innerHeight, Rc = (sel: string) => { const q = (document.querySelector(sel) as HTMLElement).getBoundingClientRect(); return { l: q.left, r: q.right, t: q.top + scrollY, b: q.bottom + scrollY, h: q.height, w: q.width }; };
        const apH = Rc("#approach h2"), ol = Rc("#approach ol"), pri = Rc("section:has(#principles-h)"), port = Rc(".st-portrait"), pull = Rc(".st-pull"), fitH = Rc("#fit-h"), fitB = Rc("section:has(#fit-h) p:not(.label)"), coB = Rc("#contact .body"), coH = Rc("#contact h2"), form = Rc("#contact form"), foot = Rc("footer");
        const pc = { x: (port.l + port.r) / 2, y: (port.t + port.b) / 2, r: port.w / 2 };
        const ring = { x: pc.x, y: pc.y, r: pc.r * (wide ? 1.24 : 1.2), hole: pc.r * 1.045, kind: "clear" as const };
        const anchors = wide ? [
          { x: vw * 0.86, y: apH.b - 10, r: vw * 0.075 },
          { x: ol.l * 0.6, y: ol.t - 36, r: vw * 0.042 },
          { x: ol.l * 0.62, y: ol.t + ol.h * 0.62, r: vw * 0.07 },
          { x: vw * 0.2, y: pri.t + pri.h * 0.42, r: vw * 0.085, kind: "soft" as const },
          { x: vw * 0.13, y: pri.t + pri.h * 0.8, r: vw * 0.05, kind: "soft" as const },
          ring,
          { x: vw * 0.68, y: pull.t - 62, r: vw * 0.04 },
          { x: vw * 0.89, y: (pull.t + pull.b) / 2, r: vw * 0.06 },
          { x: vw * 0.91, y: fitH.t + fitH.h * 0.3, r: vw * 0.055 },
          { x: vw * 0.53, y: (fitB.b + form.t) / 2, r: vw * 0.05 },
          { x: (coH.r + form.l) / 2, y: form.t + 190, r: vw * 0.036 },
          { x: vw * 0.23, y: coB.b + vw * 0.105 + 24, r: vw * 0.105, kind: "clear" as const },
        ] : [
          { x: vw * 1.02, y: apH.t + 30, r: vw * 0.2 },
          { x: vw * 1.02, y: ol.t + ol.h * 0.5, r: vw * 0.17 },
          { x: vw * 1.04, y: pri.t + pri.h * 0.35, r: vw * 0.2 },
          { x: vw * 1.0, y: pri.t + pri.h * 0.8, r: vw * 0.16 },
          ring,
          { x: vw * 1.02, y: (pull.t + pull.b) / 2, r: vw * 0.18 },
          { x: vw * 1.02, y: fitB.b, r: vw * 0.16 },
          { x: vw * 0.84, y: foot.t - vw * 0.12, r: vw * 0.17, kind: "clear" as const },
        ];
        const sig = anchors.map((a) => `${Math.round(a.x / 8)},${Math.round(a.y / 8)}`).join("|");
        if (sig === chainSig) return;
        chainSig = sig;
        const range = document.createRange(), text: { l: number; r: number; t: number; b: number }[] = [];
        document.querySelectorAll<HTMLElement>("#approach h2, #approach p, #approach h3, section:has(#principles-h) .pr-item, #studio h2, #studio p, section:has(#fit-h) h2, section:has(#fit-h) p, #contact h2, #contact p, #contact form, footer p, footer a").forEach((el) => {
          range.selectNodeContents(el);
          const q = range.getBoundingClientRect();
          if (q.width) text.push({ l: q.left, r: q.right, t: q.top + scrollY, b: q.bottom + scrollY });
        });
        m.setChain(anchors, vw, vh, (x, y, r) => {
          const hit = text.some((q) => { const dx = Math.max(q.l - x, 0, x - q.r), dy = Math.max(q.t - y, 0, y - q.b); return Math.hypot(dx, dy) < r * 1.02; });
          if (hit) return "dim";
          /* The heading in How we think is sticky, so its whole column stays a little quieter. */
          return wide && y > pri.t && y < pri.b && x < vw * 0.36 ? "soft" : "clear";
        });
      };
      const scheduleChain = () => { clearTimeout(chainTimer); chainTimer = window.setTimeout(buildChain, frozen !== null ? 0 : 1200); };
      layout();
      addEventListener("resize", layout);
      addEventListener("load", layout);
      new ResizeObserver(layout).observe(document.body);
      const P: V3 = new Vector3(), L: V3 = new Vector3();
      /* The founder's portrait: it rounds into a circle, and the machine's rings come up behind it. */
      const portrait = document.querySelector(".st-portrait") as HTMLElement | null;
      let lastY = scrollY, move = 0;
      const step = (t: number, y: number, dt = 1 / 60) => {
        let i = 0;
        while (i < stops.length - 2 && y > stops[i + 1].y) i++;
        const a = stops[i], b = stops[i + 1], x = Math.min(1, Math.max(0, (y - a.y) / (b.y - a.y))), e = x * 0.5 + (x * x * (3 - 2 * x)) * 0.5;
        const u = (i + e) / (stops.length - 1);
        posC.getPoint(u, P); lookC.getPoint(u, L);
        /* Never quite still: the camera breathes with the machine. */
        P.x += Math.sin(t * 0.3) * 0.12; P.y += Math.sin(t * 0.41 + 1) * 0.1;
        const v = Math.abs(y - lastY) / Math.max(dt, 1 / 240) / innerHeight; lastY = y;
        /* The machine comes alive as you travel and settles quickly into the background when you stop to read. */
        const want = Math.min(1, v * 1.3);
        move += (want - move) * (1 - Math.exp(-dt * (want > move ? 9 : 1.6)));
        const restNow = a.rest + (b.rest - a.rest) * e, moveNow = (a.dim + (b.dim - a.dim) * e) * (wide ? 1 : 0.7);
        const r = work.getBoundingClientRect();
        let pw = 0, cx = 0, cy = 0;
        if (portrait) {
          const b = portrait.getBoundingClientRect(), vh = innerHeight;
          cx = b.left + b.width / 2; cy = b.top + b.height / 2;
          pw = sstep(vh * 1.15, vh * 0.62, cy) * (1 - sstep(vh * 0.32, -vh * 0.12, cy));
          /* Once it has become a circle it stays one. */
          portrait.style.borderRadius = `${14 + (b.width / 2 - 14) * Math.max(sstep(vh * 1.15, vh * 0.72, cy), cy < vh * 0.72 ? 1 : 0)}px`;
        }
        /* While that happens the camera sits on the corridor's axis, so its lines all run in behind the circle. */
        if (pw > 0) { P.x *= 1 - pw; P.y *= 1 - pw; L.x *= 1 - pw; L.y *= 1 - pw; L.z = P.z - 20 * pw + (L.z - (P.z - 20)) * (1 - pw); }
        const d = (y - wwd.y) / wwd.S;
        const wwdIn = sstep(wwd.y - innerHeight * 1.1, wwd.y - innerHeight * 0.2, y) * (1 - sstep(wwd.y + wwd.S + innerHeight * 0.1, wwd.y + wwd.S + innerHeight * 0.55, y));
        /* Interior rooms appear as the camera nears the intake. */
        const inT = sstep(th.y - innerHeight * 0.3, th.y + th.S * 0.1, y);
        m.draw({
          clipZ: -8 + inT * -200, navFade: 1 - inT, edge: [0.46 + (0.12 - 0.46) * inT, 0.56 + (0.72 - 0.56) * inT],
          shift: [(cx - innerWidth / 2) * pw + (1 - inT) * (wide ? innerWidth * 0.315 : 0) + wwdIn * (wide ? innerWidth * 0.2 : 0), (cy - innerHeight / 2) * pw + (1 - inT) * (wide ? innerHeight * 0.155 : innerHeight * 0.36) + wwdIn * (wide ? 0 : -innerHeight * 0.2)], 
          chain: { y: scrollY, turn: y, move, t },
          t, pos: P, look: L, roll: Math.sin(u * 14) * 0.06 * (1 - pw),
          tidy: sstep(0.72, 0.95, (y - th.y) / th.S),
          stack: { d, dt },
          dim: restNow + (moveNow - restNow) * move, veil: wide ? (a.veil ?? 0) + ((b.veil ?? 0) - (a.veil ?? 0)) * e : 0, fogFar: (a.fog ?? 30) + ((b.fog ?? 30) - (a.fog ?? 30)) * e,
          speed: Math.min(0.9, v * 0.16), bandTop: r.top, bandBottom: r.bottom,
        });
      };
      if (process.env.NODE_ENV === "development") (window as unknown as { __shape: unknown }).__shape = { step, settle: (to = 0) => { move = to; lastY = scrollY; } };
      root.classList.add("world");
      const reveal = () => { canvas.classList.add("on"); root.classList.add("machine-on"); };
      if (frozen !== null) { step(parseFloat(frozen), scrollY); reveal(); root.dataset.ready = "1"; return; }
      let cur = scrollY, prev = performance.now(), frames = 0, slow = 0;
      const loop = (now: number) => {
        const delta = now - prev; prev = now;
        const dt = Math.min(delta, 50) / 1000;
        cur += (scrollY - cur) * (1 - Math.exp(-dt * 5));
        step(now / 1000, cur, dt);
        frames++; if (delta > 24) slow++;
        if (frames >= 60) { if (slow > 24) m.lowerQuality(); frames = 0; slow = 0; }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      requestAnimationFrame(reveal);
      root.dataset.ready = "1";
    };
    /* The page paints and settles first; the machine fades in over the still. */
    const idle = () => {
      const go = () => void start().catch(() => {});
      const ric = (window as unknown as { requestIdleCallback?: (f: () => void, o?: object) => number }).requestIdleCallback;
      setTimeout(() => (ric ? ric(go, { timeout: 1200 }) : go()), frozen !== null ? 0 : 900);
    };
    if (document.readyState === "complete") idle();
    else addEventListener("load", idle, { once: true });
    return () => { stopped = true; cancelAnimationFrame(raf); dispose(); removeEventListener("load", idle); root.classList.remove("machine-on", "world"); };
  }, []);

  return <canvas ref={ref} aria-hidden className="machine" />;
}
