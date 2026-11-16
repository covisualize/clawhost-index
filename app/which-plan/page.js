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
  return (<table className="plans plans-pick"><thead><tr><th>Provider / plan</th><th>Price /mo (GBP)</th><th>vCPU</th><th>RAM</th><th>Type</th></tr></thead>
    <tbody>{rows.map(p => <tr key={p.id}>
      <td data-label="Plan" className="c-name"><a href={`/provider/${p.providerSlug}/`}>{p.provider}</a><br/><span className="src">{p.plan}</span></td>
      <td data-label="Price /mo" className="c-price"><b>£{p.gbp.toFixed(2)}</b><br/><span className="src">{p.currency === "EUR" ? "€" : "$"}{p.price.toFixed(2)} {p.currency} · checked {p.source_checked}</span>{p.billing_note && <><br/><span className="src note">{p.billing_note}</span></>}</td>
      <td data-label="vCPU" className="c-spec">{p.vcpu}</td><td data-label="RAM" className="c-spec">{p.ram_gb} GB</td>
      <td data-label="Type" className="c-spec">{p.managed ? "Managed" : p.type === "free" ? "Free tier" : "VPS"}</td>
    </tr>)}</tbody></table>);
}

export default function WhichPlan() {
  const plans = getPlans();
  const floor = Math.min(...plans.map(p => p.ram_gb));
  const checked = fmtDate(AGENTS_CHECKED);
  const rows = [
    ["Minimum RAM", a => a.minRam], ["Comfortable RAM", a => a.comfyRam],
    ["Minimum vCPU", a => a.minVcpu || NONE], ["Comfortable vCPU", a => a.comfyVcpu || NONE],
    ["Notes", a => <ul>{a.notes.map(n => <li key={n}>{n}</li>)}</ul>],
    ["Source", a => <>{a.sources.map((s, i) => <span key={s.url}>{i > 0 && <br/>}<a href={s.url}>{s.label}</a></span>)}<br/><span className="src">checked {checked}</span></>],
  ];
  return (<>
    <p className="crumb"><a href="/">← All plans</a></p>
    <h1>Which plan for which agent</h1>
    <p className="sub intro">What OpenClaw, Hermes and Claude Code say they need, taken from their own docs, and the cheapest plans in the index that meet it. Where the docs give no figure, this page says so rather than guess.</p>
    <AffiliateNote />

    <h2>What each agent needs</h2>
    <div className="scroll"><table className="compare">
      <thead><tr><th><span className="sr-only">Requirement</span></th>{AGENTS.map(a => <th key={a.id} scope="col">{a.name}</th>)}</tr></thead>
      <tbody>{rows.map(([label, cell]) => <tr key={label}><th scope="row">{label}</th>{AGENTS.map(a => <td key={a.id}>{cell(a)}</td>)}</tr>)}</tbody>
    </table></div>
    <p className="src">All figures checked {checked}. OpenClaw's main install page gives no RAM or CPU figure, so its numbers come from the Raspberry Pi, Fly.io and DigitalOcean guides. Neither OpenClaw nor Claude Code gives an official comfortable vCPU figure.</p>

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
    <p className="src">Paid plans, cheapest first, in GBP converted at ECB reference rates of {fmtDate(FX.date)}, with the original price and the date it was checked. Managed plans are only listed for the agents they support. Every plan in the index has at least {floor} GB RAM.</p>
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

    <div className="box">Work out the full monthly bill, server plus model tokens, on <a href="/cost/">what it really costs</a>. Or size a server with the <a href="/calculator/">calculator</a>.</div>
    <SignupBar variant="compact" />
  </>);
}
