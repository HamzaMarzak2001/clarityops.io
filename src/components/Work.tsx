"use client";
import { useEffect, useRef } from "react";
import { type Case, cases } from "@/content/work";
import { io, motionOn, seg } from "@/lib/ease";
import { lenisRef } from "@/lib/lenis";
import { Laptop } from "./Laptop";
import { IslandMessages, SystemMap, layout } from "./SystemMap";

/* Selected work. The section pins, and each project plays on a laptop: the team doing it all by hand, the system wired in part by part,
   the whole system, then the steps it took off the team. Then the project slides off to the left and the next comes in from the right.
   Lengths are in screens of scroll. Every change is spread over a long stretch of scroll, and the stage follows the scroll with
   a little easing, so it moves at the same calm pace as the rest of the page. */
const FULL = 2, MOVE = 0.6, LAG = 0.14;
const FIX: [number, number] = [0.07, 0.19];
/* The camera arrives at each part, holds, then moves on. */
const ARRIVE = [0.24, 0.35, 0.46, 0.57], HOLD = 0.05, BACK = 0.7;
/* Where each beat of copy starts: before, the four parts, the system, the result. */
const EDGES = [-1, 0.2, 0.305, 0.415, 0.525, 0.635, 0.78, 2];
const TAB: [number, number] = [0.74, 0.8], FLIP: [number, number] = [0.8, 0.95];
const smooth = (t: number) => t * t * (3 - 2 * t);

const pad = (n: number) => String(n).padStart(2, "0");

function CaseSlide({ c, i }: { c: Case; i: number }) {
  return (
    <article className="wk-case" data-case={c.slug} aria-labelledby={`case-${c.slug}`}>
      <div className="wk-head">
        <p className="label wk-who"><span className="wk-num">{pad(i + 1)}</span><span className="wk-name">{c.name}</span><span className="wk-kick">{c.kicker}</span></p>
        <h3 id={`case-${c.slug}`} className="wk-h">{c.headline}</h3>
        <a href={`/work/${c.slug}`} className="tlink wk-read">Read the full case<span aria-hidden> →</span><span className="sr-only">: {c.name}</span></a>
      </div>
      <div className="wk-device">
        <Laptop app={c.hub[0]} island={<IslandMessages c={c} />}><SystemMap c={c} /></Laptop>
      </div>
      <div className="wk-beats">
        <div className="wk-beat"><p className="label wk-k">Before</p><p className="wk-t">{c.before.title}</p><p className="wk-line">{c.before.text}</p></div>
        <ol className="wk-steps" aria-label="How it works">
          {c.zones.map((z, k) => (
            <li key={z.label} className="wk-beat">
              <p className="label wk-k"><span className="wk-n">{k + 1} / 4</span>How it works</p>
              <p className="wk-t">{z.title}</p>
              <p className="wk-line">{z.text}</p>
            </li>
          ))}
        </ol>
        <div className="wk-beat"><p className="label wk-k">The system</p><p className="wk-t">{c.system.title}</p><p className="wk-line">{c.system.text}</p></div>
        <div className="wk-beat">
          <p className="label wk-k">What changed</p>
          <ul className="wk-facts">
            {c.outcomes.map((o) => <li key={o.label}><b><s>{o.from}</s><span aria-hidden> → </span><span className="sr-only"> down to </span>{o.to}</b>{o.label}</li>)}
          </ul>
        </div>
      </div>
    </article>
  );
}

