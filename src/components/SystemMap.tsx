import type { CSSProperties } from "react";
import type { Case } from "@/content/work";
import { Glyph } from "./Glyph";

/* The map on the laptop screen, in a light theme: the middle of the operation, and the tools around it in four labelled groups.
   First the team sits in the middle with nothing connected; then the system takes its place and each group is wired in.
   After the map, the same work as a list of steps going automatic. */

/* Four equal columns, left to right in the order the work happens, over one bar for the system itself. Nothing overlaps. */
const COL_W = 20.5, GAP = 2.6, LEFT = (100 - (4 * COL_W + 3 * GAP)) / 2;
const TOP = 19, BOTTOM = 64, BAR: [number, number] = [73, 88];
/* Platform colours, so each tool reads at a glance. */
const BRAND: Record<string, string> = { make: "#6d00cc", drive: "#1fa463", docs: "#4285f4", gemini: "#7b61ff", gmail: "#ea4335", meta: "#0467df", facebook: "#1877f2", quickbooks: "#2ca01c", calendar: "#4285f4", notion: "#111" };

export function layout(c: Case) {
  return c.zones.map((z, k) => {
    const x = LEFT + k * (COL_W + GAP) + COL_W / 2, n = z.tools.length;
    const mid = (TOP + 6 + BOTTOM) / 2;
    const tools = z.tools.map((t, i) => ({ ...t, x, y: mid + (i - (n - 1) / 2) * 15 }));
    return { ...z, x, y: (TOP + BAR[1]) / 2, tools, frame: { x: x - COL_W / 2, y: TOP, w: COL_W, h: BOTTOM - TOP } };
  });
}

export function SystemMap({ c }: { c: Case }) {
  const zones = layout(c);
  const manual = c.rows.filter((r) => !r.person).length;
  const link = (x: number) => <line x1={x} y1={BOTTOM} x2={x} y2={BAR[0]} vectorEffect="non-scaling-stroke" />;
  return (
    <div className="sm">
      <div className="sm-map">
        <div className="sm-world">
          <svg className="sm-edges" viewBox="0 0 100 100" preserveAspectRatio="none">
            <g className="sm-dash">{zones.map((z, k) => <g key={k}>{link(z.x)}</g>)}</g>
            {zones.map((z, k) => <g key={k} className="sm-base" data-z={k}>{link(z.x)}</g>)}
            {zones.map((z, k) => <g key={k} className="sm-live" data-z={k}>{link(z.x)}</g>)}
          </svg>
          {zones.map((z, k) => (
            <span key={k} className="sm-frame" data-z={k} style={{ left: `${z.frame.x}%`, top: `${z.frame.y}%`, width: `${z.frame.w}%`, height: `${z.frame.h}%` }}>
              <span className="sm-fl"><span className="sm-fn">{k + 1}</span>{z.label}</span>
            </span>
          ))}
          {zones.slice(0, 3).map((z, k) => <span key={k} className="sm-arrow" style={{ left: `${z.x + COL_W / 2 + GAP / 2}%`, top: `${(TOP + BOTTOM) / 2}%` }}>›</span>)}
          <div className="sm-hub" style={{ left: `${LEFT}%`, top: `${BAR[0]}%`, width: `${100 - 2 * LEFT}%`, height: `${BAR[1] - BAR[0]}%` }}>
            <span className="sm-ht sm-ht0"><b>Your team</b><span>doing every step by hand</span></span>
            <span className="sm-ht sm-ht1"><i className="sm-dot" /><b>{c.hub[0]}</b><span>{c.hub[1]}</span></span>
          </div>
          {zones.flatMap((z, k) => z.tools.map((t, i) => (
            <span key={`${k}-${i}`} className="sm-node" data-z={k} style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${COL_W - 3}%` }}>
              <span className="sm-ic" style={{ color: (t.icon && BRAND[t.icon]) || "#111" }}><Glyph icon={t.icon} mark={t.mark} /></span>
              <span className="sm-nt"><b>{t.name}</b><span>{t.job}</span></span>
            </span>
          )))}
        </div>
      </div>
      <div className="sm-table" style={{ "--rows": c.rows.length } as CSSProperties}>
        <p className="sm-th"><span>The work</span><span>Before</span><span>Now</span></p>
        {c.rows.map((r) => (
          <p key={r.name} className={`sm-row${r.person ? " is-person" : ""}`}>
            <span className="sm-rn"><span className="sm-ic" style={{ color: (r.icon && BRAND[r.icon]) || "#111" }}><Glyph icon={r.icon} mark={r.mark} /></span>{r.name}</span>
            <span className="sm-was"><span>{r.person ? "You" : "By hand"}</span><i /></span>
            <span className="sm-now">{r.person ? "You" : "Automatic"}</span>
          </p>
        ))}
        <p className="sm-count"><span>{c.unit}</span><b className="sm-n">{manual}</b></p>
      </div>
    </div>
  );
}

/* The Dynamic Island's messages, one per beat: before, the four parts, the system, the result. */
export function IslandMessages({ c }: { c: Case }) {
  const first = c.outcomes[0];
  const msgs = [
    { title: "Before", text: c.before.island, mark: "!" },
    ...c.zones.map((z) => z.island),
    { title: c.system.island[0], text: c.system.island[1], icon: "notion" },
    { title: `${first.from} → ${first.to}`, text: first.label, mark: "✓" },
  ];
  return (
    <>
      {msgs.map((m, i) => (
        <span key={i} className="lap-msg">
          <span className="lap-mic"><Glyph icon={m.icon} mark={m.mark} /></span>
          <span className="lap-mt"><b>{m.title}</b><span>{m.text}</span></span>
        </span>
      ))}
    </>
  );
}
