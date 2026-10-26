import fs from "fs";
import path from "path";
import { fmtDate } from "./site";

const FILE = /^(\d{4}-\d{2}-\d{2})-issue-(\d+)\.md$/;

// Past issues are mirrored from the newsletter source into content/issues/YYYY-MM-DD-issue-N.md.
// Format: "Subject: ..." line, "Preview: ..." line, blank line, then the email body.
export function getIssues() {
  const dir = path.join(process.cwd(), "content", "issues");
  return fs.readdirSync(dir).filter(f => FILE.test(f)).map(f => {
    const [, date, num] = f.match(FILE);
    const raw = fs.readFileSync(path.join(dir, f), "utf8").replace(/\r\n/g, "\n");
    const subject = raw.match(/^Subject:\s*(.+)$/m)?.[1].trim();
    if (!subject) throw new Error(`${f}: missing "Subject:" line`);
    const preview = raw.match(/^Preview:\s*(.+)$/m)?.[1].trim() || "";
    const body = raw.replace(/^(Subject|Preview):.*$/gm, "").trim();
    const n = +num;
    return { n, date, dateLabel: fmtDate(date), subject, title: subject.replace(/^ClawHost Index Weekly #\d+:\s*/, ""), preview, body, slug: `issue-${n}`, href: `/newsletter/issue-${n}/` };
  }).sort((a, b) => b.n - a.n);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = (s) => esc(s)
  .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
  .replace(/(https?:\/\/[^\s<]+?)([.,;:)]*)(\s|$)/g, '<a href="$1">$1</a>$2$3')
  .replace(/\n/g, "<br/>");

// Tiny renderer for the subset used in the issues: paragraphs, **bold**, line breaks, bare URLs.
// A paragraph that opens with a bold line on its own ("**Hetzner**") becomes a heading.
export function renderBody(md) {
  return md.split(/\n{2,}/).map(par => {
    const p = par.trim();
    const head = p.match(/^\*\*(.+?)\*\*\n([\s\S]+)$/);
    if (head) return `<h2>${esc(head[1])}</h2>\n<p>${inline(head[2])}</p>`;
    return `<p>${inline(p)}</p>`;
  }).join("\n");
}
