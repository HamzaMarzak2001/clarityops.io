import { tools } from "@/content/tools";

/* The stack: two rows of the tools we build with, drifting in opposite directions. The headline is from What we do. */
function Row({ list, reverse }: { list: typeof tools; reverse?: boolean }) {
  const pills = (copy: number) => list.map((t) => (
    <span key={`${copy}-${t.name}`} className="stk-pill">{t.d ? <svg viewBox="0 0 24 24" aria-hidden><path fill={t.color} d={t.d} /></svg> : <span className="stk-init" style={{ background: t.color }}>{t.name[0]}</span>}{t.name}</span>
  ));
  return (
    <div className="stk-mq" aria-hidden>
      <div className={`stk-row${reverse ? " is-rev" : ""}`}>{pills(0)}{pills(1)}</div>
    </div>
  );
}

export function Stack() {
  const half = Math.ceil(tools.length / 2);
  return (
    <section id="stack" aria-labelledby="stack-h" className="stk">
      <div className="wrap text-center">
        <p className="label stk-k">The stack</p>
        <h2 id="stack-h" className="d stk-h">Built on the tools you already pay for.</h2>
        <p className="sr-only">Tools we build with: {tools.map((t) => t.name).join(", ")}.</p>
      </div>
      <div className="stk-rows">
        <Row list={tools.slice(0, half)} />
        <Row list={tools.slice(half)} reverse />
      </div>
    </section>
  );
}
