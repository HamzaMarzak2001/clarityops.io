"use client";
import Lenis from "lenis";
import { cancelFrame, frame } from "motion/react";
import { useEffect } from "react";
import { motionOn } from "@/lib/ease";
import { lenisRef } from "@/lib/lenis";
import { opening, whenLifted } from "@/lib/opening";

/* Lenis runs on Motion's frame loop, so there is one RAF for everything. */
export function SmoothScroll() {
  useEffect(() => {
    if (!motionOn()) return;
    const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.12 });
    lenisRef.current = lenis;
    /* The page holds still behind the loader. */
    if (!opening.lifted) { lenis.stop(); whenLifted(() => { if (lenisRef.current === lenis) lenis.start(); }); }
    const tick = ({ timestamp }: { timestamp: number }) => lenis.raf(timestamp);
    frame.update(tick, true);
    return () => { cancelFrame(tick); lenis.destroy(); lenisRef.current = null; };
  }, []);
  return null;
}
