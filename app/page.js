import { getPlans, FX } from "../lib/plans";
import { pageMeta, fmtDate } from "../lib/site";
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
    <h1>Where to run your AI agent, 24/7</h1>
    <p className="sub intro">{plans.length} plans for OpenClaw, Hermes and Claude Code, cheapest first. My Grok Bot finds the hosts and checks each price on the provider's own page. I review what it finds.</p>
    <SignupBar variant="full" />
    <PlanTable plans={plans} fxDate={fmtDate(FX.date)} />
    <div className="box signup-end">
      <b>Spotted a wrong price or a missing host?</b> Reply to any issue of the newsletter and tell me. <a href="#signup">Get the weekly email</a> or read the <a href="/newsletter/">latest issue</a>.
    </div>
  </>);
}
