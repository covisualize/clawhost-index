import { getPlans, latestChecked, FX } from "../../lib/plans";
import { pageMeta, fmtDate } from "../../lib/site";
import AffiliateNote from "../AffiliateNote";

export const metadata = pageMeta({
  title: "Open data: every plan as a CSV file",
  description: "Download every VPS and managed hosting plan on ClawHost Index as a CSV file, with the source and the date each price was checked. Licensed under CC BY 4.0.",
  path: "/data/",
});

const COLUMNS = [
  ["provider", "The hosting company."],
  ["plan", "The plan name, as the provider writes it."],
  ["vCPU", "Number of virtual CPUs."],
  ["RAM", "Memory in GB."],
  ["storage", "Disk in GB."],
  ["price_original", "Monthly price in the provider's own currency."],
  ["currency", "USD, EUR or GBP."],
  ["price_gbp", "Monthly price in pounds, to 2 decimals."],
  ["billing_term", "How it's billed, such as hourly, monthly, a 12-month term or ex VAT. Blank if the provider page didn't say."],
  ["promo_note", "Intro, promo, first-term, renewal or trial wording. Blank if there isn't any."],
  ["availability", "\"Listed\", or what the provider page said, such as \"Currently unavailable\"."],
  ["source_url", "The provider page the price was taken from."],
  ["checked_date", "The date the price was checked, as YYYY-MM-DD."],
  ["price_renewal_original", "Monthly price after any intro or promo period, in the provider's own currency. The same as price_original if there's no promo. Blank means the renewal price isn't stated on the provider's page."],
  ["price_renewal_gbp", "The renewal price in pounds, to 2 decimals. Blank means the renewal price isn't stated on the provider's page."],
  ["renewal_source_url", "The provider page the renewal price was taken from, or checked on if it's not stated."],
];

export default function Page() {
  const plans = getPlans();
  return (<div className="prose">
    <AffiliateNote />
    <h1>Open data</h1>
    <p className="checked-on">Last updated {fmtDate(latestChecked(plans))}</p>
    <p>Every plan on this site is in one CSV file you can open in a spreadsheet or load into your own code. It has {plans.length} rows, one per plan, and it's rebuilt each time the prices are re-checked.</p>
    <p><a className="btn" href="/plans.csv" download>Download plans.csv</a></p>
    <p>The GBP prices are converted at ECB reference rates of {fmtDate(FX.date)}. Prices don't include VAT unless the provider shows them that way. Always confirm the price on the provider's page before you buy.</p>
    <h2>Columns</h2>
    <dl className="cols">{COLUMNS.map(([name, desc]) => <div key={name}><dt>{name}</dt><dd>{desc}</dd></div>)}</dl>
    <h2>Licence</h2>
    <p>Licensed under <a href="https://creativecommons.org/licenses/by/4.0/" rel="license">CC BY 4.0</a>. You can use, share and change it, including for commercial use, as long as you credit &ldquo;ClawHost Index&rdquo; and link back to this site.</p>
    <p>What changed and when is in the <a href="/changelog/">changelog</a>.</p>
  </div>);
}
