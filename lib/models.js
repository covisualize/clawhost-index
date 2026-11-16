// Model API prices used on /cost/, USD per 1M tokens, standard (short-context) rates.
// Checked 16 Nov 2026 on each vendor's own pricing page. Don't add a model without a source.
export const MODELS_CHECKED = "2026-11-16";

export const PRICE_SOURCES = {
  anthropic: "https://platform.claude.com/docs/en/about-claude/pricing",
  openai: "https://developers.openai.com/api/docs/pricing",
  anthropicCaching: "https://platform.claude.com/docs/en/build-with-claude/prompt-caching",
  anthropicLimits: "https://platform.claude.com/docs/en/api/rate-limits",
  openaiLimits: "https://developers.openai.com/api/docs/guides/spend-limits",
};

// cachedUsd: OpenAI lists a cached-input price. Anthropic gives a multiplier instead (see page).
export const MODELS = [
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", vendor: "Anthropic", inUsd: 1, outUsd: 5, cachedUsd: null, source: PRICE_SOURCES.anthropic },
  { id: "claude-sonnet-5", name: "Claude Sonnet 5", vendor: "Anthropic", inUsd: 2, outUsd: 10, cachedUsd: null, source: PRICE_SOURCES.anthropic },
  { id: "claude-opus-5", name: "Claude Opus 5", vendor: "Anthropic", inUsd: 5, outUsd: 25, cachedUsd: null, source: PRICE_SOURCES.anthropic },
  { id: "gpt-5-mini", name: "gpt-5-mini", vendor: "OpenAI", inUsd: 0.25, outUsd: 2, cachedUsd: 0.025, source: PRICE_SOURCES.openai },
  { id: "gpt-5.4-mini", name: "gpt-5.4-mini", vendor: "OpenAI", inUsd: 0.75, outUsd: 4.5, cachedUsd: 0.075, source: PRICE_SOURCES.openai },
  { id: "gpt-5.4", name: "gpt-5.4 (under 272K context)", vendor: "OpenAI", inUsd: 2.5, outUsd: 15, cachedUsd: 0.25, source: PRICE_SOURCES.openai },
];
export const DEFAULT_MODEL = "claude-sonnet-5";

// Illustrative assumptions, not measurements. Millions of tokens a month. The page says so.
export const PRESETS = {
  light: { label: "Light", inM: 5, outM: 0.5 },
  medium: { label: "Medium", inM: 20, outM: 2 },
  heavy: { label: "Heavy", inM: 80, outM: 8 },
};

// One person's report each. Anecdotes, not typical or verified figures.
export const REPORTS = [
  {
    where: "Reddit r/better_claw", date: "2026-04-24",
    url: "https://www.reddit.com/r/better_claw/comments/1sui7xe/actual_monthly_cost_comparison_selfhosted/",
    text: "Self-hosted OpenClaw on Hetzner for a Telegram support bot: \"$4.49 VPS + ~$45 api costs\" for the month.",
  },
  {
    where: "Reddit r/openclaw", date: null,
    url: "https://www.reddit.com/r/openclaw/comments/1rl2z70/i_tracked_every_dollar_my_openclaw_agents_spent/",
    text: "A small SaaS running four OpenClaw agents cut its monthly bill from $340 to $112, mostly through prompt caching and cheaper models for simple tasks (\"like 80% of the reduction\").",
  },
];
