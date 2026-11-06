"use client";
import { useEffect, useRef } from "react";
import { BEEHIIV_FORM_ID as FORM_ID } from "../lib/site";

const LOADER = "https://subscribe-forms.beehiiv.com/v3/loader.js";
const SNIPPET = `<script async src="${LOADER}" data-beehiiv-form="${FORM_ID}"></script>`;

// The beehiiv iframe is cross-origin, so we only set host-side attributes (title, width).
// Padding, heading and field layout live inside the iframe and cannot be restyled here.
function markIframe(root) {
  const iframe = root.querySelector("iframe");
  if (!iframe) return false;
  iframe.setAttribute("title", "Subscribe to ClawHost Index Weekly");
  iframe.style.maxWidth = "560px";
  iframe.style.width = "100%";
  iframe.style.border = "0";
  iframe.style.display = "block";
  return true;
}

// The beehiiv embed. On a full page load the script in the static HTML already runs.
// After a client-side navigation, innerHTML scripts are inert, so inject a live one.
// Bare form only: SignupBar supplies the copy around it.
export default function BeehiivEmbed({ className = "" }) {
  const ref = useRef(null);
  const done = useRef(false); // dev Strict Mode runs effects twice; only act once
  useEffect(() => {
    if (!done.current) {
      done.current = true;
      const nav = performance.getEntriesByType?.("navigation")?.[0];
      const initialPath = nav ? new URL(nav.name).pathname : null;
      const isInitial = !window.__bhNavigated && initialPath === window.location.pathname;
      window.__bhNavigated = true;
      if (!isInitial && ref.current) {
        ref.current.innerHTML = "";
        const s = document.createElement("script");
        s.async = true;
        s.src = LOADER;
        s.setAttribute("data-beehiiv-form", FORM_ID);
        ref.current.appendChild(s);
      }
    }
    if (!ref.current) return undefined;
    if (markIframe(ref.current)) return undefined;
    const mo = new MutationObserver(() => {
      if (ref.current && markIframe(ref.current)) mo.disconnect();
    });
    mo.observe(ref.current, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);
  return <div className={`bh-embed ${className}`.trim()} ref={ref} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: SNIPPET }} />;
}
