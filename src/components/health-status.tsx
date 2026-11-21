"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

const healthSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("LeadDesk"),
  aiConfigured: z.boolean(),
  timestamp: z.iso.datetime(),
});

type Health = z.infer<typeof healthSchema>;

export function HealthStatus() {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Health | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 5000);
    setResult(null);
    setFailed(false);
    async function check() {
      try {
        const response = await fetch("/api/health", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Health request failed");
        const health = healthSchema.parse(await response.json());
        if (active) setResult(health);
      } catch {
        if (active) setFailed(true);
      } finally {
        clearTimeout(timeout);
      }
    }
    void check();
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  if (failed) {
    return (
      <div>
        <p role="alert">The health endpoint could not be fetched.</p>
        <button className="primary-button" onClick={() => setAttempt((value) => value + 1)}>
          Retry health check
        </button>
      </div>
    );
  }
  if (!result) return <p role="status">Checking service health…</p>;
  return (
    <div role="status">
      <p>Application API · {result.status}</p>
      <p>
        AI provider · {result.aiConfigured
          ? "Server key configured (provider call not checked)"
          : "Awaiting server key"}
      </p>
      <p>Fetched at {result.timestamp}</p>
    </div>
  );
}
