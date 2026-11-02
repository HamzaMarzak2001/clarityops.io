"use client";
import { useScroll, useMotionValueEvent } from "motion/react";
import { type RefObject, useEffect, useRef, useState } from "react";
import { type Case, cases } from "@/content/work";
import { motionOn, seg } from "@/lib/ease";
import { lenisRef } from "@/lib/lenis";
import { CaseDialog } from "./CaseDialog";
import { SystemScene } from "./SystemScene";

/* While the next case rises over this one, this one holds still and steps back. */
function useStepBack(next: RefObject<HTMLElement | null>, inner: RefObject<HTMLDivElement | null>, dim: RefObject<HTMLSpanElement | null>) {
  const { scrollYProgress } = useScroll({ target: next, offset: ["start end", "start start"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const el = inner.current;
    if (!el || !motionOn()) return;
    const q = seg(p, 0.1, 1);
    el.style.transform = `scale(${(1 - q * 0.035).toFixed(4)})`;
    /* A paper overlay, not group opacity: opacity over a playing video costs a render surface per frame. */
    if (dim.current) dim.current.style.opacity = String(q * 0.6);
    /* A sticky case stays "in view" while covered, so it must stop itself: it holds still as the next one rises. */
    el.toggleAttribute("data-held", p > 0.1);
  });
}

/* A sticky case can be covered by the next one, and the browser cannot scroll it free. Keyboard focus does it here. */
function revealCovered(article: HTMLElement) {
  const next = article.nextElementSibling;
  if (!next || next.getBoundingClientRect().top >= innerHeight * 0.8) return;
  let flowTop = (article.parentElement as HTMLElement).getBoundingClientRect().top + scrollY + parseFloat(getComputedStyle(article).marginTop);
  for (let el = article.previousElementSibling as HTMLElement | null; el; el = el.previousElementSibling as HTMLElement | null) flowTop += el.offsetHeight + parseFloat(getComputedStyle(el).marginTop);
  const y = flowTop + Math.max(0, article.offsetHeight - innerHeight);
  if (lenisRef.current) lenisRef.current.scrollTo(y, { immediate: true, force: true });
  else scrollTo({ top: y, behavior: "instant" });
}

function Spread({ c, next, onOpen }: { c: Case; next: RefObject<HTMLElement | null>; onOpen: (c: Case, el: HTMLElement) => void }) {
  const root = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLSpanElement>(null);
  useStepBack(next, inner, dim);

  useEffect(() => {
    const el = root.current;
    if (!el || !motionOn()) return;
    const set = () => { el.style.setProperty("--stick", `${Math.min(0, innerHeight - el.offsetHeight)}px`); };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    addEventListener("resize", set);
    return () => { ro.disconnect(); removeEventListener("resize", set); };
  }, []);

  return (
    <article ref={root} aria-labelledby={`case-${c.slug}`} data-case={c.slug} className="spread">
      <div ref={inner} className="spread-in">
        <div className="wrap">
          <div className="grid12 gap-y-6">
            <p className="label col-span-12 pt-2 !text-ink-2 lg:col-span-3">
              <span className="block font-medium text-ink">{c.name}</span>
              {c.kicker}
            </p>
            <h3 id={`case-${c.slug}`} className="d col-span-12 lg:col-span-9">{c.headline}</h3>
          </div>
          <button type="button" aria-label={`Open the ${c.name} case`} onClick={(e) => onOpen(c, e.currentTarget)} onFocus={(e) => { if (root.current && motionOn() && e.currentTarget.matches(":focus-visible")) revealCovered(root.current); }} className="frame work-frame mt-8 block w-[calc(100%+2*var(--m))] cursor-pointer md:w-full lg:mt-12">
            <SystemScene scene={c.scene} />
            <span aria-hidden className="work-open">Open</span>
          </button>
          <ul className="spread-facts">
            {c.facts.map((f) => <li key={f} className="metric">{f}</li>)}
          </ul>
        </div>
      </div>
      <span ref={dim} aria-hidden className="spread-dim" />
    </article>
  );
}

export function Work() {
  const [open, setOpen] = useState<Case | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const r0 = useRef<HTMLElement>(null), r1 = useRef<HTMLElement>(null), r2 = useRef<HTMLElement>(null), r3 = useRef<HTMLElement>(null), end = useRef<HTMLDivElement>(null);
  const nexts = [r1, r2, r3, end] as RefObject<HTMLElement | null>[];

  useEffect(() => {
    const arts = document.querySelectorAll<HTMLElement>(".spread");
    [r0, r1, r2, r3].forEach((r, i) => { r.current = arts[i] ?? null; });
  }, []);

  return (
    <section id="work" aria-labelledby="work-h" className="paper bg-paper text-ink">
      <div className="wrap pt-20 md:pt-32 xl:pt-44">
        <p className="label mb-6 !text-ink-2">Selected work</p>
        <h2 id="work-h" className="d-xl max-w-[11.5em]">Systems that are running today.</h2>
      </div>
      {cases.map((c, i) => (
        <Spread key={c.slug} c={c} next={nexts[i]} onOpen={(x, el) => { opener.current = el; setOpen(x); }} />
      ))}
      <div ref={end} className="spread-end">
        {/* Hamza confirms this line before it can ship. Off unless the TODO flag is set. */}
        {process.env.NEXT_PUBLIC_SHOW_TODOS === "1" && (
          <div className="wrap pt-20 lg:pt-32">
            <p className="d">Every engagement above is still running.</p>
            <p className="todo mt-6 max-w-[62ch] text-ink-2">TODO, Hamza: confirm this is true before publishing. The line stays out of production until then.</p>
          </div>
        )}
      </div>
      {open && <CaseDialog c={open} onClose={() => { setOpen(null); opener.current?.focus(); }} />}
    </section>
  );
}
