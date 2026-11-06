import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const FORM_ID = "5596c3fb-7d3f-49e8-bcbb-91c62f2d95a1";
const SUBSCRIBE = "https://charles-newsletter-3ab0b4.beehiiv.com/subscribe";
const LOADER = "https://subscribe-forms.beehiiv.com/v3/loader.js";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("beehiiv signup tidy-up", () => {
  it("keeps the public embed and subscribe URL, with no API-key form", () => {
    const site = read("lib/site.js");
    const form = read("app/NewsletterForm.js");
    const bar = read("app/SignupBar.js");
    assert.match(site, new RegExp(`BEEHIIV_FORM_ID = "${FORM_ID}"`));
    assert.match(site, new RegExp(SUBSCRIBE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(form, new RegExp(LOADER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(form, /data-beehiiv-form/);
    assert.match(bar, /Subscribe on beehiiv/);
    assert.doesNotMatch(form, /api\.beehiiv|BEEHIIV_API|x-api-key|x-user-key|stripe/i);
    assert.doesNotMatch(bar, /api\.beehiiv|BEEHIIV_API|x-api-key|stripe/i);
  });

  it("does not repeat the newsletter heading on /newsletter", () => {
    const page = read("app/newsletter/page.js");
    assert.match(page, /showCopy=\{false\}/);
    assert.match(page, /<h1>ClawHost Index Weekly<\/h1>/);
  });

  it("gives the embed full width and a mobile public-signup path", () => {
    const css = read("app/globals.css");
    assert.match(css, /\.signup-form iframe\{[^}]*max-width:560px !important/);
    assert.match(css, /\.signup-cta\{display:none\}/);
    assert.match(css, /\.signup-form \.bh-embed\{display:none/);
    assert.doesNotMatch(css, /minmax\(0,460px\)/);
    assert.doesNotMatch(css, /\.bh-embed\{[^}]*overflow:hidden/);
  });
});

describe("exported signup HTML", () => {
  const home = new URL("../out/index.html", import.meta.url);
  const news = new URL("../out/newsletter/index.html", import.meta.url);
  const ready = existsSync(home) && existsSync(news);

  it("home keeps one heading, the embed snippet, and a beehiiv fallback", { skip: !ready }, () => {
    const html = readFileSync(home, "utf8");
    const section = html.match(/<section class="signup" id="signup"[\s\S]*?<\/section>/)[0];
    assert.equal((section.match(/Get the price changes by email/g) || []).length, 1);
    assert.match(section, new RegExp(`data-beehiiv-form="${FORM_ID}"`));
    assert.match(section, new RegExp(SUBSCRIBE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(section, /signup-cta/);
    assert.doesNotMatch(section, /x-api-key|stripe/i);
  });

  it("newsletter bar omits the extra heading and still has a subscribe path", { skip: !ready }, () => {
    const html = readFileSync(news, "utf8");
    const section = html.match(/<section class="signup signup-compact" id="signup"[\s\S]*?<\/section>/)[0];
    assert.doesNotMatch(section, /Get the price changes by email/);
    assert.match(html, /<h1>ClawHost Index Weekly<\/h1>/);
    assert.match(section, new RegExp(`data-beehiiv-form="${FORM_ID}"`));
    assert.match(section, new RegExp(SUBSCRIBE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});
