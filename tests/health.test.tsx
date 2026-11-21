import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HealthStatus } from "@/components/health-status";

const health = {
  status: "ok",
  service: "LeadDesk",
  aiConfigured: false,
  timestamp: "2026-11-21T12:00:00.000Z",
};

describe("Health status", () => {
  it("shows loading, then the actual same-origin response", async () => {
    let resolve!: (value: Response) => void;
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise((done) => { resolve = done; }));
    render(<HealthStatus />);
    expect(screen.getByRole("status")).toHaveTextContent("Checking service health");
    resolve(Response.json(health));
    expect(await screen.findByText(`Fetched at ${health.timestamp}`)).toBeVisible();
    expect(fetch).toHaveBeenCalledWith("/api/health", expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }));
    expect(screen.getByRole("status")).toHaveTextContent("Awaiting server key");
  });

  it.each([Response.json({}, { status: 503 }), Response.json({ ...health, aiConfigured: "yes" })])("rejects failed or malformed responses and recovers on retry", async (response) => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response).mockResolvedValueOnce(Response.json({ ...health, aiConfigured: true }));
    render(<HealthStatus />);
    expect(await screen.findByRole("alert")).toHaveTextContent("could not be fetched");
    await userEvent.click(screen.getByRole("button", { name: "Retry health check" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Server key configured (provider call not checked)"));
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("cancels the request on unmount", () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
    const { unmount } = render(<HealthStatus />);
    const signal = fetch.mock.calls[0][1]?.signal;
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});
