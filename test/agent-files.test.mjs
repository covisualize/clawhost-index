import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import Papa from "papaparse";
import { onRequest } from "../functions/_middleware.js";
import { markdownAssetPath, notFoundMarkdown, prefersMarkdown } from "../functions/markdown.js";
import { providerJsonLd, siteJsonLd } from "../lib/jsonld.js";
import { llmsFullTxt, llmsTxt } from "../lib/llms.js";
import { markdownPages, pageMarkdown } from "../lib/page-markdown.js";
import { CSV_COLUMNS, getPlans, OPEN_DATA_COLUMNS, plansCsv, plansJson } from "../lib/plans.js";
import { pageMeta, SITE_KEYWORDS, SITE_URL } from "../lib/site.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const plans = getPlans();

describe("/plans.json", () => {
  it("has the same columns and row count as /plans.csv, with null for missing renewals", () => {
    assert.deepEqual(OPEN_DATA_COLUMNS.map(([name]) => name), CSV_COLUMNS);
    const json = JSON.parse(plansJson());
    const csv = Papa.parse(plansCsv(), { header: true, skipEmptyLines: true }).data;
    assert.equal(json.length, csv.length);
    assert.equal(json.length, plans.length);
    for (const [i, row] of json.entries()) {
      assert.deepEqual(Object.keys(row), CSV_COLUMNS);
      assert.equal(row.provider, csv[i].provider);
      assert.equal(row.plan, csv[i].plan);
      assert.equal(row.source_url, csv[i].source_url);
      assert.equal(row.checked_date, csv[i].checked_date);
      assert.equal(row.price_gbp.toFixed(2), csv[i].price_gbp);
      if (csv[i].price_renewal_gbp === "") {
        assert.equal(row.price_renewal_original, null);
        assert.equal(row.price_renewal_gbp, null);
      } else {
        assert.equal(row.price_renewal_gbp.toFixed(2), csv[i].price_renewal_gbp);
      }
    }
  });
});

