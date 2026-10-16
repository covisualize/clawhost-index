import fs from "fs";
import path from "path";
import Papa from "papaparse";
export const TODAY = new Date("2026-10-16");
// ECB euro reference rates, 2026-10-16: https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml
export const FX = { date: "2026-10-16", source: "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml", EUR_GBP: 0.84385, EUR_USD: 1.1253 };
const toGBP = (amt, cur) => cur === "GBP" ? amt : cur === "EUR" ? amt * FX.EUR_GBP : amt / FX.EUR_USD * FX.EUR_GBP;
const ONE_CLICK = { Hostinger: "OpenClaw & Hermes templates", Contabo: "OpenClaw 1-click app", ClawHosters: "Managed OpenClaw", Agent37: "Managed harnesses" };
const AGENTS = { ClawHosters: ["OpenClaw"], Agent37: ["Hermes", "OpenClaw", "Claude Code", "Codex", "OpenCode", "Pi"] };
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
export function getPlans() {
  const csv = fs.readFileSync(path.join(process.cwd(), "data.csv"), "utf8");
  return Papa.parse(csv, { header: true, skipEmptyLines: true }).data.map((r, i) => {
    const checked = r.source_checked.length === 7 ? r.source_checked + "-01" : r.source_checked;
    const ageDays = Math.round((TODAY - new Date(checked)) / 864e5);
    return { id: i, ...r, vcpu: +r.vcpu, ram_gb: +r.ram_gb, disk_gb: +r.disk_gb, price: +r.price,
      managed: r.type === "managed", gbp: toGBP(+r.price, r.currency), thirdParty: r.verified !== "provider", stale: ageDays > 30, ageDays,
      oneClick: ONE_CLICK[r.provider] || null,
      agents: AGENTS[r.provider] || ["Any (self-host: OpenClaw, Hermes, Claude Code…)"],
      providerSlug: slug(r.provider) };
  });
}
