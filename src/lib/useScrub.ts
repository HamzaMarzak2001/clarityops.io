"use client";
import { useMotionValueEvent, useScroll } from "motion/react";
import { type RefObject, useEffect, useRef } from "react";
import { motionOn } from "./ease";

type Offset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

/** Runs render(p) for a scroll-linked sequence. Nothing runs when the static layout is showing. */
export function useScrub(target: RefObject<HTMLElement | null>, offset: Offset, render: (p: number) => void) {
  const { scrollYProgress } = useScroll({ target, offset });
  const latest = useRef(render);
  useEffect(() => { latest.current = render; });
  useMotionValueEvent(scrollYProgress, "change", (p) => { if (motionOn()) latest.current(p); });
  useEffect(() => {
    if (!motionOn()) return;
    const draw = () => latest.current(scrollYProgress.get());
    draw();
    addEventListener("resize", draw);
    return () => removeEventListener("resize", draw);
  }, [scrollYProgress]);
}
