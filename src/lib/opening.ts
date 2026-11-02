/* The opening: how far the machine has got, and the moment the curtain lifts. */
export const opening = { target: 0, ready: false, lifted: false };
const waiting: (() => void)[] = [];
export const loadedTo = (x: number) => { opening.target = Math.max(opening.target, x); };
export const loadDone = () => { opening.target = 1; opening.ready = true; };
export const whenLifted = (f: () => void) => { if (opening.lifted) f(); else waiting.push(f); };
export const lift = () => { opening.lifted = true; waiting.splice(0).forEach((f) => f()); };
