import { getPlans } from "../../../lib/plans";
import { pageMeta, fmtDate } from "../../../lib/site";
import SignupBar from "../../SignupBar";

export function generateStaticParams() { return [...new Set(getPlans().map(p => p.providerSlug))].map(s => ({ slug: s })); }

const latest = (plans) => plans.map(p => p.source_checked.length === 7 ? p.source_checked + "-01" : p.source_checked).sort().pop();

export async function generateMetadata({ params }) {
  const { slug: s } = await params; const plans = getPlans().filter(p => p.providerSlug === s);
  const name = plans[0].provider, prices = plans.map(p => p.gbp), lo = Math.min(...prices), hi = Math.max(...prices);
  const range = plans.length === 1 ? (lo === 0 ? "free" : `about £${lo.toFixed(2)} a month`) : `about £${lo.toFixed(2)} to £${hi.toFixed(2)} a month`;
  return pageMeta({
    title: `${name} for OpenClaw and Hermes: plans and prices, checked ${fmtDate(latest(plans))}`,
    description: `${plans.length} ${name} plan${plans.length > 1 ? "s" : ""} for running AI agents, ${range}. Each price links to ${name}'s own page with the date it was checked.`,
    path: `/provider/${s}/`,
  });
}

export default async function Provider({ params }) {
  const { slug: s } = await params; const plans = getPlans().filter(p => p.providerSlug === s);
  return (<><p className="crumb"><a href="/">← All plans</a></p><h1>{plans[0].provider}</h1>
    <SignupBar variant="compact" />
    <table className="plans plans-provider"><thead><tr><th>Plan</th><th>Price</th><th>vCPU/RAM/Disk</th><th>Notes</th><th>Source</th><th><span className="sr-only">Link</span></th></tr></thead><tbody>
    {plans.map(p=><tr key={p.id}><td data-label="Plan" className="c-name">{p.plan}</td><td data-label="Price /mo" className="c-price">£{p.gbp.toFixed(2)}/mo<br/><span className="src">{p.currency==="EUR"?"€":"$"}{p.price.toFixed(2)} {p.currency}</span></td><td data-label="vCPU / RAM / Disk" className="c-spec">{p.vcpu} / {p.ram_gb} GB / {p.disk_gb} GB</td><td data-label="Notes" className="c-notes">{p.billing_note}</td>
    <td data-label="Source" className="src c-src"><a href={p.source_url} rel="nofollow">source</a> · checked {p.source_checked} {p.stale&&<span className="stale">STALE</span>} {p.thirdParty&&<span className="unv">UNVERIFIED</span>}</td><td className="c-visit">{p.affiliate_url?<><a href={p.affiliate_url} rel="sponsored nofollow noopener" target="_blank">Visit</a><div className="aff">affiliate</div></>:<a href={p.source_url} rel="nofollow noopener" target="_blank">Visit</a>}</td></tr>)}
    </tbody></table></>);
}