describe("/llms.txt and /llms-full.txt", () => {
  it("tells agents when to use the site and points at the data files", () => {
    const txt = llmsTxt();
    assert.match(txt, /^# ClawHost Index/m);
    assert.match(txt, /## When to use ClawHost Index/);
    assert.match(txt, /\/plans\.csv/);
    assert.match(txt, /\/plans\.json/);
    assert.match(txt, /\/llms-full\.txt/);
    assert.match(txt, /CC BY 4\.0/);
    assert.match(txt, /affiliate/i);
    assert.match(txt, /once a week/);
    assert.match(txt, /Side Hustle CEO agent/);
    assert.doesNotMatch(txt, /grok ?bot/i);
    assert.doesNotMatch(txt, /I'm no developer/i);
    assert.match(read("app/llms.txt/route.js"), /export const dynamic = "force-static"/);
    assert.match(read("app/llms-full.txt/route.js"), /export const dynamic = "force-static"/);
  });

  it("lists every plan from data.csv so prices cannot drift", () => {
    const full = llmsFullTxt();
    for (const p of plans) {
      assert.match(full, new RegExp(`### ${p.plan.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
      assert.match(full, new RegExp(`£${p.gbp.toFixed(2)}`));
      assert.ok(full.includes(p.source_url), p.source_url);
    }
    assert.doesNotMatch(full, /grok ?bot/i);
    assert.doesNotMatch(full, /kqzyfj\.com|awin1\.com/);
  });
});

describe("JSON-LD", () => {
  it("describes a WebSite, Organization and Dataset without personal contact fields", () => {
    const data = siteJsonLd(plans);
    const types = data["@graph"].map(n => n["@type"]);
    assert.ok(types.includes("WebSite"));
    assert.ok(types.includes("Organization"));
    assert.ok(types.includes("Dataset"));
    const blob = JSON.stringify(data);
    assert.doesNotMatch(blob, /telephone|email|PostalAddress|streetAddress|postalCode|contactPoint/i);

    const org = data["@graph"].find(n => n["@type"] === "Organization");
    assert.equal(typeof org.description, "string");
    assert.ok(org.description.trim().length > 0);
    assert.match(org.description, /VPS/i);
    assert.match(org.description, /hosting/i);
    assert.match(org.description, /OpenClaw/);
    const logoUrl = typeof org.logo === "string" ? org.logo : org.logo?.url;
    assert.equal(logoUrl, `${SITE_URL}/og.png`);
    assert.ok(Array.isArray(org.sameAs) && org.sameAs.includes("https://github.com/covisualize/clawhost-index"));

    const website = data["@graph"].find(n => n["@type"] === "WebSite");
    const dataset = data["@graph"].find(n => n["@type"] === "Dataset");
    assert.ok(dataset.distribution.some(d => d.contentUrl.endsWith("/plans.csv")));
    assert.ok(dataset.distribution.some(d => d.contentUrl.endsWith("/plans.json")));
    assert.equal(dataset.license, "https://creativecommons.org/licenses/by/4.0/");

    const termLists = [org.knowsAbout, website.keywords, dataset.keywords];
    for (const terms of termLists) {
      assert.ok(Array.isArray(terms) && terms.length > 0);
      assert.ok(terms.includes("VPS prices"));
      assert.ok(terms.includes("OpenClaw"));
      assert.ok(terms.includes("Hermes"));
      assert.ok(terms.includes("Claude Code"));
      assert.ok(!terms.includes("VPS"), "must not include bare 'VPS'");
      assert.ok(!terms.includes("AI agents"), "must not include bare 'AI agents'");
    }
  });

  it("uses a brand-discoverable homepage title and keywords without polluting other pages", () => {
    const expectedTitle = "ClawHost Index: VPS prices for AI agents like OpenClaw, Hermes and Claude Code";
    const page = read("app/page.js");
    assert.ok(page.includes(`title: "${expectedTitle}"`));
    assert.match(page, /absoluteTitle:\s*true/);
    assert.match(page, /path:\s*"\/"/);
    assert.match(page, /keywords:\s*SITE_KEYWORDS/);
    assert.ok(pageMarkdown("/").startsWith(`# ${expectedTitle}\n`));

    const homeMeta = pageMeta({ title: expectedTitle, description: "desc", path: "/", absoluteTitle: true, keywords: SITE_KEYWORDS });
    assert.deepEqual(homeMeta.keywords, SITE_KEYWORDS);
    const otherMeta = pageMeta({ title: "Other", description: "desc", path: "/other/" });
    assert.equal("keywords" in otherMeta, false);
  });

  it("lists provider plans as Offers and keeps Visit links on the HTML page sponsored", () => {
    const hetzner = plans.filter(p => p.providerSlug === "hetzner");
    const data = providerJsonLd(hetzner, "hetzner");
    assert.equal(data["@type"], "ItemList");
    assert.equal(data.numberOfItems, hetzner.length);
    assert.equal(data.itemListElement[0].item["@type"], "Offer");
    assert.equal(data.itemListElement[0].item.url, hetzner[0].source_url);
    assert.match(read("app/provider/[slug]/page.js"), /rel="sponsored nofollow noopener"/);
    assert.match(read("app/PlanTable.js"), /rel="sponsored nofollow noopener"/);
  });
});

describe("robots.txt", () => {
  it("allows all crawlers and names the major AI bots", () => {
    const src = read("app/robots.js");
    assert.match(src, /userAgent: "\*"/);
    assert.match(src, /AI_CRAWLERS = \["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"\]/);
    assert.match(src, /allow: "\/"/);
    assert.match(src, /sitemap: `\$\{SITE_URL\}\/sitemap\.xml`/);
  });
});

describe("markdown pages", () => {
  it("covers the homepage, key pages and every sitemap provider", () => {
    const home = pageMarkdown("/");
    assert.match(home, /^# ClawHost Index/);
    assert.match(home, /We earn commissions/);
    assert.match(home, /Hostinger/);
    assert.match(pageMarkdown("/data/"), /plans\.json/);
    assert.match(pageMarkdown("/disclosure/"), /Side Hustle CEO agent/);
    const paths = markdownPages();
    assert.ok(paths.includes("/"));
    assert.ok(paths.includes("/data/"));
    for (const slug of new Set(plans.map(p => p.providerSlug))) {
      assert.ok(paths.includes(`/provider/${slug}/`), slug);
      const name = plans.find(p => p.providerSlug === slug).provider;
      assert.ok(pageMarkdown(`/provider/${slug}/`).startsWith(`# ${name}\n`), slug);
    }
    assert.equal(pageMarkdown("/no-such-page"), null);
  });
});

describe("markdown content negotiation", () => {
  it("prefers markdown only when Accept ranks it above HTML", () => {
    assert.equal(prefersMarkdown("text/markdown"), true);
    assert.equal(prefersMarkdown("text/markdown, */*"), true);
    assert.equal(prefersMarkdown("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"), false);
    assert.equal(prefersMarkdown("text/html, text/markdown;q=0.5"), false);
    assert.equal(prefersMarkdown("text/markdown;q=0"), false);
    assert.equal(prefersMarkdown(null), false);
    assert.equal(markdownAssetPath("/"), "/index.md");
    assert.equal(markdownAssetPath("/data/"), "/data/index.md");
    assert.equal(markdownAssetPath("/plans.csv"), null);
  });

  it("returns markdown 200 for a known page and 404 markdown for unknown paths", async () => {
    const files = { "/index.md": "# Home\n\nPlans.\n" };
    const env = {
      ASSETS: {
        fetch: async (req) => {
          const path = new URL(req.url).pathname;
          if (files[path]) return new Response(files[path], { status: 200, headers: { "content-type": "text/markdown" } });
          return new Response("<!DOCTYPE html><html>404</html>", { status: 404, headers: { "content-type": "text/html" } });
        },
      },
    };
    const next = async () => new Response("<html>home</html>", { headers: { "content-type": "text/html" } });
    const md = await onRequest({
      request: new Request("https://clawhostindex.com/", { headers: { Accept: "text/markdown" } }),
      env, next,
    });
    assert.equal(md.status, 200);
    assert.equal(md.headers.get("Content-Type"), "text/markdown; charset=utf-8");
    assert.equal(md.headers.get("Vary"), "Accept");
    assert.match(await md.text(), /# Home/);

    const html = await onRequest({
      request: new Request("https://clawhostindex.com/", { headers: { Accept: "text/html" } }),
      env, next,
    });
    assert.equal(html.status, 200);
    assert.match(await html.text(), /<html>home<\/html>/);

    const missing = await onRequest({
      request: new Request("https://clawhostindex.com/__ora-404-probe", { headers: { Accept: "text/markdown" } }),
      env, next,
    });
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get("Content-Type"), "text/markdown; charset=utf-8");
    assert.equal(missing.headers.get("Vary"), "Accept");
    const body = await missing.text();
    assert.ok(body.length >= 20);
    assert.match(body, /\/llms\.txt/);
    assert.match(body, /\/sitemap\.xml/);
    assert.match(body, /\/plans\.csv/);
    assert.match(body, /\/plans\.json/);
    assert.equal(body, notFoundMarkdown());
  });
});

describe("exported agent files", () => {
  const ready = existsSync(new URL("../out/plans.json", import.meta.url));

  it("writes llms.txt, llms-full.txt, plans.json, robots.txt and page markdown", { skip: !ready }, () => {
    assert.equal(read("out/plans.json"), plansJson());
    assert.equal(read("out/llms.txt"), llmsTxt());
    assert.equal(read("out/llms-full.txt"), llmsFullTxt());
    assert.equal(read("out/index.md"), pageMarkdown("/"));
    assert.equal(read("out/data/index.md"), pageMarkdown("/data/"));
    const robotsTxt = read("out/robots.txt");
    assert.match(robotsTxt, /User-Agent: \*/);
    assert.match(robotsTxt, /Allow: \//);
    assert.match(robotsTxt, /User-Agent: GPTBot/);
    assert.match(robotsTxt, /User-Agent: OAI-SearchBot/);
    assert.match(robotsTxt, /User-Agent: ClaudeBot/);
    assert.match(robotsTxt, /User-Agent: PerplexityBot/);
    assert.match(robotsTxt, /User-Agent: Google-Extended/);
    assert.match(robotsTxt, /Sitemap: https:\/\/clawhostindex\.com\/sitemap\.xml/);
    const home = read("out/index.html");
    assert.match(home, /application\/ld\+json/);
    assert.match(home, /"@type":"WebSite"/);
    assert.match(home, /"@type":"Organization"/);
    assert.match(home, /"@type":"Dataset"/);
    assert.match(home, /https:\/\/clawhostindex\.com\/og\.png/);
    assert.match(home, /https:\/\/github\.com\/covisualize\/clawhost-index/);
    assert.doesNotMatch(home, /PostalAddress|contactPoint/);
    assert.match(home, /<title>ClawHost Index: VPS prices for AI agents like OpenClaw, Hermes and Claude Code<\/title>/);
    assert.match(home, /<meta name="keywords"/);
    const data = read("out/data/index.html");
    assert.match(data, /"@type":"Dataset"/);
    const provider = read("out/provider/hetzner/index.html");
    assert.match(provider, /"@type":"ItemList"/);
    assert.match(read("out/provider/digitalocean/index.html"), /rel="sponsored nofollow noopener"/);
  });
});
