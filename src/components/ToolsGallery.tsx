"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/content/products";
import { lenisRef } from "@/lib/lenis";

/* The Tools gallery: one picture tile per tool. A tile opens a pop-up with the tool's screenshots, the short version
   and a button on to the tool's own site. A link to /tools#<slug> opens that tool's pop-up straight away. */

const ext = { target: "_blank", rel: "noopener" } as const;
const SOON = 2;

export function ToolsGallery({ products }: { products: Product[] }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [cur, setCur] = useState<Product | null>(null);
  const [shot, setShot] = useState(0);

  const open = useCallback((p: Product) => {
    setCur(p); setShot(0);
    dlg.current?.showModal();
    lenisRef.current?.stop();
    history.replaceState(null, "", `#${p.slug}`);
  }, []);

  const onClose = () => {
    lenisRef.current?.start();
    history.replaceState(null, "", location.pathname);
    setCur(null);
  };

  useEffect(() => {
    const p = products.find((x) => `#${x.slug}` === location.hash);
    if (p) open(p);
  }, [products, open]);

  const n = cur?.shots.length ?? 0;
  const go = (d: number) => setShot((s) => (s + d + n) % n);

  return (
    <>
      <ul className="tg-grid" aria-label="Tools">
        {products.map((p) => (
          <li key={p.slug}>
            <button type="button" className="tg-tile" onClick={() => open(p)} aria-haspopup="dialog">
              <span className="tg-pic">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.tile.src} width={p.tile.w} height={p.tile.h} alt={p.tile.alt} loading="lazy" decoding="async" />
              </span>
              <span className="tg-meta">
                <span><b>{p.name}</b><span>{p.line}</span></span>
                <span className="tg-tag">{p.tags[0]}</span>
              </span>
            </button>
          </li>
        ))}
        {Array.from({ length: SOON }, (_, i) => (
          <li key={`soon-${i}`} className="tg-tile is-soon">
            <span className="tg-pic" />
            <span className="tg-meta"><span><b>Next tool</b><span>In the works.</span></span><span className="tg-tag">Soon</span></span>
          </li>
        ))}
      </ul>

      <dialog
        ref={dlg}
        className="tg-dlg"
        aria-labelledby="tg-dlg-h"
        data-lenis-prevent
        onClose={onClose}
        onClick={(e) => { if (e.target === dlg.current) dlg.current.close(); }}
        onKeyDown={(e) => { if (n > 1 && e.key === "ArrowRight") go(1); if (n > 1 && e.key === "ArrowLeft") go(-1); }}
      >
        {cur && (
          <div className="tg-box">
            <div className="tg-shots">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={cur.shots[shot].src} src={cur.shots[shot].src} width={cur.shots[shot].w} height={cur.shots[shot].h} alt={cur.shots[shot].alt} />
              {n > 1 && (
                <div className="tg-dots">
                  {cur.shots.map((s, i) => (
                    <button key={s.src} type="button" aria-label={`Screenshot ${i + 1} of ${n}`} aria-current={i === shot ? "true" : undefined} onClick={() => setShot(i)} />
                  ))}
                </div>
              )}
            </div>
            <div className="tg-info">
              <div className="tg-head">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cur.icon} width={64} height={64} alt="" />
                <div><h2 id="tg-dlg-h">{cur.name}</h2><p className="tg-tags">{cur.tags.join(" · ")}</p></div>
              </div>
              <p className="tg-line">{cur.line}</p>
              <p className="tg-text">{cur.text}</p>
              <ul className="tg-points">{cur.points.map((t) => <li key={t}>{t}</li>)}</ul>
              <div className="tg-btns">
                <a href={cur.href} {...ext} className="btn btn-p"><span>{cur.cta}</span></a>
                {cur.more && <a href={cur.more.href} {...ext} className="tlink">{cur.more.label} ↗</a>}
              </div>
            </div>
            <button type="button" className="tg-x" aria-label="Close" onClick={() => dlg.current?.close()}>×</button>
          </div>
        )}
      </dialog>
    </>
  );
}
