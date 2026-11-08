/* Answers are built from copy already on the site (Approach, What we do, Fit, Principles). Hamza edits before launch. */
export const faqs: [string, string][] = [
  ["Who do you work with?", "Usually founder-led companies between 10 and 100 people, in a phase where the business has outgrown the way it runs. If you're looking for a template or a quick fix, we're probably not the right studio."],
  ["How does it start?", "With a review of how your company runs today. We map every process that matters and find where time, money and attention leak. You receive a written diagnosis, a system blueprint and a fixed proposal. If the right answer is not to build, we'll tell you."],
  ["How soon will we see something working?", "Within the first two weeks. We design, build, migrate and train in stages, and you approve each stage before the next. The system is live, documented and in use before we hand it over."],
  ["Do we have to change our tools?", "Rarely. We build one source of truth for the work and connect it to the tools you already pay for, so information moves on its own and nobody copies or re-enters anything."],
  ["Where does AI fit in?", "Where it earns its place. Agents read documents, draft replies, update records and flag what needs a person. If a rule can do the job, a rule does it."],
  ["Who owns what you build?", "You do. Your accounts, your data, your system. No licences and no lock-in."],
  ["What happens after the handover?", "We can stay on as your operations team: new automations, new agents and new parts of the business brought into the system as you grow. One monthly engagement, cancellable anytime."],
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-h" className="faq">
      <div className="wrap grid12 gap-y-10">
        <div className="col-span-12 lg:col-span-4">
          <p className="label faq-k">FAQ</p>
          <h2 id="faq-h" className="h3 mt-4 !text-[clamp(1.75rem,2.8vw,2.5rem)]">Questions we hear first.</h2>
        </div>
        <div className="col-span-12 lg:col-span-7 lg:col-start-6">
          {faqs.map(([q, a]) => (
            <details key={q} className="faq-item">
              <summary><span>{q}</span><i aria-hidden /></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
