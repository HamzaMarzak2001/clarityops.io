"use client";
import { useRef } from "react";
import { out, seg } from "@/lib/ease";
import { useScrub } from "@/lib/useScrub";

const layers = [
  { n: "01", title: "Operations design", body: "We map how work actually moves through your company: who decides, where things stall, what lives in one person's head. Then we design the operation it should run on." },
  { n: "02", title: "Systems & automation", body: "One source of truth for the work, connected to the tools you already pay for. Information moves on its own. Nobody copies, chases or re-enters anything." },
  { n: "03", title: "AI agents", body: "Agents with real jobs inside your system. They read documents, draft replies, update records and flag what needs a person. Built where they earn their place, never for show." },
];

const jobs = ["Read documents", "Draft replies", "Update records", "Flag what needs a person"];

/* The machine tells this section: the plan, then gears set on it, then agents over them, then all three lock into one system. Machine.tsx reads the same scroll range. */
export function WhatWeDo() {
  const pin = useRef<HTMLDivElement>(null);
  const blocks = useRef<(HTMLLIElement | null)[]>([]);
  const fills = useRef<(HTMLElement | null)[]>([]);
  const chips = useRef<(HTMLLIElement | null)[]>([]);

  useScrub(pin, ["start start", "end end"], (p) => {
    const windows: [number, number][] = [[-1, 0.3], [0.34, 0.62], [0.66, 2]];
    blocks.current.forEach((b, i) => {
      if (!b) return;
      const [a, z] = windows[i];
      const inn = i === 0 ? 1 : out(seg(p, a, a + 0.05));
      const off = seg(p, z, z + 0.04);
      b.style.opacity = String(inn * (1 - off));
      b.style.transform = `translate3d(0,${((1 - inn) * 26 - off * 26).toFixed(1)}px,0)`;
      b.style.pointerEvents = inn * (1 - off) > 0.5 ? "auto" : "none";
      const f = fills.current[i];
      if (f) f.style.transform = `scaleX(${seg(p, i * 0.33, (i + 1) * 0.33).toFixed(3)})`;
    });
    chips.current.forEach((c, i) => {
      if (!c) return;
      const a = out(seg(p, 0.72 + i * 0.05, 0.8 + i * 0.05));
      c.style.opacity = a.toFixed(3);
      c.style.transform = `translate3d(${((1 - a) * 14).toFixed(1)}px,0,0)`;
    });
  });

  return (
    <section id="what-we-do" aria-labelledby="what-h" className="wwd">
      <div className="wrap wwd-head">
        <p className="label mb-6">What we do</p>
        <h2 id="what-h" className="d">Three layers. One operation.</h2>
        <p className="body-l mt-6 text-muted">We design the structure, connect it, then put AI to work inside it. In that order.</p>
      </div>
      <div ref={pin} className="wwd-track">
        <div className="wwd-pin">
          <div className="wrap wwd-stage">
            <div aria-hidden className="wwd-rail">
              {layers.map((l, i) => <span key={l.n}><i ref={(el) => { fills.current[i] = el; }} /></span>)}
            </div>
            <ol className="wwd-layers">
              {layers.map((l, i) => (
                <li key={l.n} ref={(el) => { blocks.current[i] = el; }} className="wwd-layer">
                  <p className="metric text-muted">{l.n}</p>
                  <h3 className="wwd-title">{l.title}</h3>
                  <p className="body mt-4 text-muted">{l.body}</p>
                </li>
              ))}
            </ol>
            <ul className="wwd-jobs">
              {jobs.map((j, i) => <li key={j} ref={(el) => { chips.current[i] = el; }}><i aria-hidden />{j}</li>)}
            </ul>
          </div>
        </div>
      </div>
      <div className="wrap wwd-fine">
        <p className="fine max-w-[72ch]">We build on Notion, Make, n8n, Zapier, Claude and OpenAI, and the tools your team already uses. We choose the stack for the operation, never the other way around.</p>
      </div>
    </section>
  );
}
