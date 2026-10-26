"use client";
import { useEffect, useRef } from "react";
import { BEEHIIV_FORM_ID as FORM_ID } from "../lib/site";

const LOADER = "https://subscribe-forms.beehiiv.com/v3/loader.js";
const SNIPPET = `<script async src="${LOADER}" data-beehiiv-form="${FORM_ID}"></script>`;

// The beehiiv embed. On a full page load the script in the static HTML already runs.
// After a client-side navigation, innerHTML scripts are inert, so inject a live one.
// Bare form only: SignupBar supplies the copy around it.
export default function BeehiivEmbed({ className = "" }) {
  const ref = useRef(null);
  const done = useRef(false); // dev Strict Mode runs effects twice; only act once
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const nav = performance.getEntriesByType?.("navigation")?.[0];
    const initialPath = nav ? new URL(nav.name).pathname : null;
    const isInitial = !window.__bhNavigated && initialPath === window.location.pathname;
    window.__bhNavigated = true;
    if (isInitial || !ref.current) return;
    ref.current.innerHTML = "";
    const s = document.createElement("script");
    s.async = true;
    s.src = LOADER;
    s.setAttribute("data-beehiiv-form", FORM_ID);
    ref.current.appendChild(s);
  }, []);
  return <div className={`bh-embed ${className}`.trim()} ref={ref} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: SNIPPET }} />;
}
