const SITE_URL = "https://clawhostindex.com";
const MD_TYPE = "text/markdown; charset=utf-8";

/** True when Accept explicitly prefers text/markdown over HTML. A browser Accept that includes star/star still gets HTML. */
export function prefersMarkdown(accept) {
  if (!accept) return false;
  let md = -1;
  let html = -1;
  for (const part of accept.split(",")) {
    const pieces = part.trim().toLowerCase().split(";").map(s => s.trim());
    const type = pieces[0];
    if (!type) continue;
    const qp = pieces.find(p => p.startsWith("q="));
    const q = qp ? Number(qp.slice(2)) : 1;
    if (!Number.isFinite(q) || q < 0) continue;
    if (type === "text/markdown" || type === "text/x-markdown") md = Math.max(md, q);
    else if (type === "text/html" || type === "application/xhtml+xml" || type === "text/*" || type === "*/*") html = Math.max(html, q);
  }
  return md > 0 && md >= html;
}

/** Static-file path for a page URL: / → /index.md, /data/ → /data/index.md. */
export function markdownAssetPath(pathname) {
  const raw = pathname.split("?")[0].split("#")[0] || "/";
  if (/\.[a-z0-9]+$/i.test(raw) && !raw.endsWith("/")) return null;
  const trimmed = raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw;
  if (trimmed === "" || trimmed === "/") return "/index.md";
  return `${trimmed}/index.md`;
}

export function notFoundMarkdown() {
  return `# Not found

That path is not on ClawHost Index.

Use these instead:

- [llms.txt](${SITE_URL}/llms.txt) — when to use this site, and links for AI agents
- [sitemap.xml](${SITE_URL}/sitemap.xml) — every HTML page
- [plans.csv](${SITE_URL}/plans.csv) — every plan as CSV
- [plans.json](${SITE_URL}/plans.json) — the same data as JSON
`;
}

export function markdownHeaders() {
  return {
    "Content-Type": MD_TYPE,
    Vary: "Accept",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=0, must-revalidate",
  };
}

/** True when an ASSETS response is the pre-built Markdown sibling, not the HTML 404 page. */
export function isMarkdownAsset(res, body) {
  if (!res || !res.ok) return false;
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("text/html")) return false;
  const start = body.trimStart().slice(0, 15).toLowerCase();
  if (start.startsWith("<!doctype") || start.startsWith("<html")) return false;
  return body.trim().length > 0;
}
