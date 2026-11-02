"use client";
import { useEffect, useRef } from "react";
import { io, motionOn, out, seg } from "@/lib/ease";
import { useScrub } from "@/lib/useScrub";

const lines = [
  "Work lives in inboxes, spreadsheets and people's heads.",
  "Every new tool adds another place to check.",
  "Every new hire adds another round of questions.",
  "And slowly, the founder becomes the system.",
];

/* Illustrative fragments in brand type. [kind, text, x, y, rotation, phone x, phone y]. Positions are fractions of the stage. */
const F: [string, string, number, number, number, number, number][] = [
  ["Inbox", "Re: Re: Fwd: site visit", 0.74, 0.08, -6, 0.04, 0.03],
  ["Sheet", "#REF!", 0.0, 0.1, 5, 0.96, 0.08],
  ["Chat", "Who has the latest?", 0.62, 0.74, 4, 0.08, 0.2],
  ["Note", "Call the supplier", 0.36, 0.04, -5, 0.92, 0.26],
  ["Sheet", "FINAL_v4_final.xlsx", 0.8, 0.42, 7, 0.04, 0.66],
  ["Inbox", "Invoice, second reminder", 0.02, 0.78, -4, 0.94, 0.63],
  ["Note", "Ask Hamza", 0.32, 0.82, 8, 0.14, 0.85],
  ["Chat", "Quick question", 0.86, 0.84, -8, 0.96, 0.84],
];

export function Thesis() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const focus = useRef<HTMLParagraphElement>(null);
  const close = useRef<HTMLParagraphElement>(null);
  const frags = useRef<(HTMLLIElement | null)[]>([]);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const geo = useRef<{ dx: number; dy: number; r: number }[]>([]);
  const small = useRef(false);

  useEffect(() => {
    if (!motionOn()) return;
    const measure = () => {
      const s = stage.current;
      if (!s) return;
      small.current = innerWidth < 640 || innerHeight < 620;
      const b = s.getBoundingClientRect();
      geo.current = frags.current.map((el, i) => {
        if (!el) return { dx: 0, dy: 0, r: 0 };
        const parent = el.offsetParent as HTMLElement;
        const pb = parent.getBoundingClientRect();
        const homeX = pb.left - b.left + el.offsetLeft;
        const homeY = pb.top - b.top + el.offsetTop;
        const [, , fx, fy, r, px, py] = F[i];
        const x = small.current ? px : fx, y = small.current ? py : fy;
        return { dx: x * (b.width - el.offsetWidth) - homeX, dy: y * (b.height - el.offsetHeight) - homeY, r: small.current ? r * 0.6 : r };
      });
    };
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, []);

  useScrub(root, ["start start", "end end"], (p) => {
    const sm = small.current;
    if (head.current) head.current.style.opacity = String(sm ? 1 - seg(p, 0.08, 0.15) : 1 - seg(p, 0.5, 0.58));
    if (list.current) list.current.style.opacity = String(1 - seg(p, 0.52, 0.6));
    items.current.forEach((li, i) => {
      if (!li) return;
      const s = (sm ? 0.15 : 0.08) + i * (sm ? 0.08 : 0.095);
      const q = seg(p, s, s + 0.07);
      li.style.opacity = String(out(q));
      (li.firstElementChild as HTMLElement).style.transform = `translate3d(0,${(1 - out(q)) * 110}%,0)`;
    });
    if (focus.current) focus.current.style.opacity = String(out(seg(p, 0.54, 0.62)) * (1 - seg(p, 0.72, 0.78)));
    frags.current.forEach((el, i) => {
      const g = geo.current[i];
      if (!el || !g) return;
      const q = io(seg(p, 0.7 + i * 0.012, 0.88 + i * 0.012));
      const k = 1 - q;
      const dx = Math.sin(p * 16 + i * 1.7) * 16 * k;
      const dy = Math.cos(p * 13 + i * 2.3) * 12 * k;
      el.style.opacity = String(out(seg(p, 0.54 + i * 0.012, 0.62 + i * 0.012)));
      el.style.transform = `translate3d(${(g.dx * k + dx).toFixed(2)}px,${(g.dy * k + dy).toFixed(2)}px,0) rotate(${(g.r * k).toFixed(2)}deg) scale(${(0.88 + 0.12 * q).toFixed(3)})`;
    });
    if (close.current) close.current.style.opacity = String(out(seg(p, 0.8, 0.9)));
  });

  return (
    <section ref={root} aria-labelledby="thesis-h" className="th sec">
      <div className="th-pin">
        <div ref={stage} className="wrap th-stage">
          <div ref={head} className="th-head">
            <p className="label mb-6">The problem</p>
            <h2 id="thesis-h" className="d-xl th-statement">
              <span className="sm:block">Growth doesn&apos;t </span>
              <span className="sm:block">break companies. </span>
              <span className="sm:block">The way they </span>
              <span className="sm:block">run does.</span>
            </h2>
          </div>
          <ul ref={list} className="th-lines">
            {lines.map((l, i) => (
              <li key={l} ref={(el) => { items.current[i] = el; }} className="body-l"><span className="block">{l}</span></li>
            ))}
          </ul>
          <p ref={focus} aria-hidden className="d th-focus">And slowly, the founder becomes the system.</p>
          <ul aria-hidden className="th-frags">
            {F.map(([k, v], i) => (
              <li key={k + v} data-kind={k} ref={(el) => { frags.current[i] = el; }}>
                <span className="fr-kind">{k}</span>
                <span className="fr-text">{v}</span>
              </li>
            ))}
          </ul>
          <p ref={close} className="d th-close">We replace that with an operation that&apos;s designed, connected and run by systems, not memory.</p>
        </div>
      </div>
    </section>
  );
}
