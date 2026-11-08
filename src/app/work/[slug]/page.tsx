import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Glyph } from "@/components/Glyph";
import { Laptop } from "@/components/Laptop";
import { Lift } from "@/components/Lift";
import { Nav } from "@/components/Nav";
import { BRAND, SystemMap } from "@/components/SystemMap";
import { cases } from "@/content/work";
import { toJsonLd } from "@/content/schema";

/* One page per case: the same story as the laptop on the home page, written out in full so search engines and AI assistants
   have something specific to read and cite. Every word comes from the case data in content/work.ts. */

const site = "https://clarityops.io";
const find = (slug: string) => cases.find((c) => c.slug === slug);
const clip = (s: string, n: number) => (s.length <= n ? s : `${s.slice(0, s.lastIndexOf(" ", n - 1))}…`);

export function generateStaticParams() {
  return cases.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = find((await params).slug);
  if (!c) return {};
  const title = `${c.name} case study · ClarityOps`;
  const tools = [...new Set(c.zones.flatMap((z) => z.tools.map((t) => t.name)))];
  const list = tools.length > 1 ? `${tools.slice(0, -1).join(", ")} and ${tools[tools.length - 1]}` : tools[0];
  const description = clip(`${c.headline} How ClarityOps built it with ${list}.`, 158);
  const url = `/work/${c.slug}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "article", siteName: "ClarityOps", locale: "en_US" }, twitter: { card: "summary_large_image", title, description } };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = find((await params).slug);
  if (!c) notFound();
  const i = cases.indexOf(c);
  const tools = [...new Map(c.zones.flatMap((z) => z.tools).map((t) => [t.name, t])).values()];
  const url = `${site}/work/${c.slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: c.headline,
        name: `${c.name} case study`,
        description: `${c.before.text} ${c.system.text}`,
        url,
        mainEntityOfPage: url,
        about: c.kicker,
        author: { "@id": `${site}/#hamza-marzak` },
        publisher: { "@id": `${site}/#organization` },
        isPartOf: { "@id": `${site}/#website` },
        mentions: tools.map((t) => ({ "@type": "SoftwareApplication", name: t.name })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ClarityOps", item: site },
          { "@type": "ListItem", position: 2, name: "Selected work", item: `${site}/#work` },
          { "@type": "ListItem", position: 3, name: c.name, item: url },
        ],
      },
    ],
  };
  const manual = c.rows.filter((r) => !r.person);
  const others = cases.filter((x) => x !== c);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(schema) }} />
      <Lift />
      <Nav base="/" />
      <main className="paper-run cs">
        <header className="wrap cs-hero">
          <nav aria-label="Breadcrumb" className="label cs-crumb"><Link href="/#work">Selected work</Link><span aria-hidden>/</span><span>{c.name}</span></nav>
          <p className="label cs-kick"><span className="wk-num">{String(i + 1).padStart(2, "0")}</span><span className="cs-name">{c.name}</span><span>{c.kicker}</span></p>
          <h1 className="d cs-h1">{c.headline}</h1>
        </header>

        <div className="wrap cs-device">
          <div className="sm-static"><Laptop app={c.hub[0]}><SystemMap c={c} /></Laptop></div>
          <p className="fine cs-cap">The system, mapped: the tools in the order the work happens, all connected to the {c.hub[0]}.</p>
        </div>

        <section className="wrap grid12 cs-sec" aria-labelledby="cs-before">
          <h2 id="cs-before" className="label col-span-12 lg:col-span-3">Before</h2>
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            <p className="cs-big">{c.before.title}</p>
            <p className="body-l mt-4 text-muted">{c.before.text}</p>
          </div>
        </section>

        <section className="wrap grid12 cs-sec" aria-labelledby="cs-how">
          <h2 id="cs-how" className="label col-span-12 lg:col-span-3">How it works</h2>
          <ol className="col-span-12 lg:col-span-8 lg:col-start-5 cs-steps">
            {c.zones.map((z, k) => (
              <li key={z.label} className="cs-step">
                <span className="cs-n">{k + 1}</span>
                <div>
                  <p className="label">{z.label}</p>
                  <h3 className="cs-st">{z.title}</h3>
                  <p className="body mt-2 text-muted">{z.text}</p>
                  <ul className="cs-tools" aria-label="Tools">
                    {z.tools.map((t) => <li key={t.name}><span className="cs-ti" style={{ color: (t.icon && BRAND[t.icon]) || "#111" }}><Glyph icon={t.icon} mark={t.mark} /></span>{t.name}<span className="cs-tj">{t.job}</span></li>)}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="wrap grid12 cs-sec" aria-labelledby="cs-changed">
          <h2 id="cs-changed" className="label col-span-12 lg:col-span-3">What changed</h2>
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            <ul className="wk-facts cs-facts">
              {c.outcomes.map((o) => <li key={o.label}><b><s>{o.from}</s><span aria-hidden> → </span><span className="sr-only"> down to </span>{o.to}</b>{o.label}</li>)}
            </ul>
            <table className="cs-table">
              <caption className="sr-only">The work, before and now</caption>
              <thead><tr><th scope="col">The work</th><th scope="col">Before</th><th scope="col">Now</th></tr></thead>
              <tbody>
                {c.rows.map((r) => <tr key={r.name} className={r.person ? "is-person" : ""}><th scope="row">{r.name}</th><td>{r.person ? "You" : "By hand"}</td><td>{r.person ? "You" : "Automatic"}</td></tr>)}
              </tbody>
            </table>
            <p className="fine mt-4">{manual.length} steps that used to be done by hand now run on their own. {c.rows.some((r) => r.person) ? "The one left is the one that needs a person." : ""}</p>
          </div>
        </section>

        <section className="wrap grid12 cs-sec" aria-labelledby="cs-system">
          <h2 id="cs-system" className="label col-span-12 lg:col-span-3">The system</h2>
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            <p className="cs-big">{c.system.title}</p>
            <p className="body-l mt-4 text-muted">{c.system.text}</p>
            <ul className="cs-stack" aria-label="Built with">
              {tools.map((t) => <li key={t.name}><span className="cs-ti" style={{ color: (t.icon && BRAND[t.icon]) || "#111" }}><Glyph icon={t.icon} mark={t.mark} /></span>{t.name}</li>)}
            </ul>
          </div>
        </section>

        <section className="wrap cs-cta" aria-labelledby="cs-cta-h">
          <h2 id="cs-cta-h" className="d">Let&apos;s look at how your company runs.</h2>
          <a href="/#contact" className="btn btn-p mt-8"><span>Start a conversation</span></a>
        </section>

        <nav className="wrap cs-more" aria-label="More work">
          <p className="label">More work</p>
          <ul>
            {others.map((x) => <li key={x.slug}><Link href={`/work/${x.slug}`}><span className="label">{x.name}</span><span className="cs-mh">{x.headline}</span></Link></li>)}
          </ul>
        </nav>
      </main>
      <Footer base="/" />
    </>
  );
}
