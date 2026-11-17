import { pageMeta } from "../../lib/site";
import AffiliateNote from "../AffiliateNote";
import SignupBar from "../SignupBar";

export const metadata = pageMeta({
  title: "VPS security checklist for OpenClaw, Hermes and Claude Code",
  description: "Nine things to lock down on a VPS before you run an AI agent: SSH keys, a non-root user, a firewall, automatic updates, keeping agent gateways off the internet, API key files, spend limits, backups and fail2ban. Each step links to the official docs.",
  path: "/security/",
});

// Every link here was checked on the date below. Sources and the exact quotes are kept
// outside the repo. If a doc changes, re-check it before editing the wording.
const SRC = {
  ubuntuSsh: "https://ubuntu.com/server/docs/how-to/security/openssh-server/",
  sshdConfig: "https://man.openbsd.org/sshd_config",
  ubuntuUsers: "https://ubuntu.com/server/docs/how-to/security/user-management/",
  hermesSecurity: "https://hermes-agent.nousresearch.com/docs/user-guide/security",
  hermesMessaging: "https://hermes-agent.nousresearch.com/docs/user-guide/messaging/",
  ubuntuUfw: "https://ubuntu.com/server/docs/how-to/security/firewalls/",
  ubuntuUpdates: "https://ubuntu.com/server/docs/how-to/software/automatic-updates/",
  ocRemote: "https://docs.openclaw.ai/gateway/remote",
  ocSecurity: "https://docs.openclaw.ai/gateway/security",
  ocTailscale: "https://docs.openclaw.ai/gateway/tailscale",
  tsServe: "https://tailscale.com/kb/1312/serve",
  ocSecrets: "https://docs.openclaw.ai/gateway/security/secrets-and-storage",
  ccSettings: "https://code.claude.com/docs/en/settings",
  anthropicLimits: "https://platform.claude.com/docs/en/api/rate-limits",
  fail2ban: "https://github.com/fail2ban/fail2ban",
};

const Src = ({ links }) => (<p className="src">Source: {links.map(([label, url], i) => <span key={url}>{i > 0 && ", "}<a href={url}>{label}</a></span>)}</p>);

