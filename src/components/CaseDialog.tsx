"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Case } from "@/content/work";
import { lenisRef } from "@/lib/lenis";

/* The full-screen case view. A native dialog, so focus and Escape are handled by the browser. */
export function CaseDialog({ c, onClose }: { c: Case; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.showModal();
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => { lenisRef.current?.start(); document.documentElement.style.overflow = ""; };
  }, []);

  const [first, ...rest] = c.sequence;
  return (
    <dialog ref={ref} aria-labelledby="case-view-h" onClose={onClose} data-lenis-prevent className="case-view">
      <div className="case-bar">
        <p className="label">{c.name}</p>
        <button type="button" autoFocus onClick={() => ref.current?.close()} className="btn btn-s">Close</button>
      </div>
      <div className="wrap pb-20 lg:pb-32">
        <p className="label pt-8 lg:pt-12">{c.kicker}</p>
        <h2 id="case-view-h" className="d mt-6 max-w-[16em]">{c.headline}</h2>
        <div className="grid12 mt-10 gap-y-8 lg:mt-16">
          <ul className="order-2 col-span-12 lg:order-none lg:col-span-3">
            {c.facts.map((f) => <li key={f} className="metric border-t border-hairline py-3 last:border-b">{f}</li>)}
          </ul>
          <p className="body-l col-span-12 lg:col-span-6">{c.body}</p>
        </div>
        <figure className="frame mt-12 border border-hairline lg:mt-20" style={{ aspectRatio: `${first.width} / ${first.height}` }}>
          <Image src={first.src} alt={first.alt} fill sizes="(min-width: 1344px) 80vw, 100vw" className="object-cover" />
        </figure>
        <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start">
          {rest.map((im) => (
            <figure key={im.src} className="frame border border-hairline" style={{ aspectRatio: `${im.width} / ${im.height}` }}>
              <Image src={im.src} alt={im.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </figure>
          ))}
        </div>
      </div>
    </dialog>
  );
}
