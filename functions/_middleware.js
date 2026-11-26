import { isMarkdownAsset, markdownAssetPath, markdownHeaders, notFoundMarkdown, prefersMarkdown } from "./markdown.js";

/**
 * Cloudflare Pages Function: honour Accept: text/markdown on the static export.
 * Pre-built siblings live next to each page ( / → /index.md ). Unknown paths
 * return HTTP 404 with a short Markdown body. HTML for browsers is unchanged.
 */
export async function onRequest(context) {
  const { request, next, env } = context;
  const method = request.method;
  if (method !== "GET" && method !== "HEAD") return next();
  if (!prefersMarkdown(request.headers.get("Accept"))) return next();

  const url = new URL(request.url);
  const assetPath = markdownAssetPath(url.pathname);
  if (!assetPath) return next();

  const headers = markdownHeaders();
  if (env?.ASSETS?.fetch) {
    const asset = await env.ASSETS.fetch(new Request(new URL(assetPath, url.origin), { method: "GET" }));
    const body = await asset.text();
    if (isMarkdownAsset(asset, body)) {
      return new Response(method === "HEAD" ? null : body, { status: 200, headers });
    }
  }

  return new Response(method === "HEAD" ? null : notFoundMarkdown(), { status: 404, headers });
}
