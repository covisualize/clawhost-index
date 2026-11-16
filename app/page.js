import { getPlans, latestChecked, FX } from "../lib/plans";
import { pageMeta, fmtDate } from "../lib/site";
import AffiliateNote from "./AffiliateNote";
import PlanTable from "./PlanTable";
import SignupBar from "./SignupBar";

export const metadata = pageMeta({
  absoluteTitle: true,
  title: "ClawHost Index: VPS prices for running OpenClaw, Hermes and Claude Code",
  description: `Compare ${getPlans().length} VPS and managed hosting plans for AI agents like OpenClaw, Hermes and Claude Code. Every price links to the provider's own page with the date it was checked.`,
  path: "/",
});

export default function Home() {
  const plans = getPlans();
  return (<>
    <AffiliateNote />
    <h1>Host prices for OpenClaw, Hermes and Claude Code, checked this week.</h1>
    <p className="checked-on">Last checked {fmtDate(latestChecked(plans))}</p>
    <p className="sub intro">{plans.length} plans, cheapest first. If a plan has been replaced or is no longer for sale, the row says so.</p>
    <p className="hero-cta"><a className="btn" href="#plans">See the live list</a></p>
    <p className="src hero-how">Each price is taken from the provider's own page, with the date it was checked. I review what my Side Hustle CEO agent finds.</p>
    <SignupBar variant="full" />
    <section id="plans" aria-label="Plans">
      <PlanTable plans={plans} fxDate={fmtDate(FX.date)} />
    </section>
    <div className="box signup-end">
      <b>Spotted a wrong price or a missing host?</b> Reply to any issue of the newsletter and tell me. <a href="#signup">Get the weekly email</a> or read the <a href="/newsletter/">latest issue</a>. The full list is also <a href="/data/">open data</a>.
    </div>
  </>);
}
