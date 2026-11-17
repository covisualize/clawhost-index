"use client";
import { useState } from "react";
import { byRenewal } from "../lib/cost";
const sym = (cur) => cur === "EUR" ? "€" : "$";
export default function PlanTable({ plans, fxDate }) {
  const [ram, setRam] = useState(0), [max, setMax] = useState(""), [type, setType] = useState("all"), [agent, setAgent] = useState("all"), [oc, setOc] = useState(false), [sort, setSort] = useState("current");
  const rows = plans.filter(p => p.ram_gb >= ram && (max === "" || p.gbp <= +max) &&
    (type === "all" || (type === "managed") === p.managed) &&
    (agent === "all" || p.agents.some(a => a.includes(agent) || a.startsWith("Any"))) && (!oc || p.oneClick)).sort(sort === "renewal" ? byRenewal : (a,b)=>a.gbp-b.gbp);
  return (<>
    <div className="filters">
      <label>Min RAM<select value={ram} onChange={e=>setRam(+e.target.value)}><option value={0}>Any</option><option value={4}>4 GB+</option><option value={8}>8 GB+ (browser tools)</option><option value={16}>16 GB+</option></select></label>
      <label>Max £ / mo<input type="number" inputMode="decimal" min={0} placeholder="e.g. 10" value={max} onChange={e=>setMax(e.target.value)} /></label>
      <label>Type<select value={type} onChange={e=>setType(e.target.value)}><option value="all">All</option><option value="self">Self-hosted VPS</option><option value="managed">Managed</option></select></label>
      <label>Agent<select value={agent} onChange={e=>setAgent(e.target.value)}><option value="all">Any</option><option>OpenClaw</option><option>Hermes</option><option>Claude Code</option></select></label>
      <label>One-click<span><input type="checkbox" checked={oc} onChange={e=>setOc(e.target.checked)} /> only</span></label>
      <label>Sort by<select value={sort} onChange={e=>setSort(e.target.value)}><option value="current">Current price</option><option value="renewal">Renewal price</option></select></label>
    </div>
    <p className="sub" aria-live="polite">{rows.length} plans · {sort === "renewal" ? "cheapest renewal first, Not stated last" : "cheapest first"} in GBP · converted at ECB rates of {fxDate} · original price shown underneath</p>
    {rows.length === 0 && <p className="box">No plans match those filters. Try a higher price or less RAM.</p>}
    <table className="plans"><thead><tr><th>Provider / plan</th><th aria-sort={sort === "current" ? "ascending" : undefined}>Price /mo (GBP)</th><th aria-sort={sort === "renewal" ? "ascending" : undefined}>Renews at /mo (GBP)</th><th>vCPU</th><th>RAM</th><th>Disk</th><th>Type</th><th>Agents · one-click</th><th>Source &amp; checked</th><th><span className="sr-only">Link</span></th></tr></thead>
    <tbody>{rows.map(p=>(<tr key={p.id}>
      <td data-label="Plan" className="c-name"><a href={`/provider/${p.providerSlug}/`}>{p.provider}</a><br/><span className="src">{p.plan}</span>{(p.availability !== "Listed" || p.replaces) && <span className="avail">{p.availability !== "Listed" && <span className="badge-out">{p.availability}</span>}{p.replaces && <span className="badge-new">Replaces {p.replaces}</span>}</span>}</td>
      <td data-label="Price /mo" className="c-price"><b>£{p.gbp.toFixed(2)}</b><br/><span className="src">{sym(p.currency)}{p.price.toFixed(2)} {p.currency}</span>{p.billing_note&&<><br/><span className="src note">{p.billing_note}</span></>}</td>
      <td data-label="Renews at" className="c-renew">{p.renewalGbp === null ? <span className="src">Not stated</span> : <>{p.renewalSource !== p.source_url
        ? <a href={p.renewalSource} rel="nofollow" aria-label={`${p.provider} ${p.plan} renews at £${p.renewalGbp.toFixed(2)}, renewal price source`}>£{p.renewalGbp.toFixed(2)}</a>
        : <>£{p.renewalGbp.toFixed(2)}</>}<br/><span className="src">{sym(p.currency)}{p.renewal.toFixed(2)} {p.currency}</span></>}</td>
      <td data-label="vCPU" className="c-spec">{p.vcpu}</td><td data-label="RAM" className="c-spec">{p.ram_gb} GB</td><td data-label="Disk" className="c-spec">{p.disk_gb} GB</td><td data-label="Type" className="c-spec">{p.managed?"Managed":p.type==="free"?"Free tier":"VPS"}</td>
      <td data-label="Agents" className="c-agents">{p.agents.map(a=><span key={a} className="tag">{a}</span>)}{p.oneClick&&<div className="src">⚡ {p.oneClick}</div>}</td>
      <td data-label="Source" className="src c-src"><a href={p.source_url} rel="nofollow" aria-label={`${p.provider} ${p.plan} price source`}>source</a><br/><span className="checked">checked <time dateTime={p.source_checked}>{p.checkedLabel}</time></span> {p.stale&&<span className="stale">STALE</span>} {p.thirdParty&&<span className="unv">UNVERIFIED</span>}</td>
    <td className="c-visit">{p.affiliate_url?<><a href={p.affiliate_url} rel="sponsored nofollow noopener" target="_blank" aria-label={`Visit ${p.provider} (affiliate link, opens in a new tab)`}>Visit</a><div className="aff">affiliate</div></>:<a href={p.source_url} rel="nofollow noopener" target="_blank" aria-label={`Visit ${p.provider} (opens in a new tab)`}>Visit</a>}</td>
    </tr>))}</tbody></table></>);
}
