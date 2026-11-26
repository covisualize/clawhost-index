import "./globals.css";
import { SITE_URL, SITE_NAME, fmtDate } from "../lib/site";
import { FX } from "../lib/plans";

const DESC = "Dated, sourced prices for VPS and managed hosting plans that run AI agents like OpenClaw, Hermes and Claude Code. Every price links to the provider's own page.";
export const viewport = { width: "device-width", initialScale: 1 };
// Site-wide defaults. Each page sets its own title, description and canonical through pageMeta(),
// so there's no canonical here: a page without one (like the 404) shouldn't claim to be the home page.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "ClawHost Index: where to run your AI agent", template: `%s | ${SITE_NAME}` },
  description: DESC,
  authors: [{ name: "Charles" }],
  openGraph: { title: "ClawHost Index: where to run your AI agent", description: DESC, siteName: SITE_NAME, type: "website", locale: "en_GB", images: [{ url: "/og.png", width: 1200, height: 630, alt: "ClawHost Index: VPS prices for AI agents" }] },
  twitter: { card: "summary_large_image", title: "ClawHost Index: where to run your AI agent", description: DESC, images: ["/og.png"] },
};

export default function RootLayout({ children }) {
  return (<html lang="en-GB"><body>
    <header><a href="/" className="logo">🦞 ClawHost Index</a><nav aria-label="Main"><a href="/">Plans</a><a href="/calculator/">Calculator</a><a href="/cost/">Real cost</a><a href="/which-plan/">Which plan</a><a href="/gotchas/">7 gotchas</a><a href="/newsletter/">Newsletter</a><a href="/disclosure/">Disclosure</a></nav></header>
    <main>{children}</main>
    <footer>
      <p className="foot-by">My Side Hustle CEO agent finds the hosts and checks the prices. I'm Charles, and I review what it finds. Spotted a wrong price? Reply to any newsletter issue. <a href="/disclosure/#who">How this works</a></p>
      <ul className="foot-links">
        <li><a href="/data/">Data</a></li>
        <li><a href="/plans.csv">plans.csv</a></li>
        <li><a href="/plans.json">plans.json</a></li>
        <li><a href="/changelog/">Changelog</a></li>
        <li><a href="/security/">Security checklist</a></li>
        <li><a href="/disclosure/">Disclosure</a></li>
        <li><a href="/newsletter/">Newsletter</a></li>
      </ul>
      <details className="more foot-more">
        <summary>How prices are checked</summary>
        <p>Every price shows its source and the date it was checked. <span className="stale">STALE</span> means over 30 days old, so confirm it on the provider's page. <span className="unv">UNVERIFIED</span> means it comes from a third-party tracker and couldn't be confirmed on the provider's own page.</p>
        <p>GBP is converted at ECB reference rates ({fmtDate(FX.date)}), with the original currency shown. Affiliate links are marked and don't change the order or the prices. The data is licensed CC BY 4.0. Not affiliated with OpenClaw or Hermes.</p>
      </details>
    </footer>
  </body></html>);
}
