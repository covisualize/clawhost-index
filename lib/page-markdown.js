import { AGENTS, AGENTS_CHECKED, supports } from "./agents.js";
import { CHANGELOG } from "./changelog.js";
import { getIssues } from "./issues.js";
import { MODELS, MODELS_CHECKED, PRICE_SOURCES } from "./models.js";
import { getPlans, latestChecked, OPEN_DATA_COLUMNS, FX } from "./plans.js";
import { SITE_NAME, SITE_URL, fmtDate } from "./site.js";

const AFFILIATE =
  "We earn commissions when you shop through some links on this page. It costs you nothing extra and doesn't change the order or the prices. Details: /disclosure/.";

const abs = (path) => `${SITE_URL}${path}`;
const orig = (p) => `${p.currency === "EUR" ? "€" : p.currency === "GBP" ? "£" : "$"}${p.price.toFixed(2)} ${p.currency}`;
const findPlan = (plans, provider, plan) => {
  const p = plans.find(x => x.provider === provider && x.plan === plan);
  if (!p) throw new Error(`page-markdown: plan not in data.csv: ${provider} ${plan}`);
  return p;
};

function planTable(plans) {
  const header = "| Provider | Plan | GBP /mo | Original | Renews GBP /mo | vCPU | RAM GB | Disk GB | Availability | Checked | Source |\n| --- | --- | ---: | --- | ---: | ---: | ---: | ---: | --- | --- | --- |";
  const rows = [...plans].sort((a, b) => a.gbp - b.gbp).map(p => {
    const renew = p.renewalGbp == null ? "Not stated" : p.renewalGbp.toFixed(2);
    return `| ${p.provider} | ${p.plan} | ${p.gbp.toFixed(2)} | ${orig(p)} | ${renew} | ${p.vcpu} | ${p.ram_gb} | ${p.disk_gb} | ${p.availability} | ${p.source_checked} | ${p.source_url} |`;
  });
  return [header, ...rows].join("\n");
}

function homeMd(plans) {
  return `# ${SITE_NAME}: VPS prices for running OpenClaw, Hermes and Claude Code

${AFFILIATE}

Host prices for OpenClaw, Hermes and Claude Code, checked this week.

Last checked ${fmtDate(latestChecked(plans))}. ${plans.length} plans, cheapest first. Each price links to the provider's own page. GBP at ECB rates of ${fmtDate(FX.date)}.

${planTable(plans)}

Machine-readable: [plans.csv](${abs("/plans.csv")}), [plans.json](${abs("/plans.json")}), [llms-full.txt](${abs("/llms-full.txt")}). How to use this site: [llms.txt](${abs("/llms.txt")}).
`;
}

function dataMd(plans) {
  const cols = OPEN_DATA_COLUMNS.map(([name, desc]) => `- \`${name}\`: ${desc}`).join("\n");
  return `# Open data

${AFFILIATE}

Last updated ${fmtDate(latestChecked(plans))}.

Every plan on this site is in one CSV file and one JSON file, rebuilt from data.csv each time the prices are re-checked. ${plans.length} rows, one per plan.

- [plans.csv](${abs("/plans.csv")})
- [plans.json](${abs("/plans.json")}) — same fields as the CSV; missing renewal prices are \`null\`

The GBP prices are converted at ECB reference rates of ${fmtDate(FX.date)}. Prices don't include VAT unless the provider shows them that way. Always confirm the price on the provider's page before you buy.

## Columns

${cols}

## Licence

Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). You can use, share and change it, including for commercial use, as long as you credit “${SITE_NAME}” and link back to this site.

What changed and when is in the [changelog](${abs("/changelog/")}).
`;
}

