import { getPlans } from "../lib/plans";
import PlanTable from "./PlanTable";
import NewsletterForm from "./NewsletterForm";
export default function Home() {
  const plans = getPlans();
  return (<>
    <h1>Where to run your AI agent, 24/7</h1>
    <p className="sub">{plans.length} VPS and managed agent-hosting plans for OpenClaw, Hermes and Claude Code. Every price links to its source with a check date.</p>
    <PlanTable plans={plans} />
    <NewsletterForm />
  </>);
}
