/* The one easing family, addendum section 6. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const c = (a: number, b: number, t: number) => { const u = 1 - t; return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t; };
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 20; i++) { t = (lo + hi) / 2; if (c(x1, x2, t) < x) lo = t; else hi = t; }
    return c(y1, y2, t);
  };
}
export const out = bezier(0.22, 1, 0.36, 1);
export const io = bezier(0.65, 0, 0.35, 1);
export const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** Progress of p through the window a to b. */
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
/** True when the motion layer is on: JS ran and reduced motion is off. */
export const motionOn = () => typeof document !== "undefined" && document.documentElement.classList.contains("mo");
