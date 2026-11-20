import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Message } from "@/components/message";
import { ToolResult } from "@/components/tool-result";
import { ScoreCard } from "@/components/score-card";
import { SettingsForm } from "@/components/settings-form";
import { HandDialog, HandTabs, HandDisclosure } from "@/components/playground";
import { scoreLead } from "@/lib/qualification";
const input = {
  company: "Example Studio",
  project: "A new accessible website for our business.",
  budget: "5k-15k",
  timeline: "this-quarter",
  decisionMaker: true,
} as const;

describe("Qualification", () => {
  it("scores declared facts deterministically", () => {
    expect(scoreLead(input)).toMatchObject({ score: 80, category: "Priority" });
  });
  it("keeps unknown facts at zero", () => {
    expect(
      scoreLead({
        ...input,
        budget: "unknown",
        timeline: "unknown",
        decisionMaker: false,
      }).score,
    ).toBe(10);
  });
  it("rejects an empty project", () => {
    expect(() => scoreLead({ ...input, project: "" })).toThrow();
  });
  it("renders a real score card with its next action", () => {
    render(<ScoreCard lead={scoreLead(input)} />);
    expect(
      screen.getByRole("heading", { name: "Example Studio" }),
    ).toBeVisible();
    expect(
      screen.getByText("Offer a discovery call with the agency."),
    ).toBeVisible();
  });
  it("shows collecting input separately from executing", () => {
    const { rerender } = render(<ToolResult state="input-streaming" />);
    expect(screen.getByRole("status")).toHaveTextContent("Collecting");
    rerender(<ToolResult state="input-available" input={input} />);
    expect(screen.getByRole("status")).toHaveTextContent("Example Studio");
  });
  it("shows execution failure and malformed output safely", () => {
    const { rerender } = render(<ToolResult state="output-error" />);
    expect(screen.getByRole("alert")).toHaveTextContent("could not finish");
    rerender(<ToolResult state="output-available" output={{ score: 90 }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("incomplete data");
  });
  it("renders partial streamed text as plain text", () => {
    render(
      <Message
        message={{
          id: "1",
          role: "assistant",
          parts: [
            { type: "text", text: "**unfinished <script>bad()</script>" },
          ],
        }}
      />,
    );
    expect(
      screen.getByRole("article", { name: "Assistant message" }),
    ).toHaveTextContent("**unfinished <script>bad()</script>");
    expect(document.querySelector("script")).toBeNull();
  });
  it("renders a completed tool result inside a message", () => {
    render(
      <Message
        message={{
          id: "2",
          role: "assistant",
          parts: [
            {
              type: "dynamic-tool",
              toolName: "qualifyLead",
              toolCallId: "call-1",
              state: "output-available",
              input,
              output: scoreLead(input),
            },
          ],
        }}
      />,
    );
    expect(
      screen.getByRole("region", { name: "Qualification for Example Studio" }),
    ).toBeVisible();
  });
});
describe("Validated form", () => {
  it("associates useful errors with invalid fields", async () => {
    const user = userEvent.setup();
    render(<SettingsForm />);
    await user.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(screen.getByLabelText("Workspace name")).toBeInvalid();
    expect(screen.getByLabelText("Contact email")).toHaveAccessibleDescription(
      "Enter a valid email address.",
    );
  });
  it("saves valid preferences and restores them on remount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SettingsForm />);
    await user.type(screen.getByLabelText("Workspace name"), "Example agency");
    await user.type(screen.getByLabelText("Contact email"), "test@example.com");
    await user.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(screen.getByRole("status")).toHaveTextContent("saved");
    unmount();
    render(<SettingsForm />);
    expect(screen.getByLabelText("Workspace name")).toHaveValue(
      "Example agency",
    );
  });
});
describe("Accessible custom patterns", () => {
  it("focuses, traps, dismisses, and restores focus in the dialog", async () => {
    const user = userEvent.setup();
    render(<HandDialog />);
    const trigger = screen.getByRole("button", { name: "Open custom dialog" });
    await user.click(trigger);
    expect(screen.getByLabelText("Workspace name")).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Done" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("supports arrow, Home, and End navigation in tabs", async () => {
    const user = userEvent.setup();
    render(<HandTabs />);
    await user.click(screen.getByRole("tab", { name: "Overview" }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Scoring" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("fixed rubric");
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Privacy" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveFocus();
  });
  it("toggles disclosure with keyboard activation", async () => {
    const user = userEvent.setup();
    render(<HandDisclosure />);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
