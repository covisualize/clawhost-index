import BeehiivEmbed from "./NewsletterForm";
import { SUBSCRIBE_URL } from "../lib/site";

// variant "full": home page bar above the table. variant "compact": every other page.
// Markup order is heading, form, then the who-makes-this line, so on a phone the form
// sits straight under the heading. On wider screens the form moves to the right column.
// The id lets other links jump to the form (#signup).
export default function SignupBar({ variant = "full", id = "signup" }) {
  const full = variant === "full";
  const headId = `${id}-h`;
  return (
    <section className={full ? "signup" : "signup signup-compact"} id={id} aria-labelledby={headId}>
      <div className="signup-copy">
        {full
          ? <h2 id={headId}>Get the price changes by email</h2>
          : <p id={headId} className="signup-h">Get the price changes by email</p>}
        <p>One short email a week: what got cheaper, what got dearer, and anything I got wrong. Free, unsubscribe any time.</p>
      </div>
      <div className="signup-form">
        <BeehiivEmbed />
        <p className="src">Form not loading? <a href={SUBSCRIBE_URL} target="_blank" rel="noopener">Subscribe on beehiiv</a>.</p>
      </div>
      <p className="signup-who src">Sent by Charles. My Grok Bot finds the hosts and checks every price on the provider's own page. I review what it finds before it goes out. <a href="/disclosure/#who">How this works</a></p>
      {full && <p className="gift">Also free: <a href="/gotchas/"><b>7 hosting gotchas for running AI agents on a VPS</b></a>. Renewal prices, upfront terms, intro prices, VAT and the Oracle free tier.</p>}
    </section>
  );
}