function disclosureMd() {
  return `# Affiliate disclosure & data rules

Some links on ClawHost Index are affiliate links, marked with a small “affiliate” label. If you buy through one, I may earn a commission at no cost to you. Affiliate links never change the order, the prices or which plans are shown. Plans are always sorted by price. I'm a member of InterServer's affiliate programme, DigitalOcean's affiliate programme (via Awin) and Contabo's affiliate programme (via CJ, Commission Junction).

## The price rule

Every price shows its source URL and the date it was checked. Prices older than 30 days are marked STALE. A price that comes from a third-party tracker (such as trackvps.com or vpsranker.com) is marked UNVERIFIED until it's re-checked on the provider's own page. Promo and first-term prices are noted next to the renewal price where I know it. If a provider's page says a plan has been replaced or is unavailable, the row says so.

## Open data

The full plan list is free to download as [plans.csv](${abs("/plans.csv")}) or [plans.json](${abs("/plans.json")}), with the source and checked date for every price. It's licensed under CC BY 4.0, so you can reuse it as long as you credit ClawHost Index. The [data page](${abs("/data/")}) explains each column, and the [changelog](${abs("/changelog/")}) lists what changed and when.

## Who makes this

I'm Charles. My Side Hustle CEO agent found the idea for this site, built it and runs it. It finds the hosts, re-checks every plan against the provider's own page each week and drafts the newsletter. I review what it finds before anything goes out. It has got things wrong before, such as the Oracle free tier, and when that happens I fix it and say so in the newsletter.
`;
}

function changelogMd() {
  const items = CHANGELOG.map(e => {
    const lines = e.items.map(t => `- ${t}`).join("\n");
    const see = e.links ? `\nSee: ${e.links.map(([href, label]) => `[${label}](${abs(href)})`).join(" · ")}` : "";
    return `## ${fmtDate(e.date)}\n\n${lines}${see}`;
  }).join("\n\n");
  return `# Changelog

${AFFILIATE}

Price and plan changes from the weekly re-checks, newest first.

${items}

The current prices are on the [plans list](${abs("/")}) and in the [open data file](${abs("/data/")}).
`;
}

function providerMd(plans, slug) {
  const mine = plans.filter(p => p.providerSlug === slug);
  if (!mine.length) return null;
  const name = mine[0].provider;
  return `# ${name}

${AFFILIATE}

${mine.length} plan${mine.length > 1 ? "s" : ""}. Each price links to its source, with the date it was checked.

${planTable(mine)}

[All plans](${abs("/")})
`;
}

function whichPlanMd(plans) {
  const floor = Math.min(...plans.map(p => p.ram_gb));
  const cheapest = (agent, ram) => plans.filter(p => p.type !== "free" && p.ram_gb >= ram && supports(p, agent)).sort((a, b) => a.gbp - b.gbp).slice(0, 3);
  const needs = AGENTS.map(a => `### ${a.name}

- Minimum RAM: ${a.minRam}
- Comfortable RAM: ${a.comfyRam}
- Minimum vCPU: ${a.minVcpu || "No official figure"}
- Comfortable vCPU: ${a.comfyVcpu || "No official figure"}

${a.notes.map(n => `- ${n}`).join("\n")}

Sources: ${a.sources.map(s => `[${s.label}](${s.url})`).join(", ")}`).join("\n\n");
  const picks = AGENTS.map(a => {
    const min = cheapest(a, a.minRamGb);
    const rows = min.map(p => `- [${p.provider} ${p.plan}](${abs(`/provider/${p.providerSlug}/`)}): £${p.gbp.toFixed(2)} /mo, ${p.vcpu} vCPU, ${p.ram_gb} GB`).join("\n");
    return `### ${a.name}\n\nMeets the minimum (${a.minRamGb} GB+):\n\n${rows}`;
  }).join("\n\n");
  return `# Which plan for which agent

${AFFILIATE}

What OpenClaw, Hermes and Claude Code say they need, from their own docs (checked ${fmtDate(AGENTS_CHECKED)}), and the cheapest paid plans that meet it. Where the docs give no figure, this page says so. GBP at ECB rates of ${fmtDate(FX.date)}. Every plan in the index has at least ${floor} GB RAM.

## What each agent needs

${needs}

## Cheapest suitable plans

${picks}

Next: [what it really costs](${abs("/cost/")}), [server size calculator](${abs("/calculator/")}), [security checklist](${abs("/security/")}).
`;
}

