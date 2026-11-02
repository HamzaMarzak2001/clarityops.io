"use client";
import { useEffect } from "react";

/* Dev only, behind ?tune. Layout renders this only in development, so it is not in the production bundle. */
export function Tune() {
  useEffect(() => {
    if (!location.search.includes("tune")) return;
    let pane: { dispose(): void } | undefined;
    import("tweakpane").then(({ Pane }) => {
      /* Tweakpane's bindings come from its core types, which this version does not re-export. */
      const p = new Pane({ title: "Timing" }) as unknown as { addBinding(o: object, k: string, c: object): void; on(e: string, f: () => void): void; dispose(): void };
      pane = p;
      const root = document.documentElement.style;
      const s = { reveal: 800, x1: 0.22, y1: 1, x2: 0.36, y2: 1 };
      const apply = () => {
        root.setProperty("--t-reveal", `${s.reveal}ms`);
        root.setProperty("--ease-out", `cubic-bezier(${s.x1},${s.y1},${s.x2},${s.y2})`);
      };
      p.addBinding(s, "reveal", { min: 300, max: 1400, step: 10 });
      (["x1", "y1", "x2", "y2"] as const).forEach((k) => p.addBinding(s, k, { min: 0, max: 1, step: 0.01 }));
      p.on("change", apply);
    });
    return () => pane?.dispose();
  }, []);
  return null;
}
