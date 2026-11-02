import type Lenis from "lenis";
/* The single Lenis instance, so dialogs can pause it. */
export const lenisRef: { current: Lenis | null } = { current: null };
