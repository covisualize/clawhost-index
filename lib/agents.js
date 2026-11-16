// What each agent's own docs say it needs. Checked 16 Nov 2026; every figure here has its source.
// minRamGb / comfyRamGb are the thresholds used to pick plans on /cost/ and /which-plan/.
// null means the docs give no official figure: say so on the page, don't fill it in.
export const AGENTS_CHECKED = "2026-11-16";

export const SRC = {
  hermesDocker: { label: "Hermes Docker docs", url: "https://hermes-agent.nousresearch.com/docs/user-guide/docker" },
  ocInstall: { label: "OpenClaw install page", url: "https://docs.openclaw.ai/install" },
  ocPi: { label: "OpenClaw Raspberry Pi guide", url: "https://docs.openclaw.ai/install/raspberry-pi" },
  ocFly: { label: "OpenClaw Fly.io guide", url: "https://docs.openclaw.ai/install/fly" },
  ocDo: { label: "OpenClaw DigitalOcean guide", url: "https://docs.openclaw.ai/install/digitalocean" },
  ocDocker: { label: "OpenClaw Docker guide", url: "https://docs.openclaw.ai/install/docker" },
  ocOllama: { label: "OpenClaw Ollama provider", url: "https://docs.openclaw.ai/providers/ollama" },
  ccSetup: { label: "Claude Code setup", url: "https://code.claude.com/docs/en/setup" },
};

export const AGENTS = [
  {
    id: "openclaw", name: "OpenClaw", minRamGb: 1, comfyRamGb: 2,
    minRam: "1 GB", comfyRam: "2 GB+", minVcpu: "1 core", comfyVcpu: null,
    notes: [
      "The main install page lists no RAM or CPU figure, only Node 24/26 and the OS.",
      "Raspberry Pi guide: \"Minimum: 1 GB RAM, 1 core, 500 MB free disk, 64-bit OS. Recommended: 2 GB+ RAM\".",
      "Fly.io guide: \"512MB is too small. 1GB may work but can OOM under load ... 2GB is recommended\".",
      "DigitalOcean guide: on a 1 GB droplet, add swap. Local LLM inference does not fit in 1 GB.",
      "Docker guide: at least 6 GB RAM for a local source image build. Pre-built images avoid this.",
    ],
    sources: [SRC.ocInstall, SRC.ocPi, SRC.ocFly, SRC.ocDo, SRC.ocDocker],
  },
  {
    id: "hermes", name: "Hermes", minRamGb: 1, comfyRamGb: 2,
    minRam: "1 GB", comfyRam: "2–4 GB", minVcpu: "1 core", comfyVcpu: "2 cores",
    notes: [
      "Disk: 500 MB minimum, 2 GB+ recommended.",
      "\"If you don't need browser tools, 1 GB is sufficient. With browser tools active, allocate at least 2 GB.\"",
      "Chromium in Docker needs --shm-size=1g.",
    ],
    sources: [SRC.hermesDocker],
  },
  {
    id: "claude-code", name: "Claude Code", minRamGb: 4, comfyRamGb: 4,
    minRam: "4 GB", comfyRam: "4 GB (no official higher recommendation)", minVcpu: null, comfyVcpu: null,
    notes: [
      "Official requirement: \"4 GB+ RAM, x64 or ARM64 processor\". No vCPU count is given.",
      "OS: Ubuntu 20.04+, Debian 10+ or Alpine 3.19+. Needs an internet connection.",
    ],
    sources: [SRC.ccSetup],
  },
];

// A plan supports an agent if it's a self-host plan ("Any …") or the provider lists that agent.
export const supports = (plan, agent) => plan.agents.some(a => a.startsWith("Any") || a === agent.name);
