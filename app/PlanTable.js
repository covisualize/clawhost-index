"use client";
import { useState } from "react";
export default function PlanTable({ plans, fxDate }) {
  const [ram, setRam] = useState(0), [max, setMax] = useState(""), [type, setType] = useState("all"), [agent, setAgent] = useState("all"), [oc, setOc] = useState(false);
  const rows = plans.filter(p => p.ram_gb >= ram && (max === "" || p.gbp <= +max) &&
    (type === "all" || (type === "managed") === p.managed) &&
    (agent === "all" || p.agents.some(a => a.includes(agent) || a.startsWith("Any"))) && (!oc || p.oneClick)).sort((a,b)=>a.gbp-b.gbp);
  return (<>
    <div className="filters">
      <label>Min RAM<select value={ram} onChange={e=>setRam(+e.target.value)}><option value={0}>Any</option><option value={4}>4 GB+</option><option value={8}>8 GB+ (browser tools)</option><option value={16}>16 GB+</option></select></label>
      <label>Max £ / mo<input type="number" inputMode="decimal" min={0} placeholder="e.g. 10" value={max} onChange={e=>setMax(e.target.value)} /></label>
      <label>Type<select value={type} onChange={e=>setType(e.target.value)}><option value="all">All</option><option value="self">Self-hosted VPS</option><option value="managed">Managed</option></select></label>
      <label>Agent<select value={agent} onChange={e=>setAgent(e.target.value)}><option value="all">Any</option><option>OpenClaw</option><option>Hermes</option><option>Claude Code</option></select></label>
      <label>One-click<span><input type="checkbox" checked={oc} onChange={e=>setOc(e.target.checked)} /> only</span></label>
    </div>
    <p className="sub" aria-live="polite">{rows.length} plans · cheapest first in GBP · converted at ECB rates of {fxDate} · original price shown underneath</p>
    {rows.length === 0 && <p className="box">No plans match those filters. Try a higher price or less RAM.</p>}
    <table className="plans"><thead><tr><th>Provider / plan</th><th>Price /mo (GBP)</th><th>vCPU</th><th>RAM</th><th>Disk</th><th>Type</th><th>Agents · one-click</th><th>Source &amp; checked</th><th><span className="sr-only">Link</span></th></tr></thead>
    <tbody>{rows.map(p=>(<tr key={p.id}>
      <td data-label="Plan" className="c-name"><a href={`/provider/${p.providerSlug}/`}>{p.provider}</a><br/><span className="src">{p.plan}</span></td>
      <td data-label="Price /mo" className="c-price"><b>£{p.gbp.toFixed(2)}</b><br/><span className="src">{p.currency==="EUR"?"€":"$"}{p.price.toFixed(2)} {p.currency}</span>{p.billing_note&&<><br/><span className="src note">{p.billing_note}</span></>}</td>
      <td data-label="vCPU" className="c-spec">{p.vcpu}</td><td data-label="RAM" className="c-spec">{p.ram_gb} GB</td><td data-label="Disk" className="c-spec">{p.disk_gb} GB</td><td data-label="Type" className="c-spec">{p.managed?"Managed":p.type==="free"?"Free tier":"VPS"}</td>
      <td data-label="Agents" className="c-agents">{p.agents.map(a=><span key={a} className="tag">{a}</span>)}{p.oneClick&&<div className="src">⚡ {p.oneClick}</div>}</td>
      <td data-label="Source" className="src c-src"><a href={p.source_url} rel="nofollow" aria-label={`${p.provider} ${p.plan} price source`}>source</a><br/>checked {p.source_checked} {p.stale&&<span className="stale">STALE</span>} {p.thirdParty&&<span className="unv">UNVERIFIED</span>}</td>
    <td className="c-visit">{p.affiliate_url?<><a href={p.affiliate_url} rel="sponsored nofollow noopener" target="_blank" aria-label={`Visit ${p.provider} (affiliate link, opens in a new tab)`}>Visit</a><div className="aff">affiliate</div></>:<a href={p.source_url} rel="nofollow noopener" target="_blank" aria-label={`Visit ${p.provider} (opens in a new tab)`}>Visit</a>}</td>
    </tr>))}</tbody></table></>);
}
