import { getPlans, FX } from "../../lib/plans";
import { pageMeta, fmtDate } from "../../lib/site";
import { MODELS, MODELS_CHECKED, PRICE_SOURCES, REPORTS } from "../../lib/models";
import { SRC } from "../../lib/agents";
import AffiliateNote from "../AffiliateNote";
import SignupBar from "../SignupBar";
import CostCalc from "./CostCalc";

export const metadata = pageMeta({
  title: "OpenClaw monthly cost: server plus model spend calculator",
  description: "Work out the monthly cost of running OpenClaw, Hermes or Claude Code: the server plus model API tokens, in GBP. Uses dated, sourced plan and model prices you can edit.",
  path: "/cost/",
});

const usd = (n) => `$${n < 1 ? n : n.toFixed(2)}`;

export default function Cost() {
  // Only what the calculator needs.
  const plans = getPlans().map(({ id, provider, plan, ram_gb, vcpu, gbp, price, currency, providerSlug, agents, type, billing_note }) =>
    ({ id, provider, plan, ram_gb, vcpu, gbp, price, currency, providerSlug, agents, type, billing_note }));
  const checked = fmtDate(MODELS_CHECKED);
  const A = PRICE_SOURCES;
  return (<>
    <p className="crumb"><a href="/">← All plans</a></p>
    <h1>What it really costs to run an AI agent a month</h1>
    <p className="sub intro">The server is usually the small part. What you spend on model API tokens usually dwarfs it. Pick your agent, a plan and roughly how much you use the model, and see both side by side.</p>
    <AffiliateNote />

    <CostCalc plans={plans} fxRate={FX.EUR_GBP / FX.EUR_USD} fxDate={fmtDate(FX.date)} fxSource={FX.source} />

    <h2>Prices used</h2>
    <p className="src">USD per 1 million tokens, standard short-context rates, checked {checked} on <a href={A.anthropic}>Anthropic's pricing page</a> and <a href={A.openai}>OpenAI's pricing page</a>. Server prices come from the <a href="/">plans table</a>.</p>
    <div className="scroll"><table className="compact">
      <thead><tr><th>Model</th><th>Input</th><th>Output</th><th>Cached input</th><th>Source</th></tr></thead>
      <tbody>{MODELS.map(m => <tr key={m.id}>
        <td>{m.vendor} {m.name}</td><td>{usd(m.inUsd)}</td><td>{usd(m.outUsd)}</td>
        <td>{m.cachedUsd != null ? usd(m.cachedUsd) : "0.1× input (most models)"}</td>
        <td className="src"><a href={m.source} rel="nofollow">source</a> · checked {checked}</td>
      </tr>)}</tbody>
    </table></div>
    <p className="src">Anthropic also lists 5-minute cache writes at 1.25× base input, and the Batch API at 50% off input and output (<a href={A.anthropic}>source</a>, checked {checked}).</p>

    <h2>What other people report</h2>
    <p className="src">These are one person's report each, from Reddit. They're anecdotes, not typical or verified figures.</p>
    <ul>{REPORTS.map(r => <li key={r.url}>{r.text} <span className="src"><a href={r.url} rel="nofollow">{r.where}{r.date ? `, ${fmtDate(r.date)}` : ""}</a></span></li>)}</ul>

    <article className="prose">
      <h2>How to cut model spend</h2>
      <p><b>Use a cheaper model for routine work.</b> Prices vary a lot. Claude Haiku 4.5 is $1 in and $5 out per million tokens, and Claude Opus 5 is $5 and $25, five times as much (<a href={A.anthropic}>Anthropic pricing</a>). On OpenAI, gpt-5-mini is $0.25 and $2, and gpt-5.4 is $2.50 and $15 (<a href={A.openai}>OpenAI pricing</a>). Keep the expensive model for the hard tasks. One <a href={REPORTS[1].url} rel="nofollow">Reddit post</a> describes a cut from $340 to $112 a month, mostly from this and caching. That's one person's account, not a promise.</p>
      <p><b>Turn on prompt caching.</b> Agents send the same long instructions again and again. On Anthropic, cached reads cost about 0.1× the base input price on most models (<a href={A.anthropicCaching}>prompt caching docs</a>). OpenAI lists a separate, cheaper "cached input" price for each model, for example $0.025 instead of $0.25 for gpt-5-mini (<a href={A.openai}>OpenAI pricing</a>). The calculator above ignores caching, so your bill may come in lower.</p>
      <p><b>Set a spend limit and alerts.</b> Anthropic lets you set your own monthly spend limit in the Claude Console (<a href={A.anthropicLimits}>rate limits docs</a>). OpenAI has spend limits and spend alerts for an organisation or a project (<a href={A.openaiLimits}>spend limits guide</a>). Set one before you leave an agent running overnight.</p>
      <p><b>Batch jobs that can wait.</b> Anthropic's Batch API is 50% off input and output (<a href={A.anthropic}>Anthropic pricing</a>). It suits reports, summaries and other work that doesn't need an answer straight away.</p>
      <p><b>Local models, where realistic.</b> OpenClaw can use local models through Ollama (<a href={SRC.ocOllama.url}>OpenClaw Ollama docs</a>). But its DigitalOcean guide says local LLM inference does not fit in 1 GB (<a href={SRC.ocDo.url}>source</a>), and a useful local model needs far more RAM than the cheap plans here. For most people on a small VPS, a hosted model is the realistic choice.</p>
      <p>Not sure which server to pick? See <a href="/which-plan/">which plan for which agent</a> or the <a href="/calculator/">server size calculator</a>.</p>
    </article>
    <SignupBar variant="compact" />
  </>);
}
