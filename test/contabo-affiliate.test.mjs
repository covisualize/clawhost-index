import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import Papa from "papaparse";

const CONTABO_VPS = "https://www.kqzyfj.com/click-101910290-17165311";
const CONTABO_HOME = "https://www.jdoqocy.com/click-101910290-17207185";
const CONTABO_SOURCE = "https://contabo.com/en/vps/";
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("Contabo CJ affiliate links", () => {
  it("uses the VPS-plans CJ URL on both Contabo rows only", () => {
    const rows = Papa.parse(read("data.csv"), { header: true, skipEmptyLines: true }).data;
    const contabo = rows.filter((r) => r.provider === "Contabo");
    assert.deepEqual(contabo.map((r) => r.plan), ["Cloud VPS 4", "Cloud VPS 6"]);
    for (const r of contabo) {
      assert.equal(r.affiliate_url, CONTABO_VPS, `${r.plan} should use the Contabo CJ URL`);
      // Price and renewal citations stay on Contabo's own page.
      assert.equal(r.source_url, CONTABO_SOURCE);
      assert.equal(r.renewal_source_url, CONTABO_SOURCE);
    }
    for (const r of rows.filter((r) => r.provider !== "Contabo")) {
      for (const value of Object.values(r)) {
        assert.doesNotMatch(value, /kqzyfj\.com|jdoqocy\.com|101910290/, `${r.provider} should not gain a Contabo CJ URL`);
      }
    }
  });

  it("keeps the CJ tracking domains to the Contabo rows", () => {
    const lines = read("data.csv").trim().split(/\r?\n/).slice(1);
    const tracked = lines.filter((line) => /kqzyfj\.com|jdoqocy\.com/.test(line));
    assert.equal(tracked.length, 2);
    for (const line of tracked) {
      assert.ok(line.startsWith("Contabo,"), `unexpected CJ URL: ${line}`);
      assert.equal(line.split(CONTABO_VPS).length, 2, `CJ URL should appear once: ${line}`);
      assert.ok(!line.includes(CONTABO_HOME), `homepage URL should not be on a plan row: ${line}`);
    }
    for (const file of ["lib/plans.js", "app/PlanTable.js", "app/provider/[slug]/page.js", "app/sitemap.js"]) {
      assert.doesNotMatch(read(file), /kqzyfj\.com|jdoqocy\.com/, `${file} should not hard-code a CJ URL`);
    }
  });

  it("names Contabo via CJ on the disclosure page", () => {
    const page = read("app/disclosure/page.js");
    assert.match(page, /Contabo's affiliate programme \(via CJ, Commission Junction\)/);
    assert.match(page, /DigitalOcean's affiliate programme \(via Awin\)/);
    assert.match(page, /InterServer's affiliate programme/);
  });
});

describe("exported Contabo affiliate HTML", () => {
  const home = new URL("../out/index.html", import.meta.url);
  const contabo = new URL("../out/provider/contabo/index.html", import.meta.url);
  const ready = existsSync(home) && existsSync(contabo);
  const files = ["out/index.html", "out/provider/contabo/index.html"];

  it("points Contabo Visit links at the CJ URL with sponsored nofollow", { skip: !ready }, () => {
    for (const file of files) {
      const html = read(file);
      assert.match(html, /<a href="https:\/\/www\.kqzyfj\.com\/click-101910290-17165311" rel="sponsored nofollow noopener" target="_blank"[^>]*>Visit<\/a>/);
      assert.match(html, /We earn commissions when you shop through some links on this page/);
      // Price-source citations stay on Contabo's own page.
      assert.match(html, /href="https:\/\/contabo\.com\/en\/vps\/"/);
    }
  });

  it("sends Contabo affiliate links only to the two CJ URLs", { skip: !ready }, () => {
    const allowed = [CONTABO_VPS, CONTABO_HOME];
    for (const file of files) {
      const html = read(file);
      const anchors = html.match(/<a [^>]*>/g) ?? [];
      const hrefOf = (a) => (a.match(/href="([^"]*)"/) ?? [])[1]?.replace(/&amp;/g, "&");
      const cj = anchors.filter((a) => /kqzyfj\.com|jdoqocy\.com/.test(a));
      assert.equal(cj.length, 2, `${file} should have two Contabo Visit links`);
      for (const a of cj) {
        assert.ok(allowed.includes(hrefOf(a)), `${file}: unexpected CJ href ${hrefOf(a)}`);
        assert.match(a, /rel="sponsored nofollow noopener"/);
      }
      // Any outbound Contabo anchor (Visit or contabo.com) is either an allowed CJ link or the Source citation.
      const outbound = anchors.filter((a) => /^https?:/.test(hrefOf(a) ?? ""));
      for (const a of outbound.filter((a) => /contabo/i.test(a))) {
        const href = hrefOf(a);
        assert.ok(allowed.includes(href) || href === CONTABO_SOURCE, `${file}: unexpected Contabo href ${href}`);
        if (href === CONTABO_SOURCE) assert.doesNotMatch(a, /sponsored/, `${file}: Source citation must not be sponsored`);
      }
    }
  });
});
