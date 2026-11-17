import { Fragment } from "react";
import { getPlans, FX } from "../../lib/plans";
import { pageMeta, fmtDate } from "../../lib/site";
import { AGENTS, AGENTS_CHECKED, SRC, supports } from "../../lib/agents";
import AffiliateNote from "../AffiliateNote";
import SignupBar from "../SignupBar";

export const metadata = pageMeta({
  title: "Best VPS for OpenClaw, Hermes and Claude Code: which plan to pick",
  description: "Hermes agent VPS requirements, plus OpenClaw and Claude Code minimum RAM and vCPU from their own docs, and the cheapest plans that meet them. The best VPS for OpenClaw on price, with dated sources.",
  path: "/which-plan/",
});

const NONE = "No official figure";
const fits = (p, agent, ram) => p.ram_gb >= ram && supports(p, agent);
// Paid plans only: a £0 free tier at the top would hide what a server really costs.
const cheapest = (plans, agent, ram) => plans.filter(p => p.type !== "free" && fits(p, agent, ram)).sort((a, b) => a.gbp - b.gbp).slice(0, 3);

function FreeTiers({ plans, agent }) {
  const free = plans.filter(p => p.type === "free" && fits(p, agent, agent.minRamGb));
  if (!free.length) return null;
  return (<p className="src free-tier">Free tier that also meets the minimum: {free.map((p, i) => <span key={p.id}>{i > 0 && "; "}<a href={`/provider/${p.providerSlug}/`}>{`${p.provider} ${p.plan}`}</a>{` (${p.vcpu} vCPU, ${p.ram_gb} GB).${p.billing_note ? ` ${p.billing_note}.` : ""}`}</span>)} Free tiers have limits, so read the <a href="/gotchas/">7 gotchas</a> first.</p>);
}

function Plans({ rows }) {
  return (<table className="plans plans-pick"><thead><tr><th>Provider / plan</th><th>Price /mo (GBP)</th><th>vCPU · RAM</th><th>Checked</th></tr></thead>
    <tbody>{rows.map(p => <tr key={p.id}>
      <td data-label="Plan" className="c-name"><a href={`/provider/${p.providerSlug}/`}>{p.provider}</a><br/><span className="src">{p.plan}</span></td>
      <td data-label="Price /mo" className="c-price"><b className="gbp">£{p.gbp.toFixed(2)}</b><span className="src orig">{p.currency === "EUR" ? "€" : "$"}{p.price.toFixed(2)} {p.currency}</span>{p.billing_note && <span className="src note">{p.billing_note}</span>}</td>
      <td data-label="Specs" className="c-spec">{p.vcpu} vCPU · {p.ram_gb} GB<span className="src kind">{p.managed ? "Managed" : "VPS"}</span></td>
      <td data-label="Source" className="src c-src">Checked <time dateTime={p.source_checked}>{p.checkedLabel}</time></td>
    </tr>)}</tbody></table>);
}

export default function WhichPlan() {
  const plans = getPlans();
  const floor = Math.min(...plans.map(p => p.ram_gb));
  const checked = fmtDate(AGENTS_CHECKED);
  const specs = [
    ["Minimum RAM", a => a.minRam], ["Comfortable RAM", a => a.comfyRam],
    ["Minimum vCPU", a => a.minVcpu || NONE], ["Comfortable vCPU", a => a.comfyVcpu || NONE],
  ];
  return (<>
    <AffiliateNote />
    <p className="crumb"><a href="/">← All plans</a></p>
    <h1>Which plan for which agent</h1>
    <p className="lede">What OpenClaw, Hermes and Claude Code say they need, from their own docs, and the cheapest plans that meet it. Where the docs give no figure, this page says so.</p>

    <h2>What each agent needs</h2>
    <p className="src">From each agent's own docs, checked {checked}.</p>
    <div className="needs">{AGENTS.map(a => <section key={a.id} className="box" aria-labelledby={`need-${a.id}`}>
      <h3 id={`need-${a.id}`}>{a.name}</h3>
      <dl>{specs.map(([label, cell]) => <Fragment key={label}><dt>{label}</dt><dd>{cell(a)}</dd></Fragment>)}</dl>
      <details className="more">
        <summary>Notes and sources</summary>
        <ul>{a.notes.map(n => <li key={n}>{n}</li>)}</ul>
        <p className="src">{a.sources.map((s, i) => <span key={s.url}>{i > 0 && " · "}<a href={s.url}>{s.label}</a></span>)}</p>
      </details>
    </section>)}</div>

    <article className="prose">
      <h2>What pushes needs up</h2>
      <ul>
        <li><b>Browser tools.</b> Hermes says to allocate at least 2 GB with browser tools active, and Chromium in Docker needs <code>--shm-size=1g</code> (<a href={SRC.hermesDocker.url}>Hermes Docker docs</a>).</li>
        <li><b>Docker builds.</b> OpenClaw needs at least 6 GB RAM to build its image from source. Pre-built images avoid this (<a href={SRC.ocDocker.url}>OpenClaw Docker guide</a>).</li>
        <li><b>Local models.</b> OpenClaw's DigitalOcean guide says local LLM inference does not fit in 1 GB (<a href={SRC.ocDo.url}>source</a>). A useful local model needs much more than that.</li>
        <li><b>Several agents on one box.</b> Each agent adds its own needs, so add them up rather than taking one agent's minimum. The <a href="/calculator/">server size calculator</a> gives a rough guide.</li>
      </ul>
    </article>

    <h2>Cheapest suitable plans</h2>
    <p className="src">Paid plans, cheapest first. GBP at ECB rates of {fmtDate(FX.date)}. Managed plans only appear for the agents they support. Every plan in the index has at least {floor} GB RAM.</p>
    {AGENTS.map(a => {
      const min = cheapest(plans, a, a.minRamGb), comfy = cheapest(plans, a, a.comfyRamGb);
      const same = min.map(p => p.id).join() === comfy.map(p => p.id).join();
      return (<section key={a.id} className="pick">
        <h3>{a.name}</h3>
        <p className="src">Meets the minimum ({a.minRamGb} GB+){same ? ` and the comfortable figure (${a.comfyRamGb} GB+)` : ""}:</p>
        <Plans rows={min} />
        {!same && <><p className="src">Meets the comfortable figure ({a.comfyRamGb} GB+):</p><Plans rows={comfy} /></>}
        <FreeTiers plans={plans} agent={a} />
      </section>);
    })}

    <p className="next">Next: work out the full monthly bill on <a href="/cost/">what it really costs</a>, size a server with the <a href="/calculator/">calculator</a>, or lock it down with the <a href="/security/">VPS security checklist</a>.</p>
    <SignupBar variant="compact" />
  </>);
}
