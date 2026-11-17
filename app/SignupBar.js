import BeehiivEmbed from "./NewsletterForm";
import { SUBSCRIBE_URL } from "../lib/site";

// variant "full": home page, below the table. variant "compact": every other page.
// showCopy false: the page already has the heading (newsletter index), so the bar is just
// the form + fallback. We cannot hide beehiiv's own iframe title from here.
// On viewports too narrow for the embed's 80px padding, CSS shows a public-signup button.
// Who makes this lives once in the footer, so it isn't repeated here.
export default function SignupBar({ variant = "full", id = "signup", showCopy = true }) {
  const full = variant === "full";
  const headId = `${id}-h`;
  const labelled = showCopy ? { "aria-labelledby": headId } : { "aria-label": "Subscribe to ClawHost Index Weekly" };
  return (
    <section className={full ? "signup" : "signup signup-compact"} id={id} {...labelled}>
      {showCopy && (
        <div className="signup-copy">
          {full
            ? <h2 id={headId}>Get the price changes by email</h2>
            : <p id={headId} className="signup-h">Get the price changes by email</p>}
          <p>One short email a week: what got cheaper, what got dearer, and anything I got wrong. Free, unsubscribe any time.</p>
          {full && <p className="gift">Also free: <a href="/gotchas/">7 hosting gotchas for running AI agents on a VPS</a>.</p>}
        </div>
      )}
      <div className="signup-form">
        <a className="btn signup-cta" href={SUBSCRIBE_URL} target="_blank" rel="noopener" aria-label="Subscribe on beehiiv (opens in a new tab)">Subscribe on beehiiv</a>
        <BeehiivEmbed />
        <p className="src signup-fallback">Form not loading? <a href={SUBSCRIBE_URL} target="_blank" rel="noopener">Subscribe on beehiiv</a>.</p>
      </div>
    </section>
  );
}
