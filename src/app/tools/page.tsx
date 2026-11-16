import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Laptop } from "@/components/Laptop";
import { Lift } from "@/components/Lift";
import { Nav } from "@/components/Nav";
import { products } from "@/content/products";
import { toJsonLd } from "@/content/schema";

/* Tools: the apps and resources ClarityOps puts out under its own name. The newest one is shown in full,
   and every tool sits in the numbered list below, so the page looks complete with one and still works with ten. */

const site = "https://clarityops.io";
const title = "Tools · ClarityOps";
const description = "Apps and resources from ClarityOps, the operations and AI systems studio. Built for our own work first, then shared. Start with AgentPin, a free control panel for your Claude agents on macOS.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools" },
  openGraph: { title, description, url: "/tools", type: "website", siteName: "ClarityOps", locale: "en_US" },
  twitter: { card: "summary_large_image", title, description },
};

const ext = { target: "_blank", rel: "noopener" } as const;

export default function ToolsPage() {
  const [lead] = products;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${site}/tools#page`,
        url: `${site}/tools`,
        name: "Tools by ClarityOps",
        description,
        isPartOf: { "@id": `${site}/#website` },
        publisher: { "@id": `${site}/#organization` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "SoftwareApplication",
              name: p.name,
              description: `${p.line} ${p.text}`,
              url: p.href,
              operatingSystem: "macOS",
              applicationCategory: "DeveloperApplication",
              offers: p.tags.includes("Free") ? { "@type": "Offer", price: "0", priceCurrency: "USD" } : undefined,
              publisher: { "@id": `${site}/#organization` },
            },
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ClarityOps", item: site },
          { "@type": "ListItem", position: 2, name: "Tools", item: `${site}/tools` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }} />
      <Lift />
      <Nav base="/" />
      <main className="paper-run cs">
        <header className="wrap cs-hero">
          <p className="label">Tools</p>
          <h1 className="d cs-h1">Tools we built for our own work.</h1>
          <p className="body-l mt-6 max-w-[36rem] text-muted">Small apps and resources from the studio. We make them because we need them, then share them. Some are free, some will be paid.</p>
        </header>

        <section className="wrap tl-lead" aria-labelledby="tl-lead-h">
          <div className="grid12 tl-lead-copy">
            <p className="label col-span-12 lg:col-span-3 tl-kick"><span className="wk-num">01</span><span className="cs-name">{lead.name}</span></p>
            <div className="col-span-12 lg:col-span-8 lg:col-start-5">
              <ul className="tl-tags" aria-label="Details">{lead.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              <h2 id="tl-lead-h" className="cs-big mt-4">{lead.line}</h2>
              <p className="body-l mt-4 text-muted">{lead.text}</p>
              <ul className="tl-points">{lead.points.map((t) => <li key={t}>{t}</li>)}</ul>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <a href={lead.href} {...ext} className="btn btn-p"><span>{lead.cta}</span></a>
                {lead.more && <a href={lead.more.href} {...ext} className="tlink">{lead.more.label} →</a>}
              </div>
            </div>
          </div>
          {lead.shot && (
            <figure className="cs-device tl-device">
              <div className="sm-static">
                <Laptop app={lead.name}>
                  <div className="tl-desk">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="tl-pin" src={lead.shot.src} width={lead.shot.w} height={lead.shot.h} alt="" loading="lazy" decoding="async" />
                  </div>
                </Laptop>
              </div>
              <figcaption className="fine cs-cap">{lead.shot.alt} It floats over every app, in the corner of your screen.</figcaption>
            </figure>
          )}
        </section>

        <section className="wrap tl-index" aria-labelledby="tl-all">
          <h2 id="tl-all" className="label">All tools</h2>
          <ol className="tl-list">
            {products.map((p, i) => (
              <li key={p.slug}>
                <a href={p.href} {...ext} className="tl-row">
                  <span className="tl-n">{String(i + 1).padStart(2, "0")}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.icon ? <img className="tl-ic" src={p.icon} width={64} height={64} alt="" /> : <span className="tl-ic" />}
                  <span className="tl-t"><b>{p.name}</b><span>{p.line}</span></span>
                  <span className="tl-tg">{p.tags.join(" · ")}</span>
                  <span className="tl-go" aria-hidden>↗</span>
                </a>
              </li>
            ))}
            <li className="tl-row is-soon" aria-label="More tools coming">
              <span className="tl-n">{String(products.length + 1).padStart(2, "0")}</span>
              <span className="tl-ic" />
              <span className="tl-t"><b>Next tool</b><span>In the works. New tools land here first.</span></span>
              <span className="tl-tg">Soon</span>
              <span className="tl-go" aria-hidden />
            </li>
          </ol>
        </section>

        <section className="wrap cs-cta" aria-labelledby="tl-cta-h">
          <h2 id="tl-cta-h" className="d">Want a tool like this built around your team?</h2>
          <a href="/#contact" className="btn btn-p mt-8"><span>Start a conversation</span></a>
        </section>
      </main>
      <Footer base="/" />
    </>
  );
}
