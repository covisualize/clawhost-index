import AffiliateNote from "../AffiliateNote";
import SignupBar from "../SignupBar";
import { getPlans } from "../../lib/plans";
import { getIssues } from "../../lib/issues";
import { pageMeta } from "../../lib/site";

export const metadata = pageMeta({
  title: "ClawHost Index Weekly: VPS price changes for AI agents, by email",
  description: `One email a week on what changed across ${getPlans().length} VPS and agent-hosting plans, checked against the providers' own pages. Free. Read the latest issue and the archive.`,
  path: "/newsletter/",
});

export default function Newsletter() {
  const n = getPlans().length, issues = getIssues(), latest = issues[0];
  return (<div className="prose">
    <AffiliateNote />
    <h1>ClawHost Index Weekly</h1>
    <p className="lede">One email a week on what changed across {n} VPS and agent-hosting plans, checked against the providers' own pages. Free, and you can unsubscribe any time.</p>
    <SignupBar variant="compact" showCopy={false} />
    {latest && <div className="box latest">
      <p className="src">Latest issue · Issue #{latest.n} · {latest.dateLabel}</p>
      <h2><a href={latest.href}>{latest.title}</a></h2>
      <p>{latest.preview}</p>
      <a className="btn" href={latest.href}>Read issue #{latest.n}</a>
    </div>}
    <h2>Past issues</h2>
    <ul className="issues">
      {issues.map(i => <li key={i.n}><a href={i.href}><b>Issue #{i.n}</b>: {i.title}</a> <span className="src">{i.dateLabel}</span></li>)}
    </ul>
    <p className="next">Also free to read: <a href="/gotchas/">7 hosting gotchas for running AI agents on a VPS</a>.</p>
  </div>);
}