/* One function per case that draws it at progress u, 0 to 1. Everything here is continuous: no switches, no CSS transitions. */
function drawer(el: HTMLElement, c: Case) {
  const q = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const beats = q(".wk-beat"), msgs = q(".lap-msg");
  const island = el.querySelector<HTMLElement>(".lap-island")!;
  const world = el.querySelector<HTMLElement>(".sm-world")!, map = el.querySelector<HTMLElement>(".sm-map")!, table = el.querySelector<HTMLElement>(".sm-table")!;
  const dash = el.querySelector<SVGGElement>(".sm-dash")!;
  const base = Array.from(el.querySelectorAll<SVGGElement>(".sm-base")), live = Array.from(el.querySelectorAll<SVGGElement>(".sm-live"));
  const ht0 = el.querySelector<HTMLElement>(".sm-ht0")!, ht1 = el.querySelector<HTMLElement>(".sm-ht1")!, hub = el.querySelector<HTMLElement>(".sm-hub")!, arrows = q(".sm-arrow");
  const nodes = q(".sm-node"), frames = q(".sm-frame");
  const rows = q(".sm-row"), num = el.querySelector<HTMLElement>(".sm-n")!;
  const zones = layout(c);
  const manual = rows.filter((r) => !r.classList.contains("is-person"));
  const keys: [number, number, number, number][] = [[FIX[1], 50, 50, 1]];
  zones.forEach((z, k) => { keys.push([ARRIVE[k], z.x, 40, 1.5], [ARRIVE[k] + HOLD, z.x, 40, 1.5]); });
  keys.push([BACK, 50, 50, 1]);
  let lastN = "";
  const isl = { t: 0, open: 0, fade: 1, shown: 0 };

  return (u: number) => {
    /* the copy: one beat at a time, cross-faded over a long stretch */
    let active = 0;
    beats.forEach((b, k) => {
      const a = EDGES[k], z = EDGES[k + 1];
      const inn = a < 0 ? 1 : smooth(seg(u, a, a + 0.045)), off = z > 1 ? 0 : smooth(seg(u, z - 0.035, z));
      b.style.opacity = (inn * (1 - off)).toFixed(3);
      b.style.transform = `translate3d(0,${((1 - inn) * 0.75 - off * 0.75).toFixed(3)}rem,0)`;
      if (u >= a && u < z) active = k;
    });

    /* The island runs on its own clock, like the real one: scroll decides what it says, time decides how fast it moves.
       It opens once, stays open through the project, and swaps its message with a short fade, so every line can be read. */
    const now = performance.now(), dt = Math.min(0.05, isl.t ? (now - isl.t) / 1000 : 0);
    isl.t = now;
    const want = u > 0.015 && u < 0.995 ? 1 : 0;
    isl.open += (want - isl.open) * (1 - Math.exp(-dt / 0.16));
    if (active !== isl.shown) { isl.fade -= dt / 0.16; if (isl.fade <= 0) { isl.fade = 0; isl.shown = active; } }
    else isl.fade = Math.min(1, isl.fade + dt / 0.32);
    const textOn = isl.fade * Math.max(0, (isl.open - 0.7) / 0.3);
    msgs.forEach((m, k) => { m.style.opacity = k === isl.shown ? textOn.toFixed(3) : "0"; });
    island.style.setProperty("--open", isl.open.toFixed(3));
    island.style.setProperty("--pulse", (1 - isl.fade).toFixed(3));

    /* before: the team in the middle, nothing connected. Then the system takes its place. */
    const fix = smooth(seg(u, FIX[0], FIX[1]));
    ht0.style.opacity = (1 - fix).toFixed(3);
    ht1.style.opacity = fix.toFixed(3);
    hub.style.setProperty("--fix", fix.toFixed(3));
    dash.style.opacity = (1 - fix).toFixed(3);
    arrows.forEach((a) => { a.style.opacity = (0.25 + 0.75 * fix).toFixed(3); });

    /* the camera glides from part to part */
    let cx = 50, cy = 50, s = 1;
    if (u >= keys[keys.length - 1][0]) { [, cx, cy, s] = keys[keys.length - 1]; }
    else for (let i = 0; i < keys.length - 1; i++) {
      const [a, x0, y0, s0] = keys[i], [b, x1, y1, s1] = keys[i + 1];
      if (u < a) break;
      if (u <= b) { const t = smooth((u - a) / (b - a)); cx = x0 + (x1 - x0) * t; cy = y0 + (y1 - y0) * t; s = s0 + (s1 - s0) * t; break; }
    }
    world.style.transform = `translate(${(50 - cx * s).toFixed(3)}%,${(50 - cy * s).toFixed(3)}%) scale(${s.toFixed(4)})`;

    /* each part lights up while the camera is on it, and all of them at the end */
    const every = smooth(seg(u, BACK - 0.06, BACK));
    const lit = zones.map((_, k) => Math.max(every, smooth(seg(u, ARRIVE[k] - 0.05, ARRIVE[k] - 0.005)) * (1 - smooth(seg(u, ARRIVE[k] + HOLD + 0.005, ARRIVE[k] + HOLD + 0.05)))));
    const focus = Math.max(...lit) * (1 - every);
    const level = lit.map((l) => fix * (1 - focus + focus * l));
    frames.forEach((f, k) => { f.style.opacity = (0.35 + 0.65 * level[k]).toFixed(3); f.style.setProperty("--on", (lit[k] * fix).toFixed(3)); });
    nodes.forEach((n) => { const k = +n.dataset.z!; n.style.opacity = (0.45 + 0.55 * Math.max(1 - fix, level[k])).toFixed(3); n.style.setProperty("--on", (lit[k] * fix).toFixed(3)); });
    base.forEach((g, k) => { g.style.opacity = (fix * (0.4 + 0.6 * level[k])).toFixed(3); });
    live.forEach((g, k) => { g.style.opacity = (lit[k] * fix).toFixed(3); });

    /* then the same work as a list, each step going automatic */
    const t = smooth(seg(u, TAB[0], TAB[1]));
    map.style.opacity = (1 - t).toFixed(3);
    table.style.opacity = t.toFixed(3);
    table.style.transform = `translate3d(0,${((1 - t) * 3).toFixed(2)}%,0)`;
    const per = (FLIP[1] - FLIP[0]) / manual.length;
    let left = manual.length;
    manual.forEach((r, k) => {
      const f = smooth(seg(u, FLIP[0] + k * per, FLIP[0] + (k + 0.85) * per));
      r.style.setProperty("--f", f.toFixed(3));
      if (f > 0.5) left--;
    });
    const n = String(left);
    if (n !== lastN) { num.textContent = n; lastN = n; }
  };
}

