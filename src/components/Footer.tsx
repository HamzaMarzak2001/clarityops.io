import { FooterMark } from "./FooterMark";
import { Logo } from "./Logo";

const pages = [["Work", "#work"], ["What we do", "#what-we-do"], ["Approach", "#approach"], ["Studio", "#studio"], ["Stack", "#stack"], ["FAQ", "#faq"], ["Contact", "#contact"]];
const social = [["Instagram", "https://www.instagram.com/hamza.clarityops/"], ["YouTube", "https://www.youtube.com/@hamza.clarityops"], ["X", "https://x.com/hamza_arq"], ["LinkedIn", "https://www.linkedin.com/in/hamza-marzak-347921231/"]];
/* Opens an AI assistant with the question already asked, after kargul.studio. */
const ask = "What does ClarityOps (clarityops.io) do, and who is it for?";
const ais = [["ChatGPT", `https://chatgpt.com/?q=${encodeURIComponent(ask)}`], ["Claude", `https://claude.ai/new?q=${encodeURIComponent(ask)}`], ["Perplexity", `https://www.perplexity.ai/search?q=${encodeURIComponent(ask)}`]];

function Col({ title, items, external }: { title: string; items: string[][]; external?: boolean }) {
  return (
    <div>
      <p className="ft2-h">{title}</p>
      <ul>{items.map(([label, href]) => <li key={href}><a className="ft-link" href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</a></li>)}</ul>
    </div>
  );
}

export function Footer({ base = "" }: { base?: string }) {
  return (
    <footer className="ft2">
      <div className="ft2-panel">
        <div className="wrap ft2-top">
          <div>
            <Logo />
            <p className="ft-tag">Operations &amp; AI systems studio</p>
            <p className="fine mt-6">© 2026 ClarityOps SARL</p>
          </div>
          <nav aria-label="Footer" className="ft2-cols">
            <Col title="Pages" items={pages.map(([l, h]) => [l, base + h])} />
            <Col title="Ask AI about us" items={ais} external />
            <Col title="Follow" items={social} external />
          </nav>
        </div>
        <FooterMark />
      </div>
    </footer>
  );
}
