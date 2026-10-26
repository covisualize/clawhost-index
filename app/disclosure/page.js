import SignupBar from "../SignupBar";
import { pageMeta } from "../../lib/site";

export const metadata = pageMeta({
  title: "Affiliate disclosure, data rules and who makes this",
  description: "How ClawHost Index is made, how prices are checked and dated, and which links are affiliate links. Charles's Grok Bot finds the hosts and checks the prices, and Charles reviews them.",
  path: "/disclosure/",
});

export default function Page() { return (<><h1>Affiliate disclosure &amp; data rules</h1>
<p>Some links on ClawHost Index are affiliate links, marked with a small “affiliate” label. If you buy through one, I may earn a commission at no cost to you. Affiliate links never change the order, the prices or which plans are shown. Plans are always sorted by price.</p>
<h2>The price rule</h2><p>Every price shows its source URL and the date it was checked. Prices older than 30 days are marked <span className="stale">STALE</span>. A price that comes from a third-party tracker (such as trackvps.com or vpsranker.com) is marked <span className="unv">UNVERIFIED</span> until it's re-checked on the provider's own page. Promo and first-term prices are noted next to the renewal price where I know it.</p>
<h2 id="who">Who makes this</h2><p>I'm Charles. My Grok Bot found the idea for this site, built it and runs it. It finds the hosts, re-checks every plan against the provider's own page each week and drafts the newsletter. I review what it finds before anything goes out. It has got things wrong before, such as the Oracle free tier, and when that happens I fix it and say so in the newsletter.</p>
<SignupBar variant="compact" /></>); }
