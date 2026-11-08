import { icons } from "@/content/icons";

/* A platform's mark where we have one, otherwise its initials. */
export function Glyph({ icon, mark, className = "" }: { icon?: string; mark?: string; className?: string }) {
  if (icon && icons[icon]) return <svg viewBox="0 0 24 24" aria-hidden className={`gl ${className}`}><path d={icons[icon]} fill="currentColor" /></svg>;
  return <span className={`gl-mark ${className}`}>{mark}</span>;
}
