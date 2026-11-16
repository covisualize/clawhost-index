import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import Papa from "papaparse";
import { AGENTS } from "../lib/agents.js";
import { serverGbp, sortPlans, defaultPlan } from "../lib/cost.js";

const ANTHROPIC = "https://platform.claude.com/docs/en/about-claude/pricing";
const OPENAI = "https://developers.openai.com/api/docs/pricing";
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const amp = (s) => s.replaceAll("&", "&amp;");
// React separates adjacent text with <!-- --> in static HTML.
const exported = (url) => readFileSync(url, "utf8").replaceAll("<!-- -->", "");
const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("'", "&#x27;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const rows = Papa.parse(read("data.csv"), { header: true, skipEmptyLines: true }).data;
const freePlans = rows.filter(p => p.type === "free");

describe("server price at the user's USD → GBP rate", () => {
  const anyAgent = ["Any (self-host)"];
  const plan = (id, currency, price, gbp, extra = {}) => ({ id, provider: `P${id}`, plan: "x", currency, price, gbp, ram_gb: 4, type: "vps", agents: anyAgent, ...extra });
  const usd = plan(0, "USD", 10, 7.56), eur = plan(1, "EUR", 9, 7.52), gbp = plan(2, "GBP", 7.6, 7.6), free = plan(3, "USD", 0, 0, { type: "free" });
  const openclaw = AGENTS.find(a => a.name === "OpenClaw");

  it("converts USD with the edited rate, leaves GBP alone and keeps ECB for EUR", () => {
    assert.equal(serverGbp(usd, 0.5), 5);
    assert.equal(serverGbp(usd, 1), 10);
    assert.equal(serverGbp(gbp, 0.5), 7.6);
    assert.equal(serverGbp(eur, 0.5), 7.52);
    assert.equal(serverGbp(eur, 1), 7.52);
  });

  it("re-sorts and re-picks the default plan when the rate changes, never picking a free tier", () => {
    const plans = [eur, gbp, usd, free];
    assert.deepEqual(sortPlans(plans, 0.5).map(p => p.id), [3, 0, 1, 2]);
    assert.deepEqual(sortPlans(plans, 1).map(p => p.id), [3, 1, 2, 0]);
    assert.equal(defaultPlan(plans, openclaw, 0.5).id, usd.id);
    assert.equal(defaultPlan(plans, openclaw, 1).id, eur.id);
    assert.equal(defaultPlan([free], openclaw, 1).id, free.id, "falls back to a free tier only if nothing else fits");
  });

  it("is the one helper the calculator uses for labels, sorting, the default and the total", () => {
    const calc = read("app/cost/CostCalc.js");
    assert.match(calc, /from "..\/..\/lib\/cost"/);
    assert.match(calc, /sortPlans\(plans, usdGbp\)/);
    assert.match(calc, /£\$\{fmt\(serverGbp\(p, usdGbp\)\)\}\/mo/);
    assert.match(calc, /const server = serverGbp\(plan, usdGbp\)/);
    assert.doesNotMatch(calc, /\.gbp\b/, "the calculator shouldn't read plan.gbp directly");
  });
});

describe("/cost/ and /which-plan/ pages", () => {
  it("are in the nav and the sitemap", () => {
    const layout = read("app/layout.js"), sitemap = read("app/sitemap.js");
    assert.match(layout, /<a href="\/cost\/">Real cost<\/a>/);
    assert.match(layout, /<a href="\/which-plan\/">Which plan<\/a>/);
    assert.match(sitemap, /u\("\/cost\/"/);
    assert.match(sitemap, /u\("\/which-plan\/"/);
  });

  it("cite the pricing sources, take plans from getPlans() and show the affiliate note", () => {
    const models = read("lib/models.js"), cost = read("app/cost/page.js"), which = read("app/which-plan/page.js");
    assert.ok(models.includes(ANTHROPIC) && models.includes(OPENAI));
    assert.match(cost, /PRICE_SOURCES/);
    for (const page of [cost, which]) {
      assert.match(page, /getPlans\(\)/);
      assert.match(page, /<AffiliateNote \/>/);
      assert.match(page, /pageMeta\(/);
      assert.doesNotMatch(page, /Obah/);
    }
  });
});

describe("exported /cost/ and /which-plan/ HTML", () => {
  const cost = new URL("../out/cost/index.html", import.meta.url);
  const which = new URL("../out/which-plan/index.html", import.meta.url);
  const ready = existsSync(cost) && existsSync(which);

  it("cost page cites both pricing pages with the check date and renders the result", { skip: !ready }, () => {
    const html = exported(cost);
    assert.ok(html.includes(`href="${ANTHROPIC}"`), "missing Anthropic pricing link");
    assert.ok(html.includes(`href="${OPENAI}"`), "missing OpenAI pricing link");
    assert.ok(html.includes("checked 16 Nov 2026"), "missing check date");
    assert.match(html, /We earn commissions when you shop through some links on this page/);
    const val = (id) => +html.match(new RegExp(`data-testid="${id}"[^>]*>([\\d.]+)`))[1];
    // Each figure is rounded on its own, so the parts can be 1p off the total.
    assert.ok(Math.abs(val("total-gbp") - val("server-gbp") - val("model-gbp")) <= 0.011, "total should be server + model");
    assert.match(html, /data-testid="model-share"/);
  });

  it("which-plan page cites the agent docs and links plans to provider pages", { skip: !ready }, () => {
    const html = exported(which);
    for (const url of ["https://hermes-agent.nousresearch.com/docs/user-guide/docker", "https://docs.openclaw.ai/install/raspberry-pi", "https://code.claude.com/docs/en/setup"]) {
      assert.ok(html.includes(`href="${amp(url)}"`), `missing ${url}`);
    }
    assert.ok(html.includes("No official figure"), "missing no-official-figure wording");
    assert.match(html, /href="\/provider\/[a-z0-9-]+\/"/);
    assert.match(html, /href="\/cost\/"/);
    assert.match(html, /We earn commissions when you shop through some links on this page/);
  });

  it("cost page defaults to the cheapest paid plan, with free tiers still selectable and labelled", { skip: !ready }, () => {
    const html = exported(cost);
    const select = html.match(/Server plan<select>([\s\S]*?)<\/select>/)[1];
    const options = [...select.matchAll(/<option value="\d+"( selected="")?>([^<]*)<\/option>/g)]
      .map(([, sel, label]) => ({ selected: !!sel, label, gbp: +label.match(/£([\d.]+)\/mo/)[1], free: label.endsWith("· free tier") }));
    const chosen = options.find(o => o.selected);
    assert.ok(chosen && !chosen.free, `default should be a paid plan, got ${chosen?.label}`);
    assert.equal(chosen.gbp, Math.min(...options.filter(o => !o.free).map(o => o.gbp)));
    assert.ok(chosen.gbp > 0);
    for (const p of freePlans) assert.ok(options.some(o => o.free && o.label.startsWith(`${p.provider} ${p.plan}`)), `${p.plan} missing from dropdown`);
  });

  it("which-plan lists paid plans only and notes each free tier with its caveat", { skip: !ready }, () => {
    const html = exported(which);
    const tables = [...html.matchAll(/<table class="plans plans-pick">[\s\S]*?<\/table>/g)].map(m => m[0]).join("");
    assert.ok(tables.length > 0);
    assert.doesNotMatch(tables, /Free tier/);
    const notes = [...html.matchAll(/<p class="src free-tier">([\s\S]*?)<\/p>/g)].map(m => m[1]).join("");
    for (const p of freePlans) {
      assert.ok(notes.includes(`href="/provider/${slug(p.provider)}/"`), `${p.provider} free-tier link missing`);
      assert.ok(notes.includes(esc(p.billing_note)), `${p.provider} billing note missing`);
    }
  });

  it("cost page shows the default plan's billing terms next to the result", { skip: !ready }, () => {
    const html = exported(cost);
    const label = html.match(/Server plan<select>[\s\S]*?<option value="\d+" selected="">([^<]*)<\/option>/)[1];
    const p = rows.find(r => label.startsWith(esc(`${r.provider} ${r.plan} · `)));
    assert.ok(p, `selected plan not in data.csv: ${label}`);
    const terms = html.match(/data-testid="plan-terms"[^>]*>([^<]*)</)[1];
    assert.equal(terms, p.billing_note ? esc(p.billing_note) : "No extra terms noted in the index.");
    assert.ok(read("app/cost/page.js").includes("billing_note"), "page must pass billing_note to the calculator");
  });

  it("which-plan shows each listed plan's billing note", { skip: !ready }, () => {
    const html = exported(which);
    const trs = [...html.matchAll(/<table class="plans plans-pick">[\s\S]*?<\/table>/g)]
      .flatMap(m => [...m[0].matchAll(/<tr>(<td[\s\S]*?)<\/tr>/g)].map(r => r[1]));
    assert.ok(trs.length > 0);
    for (const tr of trs) {
      const [, provider, name] = tr.match(/<a href="\/provider\/[^"]+\/">([^<]*)<\/a><br\/><span class="src">([^<]*)<\/span>/);
      const p = rows.find(r => esc(r.provider) === provider && esc(r.plan) === name);
      assert.ok(p, `${provider} ${name} not in data.csv`);
      if (p.billing_note) assert.ok(tr.includes(`<span class="src note">${esc(p.billing_note)}</span>`), `${provider} ${name} billing note missing`);
    }
  });
});
