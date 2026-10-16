import Calc from "./Calc";
export default function Page() { return (<><h1>How big a server does my agent need?</h1><p className="sub">Rule of thumb (estimates, not benchmarks): 4 GB for one person on a hosted model; 8 GB for browser automation or Docker builds (OpenClaw docs ask 6 GB+ for a source build).</p><Calc /></>); }
