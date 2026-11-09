import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const TEXT =
  "We earn commissions when you shop through some links on this page. It costs you nothing extra and doesn't change the order or the prices.";
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const inHtml = (html) =>
  html.includes(TEXT) || html.includes(TEXT.replaceAll("'", "&#x27;"));

describe("affiliate disclosure note", () => {
  it("uses the exact wording in a shared component on home and provider pages", () => {
    const note = read("app/AffiliateNote.js");
    assert.match(note, new RegExp(TEXT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(note, /href="\/disclosure\/"/);
    assert.match(read("app/page.js"), /AffiliateNote/);
    assert.match(read("app/provider/[slug]/page.js"), /AffiliateNote/);
    assert.doesNotMatch(read("app/layout.js"), /We earn commissions when you shop/);
    assert.doesNotMatch(read("app/disclosure/page.js"), /We earn commissions when you shop/);
  });
});

describe("exported affiliate-note HTML", () => {
  const home = new URL("../out/index.html", import.meta.url);
  const digitalocean = new URL("../out/provider/digitalocean/index.html", import.meta.url);
  const interserver = new URL("../out/provider/interserver/index.html", import.meta.url);
  const ready = existsSync(home) && existsSync(digitalocean) && existsSync(interserver);

  it("puts the note near the top, above the plans table", { skip: !ready }, () => {
    for (const file of ["out/index.html", "out/provider/digitalocean/index.html", "out/provider/interserver/index.html"]) {
      const html = read(file);
      const iNote = html.search(/We earn commissions when you shop through some links on this page/);
      const iTable = html.search(/class="plans/);
      assert.ok(iNote > 0, `${file} missing disclosure`);
      assert.ok(inHtml(html), `${file} wording mismatch`);
      assert.ok(iTable > iNote, `${file} disclosure should be above the table`);
    }
  });
});
