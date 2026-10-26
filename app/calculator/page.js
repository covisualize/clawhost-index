import Calc from "./Calc";
import SignupBar from "../SignupBar";
import { pageMeta } from "../../lib/site";

export const metadata = pageMeta({
  title: "How much RAM does my AI agent need? Server size calculator",
  description: "A rough guide to the VPS size you need for OpenClaw, Hermes or Claude Code: 4 GB for one person on a hosted model, 8 GB for browser automation or Docker builds. Estimates, not benchmarks.",
  path: "/calculator/",
});

export default function Page() { return (<><h1>How big a server does my agent need?</h1><p className="sub">A rough guide, not a benchmark. 4 GB suits one person on a hosted model. 8 GB suits browser automation or Docker builds, and OpenClaw's docs ask for 6 GB or more for a source build.</p><Calc /><SignupBar variant="compact" /></>); }