function calculatorMd() {
  return `# How big a server does my agent need?

${AFFILIATE}

A rough guide, not a benchmark. 4 GB suits one person on a hosted model. 8 GB suits browser automation or Docker builds, and OpenClaw's docs ask for 6 GB or more for a source build.

Use the HTML [calculator](${abs("/calculator/")}) to tick those options. Then [compare plans by price](${abs("/")}) or see [which plan for which agent](${abs("/which-plan/")}).
`;
}

function costMd() {
  const usd = (n) => `$${n < 1 ? n : n.toFixed(2)}`;
  const rows = MODELS.map(m => `- ${m.vendor} ${m.name}: ${usd(m.inUsd)} in / ${usd(m.outUsd)} out per 1M tokens${m.cachedUsd != null ? `; cached input ${usd(m.cachedUsd)}` : ""} ([source](${m.source}))`).join("\n");
  return `# What it really costs to run an AI agent a month

${AFFILIATE}

The server is usually the small part. Model API tokens usually cost far more. Use the HTML [calculator](${abs("/cost/")}) to pick an agent, a plan and usage.

Model prices below are USD per 1 million tokens, standard short-context rates, checked ${fmtDate(MODELS_CHECKED)} on [Anthropic](${PRICE_SOURCES.anthropic}) and [OpenAI](${PRICE_SOURCES.openai}).

${rows}

Server prices come from the [plans table](${abs("/")}).
`;
}

function gotchasMd(plans) {
  const kvm1 = findPlan(plans, "Hostinger", "KVM 1");
  const kvm2 = findPlan(plans, "Hostinger", "KVM 2");
  const rn4 = findPlan(plans, "RackNerd", "KVM VPS Special 4GB");
  const c4 = findPlan(plans, "Contabo", "Cloud VPS 4");
  const oracle = findPlan(plans, "Oracle Cloud", "Always Free Arm");
  const hz = findPlan(plans, "Hetzner", "CX23");
  return `# 7 hosting gotchas for running AI agents on a VPS

${AFFILIATE}

What to check before you trust a headline price for OpenClaw, Hermes or Claude Code. Every figure comes from the [plans list](${abs("/")}). GBP at ECB rates of ${fmtDate(FX.date)}.

1. **The price you see is not the price you renew at.** Hostinger KVM 1 is £${kvm1.gbp.toFixed(2)} a month at the start, then renews at £${kvm1.renewalGbp.toFixed(2)}. KVM 2 is £${kvm2.gbp.toFixed(2)}, then £${kvm2.renewalGbp.toFixed(2)}.
2. **"Per month" can mean paying 12 or 24 months up front.** Hostinger's listed prices are on a 24-month term paid up front. RackNerd's ${rn4.plan} is billed yearly.
3. **Intro prices come and go.** A cheap intro can end after a few months, or vanish before you sign up. Read the note under the price.
4. **A promo can last 24 months, then end.** Contabo Cloud VPS 4 is £${c4.gbp.toFixed(2)} a month for the first 24 months. The index does not have the price after that.
5. **Prices without VAT are not what you pay.** Contabo, Hetzner and Netcup list prices without VAT. Hetzner's CX23 is £${hz.gbp.toFixed(2)} without VAT.
6. **Free tiers have limits, and listed plans can be out of stock.** Oracle Always Free Arm is ${oracle.vcpu} OCPUs and ${oracle.ram_gb} GB. Hetzner CX23 is currently ${hz.availability.toLowerCase()}.
7. **Location and currency change the price.** Check the price for your region and currency before you buy.

Full write-up with sources: the HTML [gotchas page](${abs("/gotchas/")}).
`;
}

