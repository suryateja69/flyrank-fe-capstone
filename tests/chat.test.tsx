import React from "react";
import { it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chat } from "@/components/chat";
const mocks = vi.hoisted(() => ({
  sendMessage: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn(),
  regenerate: vi.fn().mockResolvedValue(undefined),
  setMessages: vi.fn(),
  clearError: vi.fn(),
  status: "ready",
  error: undefined as Error | undefined,
}));
vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({ ...mocks, messages: [] }),
}));
beforeEach(() => {
  mocks.status = "ready";
  mocks.error = undefined;
  vi.clearAllMocks();
});
it("offers useful first-run suggestions and rejects an empty message", () => {
  render(<Chat />);
  expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  expect(
    screen.getByRole("button", { name: /exploring a new website/ }),
  ).toBeVisible();
});
it("submits a message once and clears the composer", async () => {
  const user = userEvent.setup();
  render(<Chat />);
  await user.type(
    screen.getByLabelText("Describe your project"),
    "A company website",
  );
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect(mocks.sendMessage).toHaveBeenCalledExactlyOnceWith({
    text: "A company website",
  });
  expect(screen.getByLabelText("Describe your project")).toHaveValue("");
});
it("announces pending state and exposes a working stop control", async () => {
  mocks.status = "submitted";
  const user = userEvent.setup();
  render(<Chat />);
  expect(screen.getByText("Thinking about your project…")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Stop generation" }));
  expect(mocks.stop).toHaveBeenCalledOnce();
});
it("keeps a stop control available during streaming", () => {
  mocks.status = "streaming";
  render(<Chat />);
  expect(screen.getByRole("button", { name: "Stop generation" })).toBeEnabled();
  expect(screen.getByRole("log", { name: "Conversation" })).toHaveAttribute(
    "aria-live",
    "polite",
  );
});
it("renders an error and retries the failed response", async () => {
  mocks.status = "error";
  mocks.error = new Error("Connection interrupted");
  const user = userEvent.setup();
  render(<Chat />);
  expect(screen.getByRole("alert")).toHaveTextContent("Connection interrupted");
  await user.click(screen.getByRole("button", { name: "Retry last response" }));
  expect(mocks.regenerate).toHaveBeenCalledOnce();
});
