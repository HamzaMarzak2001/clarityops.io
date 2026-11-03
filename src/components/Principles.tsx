import { Reveal } from "./Reveal";

const principles = [
  ["Design before software.", "Tools don't fix an operation nobody designed."],
  ["Fewer tools, not more.", "The best system is usually smaller than the one you have."],
  ["AI where it earns its place.", "If a rule can do it, a rule should do it."],
  ["Adoption is the deliverable.", "A system your team doesn't use is a failed project, so we stay until it's simply how work gets done."],
  ["You own everything.", "We'd rather be rehired than relied on."],
];

export function Principles() {
  return (
    <section aria-labelledby="principles-h" className="sec bg-panel">
      <div className="wrap grid12 gap-y-12">
        <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <p className="label mb-6">How we think</p>
          <h2 id="principles-h" className="h3 !text-[clamp(1.75rem,2.8vw,2.5rem)]">What we believe about running a company.</h2>
        </div>
        <ul className="col-span-12 lg:col-span-7 lg:col-start-6">
          {principles.map(([lead, rest]) => (
            <Reveal as="li" key={lead} className="pr-item py-8 first:pt-0 lg:py-12">
              <span aria-hidden className="pr-rule" />
              <p className="pr-lead text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.03em]"><span>{lead}</span></p>
              <p className="pr-rest body mt-4 text-muted">{rest}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
