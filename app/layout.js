import "./globals.css";
import { SITE_URL, SITE_NAME, SUBSCRIBE_URL, fmtDate } from "../lib/site";
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
    <header><a href="/" className="logo">🦞 ClawHost Index</a><nav aria-label="Main"><a href="/">Plans</a><a href="/calculator/">Calculator</a><a href="/gotchas/">7 gotchas</a><a href="/newsletter/">Newsletter</a><a href="/disclosure/">Disclosure</a></nav></header>
    <main>{children}</main>
    <footer>
      <div className="foot-author">
        <p><b>Found by my Grok Bot, reviewed by me.</b> My Grok Bot finds the hosts, re-checks every price each week and built this site. I'm Charles, and I review what it finds before anything goes out. <a href="/disclosure/#who">How this works</a></p>
        <p><b>Get the price changes by email, free.</b> <a className="btn" href="/newsletter/">Join ClawHost Index Weekly</a> <a href={SUBSCRIBE_URL} target="_blank" rel="noopener">or subscribe on beehiiv</a></p>
      </div>
      <p className="foot-small">Every price shows its source and the date it was checked. Prices marked <span className="stale">STALE</span> are over 30 days old, so confirm them on the provider's page. <span className="unv">UNVERIFIED</span> means the price comes from a third-party tracker and couldn't be confirmed on the provider's own page. GBP is converted at ECB reference rates ({fmtDate(FX.date)}), with the original currency shown. Some links are affiliate links and are marked. I may earn a commission at no cost to you, and it doesn't change the order or the prices. Not affiliated with OpenClaw or Hermes.</p>
    </footer>
  </body></html>);
}
