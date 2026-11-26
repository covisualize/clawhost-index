import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { markdownPages, pageMarkdown } from "../lib/page-markdown.js";

const out = join(process.cwd(), "out");

const ROUTES = {
  version: 1,
  include: ["/*"],
  exclude: ["/_next/*", "/og.png"],
};

for (const path of markdownPages()) {
  const md = pageMarkdown(path);
  if (!md) throw new Error(`write-page-markdown: no markdown for ${path}`);
  const file = path === "/" ? join(out, "index.md") : join(out, path.replace(/^\/+/, ""), "index.md");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, md);
}

writeFileSync(join(out, "_routes.json"), JSON.stringify(ROUTES, null, 2) + "\n");
