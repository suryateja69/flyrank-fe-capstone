"use client";

import { Check, LoaderCircle, LockKeyhole, Save, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type ActionPhase = "idle" | "loading" | "success" | "error";
const labels = {
  idle: "Save demo draft",
  loading: "Saving demo draft",
  success: "Demo draft saved",
  error: "Retry demo save",
  disabled: "Saving unavailable",
} as const;

export function StateButton({ action, disabled = false, onPhaseChange }: {
  action: (signal: AbortSignal) => Promise<void>;
  disabled?: boolean;
  onPhaseChange?: (phase: ActionPhase) => void;
}) {
  const [phase, setPhase] = useState<ActionPhase>("idle");
  const busy = useRef(false);
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const display = disabled && phase !== "loading" ? "disabled" : phase;
  const change = (next: ActionPhase) => { setPhase(next); onPhaseChange?.(next); };

  useEffect(() => () => {
    generation.current++;
    controller.current?.abort();
  }, []);

  useEffect(() => {
    if (phase !== "success" && phase !== "error") return;
    const timer = window.setTimeout(() => {
      setPhase("idle");
      onPhaseChange?.("idle");
    }, phase === "success" ? 1800 : 3200);
    return () => window.clearTimeout(timer);
  }, [phase, onPhaseChange]);

  const run = async () => {
    // Synchronous guard covers repeated pointer/keyboard events before React paints.
    if (disabled || busy.current || phase === "success") return;
    busy.current = true;
    const id = ++generation.current;
    controller.current = new AbortController();
    change("loading");
    try {
      await action(controller.current.signal);
      if (id === generation.current) change("success");
    } catch {
      if (id === generation.current) change("error");
    } finally {
      if (id === generation.current) busy.current = false;
    }
  };
  const faces = [
    ["idle", Save], ["loading", LoaderCircle], ["success", Check],
    ["error", RotateCcw], ["disabled", LockKeyhole],
  ] as const;

  return (
    <button type="button" className="state-button" data-phase={display}
      aria-label={labels[display]} aria-busy={phase === "loading"}
      aria-disabled={disabled || phase === "loading" || phase === "success"}
      disabled={disabled} onClick={() => { void run(); }}>
      {faces.map(([name, Icon]) => (
        <span key={name} aria-hidden="true"
          className={`state-button__face state-button__face--${name} ${display === name ? "is-visible" : ""}`}>
          <span className="state-button__content">
            <Icon size={19} className={name === "loading" ? "state-button__spinner" : undefined} />
            <span>{labels[name]}</span>
          </span>
        </span>
      ))}
    </button>
  );
}
