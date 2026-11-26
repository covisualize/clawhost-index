import { SITE_NAME, SITE_URL } from "./site.js";
import { latestChecked } from "./plans.js";

const PUBLISHER_ID = `${SITE_URL}/#publisher`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const DATASET_ID = `${SITE_URL}/#dataset`;

const ORG = {
  "@type": "Organization",
  "@id": PUBLISHER_ID,
  name: SITE_NAME,
  url: SITE_URL,
  founder: { "@type": "Person", name: "Charles" },
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  inLanguage: "en-GB",
  description: "Dated, sourced prices for VPS and managed hosting plans that run AI agents like OpenClaw, Hermes and Claude Code.",
  publisher: { "@id": PUBLISHER_ID },
};

function dataset(plans) {
  return {
    "@type": "Dataset",
    "@id": DATASET_ID,
    name: `${SITE_NAME} hosting plans`,
    description: "Dated, sourced VPS and managed hosting plans for running AI agents, with original-currency prices, GBP conversions, renewal prices where stated, billing notes and the provider page each figure was taken from.",
    url: `${SITE_URL}/data/`,
    license: "https://creativecommons.org/licenses/by/4.0/",
    isAccessibleForFree: true,
    creator: { "@id": PUBLISHER_ID },
    publisher: { "@id": PUBLISHER_ID },
    inLanguage: "en-GB",
    dateModified: latestChecked(plans),
    keywords: ["VPS", "AI agents", "OpenClaw", "Hermes", "Claude Code", "hosting prices"],
    distribution: [
      { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${SITE_URL}/plans.csv`, name: "plans.csv" },
      { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${SITE_URL}/plans.json`, name: "plans.json" },
    ],
  };
}

/** WebSite + Dataset graph for the homepage and /data/. No postal address, phone or email. */
export function siteJsonLd(plans) {
  return { "@context": "https://schema.org", "@graph": [WEBSITE, ORG, dataset(plans)] };
}

const availabilityUrl = (p) => p.availability === "Listed" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

/** ItemList of Offers for a provider page. Prices match the GBP figures on the page. */
export function providerJsonLd(plans, slug) {
  const name = plans[0].provider;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${name} plans on ${SITE_NAME}`,
    description: `Dated, sourced ${name} plans for running AI agents, from ${SITE_NAME}.`,
    url: `${SITE_URL}/provider/${slug}/`,
    numberOfItems: plans.length,
    itemListElement: plans.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Offer",
        name: `${p.provider} ${p.plan}`,
        description: `${p.vcpu} vCPU, ${p.ram_gb} GB RAM, ${p.disk_gb} GB disk.`,
        price: p.gbp.toFixed(2),
        priceCurrency: "GBP",
        url: p.source_url,
        availability: availabilityUrl(p),
      },
    })),
  };
}
