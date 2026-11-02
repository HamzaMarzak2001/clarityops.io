"use client";
import { type ElementType, type ReactNode, useEffect, useRef } from "react";

/* Adds .in once, when the element enters. Time-based, for UI-scale entrances only. CSS owns the look. */
export function Reveal({ as: Tag = "div", className, children }: { as?: ElementType; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { rootMargin: "0px 0px -12% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={className}>{children}</Tag>;
}
