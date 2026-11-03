"use client";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";

const links = [
  { href: "#work", label: "Work" },
  { href: "#approach", label: "Approach" },
  { href: "#studio", label: "Studio" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [paper, setPaper] = useState(false);
  const [active, setActive] = useState("");
  const last = useRef(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const d = y - last.current;
    if (Math.abs(d) > 6) { setHidden(d > 0 && y > 160); last.current = y; }
  });

  useEffect(() => {
    const work = document.getElementById("work");
    const onPaper = new IntersectionObserver(([e]) => setPaper(e.isIntersecting), { rootMargin: "0px 0px -92% 0px" });
    if (work) onPaper.observe(work);
    const spy = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setActive(`#${e.target.id}`); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((l) => { const el = document.querySelector(l.href); if (el) spy.observe(el); });
    return () => { onPaper.disconnect(); spy.disconnect(); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className={`site-nav ${hidden ? "is-hidden" : ""}`} data-surface={paper ? "paper" : "black"}>
        <nav aria-label="Primary" className="wrap flex h-[5.5rem] items-center justify-between">
          <a href="#top" aria-label="ClarityOps"><Logo draw /></a>
          <ul className="hidden gap-10 lg:flex">
            {links.map((l) => (
              <li key={l.href}><a href={l.href} aria-current={active === l.href ? "true" : undefined} className="nav-link">{l.label}</a></li>
            ))}
          </ul>
          <a href="#contact" className="btn btn-s nav-cta hidden lg:inline-flex">Start a conversation</a>
          <button type="button" onClick={() => setOpen(true)} aria-expanded={open} className="label nav-menu lg:hidden">Menu</button>
        </nav>
      </header>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-20 flex flex-col bg-black px-[var(--m)] pb-8">
          <div className="flex h-[5.5rem] items-center justify-between">
            <Logo />
            <button type="button" autoFocus onClick={() => setOpen(false)} className="label nav-menu">Close</button>
          </div>
          <ul className="flex-1 pt-8">
            {links.map((l) => (
              <li key={l.href}><a href={l.href} onClick={() => setOpen(false)} className="block text-[2.5rem] font-semibold leading-[1.35] tracking-[-0.035em]">{l.label}</a></li>
            ))}
          </ul>
          <a href="#contact" onClick={() => setOpen(false)} className="btn btn-p"><span>Start a conversation</span></a>
        </div>
      )}
    </>
  );
}
