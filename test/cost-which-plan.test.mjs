import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import Papa from "papaparse";

const ANTHROPIC = "https://platform.claude.com/docs/en/about-claude/pricing";
const OPENAI = "https://developers.openai.com/api/docs/pricing";
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const amp = (s) => s.replaceAll("&", "&amp;");
// React separates adjacent text with <!-- --> in static HTML.
const exported = (url) => readFileSync(url, "utf8").replaceAll("<!-- -->", "");
const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("'", "&#x27;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const freePlans = Papa.parse(read("data.csv"), { header: true, skipEmptyLines: true }).data.filter(p => p.type === "free");

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
});
