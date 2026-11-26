import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import Papa from "papaparse";
import { plansCsv, deriveAvailability, getPlans, CSV_COLUMNS, toGBP } from "../lib/plans.js";
import { byRenewal, renewalServerGbp, serverGbp } from "../lib/cost.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const rows = Papa.parse(read("data.csv"), { header: true, skipEmptyLines: true }).data;
const COLUMNS = "provider,plan,vCPU,RAM,storage,price_original,currency,price_gbp,billing_term,promo_note,availability,source_url,checked_date,price_renewal_original,price_renewal_gbp,renewal_source_url";
const DATA_COLUMNS = "provider,plan,type,vcpu,ram_gb,disk_gb,price,currency,billing_note,source_url,source_checked,verified,affiliate_url,renewal_price,renewal_source_url";
const plan = (provider, name) => getPlans().find(p => p.provider === provider && p.plan === name);

describe("/plans.csv open data", () => {
  it("has the agreed columns in order and one row per data.csv row", () => {
    assert.equal(CSV_COLUMNS.join(","), COLUMNS);
    const parsed = Papa.parse(plansCsv(), { header: true, skipEmptyLines: true });
    assert.deepEqual(parsed.errors, []);
    assert.equal(parsed.meta.fields.join(","), COLUMNS);
    assert.equal(parsed.data.length, rows.length);
    for (const [i, r] of parsed.data.entries()) {
      assert.equal(r.provider, rows[i].provider);
      assert.equal(r.source_url, rows[i].source_url);
      assert.equal(r.checked_date, rows[i].source_checked);
      assert.match(r.price_gbp, /^\d+\.\d{2}$/);
      assert.match(r.price_renewal_gbp, /^(\d+\.\d{2})?$/);
      assert.equal(r.price_renewal_original === "", r.price_renewal_gbp === "");
      assert.equal(r.renewal_source_url, rows[i].renewal_source_url);
    }
    const contabo = parsed.data.find(r => r.provider === "Contabo" && r.plan === "Cloud VPS 4");
    assert.equal(contabo.price_renewal_original, "");
    assert.equal(contabo.price_renewal_gbp, "");
  });

  it("is built by a static route, linked from the footer, data page and disclosure", () => {
    assert.match(read("app/plans.csv/route.js"), /export const dynamic = "force-static"/);
    assert.match(read("app/plans.json/route.js"), /export const dynamic = "force-static"/);
    assert.match(read("app/layout.js"), /href="\/plans\.csv"/);
    assert.match(read("app/layout.js"), /href="\/plans\.json"/);
    assert.match(read("app/data/page.js"), /href="\/plans\.csv"/);
    assert.match(read("app/data/page.js"), /href="\/plans\.json"/);
    assert.match(read("app/data/page.js"), /https:\/\/creativecommons\.org\/licenses\/by\/4\.0\//);
    assert.match(read("app/disclosure/page.js"), /href="\/plans\.csv"/);
    assert.match(read("app/disclosure/page.js"), /href="\/plans\.json"/);
    const sitemap = read("app/sitemap.js");
    assert.match(sitemap, /u\("\/data\/"/);
    assert.match(sitemap, /u\("\/changelog\/"/);
  });
});

describe("renewal prices", () => {
  it("data.csv has the renewal columns at the end and every row has a renewal source", () => {
    assert.equal(read("data.csv").split(/\r?\n/)[0], DATA_COLUMNS);
    for (const r of rows) {
      assert.match(r.renewal_price, /^(\d+(\.\d+)?)?$/, `${r.provider} ${r.plan}`);
      assert.match(r.renewal_source_url, /^https:\/\//, `${r.provider} ${r.plan}`);
    }
  });

  it("leaves current prices, sources and affiliate links as they were at git HEAD", () => {
    const head = Papa.parse(execFileSync("git", ["show", "HEAD:data.csv"], { cwd: new URL("..", import.meta.url) }).toString(),
      { header: true, skipEmptyLines: true }).data;
    assert.equal(head.length, rows.length);
    for (const [i, h] of head.entries()) {
      for (const k of Object.keys(h)) assert.equal(rows[i][k], h[k], `${h.provider} ${h.plan} ${k}`);
    }
  });

  it("shows Contabo as Not stated (null), never a guessed figure", () => {
    for (const name of ["Cloud VPS 4", "Cloud VPS 6"]) {
      const p = plan("Contabo", name);
      assert.equal(p.renewal, null);
      assert.equal(p.renewalGbp, null);
      assert.equal(p.renewalSource, "https://contabo.com/en/vps/");
      assert.equal(renewalServerGbp(p, 0.75), null);
    }
  });

  it("has Hostinger KVM 1 renewing at $11.99, converted with the same toGBP as current prices", () => {
    const p = plan("Hostinger", "KVM 1");
    assert.equal(p.renewal, 11.99);
    assert.equal(p.currency, "USD");
    assert.equal(p.renewalGbp, toGBP(11.99, "USD"));
    assert.equal(p.gbp, toGBP(6.49, "USD"));
  });

  it("applies the /cost/ calculator's edited USD → GBP rate to renewal exactly as to the current price", () => {
    const p = plan("IONOS", "VPS M+");
    assert.equal(renewalServerGbp(p, 0.5), 7);
    assert.equal(renewalServerGbp(p, 0.5), serverGbp({ ...p, price: p.renewal }, 0.5));
    const eur = plan("Netcup", "VPS 500 G12.5");
    assert.equal(renewalServerGbp(eur, 0.5), eur.renewalGbp, "EUR keeps the site's ECB conversion");
  });

  it("sorts by renewal price with Not stated rows last", () => {
    const sorted = [...getPlans()].sort(byRenewal);
    const names = sorted.map(p => `${p.provider} ${p.plan}`);
    assert.deepEqual(names.slice(-2), ["Contabo Cloud VPS 4", "Contabo Cloud VPS 6"]);
    const stated = sorted.filter(p => p.renewalGbp !== null).map(p => p.renewalGbp);
    assert.deepEqual(stated, [...stated].sort((a, b) => a - b));
    const table = read("app/PlanTable.js");
    assert.match(table, /<option value="current">Current price<\/option><option value="renewal">Renewal price<\/option>/);
    assert.match(table, /useState\("current"\)/, "default stays cheapest current price");
    assert.match(table, /data-label="Renews at"/);
  });

  it("is in the 16 Nov 2026 changelog entry", async () => {
    const { CHANGELOG } = await import("../lib/changelog.js");
    const entry = CHANGELOG.find(e => e.date === "2026-11-16");
    assert.ok(entry.items.includes("Added renewal prices, taken from each provider's own page. Contabo's price after the first 24 months is not stated, so it shows as Not stated."));
  });
});

describe("availability from the billing note", () => {
  it("marks Hetzner CX23 as currently unavailable and replacing CX22", () => {
    const cx23 = getPlans().find(p => p.provider === "Hetzner" && p.plan === "CX23");
    assert.equal(cx23.availability, "Currently unavailable");
    assert.equal(cx23.replaces, "CX22");
  });

  it("doesn't invent a status for plans whose note says nothing", () => {
    assert.deepEqual(deriveAvailability("monthly bundle"), { availability: "Listed", replaces: null, replacedBy: null });
    const flagged = getPlans().filter(p => p.availability !== "Listed").map(p => `${p.provider} ${p.plan}`);
    assert.deepEqual(flagged, ["Hetzner CX23"]);
  });
});

describe("home page first screen", () => {
  it("has the new headline, a computed plan count and a link to the table", () => {
    const page = read("app/page.js");
    assert.ok(page.includes("<h1>Host prices for OpenClaw, Hermes and Claude Code, checked this week.</h1>"));
    assert.match(page, /\{plans\.length\} plans, cheapest first\./);
    assert.match(page, /href="#plans"/);
    assert.match(page, /id="plans"/);
    assert.ok(page.indexOf("<AffiliateNote />") < page.indexOf("<h1>"), "affiliate note must come before the headline");
  });
});

describe("exported open-data files", () => {
  const ready = existsSync(new URL("../out/plans.csv", import.meta.url));

  it("writes plans.csv, /data/ and /changelog/", { skip: !ready }, () => {
    assert.equal(read("out/plans.csv"), plansCsv());
    assert.ok(existsSync(new URL("../out/data/index.html", import.meta.url)));
    assert.ok(existsSync(new URL("../out/changelog/index.html", import.meta.url)));
    const html = read("out/index.html");
    assert.ok(html.search(/We earn commissions/) < html.search(/<h1>/), "affiliate note must be above the headline");
    assert.match(html, /Currently unavailable/);
  });
});
