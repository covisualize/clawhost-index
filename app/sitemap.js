import { getPlans } from "../lib/plans";
import { getIssues } from "../lib/issues";
import { SITE_URL } from "../lib/site";

export const dynamic = "force-static";

export default function sitemap() {
  const plans = getPlans();
  const checked = plans.map(p => p.source_checked.length === 7 ? p.source_checked + "-01" : p.source_checked).sort().pop();
  const issues = getIssues();
  const u = (path, lastModified, priority) => ({ url: `${SITE_URL}${path}`, lastModified, priority });
  return [
    u("/", checked, 1),
    u("/gotchas/", checked, 0.8),
    u("/newsletter/", issues[0]?.date || checked, 0.8),
    ...issues.map(i => u(i.href, i.date, 0.5)),
    u("/calculator/", checked, 0.6),
    u("/disclosure/", checked, 0.3),
    ...[...new Set(plans.map(p => p.providerSlug))].map(s => u(`/provider/${s}/`, checked, 0.6)),
  ];
}
