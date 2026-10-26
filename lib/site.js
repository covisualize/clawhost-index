export const SITE_URL = "https://clawhostindex.com";
export const SITE_NAME = "ClawHost Index";
export const SUBSCRIBE_URL = "https://charles-newsletter-3ab0b4.beehiiv.com/subscribe";
export const BEEHIIV_FORM_ID = "5596c3fb-7d3f-49e8-bcbb-91c62f2d95a1";

// Per-page metadata: title, description, canonical, Open Graph and Twitter card.
// `path` must start and end with "/" (the site uses trailingSlash).
export function pageMeta({ title, description, path, absoluteTitle = false }) {
  const full = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title: full, description, url: path, siteName: SITE_NAME, type: "website", locale: "en_GB", images: [{ url: "/og.png", width: 1200, height: 630, alt: "ClawHost Index: VPS prices for AI agents" }] },
    twitter: { card: "summary_large_image", title: full, description, images: ["/og.png"] },
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d ? +d + " " : ""}${MONTHS[+m - 1]} ${y}`;
}
