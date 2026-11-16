"use client";
import { useState } from "react";
import { AGENTS, supports } from "../../lib/agents";
import { MODELS, PRESETS, DEFAULT_MODEL } from "../../lib/models";
import { serverGbp, sortPlans, defaultPlan } from "../../lib/cost";

const num = (s) => { const n = parseFloat(s); return Number.isFinite(n) && n > 0 ? n : 0; };
const fmt = (n) => n.toFixed(2);

export default function CostCalc({ plans, fxRate, fxDate, fxSource }) {
  const first = MODELS.find(m => m.id === DEFAULT_MODEL);
  const startRate = +fxRate.toFixed(5);

  const [agentId, setAgentId] = useState(AGENTS[0].id);
  const [planId, setPlanId] = useState(() => defaultPlan(plans, AGENTS[0], startRate).id);
  // Once someone picks a plan themselves, a rate change shouldn't swap it out from under them.
  const [planChosen, setPlanChosen] = useState(false);
  const [mode, setMode] = useState("preset");
  const [preset, setPreset] = useState("medium");
  const [modelId, setModelId] = useState(DEFAULT_MODEL);
  const [inM, setInM] = useState(String(PRESETS.medium.inM)), [outM, setOutM] = useState(String(PRESETS.medium.outM));
  const [inPrice, setInPrice] = useState(String(first.inUsd)), [outPrice, setOutPrice] = useState(String(first.outUsd));
  const [spend, setSpend] = useState(""), [spendCur, setSpendCur] = useState("USD");
  const [rate, setRate] = useState(String(startRate));

  const agent = AGENTS.find(a => a.id === agentId);
  const model = MODELS.find(m => m.id === modelId);
  const usdGbp = num(rate);
  const sorted = sortPlans(plans, usdGbp);
  const plan = plans.find(p => p.id === planId) || sorted[0];

  const onAgent = (id) => { setAgentId(id); setPlanChosen(false); setPlanId(defaultPlan(plans, AGENTS.find(a => a.id === id), usdGbp).id); };
  const onPlan = (id) => { setPlanId(id); setPlanChosen(true); };
  const onRate = (v) => { setRate(v); if (!planChosen) setPlanId(defaultPlan(plans, agent, num(v)).id); };
  const onPreset = (k) => { setPreset(k); setInM(String(PRESETS[k].inM)); setOutM(String(PRESETS[k].outM)); };
  const onModel = (id) => { const m = MODELS.find(x => x.id === id); setModelId(id); setInPrice(String(m.inUsd)); setOutPrice(String(m.outUsd)); };

  const server = serverGbp(plan, usdGbp);
  const modelGbp = mode === "spend"
    ? (spendCur === "GBP" ? num(spend) : num(spend) * usdGbp)
    : (num(inM) * (mode === "preset" ? model.inUsd : num(inPrice)) + num(outM) * (mode === "preset" ? model.outUsd : num(outPrice))) * usdGbp;
  const total = server + modelGbp;
  const share = total > 0 ? Math.round(modelGbp / total * 100) : 0;

  const modelSelect = (<label>Model<select value={modelId} onChange={e => onModel(e.target.value)}>
    {MODELS.map(m => <option key={m.id} value={m.id}>{m.vendor} {m.name} (${m.inUsd} in / ${m.outUsd} out per 1M)</option>)}
  </select></label>);
  const tokenInputs = (<>
    <label>Input tokens a month (millions)<input type="number" inputMode="decimal" min={0} step="any" value={inM} onChange={e => setInM(e.target.value)} /></label>
    <label>Output tokens a month (millions)<input type="number" inputMode="decimal" min={0} step="any" value={outM} onChange={e => setOutM(e.target.value)} /></label>
  </>);

  return (<div className="box calc">
    <div className="row">
      <label>Agent<select value={agentId} onChange={e => onAgent(e.target.value)}>
        {AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select></label>
      <label>Server plan<select value={planId} onChange={e => onPlan(+e.target.value)}>
        {sorted.map(p => <option key={p.id} value={p.id}>{`${p.provider} ${p.plan} · ${p.ram_gb} GB · £${fmt(serverGbp(p, usdGbp))}/mo${p.type === "free" ? " · free tier" : ""}`}</option>)}
      </select></label>
    </div>
    <p className="src">Default is the cheapest paid plan with at least {agent.minRamGb} GB RAM that lists {agent.name}. Free tiers are in the list too. <a href={`/provider/${plan.providerSlug}/`}>{plan.provider} plans and prices</a></p>
    {plan.ram_gb < agent.minRamGb && <p className="warn" role="alert">{plan.ram_gb} GB is below {agent.name}'s minimum of {agent.minRamGb} GB. <a href="/which-plan/">See what it needs</a>.</p>}
    {!supports(plan, agent) && <p className="warn" role="alert">{plan.provider} lists {plan.agents.join(", ")} only, not {agent.name}.</p>}
    {plan.type === "free" && <p className="warn">This is a free tier, and free tiers have limits. See <a href="/gotchas/">7 gotchas</a> before you rely on it.</p>}

    <fieldset className="modes"><legend>Model spend</legend>
      <label><input type="radio" name="mode" checked={mode === "preset"} onChange={() => setMode("preset")} /> Usage preset</label>
      <label><input type="radio" name="mode" checked={mode === "spend"} onChange={() => setMode("spend")} /> I know my monthly spend</label>
      <label><input type="radio" name="mode" checked={mode === "tokens"} onChange={() => setMode("tokens")} /> Tokens × price</label>
    </fieldset>

    {mode === "preset" && <>
      <div className="row">
        <label>Usage<select value={preset} onChange={e => onPreset(e.target.value)}>
          {Object.entries(PRESETS).map(([k, p]) => <option key={k} value={k}>{p.label}: {p.inM}M in + {p.outM}M out</option>)}
        </select></label>
        {modelSelect}
      </div>
      <div className="row">{tokenInputs}</div>
      <p className="src">The presets are illustrative assumptions, not measured usage. Change the token numbers to match yours. This ignores caching: real bills can be lower with caching, or higher with long contexts and retries.</p>
    </>}
    {mode === "spend" && <div className="row">
      <label>Monthly model spend<input type="number" inputMode="decimal" min={0} step="any" placeholder="from your API bill" value={spend} onChange={e => setSpend(e.target.value)} /></label>
      <label>Currency<select value={spendCur} onChange={e => setSpendCur(e.target.value)}><option>USD</option><option>GBP</option></select></label>
    </div>}
    {mode === "tokens" && <>
      <div className="row">{modelSelect}</div>
      <div className="row">{tokenInputs}</div>
      <div className="row">
        <label>Input price ($ per 1M)<input type="number" inputMode="decimal" min={0} step="any" value={inPrice} onChange={e => setInPrice(e.target.value)} /></label>
        <label>Output price ($ per 1M)<input type="number" inputMode="decimal" min={0} step="any" value={outPrice} onChange={e => setOutPrice(e.target.value)} /></label>
      </div>
      <p className="src">Picking a model fills in its listed prices. Edit them for caching, batch or another model.</p>
    </>}

    <div className="row">
      <label>USD → GBP rate<input type="number" inputMode="decimal" min={0} step="any" value={rate} onChange={e => onRate(e.target.value)} /></label>
    </div>
    <p className="src">Default is the ECB reference rate of {fxDate} (<a href={fxSource}>source</a>). Used for USD model prices and USD-priced plans, including the plan list above. EUR-priced plans keep the site's ECB EUR → GBP conversion, because this box is USD → GBP only.</p>

    <div className="cost-out" aria-live="polite">
      <p className="cost-total">Server £<b data-testid="server-gbp" id="server-gbp">{fmt(server)}</b> + Model £<b data-testid="model-gbp" id="model-gbp">{fmt(modelGbp)}</b> = Total £<b data-testid="total-gbp" id="total-gbp">{fmt(total)}</b> per month</p>
      <p>The model is <b data-testid="model-share" id="model-share">{share}%</b> of the total.</p>
      <p className="src">Server is the listed monthly price of {`${plan.provider} ${plan.plan}`} ({`${plan.currency === "EUR" ? "€" : plan.currency === "GBP" ? "£" : "$"}${plan.price.toFixed(2)} ${plan.currency}`}). {plan.billing_note
        ? <>Terms: <b data-testid="plan-terms" id="plan-terms">{plan.billing_note}</b>. An intro, upfront or yearly price isn't always what you'll pay each month, so check the <a href={`/provider/${plan.providerSlug}/`}>provider page</a>.</>
        : <span data-testid="plan-terms" id="plan-terms">No extra terms noted in the index.</span>}</p>
    </div>
  </div>);
}
