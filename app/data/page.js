import { getPlans, latestChecked, FX, OPEN_DATA_COLUMNS } from "../../lib/plans";
import { pageMeta, fmtDate } from "../../lib/site";
import { siteJsonLd } from "../../lib/jsonld";
import AffiliateNote from "../AffiliateNote";
import JsonLd from "../JsonLd";

export const metadata = pageMeta({
  title: "Open data: every plan as CSV and JSON",
  description: "Download every VPS and managed hosting plan on ClawHost Index as CSV or JSON, with the source and the date each price was checked. Licensed under CC BY 4.0.",
  path: "/data/",
});

export default function Page() {
  const plans = getPlans();
  return (<div className="prose">
    <JsonLd data={siteJsonLd(plans)} />
    <AffiliateNote />
    <h1>Open data</h1>
    <p className="checked-on">Last updated {fmtDate(latestChecked(plans))}</p>
    <p>Every plan on this site is in one CSV file and one JSON file you can open in a spreadsheet or load into your own code. Each has {plans.length} rows, one per plan, and both are rebuilt from the same source each time the prices are re-checked.</p>
    <p><a className="btn" href="/plans.csv" download>Download plans.csv</a></p>
    <p><a className="btn" href="/plans.json" download>Download plans.json</a></p>
    <p>The GBP prices are converted at ECB reference rates of {fmtDate(FX.date)}. Prices don't include VAT unless the provider shows them that way. Always confirm the price on the provider's page before you buy.</p>
    <h2>Columns</h2>
    <dl className="cols">{OPEN_DATA_COLUMNS.map(([name, desc]) => <div key={name}><dt>{name}</dt><dd>{desc}</dd></div>)}</dl>
    <h2>Licence</h2>
    <p>Licensed under <a href="https://creativecommons.org/licenses/by/4.0/" rel="license">CC BY 4.0</a>. You can use, share and change it, including for commercial use, as long as you credit &ldquo;ClawHost Index&rdquo; and link back to this site.</p>
    <p>What changed and when is in the <a href="/changelog/">changelog</a>.</p>
  </div>);
}
