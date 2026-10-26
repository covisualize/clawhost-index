import { notFound } from "next/navigation";
import { getIssues, renderBody } from "../../../lib/issues";
import { pageMeta } from "../../../lib/site";
import SignupBar from "../../SignupBar";

export const dynamicParams = false;
export function generateStaticParams() { return getIssues().map(i => ({ issue: i.slug })); }

export async function generateMetadata({ params }) {
  const { issue } = await params; const i = getIssues().find(x => x.slug === issue);
  if (!i) return {};
  return pageMeta({ title: `Issue #${i.n}: ${i.title}`, description: i.preview || i.subject, path: i.href });
}

export default async function Issue({ params }) {
  const { issue } = await params; const issues = getIssues(), i = issues.find(x => x.slug === issue);
  if (!i) notFound();
  const newer = issues.find(x => x.n === i.n + 1), older = issues.find(x => x.n === i.n - 1);
  return (<article className="prose">
    <p className="crumb"><a href="/newsletter/">← All issues</a></p>
    <h1>{i.subject}</h1>
    <p className="src">Issue #{i.n} · sent {i.dateLabel} · archive copy of the email</p>
    <p className="byline">My Grok Bot finds the hosts and checks the prices, and I review what it finds before each issue goes out. Prices here are as of {i.dateLabel}. <a href="/">See today's prices</a>.</p>
    <div className="issue-body" dangerouslySetInnerHTML={{ __html: renderBody(i.body) }} />
    <SignupBar variant="compact" />
    <p>{older && <a href={older.href}>← Issue #{older.n}</a>}{older && newer && " · "}{newer && <a href={newer.href}>Issue #{newer.n} →</a>}{(older || newer) && " · "}<a href="/newsletter/">All issues</a></p>
  </article>);
}
