import { CHANGELOG } from "./changelog.js";
import { getPlans, latestChecked, OPEN_DATA_COLUMNS, planRecord, FX } from "./plans.js";
import { SITE_NAME, SITE_URL, fmtDate } from "./site.js";

const CC = "https://creativecommons.org/licenses/by/4.0/";
const abs = (path) => `${SITE_URL}${path}`;

const AFFILIATE =
  "Some Visit links on the HTML pages are affiliates, marked as such. They do not change the order, the prices or which plans are shown. Full wording: /disclosure/.";

/** Concise /llms.txt: when to use this site, key pages, machine-readable files. */
export function llmsTxt(plans = getPlans()) {
  const n = plans.length;
  const checked = fmtDate(latestChecked(plans));
  const providers = [...new Set(plans.map(p => p.provider))].sort();
  return `# ${SITE_NAME}

> Dated, sourced VPS and managed hosting prices for running AI agents such as OpenClaw, Hermes and Claude Code.

${n} plans from ${providers.length} providers. Last checked ${checked}. GBP converted at ECB reference rates of ${fmtDate(FX.date)}. Every price has a source URL and a checked date. Confirm it on the provider's own page before you buy.

Charles reviews what my Side Hustle CEO agent finds. Prices are re-checked against each provider's page about once a week.

${AFFILIATE}

The plan dataset is licensed [CC BY 4.0](${CC}). You can use, share and change it, including for commercial use, as long as you credit “${SITE_NAME}” and link back to ${SITE_URL}/.

## When to use ${SITE_NAME}

Use this site when you need a dated, sourced comparison of VPS or managed hosts that can run AI agents (OpenClaw, Hermes, Claude Code, or self-hosted equivalents).

Use it to:

- Compare monthly prices in GBP and in the provider's currency
- Read renewal prices, billing terms, promo notes and whether a plan is still listed
- Match RAM and vCPU to what each agent's own docs ask for (/which-plan/, /calculator/, /cost/)
- Load the dataset in your own code from /plans.csv or /plans.json

Do not treat a figure here as a live checkout price, a stock check, or the provider's official quote. Always follow the source URL. Prices older than 30 days are marked stale on the HTML pages. This is not financial, legal or purchasing advice.

If you already know the provider, skip to that provider page. If you need every row, download /plans.json or /llms-full.txt rather than scraping HTML.

## Pages

- [Home](${abs("/")}): all plans, cheapest first
- [Which plan](${abs("/which-plan/")}): cheapest plans that meet each agent's documented RAM
- [Real cost](${abs("/cost/")}): server plus model API spend
- [Calculator](${abs("/calculator/")}): rough RAM guide, not a benchmark
- [7 gotchas](${abs("/gotchas/")}): renewal, upfront terms, VAT, free-tier limits
- [Security checklist](${abs("/security/")}): nine steps before you run an agent on a VPS
- [Open data](${abs("/data/")}): column list, licence, download links
- [Changelog](${abs("/changelog/")}): what changed and when
- [Disclosure](${abs("/disclosure/")}): affiliates, price rules, who makes this
- [Newsletter](${abs("/newsletter/")}): weekly email of price changes

${providers.map(name => {
  const slug = plans.find(p => p.provider === name).providerSlug;
  return `- [${name}](${abs(`/provider/${slug}/`)})`;
}).join("\n")}

## Machine-readable data

- [llms-full.txt](${abs("/llms-full.txt")}): full plan list as Markdown, generated from the same source as the CSV
- [plans.csv](${abs("/plans.csv")}): one row per plan
- [plans.json](${abs("/plans.json")}): the same fields as the CSV
- [sitemap.xml](${abs("/sitemap.xml")}): every HTML page

Pages also honour \`Accept: text/markdown\` (HTML is unchanged for browsers). Unknown paths return HTTP 404 with a short Markdown body.
`;
}

function money(p) {
  const orig = `${p.currency === "EUR" ? "€" : p.currency === "GBP" ? "£" : "$"}${Number(p.price_original).toFixed(2)} ${p.currency}`;
  return `£${Number(p.price_gbp).toFixed(2)} /mo (${orig})`;
}

function renewal(p) {
  if (p.price_renewal_gbp == null) return "Not stated on the provider's page";
  const orig = `${p.currency === "EUR" ? "€" : p.currency === "GBP" ? "£" : "$"}${Number(p.price_renewal_original).toFixed(2)} ${p.currency}`;
  return `£${Number(p.price_renewal_gbp).toFixed(2)} /mo (${orig})`;
}

/** Full /llms-full.txt: every plan from data.csv, so prices cannot drift from the HTML table. */
export function llmsFullTxt(plans = getPlans()) {
  const rows = plans.map(planRecord);
  const byProvider = new Map();
  for (const [i, p] of plans.entries()) {
    const list = byProvider.get(p.provider) || [];
    list.push({ plan: p, row: rows[i] });
    byProvider.set(p.provider, list);
  }
  const cols = OPEN_DATA_COLUMNS.map(([name, desc]) => `- \`${name}\`: ${desc}`).join("\n");
  const sections = [...byProvider.entries()].map(([name, list]) => {
    const slug = list[0].plan.providerSlug;
    const blocks = list.map(({ plan, row }) => `### ${row.plan}

- Type: ${plan.managed ? "managed" : plan.type}
- vCPU: ${row.vCPU}
- RAM: ${row.RAM} GB
- Storage: ${row.storage} GB
- Price: ${money(row)}
- Renewal: ${renewal(row)}
- Billing term: ${row.billing_term || "(not stated)"}
- Promo: ${row.promo_note || "(none)"}
- Availability: ${row.availability}
- Source: ${row.source_url}
- Checked: ${row.checked_date}
- Renewal source: ${row.renewal_source_url}
- Provider page: ${abs(`/provider/${slug}/`)}`).join("\n\n");
    return `## ${name}\n\n${blocks}`;
  }).join("\n\n");

  const latest = CHANGELOG[0];
  return `# ${SITE_NAME} — full plan list

Generated at build time from data.csv. ${rows.length} plans. Last checked ${fmtDate(latestChecked(plans))}. GBP at ECB rates of ${fmtDate(FX.date)} (${FX.source}).

${AFFILIATE}

Licence: [CC BY 4.0](${CC}). Credit “${SITE_NAME}” and link back to ${SITE_URL}/.

Always confirm the price on the provider's page before you buy. Prices do not include VAT unless the provider shows them that way.

See also: ${abs("/llms.txt")}, ${abs("/plans.csv")}, ${abs("/plans.json")}, ${abs("/data/")}.

Latest changelog (${latest.date}): ${latest.items[0]}

## Columns

${cols}

${sections}
`;
}
