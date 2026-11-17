"use client";
import { useState } from "react";
export default function Calc() {
  const [agents, setA] = useState(1), [browser, setB] = useState(false), [docker, setD] = useState(false), [local, setL] = useState(false);
  let ram = 4 + (agents - 1) * 1; if (browser || docker) ram = Math.max(ram, 8); if (local) ram = Math.max(ram, 16);
  const vcpu = ram >= 16 ? 8 : ram >= 8 ? 4 : 2;
  return (<div className="calc">
    <div className="row"><label>Agents running<input type="number" min={1} max={10} value={agents} onChange={e=>setA(Math.max(1,+e.target.value))}/></label></div>
    <fieldset><legend>Also on the server</legend>
      <label><input type="checkbox" checked={browser} onChange={e=>setB(e.target.checked)}/> Browser automation</label>
      <label><input type="checkbox" checked={docker} onChange={e=>setD(e.target.checked)}/> Build Docker image on server</label>
      <label><input type="checkbox" checked={local} onChange={e=>setL(e.target.checked)}/> Run a small local model too</label>
    </fieldset>
    <div className="cost-out" aria-live="polite">
      <p className="cost-total">Suggested: <b>{vcpu} vCPU / {ram} GB RAM</b></p>
      <a className="btn" href="/">See matching plans</a>
    </div>
  </div>);
}
