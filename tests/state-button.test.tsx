import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { StateButton } from "@/components/state-button";
import { ButtonDemo } from "@/components/button-demo";
afterEach(() => vi.useRealTimers());

it("locks repeated activation, announces loading, shows success, and returns to idle", async () => {
  vi.useFakeTimers();
  let complete!: () => void;
  const action = vi.fn(() => new Promise<void>(resolve => { complete = resolve; }));
  render(<StateButton action={action} />);
  fireEvent.click(screen.getByRole("button", { name: "Save demo draft" }));
  fireEvent.click(screen.getByRole("button", { name: "Saving demo draft" }));
  expect(action).toHaveBeenCalledOnce();
  expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  await act(async () => complete());
  expect(screen.getByRole("button", { name: "Demo draft saved" })).toHaveAttribute("aria-disabled", "true");
  act(() => vi.advanceTimersByTime(1800));
  expect(screen.getByRole("button", { name: "Save demo draft" })).toHaveAttribute("aria-busy", "false");
});
it("offers error retry and cannot let the old result timer erase a new loading state", async () => {
  vi.useFakeTimers();
  let complete!: () => void;
  const action = vi.fn().mockRejectedValueOnce(new Error("Failure"))
    .mockImplementationOnce(() => new Promise<void>(resolve => { complete = resolve; }));
  render(<StateButton action={action} />);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Save demo draft" })));
  fireEvent.click(screen.getByRole("button", { name: "Retry demo save" }));
  act(() => vi.advanceTimersByTime(4000));
  expect(screen.getByRole("button", { name: "Saving demo draft" })).toBeInTheDocument();
  await act(async () => complete());
  expect(screen.getByRole("button", { name: "Demo draft saved" })).toBeInTheDocument();
});
it("blocks disabled activation and aborts a pending action on unmount", () => {
  let signal: AbortSignal | undefined;
  const action = vi.fn((next: AbortSignal) => { signal = next; return new Promise<void>(() => {}); });
  const view = render(<StateButton action={action} disabled />);
  fireEvent.click(screen.getByRole("button", { name: "Saving unavailable" }));
  expect(action).not.toHaveBeenCalled();
  view.rerender(<StateButton action={action} />);
  fireEvent.click(screen.getByRole("button", { name: "Save demo draft" }));
  view.unmount();
  expect(signal?.aborted).toBe(true);
});
it("exposes forced failure and cancels the demo safely when reset mid-flight", async () => {
  vi.useFakeTimers();
  render(<ButtonDemo />);
  fireEvent.click(screen.getByLabelText("Force failure"));
  fireEvent.click(screen.getByRole("button", { name: "Save demo draft" }));
  await act(async () => vi.advanceTimersByTime(1200));
  expect(screen.getByRole("status")).toHaveTextContent("Simulated save failed");
  fireEvent.click(screen.getByLabelText("Force success"));
  fireEvent.click(screen.getByRole("button", { name: "Retry demo save" }));
  fireEvent.click(screen.getByRole("button", { name: "Reset demo" }));
  await act(async () => vi.runAllTimers());
  expect(screen.getByRole("status")).toHaveTextContent("Demo reset");
  expect(screen.getByText("Attempts started:")).toHaveTextContent("0");
  expect(screen.getByRole("button", { name: "Save demo draft" })).toBeInTheDocument();
});
