import type { ReactNode } from "react";

/* The MacBook Pro with PROLED XDR display (October 2026), drawn in CSS: thin bezel, rounded display,
   and the Dynamic Island where the notch used to be. Everything inside is sized to the screen's own width. */
export function Laptop({ app, island, children }: { app: string; island?: ReactNode; children: ReactNode }) {
  return (
    <div className="lap" aria-hidden>
      <div className="lap-lid">
        <div className="lap-screen">
          <div className="lap-menu">
            <span className="lap-menu-l"><svg viewBox="0 0 14 17" className="lap-apple"><path fill="currentColor" d="M11.6 9c0-2 1.7-3 1.8-3.1-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.7C3 4.3 1.7 5.1 1 6.4c-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.5 2.2 2.6 2.1 1-.1 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.6 1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-3.6zM9.6 3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" /></svg><b>{app}</b><span>File</span><span>View</span></span>
            <span className="lap-menu-r"><span>Mon 9:41</span><i className="lap-bat" /></span>
          </div>
          {children}
          <div className="lap-island"><span className="lap-cam" />{island}</div>
        </div>
      </div>
      <div className="lap-base" />
      <span className="lap-shadow" />
    </div>
  );
}
