import { CHANGELOG } from "../../lib/changelog";
import { pageMeta, fmtDate } from "../../lib/site";
import AffiliateNote from "../AffiliateNote";

export const metadata = pageMeta({
  title: "Changelog: price and plan changes by date",
  description: "Price and plan changes on ClawHost Index, newest first, taken from the weekly re-checks.",
  path: "/changelog/",
});

export default function Page() {
  return (<div className="prose">
    <AffiliateNote />
    <h1>Changelog</h1>
    <p className="lede">Price and plan changes from the weekly re-checks, newest first.</p>
    <ol className="changes">{CHANGELOG.map(e => <li key={e.date}>
      <h2><time dateTime={e.date}>{fmtDate(e.date)}</time></h2>
      <ul>{e.items.map(t => <li key={t}>{t}</li>)}</ul>
      {e.links && <p className="src">See: {e.links.map(([href, label], i) => <span key={href}>{i > 0 && " · "}<a href={href}>{label}</a></span>)}</p>}
    </li>)}</ol>
    <p className="next">The current prices are on the <a href="/">plans list</a> and in the <a href="/data/">open data file</a>.</p>
  </div>);
}
