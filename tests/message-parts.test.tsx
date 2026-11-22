import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Message } from "@/components/message";
import type { LeadMessage } from "@/lib/tools";
import { scoreLead } from "@/lib/qualification";

const input = { company: "Example Studio", project: "An accessible repair booking website", budget: "5k-15k", timeline: "this-quarter", decisionMaker: true } as const;
type Part = LeadMessage["parts"][number];
const show = (part: Part, streaming = false) => render(<Message message={{ id: "message", role: "assistant", parts: [part] }} streaming={streaming} />);

describe("typed message tool parts", () => {
  it("renders partial input while the assistant is still streaming", () => {
    show({ type: "tool-qualifyLead", toolCallId: "call", state: "input-streaming", input: { company: "Ex" } }, true);
    expect(screen.getByRole("status")).toHaveTextContent("Collecting project details");
    expect(screen.queryByRole("region")).toBeNull();
  });
  it("renders the validated input summary during execution", () => {
    show({ type: "tool-qualifyLead", toolCallId: "call", state: "input-available", input }, true);
    expect(screen.getByRole("status")).toHaveTextContent("Scoring the inquiry");
    expect(screen.getAllByRole("term")).toHaveLength(5);
    expect(screen.getByText("Purchasing authority")).toBeVisible();
    expect(screen.getByText("Confirmed")).toBeVisible();
  });
  it("renders output as a qualification component", () => {
    show({ type: "tool-qualifyLead", toolCallId: "call", state: "output-available", input, output: scoreLead(input) });
    expect(screen.getByRole("region", { name: "Qualification for Example Studio" })).toHaveTextContent("80");
    expect(screen.getByText("Offer a discovery call with the agency.")).toBeVisible();
  });
  it("contains a failed tool part without revealing the raw execution error", () => {
    show({ type: "tool-qualifyLead", toolCallId: "call", state: "output-error", input, errorText: "private-provider-error" });
    expect(screen.getByRole("alert")).toHaveTextContent("Qualification could not finish");
    expect(screen.getByRole("article")).not.toHaveTextContent("private-provider-error");
  });
  it("supports the dynamic form of the same known tool", () => {
    show({ type: "dynamic-tool", toolName: "qualifyLead", toolCallId: "call", state: "output-available", input, output: scoreLead(input) });
    expect(screen.getByRole("region", { name: "Qualification for Example Studio" })).toBeVisible();
  });
  it("rejects malformed dynamic output rather than rendering a bogus score", () => {
    show({ type: "dynamic-tool", toolName: "qualifyLead", toolCallId: "call", state: "output-available", input, output: { score: "bad" } });
    expect(screen.getByRole("alert")).toHaveTextContent("incomplete data");
    expect(screen.queryByRole("region")).toBeNull();
  });
});

it("keeps text parts in order and renders markup as literal text", () => {
  render(<Message message={{ id: "text", role: "user", parts: [{ type: "text", text: "First part." }, { type: "text", text: "<script>unsafe()</script>" }] }} />);
  const article = screen.getByRole("article", { name: "Your message" });
  expect(article).toHaveTextContent("First part.<script>unsafe()</script>");
  expect(screen.queryByRole("link")).toBeNull();
});

const hiddenParts: Part[] = [
  { type: "reasoning", text: "private reasoning" },
  { type: "step-start" },
  { type: "source-url", sourceId: "source", url: "https://example.com/private-source", title: "private source" },
  { type: "source-document", sourceId: "source", mediaType: "text/plain", title: "private document" },
  { type: "file", mediaType: "text/plain", url: "https://example.com/private-file", filename: "private-file.txt" },
  { type: "data-diagnostic", data: { message: "private diagnostic" } },
  { type: "dynamic-tool", toolName: "unsupportedTool", toolCallId: "call", state: "output-available", input: {}, output: "private tool output" },
];
it.each(hiddenParts)("ignores unsupported/internal part $type without losing public text", (part) => {
  render(<Message message={{ id: "mixed", role: "assistant", parts: [part, { type: "text", text: "Public project guidance." }] }} />);
  expect(screen.getByRole("article", { name: "Assistant message" })).toHaveTextContent("Public project guidance.");
  expect(screen.getByRole("article")).not.toHaveTextContent("private");
  expect(screen.queryByRole("link")).toBeNull();
});
