"use client";
import { useEffect, useRef } from "react";
import { motionOn } from "@/lib/ease";
import { lift, opening } from "@/lib/opening";

/* Never quicker than this, so it reads as a moment and not a flash. Never longer than the cap: past that the page shows and the machine joins when it can. */
const MIN = 1600, CAP = 6500, BAIL = 8500;

/* A black curtain over the page while the machine is built and warmed. The bar shows real progress. */
export function Loader() {
  const root = useRef<HTMLDivElement>(null), bar = useRef<HTMLElement>(null), count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!motionOn()) return;
    const el = root.current!, html = document.documentElement;
    /* The script came so late that the curtain has already gone by itself. */
    if (performance.now() > BAIL) { el.classList.add("gone"); lift(); return; }
    let raf = 0, shown = 0, prev = performance.now(), timer = 0;
    const paint = () => { bar.current!.style.transform = `scaleX(${shown})`; count.current!.textContent = String(Math.round(shown * 100)); };
    const go = () => {
      html.classList.add("enter");
      el.classList.add("out");
      lift();
      timer = window.setTimeout(() => el.classList.add("gone"), 1000);
    };
    const tick = (now: number) => {
      const dt = Math.min(now - prev, 250) / 1000; prev = now;
      shown += (Math.min(now / MIN, opening.target) - shown) * (1 - Math.exp(-dt * 9));
      if ((opening.ready && shown > 0.995) || now > CAP) { shown = 1; paint(); timer = window.setTimeout(go, 160); return; }
      paint();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, []);

  return (
    <div ref={root} aria-hidden className="loader">
      <div className="loader-in">
        <span className="loader-mark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/logo-icon-gradient.svg#svgView(viewBox(75,95,350,350))" alt="" width={72} height={72} />
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/logo-wordmark-white.svg" alt="" width={124} height={44} className="loader-word" />
        <span className="loader-bar"><i ref={bar} /></span>
        <span ref={count} className="loader-count">0</span>
      </div>
    </div>
  );
}
