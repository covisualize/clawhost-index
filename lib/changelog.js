// Price and plan changes, newest first. Each entry is taken from a weekly re-check commit message.
// `links` are site pages named in that entry.
export const CHANGELOG = [
  { date: "2026-11-23", items: [
    "Weekly re-check: 30 plans confirmed, ECB rates of 20 Nov. Hetzner was checked separately.",
    "IONOS VPS M+ now $14 and VPS L+ now $25 a month, cancel anytime. The intro price is gone.",
    "RackNerd's specials page now shows Black Friday plans: 4 GB is 4 vCPU and 60 GB at $47.98/yr, 8 GB is 6 vCPU and 140 GB at $94.98/yr. Both renew at the same rate.",
  ] },
  { date: "2026-11-16", items: [
    "Weekly re-check: all 31 plans confirmed, ECB rates of 13 Nov.",
    "Hetzner CX23 shown as 'currently unavailable' on its page.",
    "Added the /cost/ and /which-plan/ pages, /plans.csv open data and this changelog.",
    "Added renewal prices, taken from each provider's own page. Contabo's price after the first 24 months is not stated, so it shows as Not stated.",
  ], links: [["/cost/", "Real cost"], ["/which-plan/", "Which plan"], ["/data/", "Open data"]] },
  { date: "2026-11-09", items: ["Weekly re-check: all 31 plans confirmed, ECB rates of 6 Nov."] },
  { date: "2026-11-02", items: [
    "Weekly re-check: ECB rates of 30 Oct, no price changes.",
    "29 plans re-confirmed. InterServer's page was blocked, and Hetzner was checked separately.",
  ] },
  { date: "2026-10-26", items: [
    "Weekly re-check: ECB rates of 23 Oct.",
    "Hostinger KVM 2 now $8.79.",
    "UpCloud now priced in EUR.",
    "Kamatera and Oracle verified on the provider pages (Oracle 2 OCPU / 12 GB).",
  ] },
  { date: "2026-10-19", items: [
    "Weekly re-check.",
    "Hetzner CX23 replaces CX22 (verified on the provider page).",
    "RackNerd and Akamai now verified on the provider pages.",
    "Checked dates updated.",
  ] },
  { date: "2026-10-16", items: ["Site launched with seed plans."] },
];
