/* Structured data for search engines and AI assistants. Every string is copy already on the site; nothing here is new wording. */
const site = "https://clarityops.io";
const id = (name: string) => `${site}/#${name}`;

/* The four accounts Hamza approved for the footer, in the same order. */
const sameAs = ["https://www.instagram.com/hamza.clarityops/", "https://www.youtube.com/@hamza.clarityops", "https://x.com/hamza_arq", "https://www.linkedin.com/in/hamza-marzak-347921231/"];

/* What we do (three layers) and Approach (three stages), worded as on the page. */
const services: [string, string][] = [
  ["Operations design", "We map how work actually moves through your company: who decides, where things stall, what lives in one person's head. Then we design the operation it should run on."],
  ["Systems & automation", "One source of truth for the work, connected to the tools you already pay for. Information moves on its own. Nobody copies, chases or re-enters anything."],
  ["AI agents", "Agents with real jobs inside your system. They read documents, draft replies, update records and flag what needs a person. Built where they earn their place, never for show."],
  ["Operations Review", "We sit with you and your team, map every process that matters and find where time, money and attention leak. You receive a written diagnosis, a system blueprint and a fixed proposal."],
  ["System Build", "We design, build, migrate and train. You see working parts within the first two weeks and approve every stage before the next. The system is live, documented and in use before we hand it over."],
  ["Partnership", "We stay on as your operations team. New automations, new agents, new parts of the business brought into the system as you grow. One monthly engagement, cancellable anytime."],
];

/* The description comes from layout.tsx so the page meta and the schema always say the same thing. FAQPage is added only when the visible FAQ is passed in. */
export function buildSchema({ description, faqs = [] }: { description: string; faqs?: readonly (readonly [string, string])[] }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": id("organization"),
        name: "ClarityOps",
        legalName: "ClarityOps SARL",
        url: site,
        logo: { "@type": "ImageObject", url: `${site}/logos/clarityops-mark-512.png`, width: 512, height: 512 },
        description,
        slogan: "We design how companies run.",
        founder: { "@id": id("hamza-marzak") },
        knowsAbout: ["Operations design", "Business process automation", "AI agents", "Notion", "Make", "n8n", "Zapier", "Claude", "OpenAI"],
        sameAs,
      },
      {
        "@type": "ProfessionalService",
        "@id": id("studio"),
        name: "ClarityOps",
        url: site,
        image: `${site}/opengraph-image`,
        description,
        parentOrganization: { "@id": id("organization") },
        founder: { "@id": id("hamza-marzak") },
        areaServed: ["Europe", "United States", "Middle East"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Operations & AI systems",
          itemListElement: services.map(([name, text]) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name, description: text, provider: { "@id": id("organization") } },
          })),
        },
      },
      {
        "@type": "Person",
        "@id": id("hamza-marzak"),
        name: "Hamza Marzak",
        jobTitle: "Founder",
        url: `${site}/#studio`,
        image: `${site}/studio/hamza-marzak.jpg`,
        worksFor: { "@id": id("organization") },
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": id("website"),
        name: "ClarityOps",
        url: site,
        inLanguage: "en",
        publisher: { "@id": id("organization") },
      },
      ...(faqs.length ? [{
        "@type": "FAQPage",
        "@id": id("faq"),
        url: site,
        isPartOf: { "@id": id("website") },
        about: { "@id": id("organization") },
        mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      }] : []),
    ],
  };
}

/* JSON.stringify does not escape "<", so a stray tag in copy can't close the script early. */
export const toJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");
