import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("/security/ checklist page", () => {
  it("exists, shows the affiliate note and has no Grok Bot credit", () => {
    assert.ok(existsSync(new URL("../app/security/page.js", import.meta.url)));
    const page = read("app/security/page.js");
    assert.match(page, /import AffiliateNote from "\.\.\/AffiliateNote"/);
    assert.match(page, /<AffiliateNote \/>/);
    assert.match(page, /Last checked 17 Nov 2026/);
    assert.doesNotMatch(page, /grok ?bot/i);
  });

  it("is in the sitemap and the footer", () => {
    assert.match(read("app/sitemap.js"), /u\("\/security\/"/);
    assert.match(read("app/layout.js"), /<footer>[\s\S]*href="\/security\/"[\s\S]*<\/footer>/);
  });
});
