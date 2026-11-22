"use client";

import { useCallback, useState } from "react";
import { StateButton, type ActionPhase } from "./state-button";

type Outcome = "success" | "error";
export function ButtonDemo() {
  const [outcome, setOutcome] = useState<Outcome>("success");
  const [disabled, setDisabled] = useState(false);
  const [phase, setPhase] = useState<ActionPhase>("idle");
  const [attempts, setAttempts] = useState(0);
  const [lastResult, setLastResult] = useState("Choose an outcome, then activate the button.");
  const [version, setVersion] = useState(0);
  const updatePhase = useCallback((next: ActionPhase) => {
    setPhase(next);
    if (next === "success") setLastResult("Simulated save completed. No data left this page.");
    if (next === "error") setLastResult("Simulated save failed. Switch to success and retry, or try the failure again.");
  }, []);
  const save = (signal: AbortSignal): Promise<void> => {
    setAttempts(count => count + 1);
    // Capture this attempt's outcome. Changing the radio cannot change it mid-flight.
    const chosen = outcome;
    return new Promise((resolve, reject) => {
      const onAbort = () => { window.clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); };
      const timer = window.setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        if (chosen === "error") reject(new Error("Demonstration failure"));
        else resolve();
      }, 1200);
      signal.addEventListener("abort", onAbort, { once: true });
      if (signal.aborted) onAbort();
    });
  };
  return (
    <section className="button-demo" aria-labelledby="button-demo-title">
      <div className="button-demo__controls">
        <p className="eyebrow">YOU PICK THE OUTCOME</p>
        <h2 id="button-demo-title">One action. Clear feedback.</h2>
        <p>A simulated 1.2-second save makes every state easy to inspect. Nothing is stored or sent.</p>
        <fieldset className="outcome-options">
          <legend>Next attempt</legend>
          <label><input type="radio" name="outcome" checked={outcome === "success"} onChange={() => setOutcome("success")} /> Force success</label>
          <label><input type="radio" name="outcome" checked={outcome === "error"} onChange={() => setOutcome("error")} /> Force failure</label>
        </fieldset>
        <label className="button-demo__toggle"><input type="checkbox" checked={disabled} onChange={event => setDisabled(event.target.checked)} /> Disable button</label>
        <button className="button-demo__reset" type="button" onClick={() => {
          setVersion(value => value + 1); setPhase("idle"); setAttempts(0); setDisabled(false);
          setLastResult("Demo reset. Any pending simulated save was cancelled.");
        }}>Reset demo</button>
      </div>
      <div className="button-demo__stage">
        <p className="eyebrow">SAVE A DEMO DRAFT</p>
        <StateButton key={version} action={save} disabled={disabled} onPhaseChange={updatePhase} />
        <p className="button-demo__instruction">Hover or Tab to focus. Enter, Space, or click to activate.</p>
        <div className="button-demo__feedback" role="status" aria-live="polite" aria-atomic="true">
          <span className="pill">{phase === "loading" ? "loading" : disabled ? "disabled" : phase}</span>
          <p>{phase === "loading" ? "Saving the demo draft. Repeated activations are ignored." : lastResult}</p>
        </div>
        <p className="button-demo__attempts">Attempts started: <strong>{attempts}</strong></p>
      </div>
    </section>
  );
}
