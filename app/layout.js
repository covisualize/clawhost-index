import "./globals.css";
export const metadata = { title: "ClawHost Index — where to run your AI agent", description: "Every price shows its source and check date." };
export default function RootLayout({ children }) {
  return (<html lang="en"><body>
    <header><a href="/" className="logo">🦞 ClawHost Index</a><nav><a href="/">Plans</a><a href="/calculator">Calculator</a><a href="/disclosure">Disclosure</a></nav></header>
    <main>{children}</main>
    <footer>Every price shows its source and the date we checked it. Prices marked <span className="stale">STALE</span> are over 30 days old — confirm on the provider's page. <span className="unv">UNVERIFIED</span> means the price comes from a third-party tracker and couldn't be confirmed on the provider's own page. GBP converted from ECB reference rates (16 Oct 2026); original currency shown. Some links are affiliate links (marked); we may earn a commission at no cost to you. Rankings and prices are not affected. Not affiliated with OpenClaw or Hermes.</footer>
  </body></html>);
}
