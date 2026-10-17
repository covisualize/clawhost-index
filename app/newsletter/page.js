import NewsletterForm from "../NewsletterForm";
export const metadata = { title: "Newsletter — ClawHost Index", description: "Weekly price changes and new plans for hosting your AI agent. Free." };
export default function Newsletter() {
  return (<>
    <h1>Newsletter</h1>
    <p className="sub">One email a week: price changes, new plans and corrections from the index. Unsubscribe any time.</p>
    <NewsletterForm />
  </>);
}
