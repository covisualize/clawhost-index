import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const AWIN_DROPLET =
  "https://www.awin1.com/cread.php?awinmid=123996&awinaffid=3142395&ued=https%3A%2F%2Fwww.digitalocean.com%2Fpricing%2Fdroplets";
const INTERSERVER = "https://www.interserver.net/r/1211008";
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("DigitalOcean Awin affiliate links", () => {
  it("uses the droplet-pricing Awin URL on DigitalOcean Visit links only", () => {
    const lines = read("data.csv").trim().split(/\r?\n/).slice(1);
    const digitalocean = lines.filter((line) => line.startsWith("DigitalOcean,"));
    assert.equal(digitalocean.length, 2);
    for (const line of digitalocean) {
      assert.ok(line.includes(AWIN_DROPLET), `missing Awin URL: ${line}`);
    }
    assert.equal(lines.filter((line) => line.includes("awin1.com")).length, 2);
    assert.ok(lines.some((line) => line.startsWith("InterServer,") && line.includes(INTERSERVER)));
    for (const line of lines.filter((l) => !l.startsWith("DigitalOcean,") && !l.startsWith("InterServer,"))) {
      assert.equal(line.endsWith(","), true, `${line.split(",")[0]} should not gain an affiliate URL`);
    }
  });

  it("names DigitalOcean via Awin on the disclosure page", () => {
    const page = read("app/disclosure/page.js");
    assert.match(page, /DigitalOcean's affiliate programme \(via Awin\)/);
    assert.match(page, /InterServer's affiliate programme/);
    assert.doesNotMatch(page, /Obah/);
  });
});

describe("exported DigitalOcean affiliate HTML", () => {
  const home = new URL("../out/index.html", import.meta.url);
  const digitalocean = new URL("../out/provider/digitalocean/index.html", import.meta.url);
  const ready = existsSync(home) && existsSync(digitalocean);

  it("points DigitalOcean Visit links at awin1.com with sponsored nofollow", { skip: !ready }, () => {
    for (const file of ["out/index.html", "out/provider/digitalocean/index.html"]) {
      const html = read(file);
      assert.match(html, /href="https:\/\/www\.awin1\.com\/cread\.php\?awinmid=123996&amp;awinaffid=3142395&amp;ued=https%3A%2F%2Fwww\.digitalocean\.com%2Fpricing%2Fdroplets"/);
      assert.match(html, /rel="sponsored nofollow noopener"/);
      assert.match(html, /We earn commissions when you shop through some links on this page/);
      // Price-source citations stay on the provider page, same as InterServer.
      assert.match(html, /href="https:\/\/www\.digitalocean\.com\/pricing\/droplets"/);
    }
  });
});
