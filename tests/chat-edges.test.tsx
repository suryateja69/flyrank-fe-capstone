import React from "react";
import { it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorPage from "@/app/error";
import { Message } from "@/components/message";
import { ChatRequestError, chatErrorMessage, hasReadableContent } from "@/lib/chat-transport";

it("gives useful network/rate-limit guidance without displaying raw errors", () => {
  expect(chatErrorMessage(new TypeError("Failed to fetch"))).toContain("internet connection");
  expect(chatErrorMessage(new ChatRequestError(429))).toContain("Wait a minute");
  expect(chatErrorMessage(new Error("private-provider-details"))).not.toContain("private-provider-details");
});
it("distinguishes no usable output from a text response", () => {
  expect(hasReadableContent({ id: "1", role: "assistant", parts: [] })).toBe(false);
  expect(hasReadableContent({ id: "1", role: "assistant", parts: [{ type: "text", text: "  " }] })).toBe(false);
  expect(hasReadableContent({ id: "1", role: "assistant", parts: [{ type: "text", text: "Could you tell me the project need?" }] })).toBe(true);
});
it("stops showing a running tool when the stream has ended", () => {
  render(<Message message={{ id: "partial", role: "assistant", parts: [{ type: "tool-qualifyLead", toolCallId: "one", state: "input-streaming", input: { company: "Wh" } }] }} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Qualification could not finish");
  expect(screen.queryByRole("status")).toBeNull();
});
it("route error boundary invokes Next's retry rather than merely resetting local state", () => {
  const retry = vi.fn();
  render(<ErrorPage error={new Error("private stack")} retry={retry} />);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
  expect(screen.getByRole("alert")).not.toHaveTextContent("private stack");
});
