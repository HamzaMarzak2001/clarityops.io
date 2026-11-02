import { Logo } from "./Logo";

const pages = [["Work", "#work"], ["Approach", "#approach"], ["Studio", "#studio"], ["Contact", "#contact"]];
const social = [["LinkedIn", "https://www.linkedin.com/in/hamza-marzak-347921231/"], ["X", "https://x.com/hamza_arq"]];

export function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-top">
          <div>
            <Logo />
            <p className="ft-tag">Operations &amp; AI systems studio</p>
          </div>
          <nav aria-label="Footer" className="ft-links">
            <ul>{pages.map(([label, href]) => <li key={href}><a className="ft-link" href={href}>{label}</a></li>)}</ul>
            <ul>{social.map(([label, href]) => <li key={href}><a className="ft-link" href={href} target="_blank" rel="noopener noreferrer">{label}</a></li>)}</ul>
          </nav>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/logo-wordmark-white.svg#svgView(viewBox(65.51,57.45,400.38,77.85))" alt="" className="ft-mark" width={400} height={78} loading="lazy" />
        <p className="fine ft-legal">© 2026 ClarityOps SARL</p>
      </div>
    </footer>
  );
}