export function Work() {
  const run = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLOListElement>(null);
  const starts = useRef<number[]>([]);

  useEffect(() => {
    const runEl = run.current, pinEl = pin.current, trackEl = track.current, railEl = rail.current;
    if (!runEl || !pinEl || !trackEl || !railEl || !motionOn()) return;
    const N = cases.length;
    starts.current = cases.map((_, i) => i * (FULL + MOVE));
    const S = starts.current;
    runEl.style.setProperty("--run", String(N * FULL + (N - 1) * MOVE));
    const slides = Array.from(trackEl.querySelectorAll<HTMLElement>(".wk-case"));
    const draws = slides.map((el, i) => drawer(el, cases[i]));
    const bars = Array.from(railEl.querySelectorAll<HTMLElement>("i"));
    const items = Array.from(railEl.querySelectorAll<HTMLElement>("li"));

    let raf = 0, current = -1, P = NaN, then = 0;
    const frame = (now: number) => {
      const target = -runEl.getBoundingClientRect().top / pinEl.offsetHeight;
      /* Follow the scroll with a little easing. A jump (a click on the rail, a resize) lands without a long glide. */
      const dt = Math.min(0.05, then ? (now - then) / 1000 : 1);
      then = now;
      if (Number.isNaN(P) || Math.abs(target - P) > 1.5) P = target;
      else P += (target - P) * (1 - Math.exp(-dt / LAG));
      let pos = N - 1;
      for (let i = 0; i < N; i++) {
        if (P < S[i] + FULL) { pos = i; break; }
        if (i < N - 1 && P < S[i + 1]) { pos = i + io((P - S[i] - FULL) / MOVE); break; }
      }
      trackEl.style.transform = `translate3d(${(-pos * pinEl.clientWidth).toFixed(1)}px,0,0)`;
      slides.forEach((el, j) => {
        const d = Math.abs(pos - j);
        el.style.opacity = (1 - Math.min(1, d) * 0.85).toFixed(3);
        el.toggleAttribute("inert", d > 0.5);
        if (d < 1.2) draws[j](Math.min(1, Math.max(0, (P - S[j]) / FULL)));
      });
      bars.forEach((b, j) => { b.style.transform = `scaleX(${Math.min(1, Math.max(0, (P - S[j]) / FULL)).toFixed(4)})`; });
      const at = Math.round(pos);
      if (at !== current) { current = at; items.forEach((it, j) => it.toggleAttribute("data-on", j === at)); }
    };
    const loop = (now: number) => { frame(now); raf = requestAnimationFrame(loop); };
    const watch = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) { then = 0; raf = requestAnimationFrame(loop); }
    }, { rootMargin: "20% 0px" });
    watch.observe(runEl);
    /* Draw once now, so nothing flashes before the first scroll. */
    frame(performance.now());
    const onResize = () => { P = NaN; };
    addEventListener("resize", onResize);
    return () => { watch.disconnect(); cancelAnimationFrame(raf); removeEventListener("resize", onResize); };
  }, []);

  const jump = (i: number) => {
    const runEl = run.current, pinEl = pin.current;
    if (!runEl || !pinEl) return;
    if (!starts.current.length) { document.querySelector(`[data-case="${cases[i].slug}"]`)?.scrollIntoView(); return; }
    const y = runEl.getBoundingClientRect().top + scrollY + (starts.current[i] + 0.02) * pinEl.offsetHeight;
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 1.4 });
    else scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section id="work" aria-labelledby="work-h" className="paper bg-paper text-ink">
      <div className="wrap pt-20 md:pt-32 xl:pt-44">
        <p className="label mb-6 !text-ink-2">Selected work</p>
        <h2 id="work-h" className="d-xl max-w-[11.5em]">Systems that are running today.</h2>
      </div>
      <div ref={run} className="wk-run">
        <div ref={pin} className="wk-pin">
          <div ref={track} className="wk-track">
            {cases.map((c, i) => <CaseSlide key={c.slug} c={c} i={i} />)}
          </div>
          <div className="wk-railbox">
            <ol ref={rail} className="wk-rail" aria-label="Projects">
              {cases.map((c, i) => (
                <li key={c.slug} data-on={i === 0 ? "" : undefined}>
                  <button type="button" onClick={() => jump(i)}><span className="wk-rn">{pad(i + 1)}</span><span className="wk-rname">{c.name}</span></button>
                  <span className="wk-bar"><i /></span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
