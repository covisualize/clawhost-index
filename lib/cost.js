// Server-price maths for the /cost/ calculator. No other imports, so the tests can load it directly.
import { supports } from "./agents.js";

// What a plan costs a month in GBP at the user's USD → GBP rate. GBP plans are as listed,
// USD plans use the edited rate, EUR plans keep the site's ECB EUR → GBP conversion (plan.gbp),
// because the calculator only asks for a USD rate.
export const serverGbp = (plan, usdGbp) =>
  plan.currency === "GBP" ? plan.price : plan.currency === "USD" ? plan.price * usdGbp : plan.gbp;

// The renewal price on the same terms as serverGbp, or null when the provider doesn't state one.
export const renewalServerGbp = (plan, usdGbp) => plan.renewal == null ? null
  : serverGbp({ currency: plan.currency, price: plan.renewal, gbp: plan.renewalGbp }, usdGbp);

// Plans table "Sort by: Renewal price": cheapest renewal first, plans whose renewal price isn't
// stated go last, ties fall back to the current price.
export const byRenewal = (a, b) =>
  (a.renewalGbp === null) - (b.renewalGbp === null) || (a.renewalGbp ?? 0) - (b.renewalGbp ?? 0) || a.gbp - b.gbp;

// Cheapest first at that rate. Ties keep data.csv order.
export const sortPlans = (plans, usdGbp) =>
  [...plans].sort((a, b) => serverGbp(a, usdGbp) - serverGbp(b, usdGbp) || a.id - b.id);

// Cheapest paid plan that meets the agent's minimum RAM and lists the agent. A £0 free tier would
// make the server look free, so free tiers stay selectable but are only picked if nothing else fits.
export function defaultPlan(plans, agent, usdGbp) {
  const sorted = sortPlans(plans, usdGbp);
  const fits = (p) => p.ram_gb >= agent.minRamGb && supports(p, agent);
  return sorted.find(p => p.type !== "free" && fits(p)) || sorted.find(fits) || sorted[0];
}