export default function Security() {
  return (<article className="prose security">
    <AffiliateNote />
    <p className="crumb"><a href="/">← All plans</a></p>
    <h1>VPS security checklist for AI agents</h1>
    <p className="checked-on">Last checked 17 Nov 2026</p>
    <p className="sub">Nine things to do on a new VPS before you run OpenClaw, Hermes or Claude Code. The commands are for Ubuntu. Each step links to the official page it comes from.</p>
    <p className="byline">By Charles. My Side Hustle CEO agent wrote this checklist and checks it. I review it. It's a starting point, not a full security audit.</p>

    <ol className="checklist">
      <li>
        <h2>SSH keys only, password login off</h2>
        <p>Make a key on your own computer and copy it to the server. Then turn off password login in <code>/etc/ssh/sshd_config</code>.</p>
        <pre><code>{`ssh-keygen -t ed25519
ssh-copy-id username@your-server

# on the server, in /etc/ssh/sshd_config:
PasswordAuthentication no

sudo sshd -t
sudo systemctl restart ssh.service`}</code></pre>
        <p>Also check the files in <code>/etc/ssh/sshd_config.d/</code>. Ubuntu reads them first, and OpenSSH uses the first value it finds, so a setting there can override yours.</p>
        <p>Keep your current session open and test a new login with the key before you log out.</p>
        <Src links={[["Ubuntu OpenSSH server", SRC.ubuntuSsh], ["sshd_config manual", SRC.sshdConfig]]} />
      </li>

      <li>
        <h2>Use a normal user with sudo, not root</h2>
        <p>Create your own user, add it to the <code>sudo</code> group and copy your key to it. Once that works, stop root logging in over SSH. Hermes says never to run its gateway as root.</p>
        <pre><code>{`sudo adduser yourname
sudo adduser yourname sudo

# in /etc/ssh/sshd_config:
PermitRootLogin no

sudo sshd -t
sudo systemctl restart ssh.service`}</code></pre>
        <p>Then open a new terminal and check that logging in as root is refused.</p>
        <Src links={[["Ubuntu user management", SRC.ubuntuUsers], ["Ubuntu OpenSSH server", SRC.ubuntuSsh], ["sshd_config manual", SRC.sshdConfig], ["Hermes security", SRC.hermesSecurity]]} />
      </li>

      <li>
        <h2>Turn on the firewall, allowing SSH first</h2>
        <p>ufw is off by default on Ubuntu. Allow SSH before you enable it, or you can lock yourself out. Only open other ports you actually need.</p>
        <pre><code>{`sudo ufw allow 22
sudo ufw enable
sudo ufw status`}</code></pre>
        <Src links={[["Ubuntu firewall", SRC.ubuntuUfw]]} />
      </li>

      <li>
        <h2>Keep automatic security updates on</h2>
        <p>Ubuntu installs security updates daily with <code>unattended-upgrades</code>, which is installed by default. Check both values below are <code>"1"</code> in <code>/etc/apt/apt.conf.d/20auto-upgrades</code>. If the package is missing, install it.</p>
        <pre><code>{`APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";

sudo apt install unattended-upgrades`}</code></pre>
        <Src links={[["Ubuntu automatic updates", SRC.ubuntuUpdates]]} />
      </li>

      <li>
        <h2>Keep agent gateways and dashboards off the internet</h2>
        <p>OpenClaw's gateway listens on loopback (port 18789) by default, and its docs say to keep it that way unless you're sure. Container images are the exception, as they default to an exposed bind. Reach it from your laptop with an SSH tunnel, or with Tailscale Serve, which only shares it inside your own tailnet. Don't use Tailscale Funnel for this, because Funnel is public.</p>
        <pre><code>{`ssh -N -L 18789:127.0.0.1:18789 user@gateway-host`}</code></pre>
        <p>Hermes's messaging gateway turns away anyone not on an allowlist or paired by default. Leave it that way.</p>
        <Src links={[["OpenClaw remote access", SRC.ocRemote], ["OpenClaw security", SRC.ocSecurity], ["OpenClaw and Tailscale", SRC.ocTailscale], ["Tailscale Serve", SRC.tsServe], ["Hermes messaging", SRC.hermesMessaging]]} />
      </li>

      <li>
        <h2>Lock down API key files and never commit them</h2>
        <p>Keep keys in the agent's env or config file, readable only by you. Never commit <code>.env</code> files to a repo. In Claude Code you can also stop it reading <code>.env</code> files with a deny rule in <code>~/.claude/settings.json</code>.</p>
        <pre><code>{`chmod 600 ~/.hermes/.env
chmod 700 ~/.openclaw
chmod 600 ~/.openclaw/openclaw.json`}</code></pre>
        <pre><code>{`{
  "permissions": {
    "deny": ["Read(./.env)", "Read(./.env.*)"]
  }
}`}</code></pre>
        <Src links={[["Hermes security", SRC.hermesSecurity], ["OpenClaw secrets and storage", SRC.ocSecrets], ["Claude Code settings", SRC.ccSettings]]} />
      </li>

      <li>
        <h2>Set a spend limit on your model API key</h2>
        <p>An agent left running can spend a lot. In the Claude Console you can set a monthly spend limit below your tier's cap, under Settings, Spend limits. You can also give the agent its own workspace with its own limit. You can't set one on the default workspace. If you use another provider, check whether it has a similar setting.</p>
        <Src links={[["Anthropic rate and spend limits", SRC.anthropicLimits]]} />
      </li>

      <li>
        <h2>Have backups and snapshots</h2>
        <p>Check whether your host offers snapshots or automatic backups, and what they cost. Take a snapshot before big changes. If you copy an agent's folder off the server, keep the copy private. OpenClaw says to assume anything under <code>~/.openclaw/</code> may contain secrets.</p>
        <Src links={[["OpenClaw secrets and storage", SRC.ocSecrets]]} />
      </li>

      <li>
        <h2>fail2ban (optional)</h2>
        <p>fail2ban watches log files and bans IP addresses with too many failed logins for a set time. With password login off, it's an extra layer rather than a must. Its own docs say it can't remove the risk of weak authentication, so do step 1 first.</p>
        <Src links={[["fail2ban", SRC.fail2ban]]} />
      </li>
    </ol>

    <p>Once the server is locked down, check <a href="/which-plan/">which plan suits your agent</a> or <a href="/">compare plans by price</a>.</p>
    <p className="src">If something here is wrong or out of date, reply to the newsletter and tell me. <a href="/disclosure/">Disclosure</a>.</p>
    <SignupBar variant="compact" />
  </article>);
}
