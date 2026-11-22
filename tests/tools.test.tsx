import React from "react";
import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { executeQualification, leadTools } from "@/lib/tools";
import { ToolResult } from "@/components/tool-result";
const input = { company: "WheelWorks", project: "Website for repair bookings", budget: "5k-15k", timeline: "this-quarter", decisionMaker: true } as const;
it("executes the validated server tool and renders its returned component", async () => {
  const output = await executeQualification(input);
  expect(output).toMatchObject({ score: 80, category: "Priority" });
  expect(leadTools.qualifyLead.inputSchema).toBeDefined();
  expect(leadTools.qualifyLead.outputSchema).toBeDefined();
  render(<ToolResult state="output-available" output={output} />);
  expect(screen.getByRole("region", { name: "Qualification for WheelWorks" })).toBeVisible();
});
it("rejects invalid execution input and keeps a designed failure UI", async () => {
  await expect(executeQualification({ ...input, budget: "invented" })).rejects.toThrow();
  render(<ToolResult state="output-error" />);
  expect(screen.getByRole("alert")).toHaveTextContent("Qualification could not finish");
});
it("distinguishes incomplete collection from validated input review", () => {
  const { rerender } = render(<ToolResult state="input-streaming" input={{ company: "Wh" }} />);
  expect(screen.getByRole("status")).toHaveTextContent("No score is available yet.");
  expect(screen.queryByRole("term")).toBeNull();
  rerender(<ToolResult state="input-available" input={input} />);
  expect(screen.getByRole("status")).toHaveTextContent("Scoring the inquiry");
  expect(screen.getByText("Purchasing authority")).toBeVisible();
  expect(screen.getByText("Confirmed")).toBeVisible();
});
