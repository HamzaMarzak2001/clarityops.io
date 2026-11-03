"use client";
import Image from "next/image";
import { cancelFrame, frame } from "motion/react";
import { useEffect, useRef } from "react";
import { icons } from "@/content/icons";
import type { Scene } from "@/content/work";
import { clamp, io, motionOn, out, seg } from "@/lib/ease";

/* One real record filling in, one step at a time, as you scroll. A quick look at the real screen first. No lines. */

const SHOT_END = 0.14, STEPS_FROM = 0.17, STEPS_TO = 0.9;

function Glyph({ icon, mark }: { icon?: string; mark?: string }) {
  if (icon && icons[icon]) return <svg viewBox="0 0 24 24" aria-hidden className="sn-icon"><path d={icons[icon]} fill="currentColor" /></svg>;
  return <span className="sn-mark">{mark}</span>;
}

export function SystemScene({ scene }: { scene: Scene }) {
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
    const shot = el.querySelector<HTMLElement>(".sn-shot")!, stage = el.querySelector<HTMLElement>(".sn-stage")!, sheet = el.querySelector<HTMLElement>(".sn-sheet")!;
    const rows = q(".sn-row"), caps = q(".sn-cap"), whos = q(".sn-who"), pips = q(".sn-pip i"), closing = el.querySelector<HTMLElement>(".sn-closing")!;
    const n = scene.steps.length;
    const span = (STEPS_TO - STEPS_FROM) / n;

    const render = (p: number) => {
      const back = io(seg(p, SHOT_END - 0.05, SHOT_END + 0.03));
      shot.style.opacity = (1 - back).toFixed(3);
      shot.style.transform = `scale(${(1 + back * 0.05).toFixed(4)})`;
      stage.style.opacity = out(seg(p, SHOT_END - 0.02, SHOT_END + 0.05)).toFixed(3);
      sheet.style.transform = `translate3d(0,${((1 - out(seg(p, SHOT_END - 0.02, SHOT_END + 0.07))) * 28).toFixed(1)}px,0)`;

      scene.steps.forEach((_, i) => {
        const a = STEPS_FROM + i * span, z = a + span;
        const on = out(seg(p, a, a + span * 0.5));
        const r = rows[i];
        (r.querySelector(".sn-val") as HTMLElement).style.transform = `translate3d(0,${((1 - on) * 110).toFixed(1)}%,0)`;
        const tile = r.querySelector(".sn-tile") as HTMLElement;
        tile.style.opacity = on.toFixed(3);
        tile.style.transform = `scale(${(0.7 + 0.3 * on).toFixed(3)})`;
        (r.querySelector(".sn-field") as HTMLElement).style.opacity = (0.34 + 0.66 * on).toFixed(3);
        /* The active row carries the light, then hands it on. */
        const active = i === n - 1 ? seg(p, a, a + span * 0.3) * (1 - seg(p, STEPS_TO, STEPS_TO + 0.04)) : seg(p, a, a + span * 0.3) * (1 - seg(p, z - span * 0.08, z + span * 0.2));
        (r.querySelector(".sn-glow") as HTMLElement).style.opacity = active.toFixed(3);

        const inn = out(seg(p, a, a + span * 0.42)), off = i === n - 1 ? seg(p, STEPS_TO, STEPS_TO + 0.03) : seg(p, z - span * 0.14, z);
        (caps[i].firstElementChild as HTMLElement).style.transform = `translate3d(0,${((1 - inn) * 101 - off * 101).toFixed(1)}%,0)`;
        whos[i].style.opacity = (inn * (1 - off)).toFixed(3);
        pips[i].style.transform = `scaleX(${seg(p, a, a + span * 0.8).toFixed(3)})`;
      });
      (closing.firstElementChild as HTMLElement).style.transform = `translate3d(0,${((1 - out(seg(p, STEPS_TO + 0.02, STEPS_TO + 0.08))) * 101).toFixed(1)}%,0)`;
    };

    if (!motionOn()) { render(1); return; }

    /* Scroll drives the timeline while the case is pinned, smoothed so it never steps. */
    const article = el.closest<HTMLElement>(".spread")!;
    let from = 0, to = 1;
    const range = () => {
      const parent = article.parentElement as HTMLElement;
      let flow = parent.getBoundingClientRect().top + scrollY + parseFloat(getComputedStyle(article).marginTop);
      for (let e = article.previousElementSibling as HTMLElement | null; e; e = e.previousElementSibling as HTMLElement | null) flow += e.offsetHeight + parseFloat(getComputedStyle(e).marginTop);
      const vh = innerHeight;
      const stuck = flow + Math.max(0, article.offsetHeight - vh);
      const next = article.nextElementSibling as HTMLElement | null;
      const dwell = next ? parseFloat(getComputedStyle(next).marginTop) : vh;
      from = stuck - vh * 0.3;
      to = stuck + dwell * 0.94;
    };
    range();
    const ro = new ResizeObserver(range);
    ro.observe(document.body);
    let t = -1, drawn = -1, visible = false;
    render(0);
    const tick = ({ delta }: { delta: number }) => {
      if (!visible) return;
      const goal = clamp((scrollY - from) / (to - from));
      if (t < 0) t = goal;
      else t += (goal - t) * (1 - Math.exp(-(Math.min(delta, 50) / 1000) * 9));
      if (Math.abs(goal - t) < 0.0005) t = goal;
      if (t === drawn) return;
      drawn = t;
      render(t);
    };
    const seen = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    seen.observe(el);
    frame.update(tick, true);
    return () => { ro.disconnect(); seen.disconnect(); cancelFrame(tick); };
  }, [scene]);

  return (
    <span ref={root} className="sn" role="img" aria-label={scene.summary}>
      <span className="sn-shot">
        <Image src={scene.shot.src} alt="" fill sizes="(min-width: 1344px) 80vw, 100vw" className="object-cover object-left-top" />
      </span>
      <span className="sn-stage" aria-hidden>
        <span className="sn-story">
          <span className="sn-whos">{scene.steps.map((s) => <span key={s.field} className="sn-who">{s.who}</span>)}</span>
          <span className="sn-caps">
            {scene.steps.map((s) => <span key={s.field} className="sn-cap"><span>{s.caption}</span></span>)}
            <span className="sn-cap sn-closing"><span>{scene.closing}</span></span>
          </span>
          <span className="sn-pips">{scene.steps.map((s) => <span key={s.field} className="sn-pip"><i /></span>)}</span>
        </span>
        <span className="sn-sheet">
          <span className="sn-head"><Glyph icon="notion" /><span>{scene.title}</span></span>
          {scene.steps.map((s) => (
            <span key={s.field} className="sn-row">
              <i className="sn-glow" />
              <span className="sn-tile"><Glyph icon={s.icon} mark={s.mark} /></span>
              <span className="sn-field">{s.field}</span>
              <span className="sn-valbox"><span className="sn-val">{s.value}</span></span>
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
