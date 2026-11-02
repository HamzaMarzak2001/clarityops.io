"use client";
import { useRef } from "react";
import { out, seg } from "@/lib/ease";
import { useScrub } from "@/lib/useScrub";

const stages = [
  { name: "Operations Review", span: "2 weeks", body: "We sit with you and your team, map every process that matters and find where time, money and attention leak. You receive a written diagnosis, a system blueprint and a fixed proposal. If the right answer is not to build, we'll tell you." },
  { name: "System Build", span: "4 to 8 weeks", body: "We design, build, migrate and train. You see working parts within the first two weeks and approve every stage before the next. The system is live, documented and in use before we hand it over." },
  { name: "Partnership", span: "Ongoing", body: "We stay on as your operations team. New automations, new agents, new parts of the business brought into the system as you grow. One monthly engagement, cancellable anytime." },
];

export function Approach() {
  const ol = useRef<HTMLOListElement>(null);
  const rule = useRef<HTMLSpanElement>(null);

  useScrub(ol, ["start 72%", "end 62%"], (p) => {
    if (rule.current) rule.current.style.transform = `scaleY(${p})`;
    ol.current?.querySelectorAll<HTMLElement>(".timeline-item").forEach((item, i) => {
      const a = i * 0.34;
      const q = out(seg(p, a, a + 0.14));
      (item.querySelector(".timeline-body") as HTMLElement).style.opacity = String(q);
      (item.querySelector(".timeline-dot") as HTMLElement).style.transform = `scale(${q})`;
    });
  });

  return (
    <section id="approach" aria-labelledby="approach-h" className="sec">
      <div className="wrap grid12 gap-y-16">
        <div className="col-span-12 lg:col-span-9">
          <p className="label mb-6">Approach</p>
          <h2 id="approach-h" className="d">We don&apos;t quote what we haven&apos;t understood.</h2>
        </div>
        <p className="body-l col-span-12 text-muted lg:col-span-5 lg:col-start-4">Every engagement starts with a review of how your company runs today. Only then do we design and build.</p>
        <ol ref={ol} className="timeline col-span-12 lg:col-span-9 lg:col-start-4">
          <span ref={rule} aria-hidden className="timeline-rule" />
          {stages.map((s) => (
            <li key={s.name} className="timeline-item">
              <span aria-hidden className="timeline-dot" />
              <div className="timeline-body">
                <p className="metric timeline-span text-muted">{s.span}</p>
                <div>
                  <h3 className="h3">{s.name}</h3>
                  <p className="body mt-4 text-muted">{s.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <p className="h3 col-span-12 lg:col-span-9 lg:col-start-4">Everything we build is yours. Your accounts, your data, your system. No licences, no lock-in.</p>
      </div>
    </section>
  );
}
