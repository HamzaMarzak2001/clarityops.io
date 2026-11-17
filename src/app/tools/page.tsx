import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Lift } from "@/components/Lift";
import { Nav } from "@/components/Nav";
import { ToolsGallery } from "@/components/ToolsGallery";
import { products } from "@/content/products";
import { toJsonLd } from "@/content/schema";

/* Tools: the apps and resources ClarityOps puts out under its own name, as a gallery of picture tiles.
   A tile opens a pop-up with the short version, and its button goes on to the tool's own site. */

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

export default function ToolsPage() {
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
              image: `${site}${p.slides[0].src}`,
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

        <section className="wrap tg" aria-label="All tools">
          <ToolsGallery products={products} />
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
