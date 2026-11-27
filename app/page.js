import { getPlans, latestChecked, FX } from "../lib/plans";
import { pageMeta, fmtDate, SITE_KEYWORDS } from "../lib/site";
import { siteJsonLd } from "../lib/jsonld";
import AffiliateNote from "./AffiliateNote";
import JsonLd from "./JsonLd";
import PlanTable from "./PlanTable";
import SignupBar from "./SignupBar";

export const metadata = pageMeta({
  absoluteTitle: true,
  title: "ClawHost Index: VPS prices for AI agents like OpenClaw, Hermes and Claude Code",
  description: `Compare ${getPlans().length} VPS and managed hosting plans for AI agents like OpenClaw, Hermes and Claude Code. Every price links to the provider's own page with the date it was checked.`,
  path: "/",
  keywords: SITE_KEYWORDS,
});

export default function Home() {
  const plans = getPlans();
  return (<>
    <JsonLd data={siteJsonLd(plans)} />
    <AffiliateNote />
    <h1>Host prices for OpenClaw, Hermes and Claude Code, checked this week.</h1>
    <p className="checked-on">Last checked {fmtDate(latestChecked(plans))}</p>
    <p className="lede">{plans.length} plans, cheapest first. Each price links to the provider's own page.</p>
    <p><a className="btn" href="#plans">See the live list</a></p>
    <section id="plans" aria-label="Plans">
      <PlanTable plans={plans} fxDate={fmtDate(FX.date)} />
    </section>
    <SignupBar variant="full" />
  </>);
}
