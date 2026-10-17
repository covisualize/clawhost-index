"use client";
import { useEffect, useRef } from "react";

const FORM_ID = "5596c3fb-7d3f-49e8-bcbb-91c62f2d95a1";
const LOADER = "https://subscribe-forms.beehiiv.com/v3/loader.js";
export const SUBSCRIBE_URL = "https://charles-newsletter-3ab0b4.beehiiv.com/subscribe";
const SNIPPET = `<script async src="${LOADER}" data-beehiiv-form="${FORM_ID}"></script>`;

let usedInitialLoad = false;

export default function NewsletterForm() {
  const ref = useRef(null);
  useEffect(() => {
    // On a full page load the browser already ran the script from the static HTML.
    // After client-side navigation, innerHTML scripts are inert, so inject a live one.
    const nav = performance.getEntriesByType?.("navigation")?.[0];
    const initialPath = nav ? new URL(nav.name).pathname : null;
    const isInitial = !usedInitialLoad && initialPath === window.location.pathname;
    usedInitialLoad = true;
    if (isInitial || !ref.current) return;
    ref.current.innerHTML = "";
    const s = document.createElement("script");
    s.async = true;
    s.src = LOADER;
    s.setAttribute("data-beehiiv-form", FORM_ID);
    ref.current.appendChild(s);
  }, []);
  return (
    <div className="box newsletter">
      <b>ClawHost Index Weekly</b>
      <p className="sub" style={{margin:"6px 0 10px"}}>Weekly price changes and new plans for hosting your AI agent. Free.</p>
      <div ref={ref} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: SNIPPET }} />
      <p className="src" style={{marginTop:8}}>Form not loading? <a href={SUBSCRIBE_URL} target="_blank" rel="noopener">Subscribe on beehiiv</a>.</p>
    </div>
  );
}
