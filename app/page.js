import { getPlans } from "../lib/plans";
import PlanTable from "./PlanTable";
export default function Home() {
  const plans = getPlans();
  return (<>
    <h1>Where to run your AI agent, 24/7</h1>
    <p className="sub">{plans.length} VPS and managed agent-hosting plans for OpenClaw, Hermes and Claude Code. Every price links to its source with a check date.</p>
    <PlanTable plans={plans} />
    <div className="box"><b>Weekly price-change email</b> <span className="sub">(coming soon — signup not connected yet)</span>
      <form style={{marginTop:10}}><input type="email" placeholder="you@example.com" disabled /> <button type="button" disabled>Notify me</button></form></div>
  </>);
}
