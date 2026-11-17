"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product, Slide } from "@/content/products";
import { lenisRef } from "@/lib/lenis";

/* The Tools gallery: one picture tile per tool. Hovering a tile plays its close-ups one feature at a time (on touch screens
   they play while the tile is in view). A tile opens a pop-up with every close-up, the short version and a button on to
   the tool's own site. A link to /tools#<slug> opens that tool's pop-up straight away. */

const ext = { target: "_blank", rel: "noopener" } as const;
const SOON = 1;
const FIRST = 700, EACH = 2000;
const tall = (s: Slide) => s.h > s.w * 1.2;

/* With a render set, the close-up is shown at exactly its render size, and each screen gets the render made for its
   pixel density, so nothing is resized and the text stays as sharp as in the app. */
function Pic({ s, eager }: { s: Slide; eager?: boolean }) {
  const exact = s.set ? { src: `${s.set}@2.5x.png`, srcSet: `${s.set}@1.25x.png 1x, ${s.set}@2.5x.png 2x, ${s.set}@3.75x.png 3x`, style: { width: s.w }, className: "is-exact" } : { src: s.src };
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...exact} width={Math.round(s.w)} height={Math.round(s.h)} alt={s.alt} loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
  );
}

function Tile({ p, onOpen }: { p: Product; onOpen: (p: Product) => void }) {
  const slides = p.slides.filter((s) => s.tile);
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [wait, setWait] = useState(FIRST);
  const ref = useRef<HTMLButtonElement>(null);
  const still = useRef(false);

  useEffect(() => {
    still.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!matchMedia("(hover: none)").matches || still.current || !ref.current) return;
    const io = new IntersectionObserver(([e]) => setPlaying(e.intersectionRatio >= 0.6), { threshold: [0, 0.6] });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || slides.length < 2) return;
    const t = setTimeout(() => { setPrev(i); setI((i + 1) % slides.length); setWait(EACH); }, wait);
    return () => clearTimeout(t);
  }, [playing, i, wait, slides.length]);

  const start = () => { if (!still.current) { setWait(FIRST); setPlaying(true); } };
  const stop = () => { setPlaying(false); if (i !== 0) { setPrev(i); setI(0); } };

  return (
    <button ref={ref} type="button" className={`tg-tile${playing ? " is-playing" : ""}`} onClick={() => onOpen(p)} onPointerEnter={(e) => e.pointerType === "mouse" && start()} onPointerLeave={(e) => e.pointerType === "mouse" && stop()} onFocus={start} onBlur={stop} aria-haspopup="dialog" aria-label={`${p.name}: ${p.line} Open details.`}>
      <span className="tg-pic">
        <span className="tg-bars" aria-hidden>
          {slides.map((s, k) => <i key={s.src} className={k < i ? "is-done" : k === i && playing ? "is-run" : undefined} style={k === i ? { animationDuration: `${wait}ms` } : undefined} />)}
        </span>
        {slides.map((s, k) => (
          <span key={s.src} className={`tg-s${tall(s) ? " is-tall" : ""}${k === i ? " is-on" : k === prev ? " is-out" : ""}`} aria-hidden={k !== i}>
            <Pic s={s} eager={k === 0} />
          </span>
        ))}
        <span className="tg-cap" aria-hidden>{slides.map((s, k) => <span key={s.src} className={k === i ? "is-on" : undefined}>{s.label}</span>)}</span>
      </span>
      <span className="tg-meta">
        <span><b>{p.name}</b><span>{p.line}</span></span>
        <span className="tg-tag">{p.tags[0]}</span>
      </span>
    </button>
  );
}

export function ToolsGallery({ products }: { products: Product[] }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [cur, setCur] = useState<Product | null>(null);
  const [shot, setShot] = useState(0);
  const touch = useRef<number | null>(null);

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

  const n = cur?.slides.length ?? 0;
  const go = (d: number) => setShot((s) => (s + d + n) % n);

  return (
    <>
      <ul className="tg-grid" aria-label="Tools">
        {products.map((p) => <li key={p.slug}><Tile p={p} onOpen={open} /></li>)}
        {Array.from({ length: SOON }, (_, i) => (
          <li key={`soon-${i}`} className="tg-tile is-soon">
            <span className="tg-pic" />
            <span className="tg-meta"><span><b>Next tool</b><span>In the works. New tools land here first.</span></span><span className="tg-tag">Soon</span></span>
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
            <div
              className="tg-shots"
              onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); }}
            >
              <figure className="tg-fig">
                <div className="tg-stage">
                  {cur.slides.map((s, k) => (
                    <span key={s.src} className={`tg-s${tall(s) ? " is-tall" : ""}${k === shot ? " is-on" : ""}`} aria-hidden={k !== shot}><Pic s={s} eager={k === 0} /></span>
                  ))}
                </div>
                <figcaption className="tg-fc" aria-live="polite">{cur.slides[shot].label}<span>{shot + 1} / {n}</span></figcaption>
              </figure>
              {n > 1 && (
                <div className="tg-nav">
                  <button type="button" className="tg-arrow" aria-label="Previous screenshot" onClick={() => go(-1)}>←</button>
                  <div className="tg-dots">
                    {cur.slides.map((s, i) => (
                      <button key={s.src} type="button" aria-label={`Screenshot ${i + 1} of ${n}: ${s.label}`} aria-current={i === shot ? "true" : undefined} onClick={() => setShot(i)} />
                    ))}
                  </div>
                  <button type="button" className="tg-arrow" aria-label="Next screenshot" onClick={() => go(1)}>→</button>
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
