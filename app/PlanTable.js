"use client";
import { useState } from "react";
export default function PlanTable({ plans }) {
  const [ram, setRam] = useState(0), [max, setMax] = useState(""), [type, setType] = useState("all"), [agent, setAgent] = useState("all"), [oc, setOc] = useState(false);
  const rows = plans.filter(p => p.ram_gb >= ram && (max === "" || p.gbp <= +max) &&
    (type === "all" || (type === "managed") === p.managed) &&
    (agent === "all" || p.agents.some(a => a.includes(agent) || a.startsWith("Any"))) && (!oc || p.oneClick)).sort((a,b)=>a.gbp-b.gbp);
  return (<>
    <div className="filters">
      <label>Min RAM<select value={ram} onChange={e=>setRam(+e.target.value)}><option value={0}>Any</option><option value={4}>4 GB+</option><option value={8}>8 GB+ (browser tools)</option><option value={16}>16 GB+</option></select></label>
      <label>Max £ / mo<input type="number" placeholder="e.g. 10" value={max} onChange={e=>setMax(e.target.value)} /></label>
      <label>Type<select value={type} onChange={e=>setType(e.target.value)}><option value="all">All</option><option value="self">Self-hosted VPS</option><option value="managed">Managed</option></select></label>
      <label>Agent<select value={agent} onChange={e=>setAgent(e.target.value)}><option value="all">Any</option><option>OpenClaw</option><option>Hermes</option><option>Claude Code</option></select></label>
      <label>One-click<span><input type="checkbox" checked={oc} onChange={e=>setOc(e.target.checked)} /> only</span></label>
    </div>
    <p className="sub">{rows.length} plans · sorted by GBP · converted at ECB rates of 23 Oct 2026 · original price shown underneath</p>
    <table><thead><tr><th>Provider / plan</th><th>Price /mo (GBP)</th><th>vCPU</th><th>RAM</th><th>Disk</th><th>Type</th><th>Agents · one-click</th><th>Source &amp; checked</th><th></th></tr></thead>
    <tbody>{rows.map(p=>(<tr key={p.id}>
      <td><a href={`/provider/${p.providerSlug}`}>{p.provider}</a><br/><span className="src">{p.plan}</span></td>
      <td><b>£{p.gbp.toFixed(2)}</b><br/><span className="src">{p.currency==="EUR"?"€":"$"}{p.price.toFixed(2)} {p.currency}</span><br/><span className="src">{p.billing_note}</span></td>
      <td>{p.vcpu}</td><td>{p.ram_gb} GB</td><td>{p.disk_gb} GB</td><td>{p.managed?"Managed":p.type==="free"?"Free tier":"VPS"}</td>
      <td>{p.agents.map(a=><span key={a} className="tag">{a}</span>)}{p.oneClick&&<div className="src">⚡ {p.oneClick}</div>}</td>
      <td className="src"><a href={p.source_url} rel="nofollow">source</a><br/>{p.source_checked} {p.stale&&<span className="stale">STALE</span>} {p.thirdParty&&<span className="unv">UNVERIFIED</span>}</td>
    <td>{p.affiliate_url?<><a href={p.affiliate_url} rel="sponsored nofollow noopener" target="_blank">Visit</a><div className="aff">affiliate</div></>:<a href={p.source_url} rel="nofollow noopener" target="_blank">Visit</a>}</td>
    </tr>))}</tbody></table></>);
}
