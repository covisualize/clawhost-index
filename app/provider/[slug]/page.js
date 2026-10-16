import { getPlans, slug } from "../../../lib/plans";
export function generateStaticParams() { return [...new Set(getPlans().map(p => p.providerSlug))].map(s => ({ slug: s })); }
export default async function Provider({ params }) {
  const { slug: s } = await params; const plans = getPlans().filter(p => p.providerSlug === s);
  return (<><a href="/">← All plans</a><h1>{plans[0].provider}</h1>
    <table><thead><tr><th>Plan</th><th>Price</th><th>vCPU/RAM/Disk</th><th>Notes</th><th>Source</th><th></th></tr></thead><tbody>
    {plans.map(p=><tr key={p.id}><td>{p.plan}</td><td>£{p.gbp.toFixed(2)}/mo<br/><span className="src">{p.currency==="EUR"?"€":"$"}{p.price.toFixed(2)} {p.currency}</span></td><td>{p.vcpu} / {p.ram_gb} GB / {p.disk_gb} GB</td><td>{p.billing_note}</td>
    <td className="src"><a href={p.source_url} rel="nofollow">source</a> · checked {p.source_checked} {p.stale&&<span className="stale">STALE</span>} {p.thirdParty&&<span className="unv">UNVERIFIED</span>}</td><td>{p.affiliate_url?<><a href={p.affiliate_url} rel="sponsored nofollow noopener" target="_blank">Visit</a><div className="aff">affiliate</div></>:<a href={p.source_url} rel="nofollow noopener" target="_blank">Visit</a>}</td></tr>)}
    </tbody></table></>);
}
