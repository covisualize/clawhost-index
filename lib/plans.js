import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { fmtDate } from "./site.js";
export const TODAY = new Date("2026-11-16");
// ECB euro reference rates, 2026-11-13: https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml
export const FX = { date: "2026-11-20", source: "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml", EUR_GBP: 0.83735, EUR_USD: 1.0990 };
export const toGBP = (amt, cur) => cur === "GBP" ? amt : cur === "EUR" ? amt * FX.EUR_GBP : amt / FX.EUR_USD * FX.EUR_GBP;
const ONE_CLICK = { Hostinger: "OpenClaw & Hermes templates", Contabo: "OpenClaw 1-click app", ClawHosters: "Managed OpenClaw", Agent37: "Managed harnesses" };
const AGENTS = { ClawHosters: ["OpenClaw"], Agent37: ["Hermes", "OpenClaw", "Claude Code", "Codex", "OpenCode", "Pi"] };
export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
// billing_note is split on ";" into parts. Availability and promo text are read from those parts only:
// data.csv has no status column, so nothing here goes beyond what the note says.
const noteParts = (note) => (note || "").split(";").map(s => s.trim()).filter(Boolean);
const AVAIL_RE = /unavailable|replaces|replaced by|discontinued|no longer (sold|for sale|available)/i;
const PROMO_RE = /\b(intro|promo|first|renews|trial)\b/i;
const TERM_RE = /\b(monthly|hourly|per-(second|minute)|prepaid|upfront|term|contract|annually|yearly|bundle|billing|ex VAT|ex tax)\b|\/yr|price$|price varies/i;

// { availability, replaces, replacedBy } from the billing note, e.g. Hetzner CX23:
// "replaces CX22; shown as 'currently unavailable' on 16 Nov" → "Currently unavailable", replaces "CX22".
export function deriveAvailability(note) {
  const n = note || "";
  const replaces = n.match(/\breplaces ([^;,()]+?)(?=[;,()]|$)/i)?.[1].trim() || null;
  const replacedBy = n.match(/\breplaced by ([^;,()]+?)(?=[;,()]|$)/i)?.[1].trim() || null;
  const availability = /unavailable/i.test(n) ? "Currently unavailable"
    : /no longer (sold|for sale|available)|discontinued/i.test(n) ? "No longer for sale"
    : replacedBy ? `Replaced by ${replacedBy}` : "Listed";
  return { availability, replaces, replacedBy };
}

// Billing term and promo text from the billing note, for /plans.csv. Promo parts (intro, promo,
// first term, renewal price, trial) go to promo_note; billing parts (term, hourly, VAT...) to billing_term.
export function deriveTerms(note, type) {
  const parts = noteParts(note).filter(s => !AVAIL_RE.test(s));
  const promo = parts.filter(s => PROMO_RE.test(s));
  const term = parts.filter(s => !PROMO_RE.test(s) && TERM_RE.test(s));
  return { billing_term: term.join("; ") || (type === "free" ? "free tier" : ""), promo_note: promo.join("; ") };
}

const isoChecked = (c) => c.length === 7 ? c + "-01" : c;
// Latest source_checked across all plans, as YYYY-MM-DD.
export const latestChecked = (plans) => plans.map(p => isoChecked(p.source_checked)).sort().pop();

export function getPlans() {
  const csv = fs.readFileSync(path.join(process.cwd(), "data.csv"), "utf8");
  return Papa.parse(csv, { header: true, skipEmptyLines: true }).data.map((r, i) => {
    const checked = isoChecked(r.source_checked);
    const ageDays = Math.round((TODAY - new Date(checked)) / 864e5);
    // Blank renewal_price means the provider's page doesn't state one: keep it null, never fill it in.
    const renewal = (r.renewal_price ?? "") === "" ? null : +r.renewal_price;
    return { id: i, ...r, vcpu: +r.vcpu, ram_gb: +r.ram_gb, disk_gb: +r.disk_gb, price: +r.price,
      managed: r.type === "managed", gbp: toGBP(+r.price, r.currency),
      renewal, renewalGbp: renewal === null ? null : toGBP(renewal, r.currency), renewalSource: r.renewal_source_url || r.source_url,
      thirdParty: r.verified !== "provider", stale: ageDays > 30, ageDays,
      oneClick: ONE_CLICK[r.provider] || null,
      agents: AGENTS[r.provider] || ["Any (self-host: OpenClaw, Hermes, Claude Code…)"],
      providerSlug: slug(r.provider), checkedLabel: fmtDate(r.source_checked), ...deriveAvailability(r.billing_note) };
  });
}

export const CSV_COLUMNS = ["provider", "plan", "vCPU", "RAM", "storage", "price_original", "currency", "price_gbp", "billing_term", "promo_note", "availability", "source_url", "checked_date", "price_renewal_original", "price_renewal_gbp", "renewal_source_url"];
const csvCell = (v) => { const s = String(v ?? ""); return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s; };

// The open-data file served at /plans.csv. Same order as data.csv, RAM and storage in GB.
export function plansCsv(plans = getPlans()) {
  const rows = plans.map(p => {
    const { billing_term, promo_note } = deriveTerms(p.billing_note, p.type);
    return [p.provider, p.plan, p.vcpu, p.ram_gb, p.disk_gb, p.price.toFixed(2), p.currency, p.gbp.toFixed(2),
      billing_term, promo_note, p.availability, p.source_url, p.source_checked,
      p.renewal === null ? "" : p.renewal.toFixed(2), p.renewalGbp === null ? "" : p.renewalGbp.toFixed(2), p.renewalSource];
  });
  return [CSV_COLUMNS, ...rows].map(r => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}