function securityMd() {
  return `# VPS security checklist for AI agents

${AFFILIATE}

Last checked 17 Nov 2026.

Nine things to do on a new VPS before you run OpenClaw, Hermes or Claude Code. The commands are on the HTML [checklist](${abs("/security/")}). Each step links to the official page it comes from.

1. SSH keys only, password login off — [Ubuntu OpenSSH](https://ubuntu.com/server/docs/how-to/security/openssh-server/)
2. Use a normal user with sudo, not root — [Ubuntu user management](https://ubuntu.com/server/docs/how-to/security/user-management/)
3. Turn on the firewall, allowing SSH first — [Ubuntu firewall](https://ubuntu.com/server/docs/how-to/security/firewalls/)
4. Keep automatic security updates on — [Ubuntu automatic updates](https://ubuntu.com/server/docs/how-to/software/automatic-updates/)
5. Keep agent gateways and dashboards off the internet — [OpenClaw security](https://docs.openclaw.ai/gateway/security)
6. Lock down API key files and never commit them — [OpenClaw secrets](https://docs.openclaw.ai/gateway/security/secrets-and-storage)
7. Set a spend limit on your model API key — [Anthropic spend limits](https://platform.claude.com/docs/en/api/rate-limits)
8. Have backups and snapshots
9. fail2ban (optional) — [fail2ban](https://github.com/fail2ban/fail2ban)
`;
}

function newsletterMd(plans) {
  const issues = getIssues();
  const n = plans.length;
  const list = issues.map(i => `- [Issue #${i.n}: ${i.title}](${abs(i.href)}) (${i.dateLabel})`).join("\n");
  return `# ClawHost Index Weekly

${AFFILIATE}

One email a week on what changed across ${n} VPS and agent-hosting plans, checked against the providers' own pages. Free, and you can unsubscribe any time.

${list}

Also free to read: [7 hosting gotchas](${abs("/gotchas/")}).
`;
}

function issueMd(slug) {
  const i = getIssues().find(x => x.slug === slug);
  if (!i) return null;
  return `# ${i.subject}

Issue #${i.n} · sent ${i.dateLabel} · archive copy, so prices are as of that date. [See today's prices](${abs("/")}).

${AFFILIATE}

${i.body}

[All issues](${abs("/newsletter/")})
`;
}

/**
 * Markdown body for a site path, or null if we don't have a page for it.
 * Paths may omit the trailing slash.
 */
export function pageMarkdown(pathname, plans = getPlans()) {
  const raw = (pathname.split("?")[0].split("#")[0] || "/");
  let p = raw.startsWith("/") ? raw : `/${raw}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  if (p === "") p = "/";

  if (p === "/") return homeMd(plans);
  if (p === "/data") return dataMd(plans);
  if (p === "/disclosure") return disclosureMd();
  if (p === "/changelog") return changelogMd();
  if (p === "/which-plan") return whichPlanMd(plans);
  if (p === "/calculator") return calculatorMd();
  if (p === "/cost") return costMd();
  if (p === "/gotchas") return gotchasMd(plans);
  if (p === "/security") return securityMd();
  if (p === "/newsletter") return newsletterMd(plans);

  const issue = p.match(/^\/newsletter\/(issue-\d+)$/);
  if (issue) return issueMd(issue[1]);

  const prov = p.match(/^\/provider\/([a-z0-9-]+)$/);
  if (prov) return providerMd(plans, prov[1]);

  return null;
}

/** Trailing-slash paths we emit as out/.../index.md (home is out/index.md). */
export function markdownPages(plans = getPlans()) {
  const issues = getIssues();
  const providers = [...new Set(plans.map(p => p.providerSlug))];
  return [
    "/",
    "/data/",
    "/disclosure/",
    "/changelog/",
    "/which-plan/",
    "/calculator/",
    "/cost/",
    "/gotchas/",
    "/security/",
    "/newsletter/",
    ...issues.map(i => i.href),
    ...providers.map(s => `/provider/${s}/`),
  ];
}
