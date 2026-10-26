import { getPlans, FX } from "../../lib/plans";
import { pageMeta, fmtDate } from "../../lib/site";
import SignupBar from "../SignupBar";

export const metadata = pageMeta({
  title: "7 hosting gotchas for running AI agents on a VPS",
  description: "Renewal prices, 24-month upfront terms, intro prices that end after 3 months, prices without VAT, and the Oracle free tier that is 2 OCPUs and 12 GB. Seven things to check before you pay, from the ClawHost Index data.",
  path: "/gotchas/",
});

// Every figure on this page comes from data.csv. If a plan or a note changes shape,
// the build fails here instead of the page quietly showing an old number.
const usdToGbp = (n) => n / FX.EUR_USD * FX.EUR_GBP;
const gbp = (n) => `£${n.toFixed(2)}`;
const money = (p) => `${p.currency === "EUR" ? "€" : "$"}${p.price.toFixed(2).replace(/\.00$/, "")}`;
function noteNum(p, re) {
  const m = p.billing_note.match(re);
  if (!m) throw new Error(`gotchas: "${p.provider} ${p.plan}" billing note no longer matches ${re}`);
  return +m[1];
}

export default function Gotchas() {
  const plans = getPlans();
  const find = (provider, plan) => {
    const p = plans.find(x => x.provider === provider && x.plan === plan);
    if (!p) throw new Error(`gotchas: plan not in data.csv: ${provider} ${plan}`);
    return p;
  };
  const kvm1 = find("Hostinger", "KVM 1"), kvm2 = find("Hostinger", "KVM 2");
  const rn4 = find("RackNerd", "KVM VPS Special 4GB"), rn8 = find("RackNerd", "KVM VPS Special 8GB");
  const ionM = find("IONOS", "VPS M+"), ionL = find("IONOS", "VPS L+");
  const c4 = find("Contabo", "Cloud VPS 4"), nc = find("Netcup", "VPS 500 G12.5");
  const oracle = find("Oracle Cloud", "Always Free Arm");
  const hz = find("Hetzner", "CX23"), up = find("UpCloud", "Starter 2 core / 4GB");

  const renew1 = noteNum(kvm1, /renews \$([\d.]+)/), renew2 = noteNum(kvm2, /renews \$([\d.]+)/);
  const rnYear4 = noteNum(rn4, /\$([\d.]+)\/yr/), rnYear8 = noteNum(rn8, /\$([\d.]+)\/yr/);
  const ionThenM = noteNum(ionM, /then \$([\d.]+)/), ionThenL = noteNum(ionL, /then \$([\d.]+)/);
  const ncVat = noteNum(nc, /€([\d.]+) incl/);

  // Check dates: the most common one, plus any plan checked on a different day.
  const count = {};
  for (const p of plans) count[p.source_checked] = (count[p.source_checked] || 0) + 1;
  const main = Object.keys(count).sort((a, b) => count[b] - count[a])[0];
  const others = plans.filter(p => p.source_checked !== main);
  const checked = `${fmtDate(main)}${others.length ? ` (${others.map(p => `${p.provider} ${fmtDate(p.source_checked).replace(/ \d{4}$/, "")}`).join(", ")})` : ""}`;

  return (<article className="prose">
    <p className="crumb"><a href="/">← All plans</a></p>
    <h1>7 hosting gotchas for running AI agents on a VPS</h1>
    <p className="sub">What to check before you trust a headline price for OpenClaw, Hermes or Claude Code. Every figure here comes from the ClawHost Index table, which links each price to the provider's own page with the date it was checked.</p>
    <p className="byline">By Charles. My Grok Bot found the hosts and checked the prices, and I reviewed them. Prices checked {checked}. GBP at ECB rates of {fmtDate(FX.date)}.</p>

    <h2>1. The price you see is not the price you renew at</h2>
    <p>Hostinger's KVM 1 is {gbp(kvm1.gbp)} a month at the start, then renews at ${renew1} a month (about {gbp(usdToGbp(renew1))}). KVM 2 is {gbp(kvm2.gbp)} a month and renews at ${renew2} (about {gbp(usdToGbp(renew2))}). Find the renewal price before you pay, because that's what you carry on paying.</p>

    <h2>2. "Per month" can mean paying 12 or 24 months up front</h2>
    <p>Hostinger's listed prices are on a 24-month term paid up front. RackNerd's {gbp(rn4.gbp)} (4 GB) and {gbp(rn8.gbp)} (8 GB) are ${rnYear4} and ${rnYear8} a year, paid yearly and shown here divided by 12. Netcup and IONOS list 12-month terms. A cheap monthly figure can still mean a bigger bill on day one.</p>

    <h2>3. Intro prices can end after 3 months</h2>
    <p>IONOS VPS M+ is {gbp(ionM.gbp)} a month for the first 3 months, then ${ionThenM} a month (about {gbp(usdToGbp(ionThenM))}). VPS L+ is {gbp(ionL.gbp)}, then ${ionThenL} (about {gbp(usdToGbp(ionThenL))}). Both are on a 1-year term. The table sorts by the listed price, so read the note under it before you pick one.</p>

    <h2>4. A promo can last 24 months, then end</h2>
    <p>Contabo Cloud VPS 4 ({c4.vcpu} vCPU, {c4.ram_gb} GB) is {money(c4)} a month, about {gbp(c4.gbp)}, for the first 24 months. The index doesn't have the price after that, so check it on Contabo's page before you commit. It also has a one-click OpenClaw install.</p>

    <h2>5. Prices without VAT are not what you pay</h2>
    <p>Contabo, Hetzner and Netcup list prices without VAT, and UpCloud lists them without tax. Netcup's VPS 500 is {money(nc)} without VAT and €{ncVat.toFixed(2)} with 19% VAT. Hetzner's CX23 is {money(hz)} without VAT, about {gbp(hz.gbp)}. Check the total at checkout.</p>

    <h2>6. Free tiers have limits, and listed plans can be out of stock</h2>
    <p>The index first had Oracle's Always Free Arm tier as 4 cores and 24 GB, from a third-party site. Oracle's own docs say {oracle.vcpu} OCPUs and {oracle.ram_gb} GB in total, with {oracle.disk_gb} GB of block storage, still free. Oracle may also reclaim idle instances, so read its terms before you rely on it. And on 19 Oct Hetzner showed every cost-optimised plan, the CX23 included, as "currently unavailable", so a plan on a list isn't always one you can buy.</p>

    <h2>7. Location and currency change the price</h2>
    <p>Akamai (Linode) shows a North America price, and LightNode says its price varies by location. UpCloud's page now shows euros only, so its 2 core / 4 GB Starter is {money(up)} a month, about {gbp(up.gbp)}. That's a change in how they show it, not necessarily a price cut. Check the price for your region and currency before you buy.</p>

    <h2>Before you pay: how much RAM?</h2>
    <p>As a rough guide, 4 GB suits one person on a hosted model, and 8 GB suits browser automation or Docker builds. OpenClaw's docs ask for 6 GB or more for a source build. These are estimates, not benchmarks. Try the <a href="/calculator/">calculator</a>, then <a href="/">compare plans by price</a>.</p>

    <p className="src">Some links on the site are affiliate links and they're clearly marked. They don't change the order, which is by price. <a href="/disclosure/">Disclosure</a>. If something here is wrong or out of date, reply to the newsletter and tell me.</p>
    <SignupBar variant="compact" />
  </article>);
}
