"use client";
import { useEffect, useRef, useState } from "react";
import { byRenewal } from "../lib/cost";
const sym = (cur) => cur === "EUR" ? "€" : "$";
// The catch-all agent label is long and on most rows, so the list shows a short form.
const agentLabel = (agents) => agents.map(a => a.startsWith("Any") ? "Any agent (self-host)" : a).join(", ");
export default function PlanTable({ plans, fxDate }) {
  const [ram, setRam] = useState(0), [max, setMax] = useState(""), [type, setType] = useState("all"), [agent, setAgent] = useState("all"), [oc, setOc] = useState(false), [sort, setSort] = useState("current");
  // Filters sit in a <details> that's collapsed on phones. CSS keeps it open on wider screens;
  // this covers browsers without ::details-content.
  const box = useRef(null);
  useEffect(() => { if (box.current && window.matchMedia("(min-width: 641px)").matches) box.current.open = true; }, []);
  const rows = plans.filter(p => p.ram_gb >= ram && (max === "" || p.gbp <= +max) &&
    (type === "all" || (type === "managed") === p.managed) &&
    (agent === "all" || p.agents.some(a => a.includes(agent) || a.startsWith("Any"))) && (!oc || p.oneClick)).sort(sort === "renewal" ? byRenewal : (a,b)=>a.gbp-b.gbp);
  return (<>
    <details className="filter-box" ref={box}>
      <summary>Filter and sort</summary>
      <div className="filters">
        <label>Min RAM<select value={ram} onChange={e=>setRam(+e.target.value)}><option value={0}>Any</option><option value={4}>4 GB+</option><option value={8}>8 GB+ (browser tools)</option><option value={16}>16 GB+</option></select></label>
        <label>Max £ / mo<input type="number" inputMode="decimal" min={0} placeholder="e.g. 10" value={max} onChange={e=>setMax(e.target.value)} /></label>
        <label>Type<select value={type} onChange={e=>setType(e.target.value)}><option value="all">All</option><option value="self">Self-hosted VPS</option><option value="managed">Managed</option></select></label>
        <label>Agent<select value={agent} onChange={e=>setAgent(e.target.value)}><option value="all">Any</option><option>OpenClaw</option><option>Hermes</option><option>Claude Code</option></select></label>
        <label>Sort by<select value={sort} onChange={e=>setSort(e.target.value)}><option value="current">Current price</option><option value="renewal">Renewal price</option></select></label>
        <label className="check"><input type="checkbox" checked={oc} onChange={e=>setOc(e.target.checked)} /> One-click install only</label>
      </div>
    </details>
    <p className="src count" aria-live="polite">{rows.length} plans · {sort === "renewal" ? "cheapest renewal first, Not stated last" : "cheapest first"} · GBP at ECB rates of {fxDate}, original price underneath</p>
    {rows.length === 0 && <p className="box">No plans match those filters. Try a higher price or less RAM.</p>}
    <table className="plans"><thead><tr><th>Provider / plan</th><th aria-sort={sort === "current" ? "ascending" : undefined}>Price /mo (GBP)</th><th aria-sort={sort === "renewal" ? "ascending" : undefined}>Renews at /mo (GBP)</th><th>vCPU · RAM · disk</th><th>Agents</th><th>Checked</th><th><span className="sr-only">Link</span></th></tr></thead>
    <tbody>{rows.map(p=>(<tr key={p.id}>
      <td data-label="Plan" className="c-name"><a href={`/provider/${p.providerSlug}/`}>{p.provider}</a><br/><span className="src">{p.plan}</span>{(p.availability !== "Listed" || p.replaces) && <span className="avail">{p.availability !== "Listed" && <span className="badge-out">{p.availability}</span>}{p.replaces && <span className="badge-new">Replaces {p.replaces}</span>}</span>}</td>
      <td data-label="Price /mo" className="c-price"><b className="gbp">£{p.gbp.toFixed(2)}</b><span className="src orig">{sym(p.currency)}{p.price.toFixed(2)} {p.currency}</span>{p.billing_note&&<span className="src note">{p.billing_note}</span>}</td>
      <td data-label="Renews at" className="c-renew">{p.renewalGbp === null ? <span className="src">Not stated</span> : <>{p.renewalSource !== p.source_url
        ? <a href={p.renewalSource} rel="nofollow" aria-label={`${p.provider} ${p.plan} renews at £${p.renewalGbp.toFixed(2)}, renewal price source`}>£{p.renewalGbp.toFixed(2)}</a>
        : <>£{p.renewalGbp.toFixed(2)}</>}<span className="src orig">{sym(p.currency)}{p.renewal.toFixed(2)} {p.currency}</span></>}</td>
      <td data-label="Specs" className="c-spec">{p.vcpu} vCPU · {p.ram_gb} GB · {p.disk_gb} GB disk<span className="src kind">{p.managed?"Managed":p.type==="free"?"Free tier":"VPS"}</span></td>
      <td data-label="Agents" className="c-agents">{agentLabel(p.agents)}{p.oneClick&&<>. One-click: {p.oneClick}</>}</td>
      <td data-label="Source" className="src c-src"><span className="checked">Checked <time dateTime={p.source_checked}>{p.checkedLabel}</time></span> · <a href={p.source_url} rel="nofollow" aria-label={`${p.provider} ${p.plan} price source`}>Source</a>{p.stale&&<> <span className="stale">STALE</span></>}{p.thirdParty&&<> <span className="unv">UNVERIFIED</span></>}</td>
    <td className="c-visit">{p.affiliate_url?<><a href={p.affiliate_url} rel="sponsored nofollow noopener" target="_blank" aria-label={`Visit ${p.provider} (affiliate link, opens in a new tab)`}>Visit</a><div className="aff">affiliate</div></>:<a href={p.source_url} rel="nofollow noopener" target="_blank" aria-label={`Visit ${p.provider} (opens in a new tab)`}>Visit</a>}</td>
    </tr>))}</tbody></table></>);
}
