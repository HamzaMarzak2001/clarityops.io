"use client";
import { useEffect, useRef } from "react";
import { motionOn } from "@/lib/ease";

/* Latest first. The logos are single-colour files, sized so that each carries about the same visual weight. */
const companies = [
  { name: "LULUORANGE", src: "/clients/luluorange.webp", w: 59, h: 50 },
  { name: "Bristol Media", src: "/clients/bristol-media.webp", w: 41, h: 50 },
  { name: "Horecalicht", src: "/clients/horecalicht.webp", w: 164, h: 30 },
  { name: "Poches & Fils", src: "/clients/poches-et-fils.webp", w: 35, h: 44 },
  { name: "Alex Helton Team", src: "/clients/alex-helton-team.webp", w: 109, h: 46 },
  { name: "Labinno", src: "/clients/labinno.webp", w: 67, h: 50 },
  { name: "MAE Media", src: "/clients/mae-media.webp", w: 61, h: 50 },
  { name: "Alice & Wonder", src: "/clients/alice-and-wonder.webp", w: 196, h: 13 },
  { name: "FryAway", src: "/clients/fryaway.webp", w: 93, h: 31 },
  { name: "Even Eleven", src: "/clients/even-eleven.webp", w: 150, h: 21 },
  { name: "BlackRidge & Co.", src: "/clients/blackridge.webp", w: 170, h: 24 },
  { name: "Big Thinkers", src: "/clients/big-thinkers.webp", w: 124, h: 23 },
  { name: "B Trust Builders", src: "/clients/b-trust-builders.webp", w: 71, h: 31 },
  { name: "Client Success Solutions", src: "/clients/client-success-solutions.webp", w: 136, h: 37 },
  { name: "Experts Agency", src: "/clients/experts-agency.webp", w: 153, h: 33 },
  { name: "Learn To Cut", src: "/clients/ltc.webp", w: 104, h: 48 },
  { name: "Pet Friends", src: "/clients/pet-friends.webp", w: 66, h: 31 },
  { name: "Rettain", src: "/clients/rettain.webp", w: 102, h: 20 },
  { name: "Riwaya Travel", src: "/clients/riwaya-travel.webp", w: 96, h: 39 },
  { name: "Service Loop Electrical", src: "/clients/sle.webp", w: 47, h: 50 },
  { name: "Summit Acquisition", src: "/clients/summit-acquisition.webp", w: 121, h: 28 },
  { name: "Trendify", src: "/clients/trendify.webp", w: 95, h: 23 },
  { name: "Xsama", src: "/clients/xsama.webp", w: 96, h: 24 },
  { name: "360 Captures", src: "/clients/360-captures.webp", w: 45, h: 38 },
];

function Set({ copy = false }: { copy?: boolean }) {
  return (
    <ul className="clients-set" aria-hidden={copy || undefined}>
      {companies.map((c) => (
        <li key={c.src}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.src} alt={copy ? "" : c.name} width={Math.round(c.w * 0.85)} height={Math.round(c.h * 0.85)} decoding="async" />
        </li>
      ))}
    </ul>
  );
}

/* The companies we've worked with, running under the hero's buttons. It fades before the gears, and away as you start to scroll. With reduced motion it is a still, wrapped list. */
export function Clients() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!motionOn()) return;
    const el = track.current!;
    const fade = () => {
      const x = Math.max(0, 1 - scrollY / (innerHeight * 0.3));
      el.style.opacity = String(x * x * (3 - 2 * x));
    };
    fade();
    addEventListener("scroll", fade, { passive: true });
    addEventListener("resize", fade);
    return () => { removeEventListener("scroll", fade); removeEventListener("resize", fade); };
  }, []);

  return (
    <div role="group" aria-label="Companies we've worked with" className="clients">
      <div ref={track} className="clients-track">
        <Set />
        <Set copy />
      </div>
    </div>
  );
}
