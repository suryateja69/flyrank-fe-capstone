import { tool } from "ai";
import type { InferUITools, UIDataTypes, UIMessage } from "ai";
import { leadSchema, leadScoreSchema, scoreLead } from "./qualification";

// A server-side boundary: validate before executing the deterministic rubric.
export async function executeQualification(input: unknown) {
  return leadScoreSchema.parse(scoreLead(leadSchema.parse(input)));
}
export const leadTools = {
  qualifyLead: tool({
    description: "Score a business inquiry using visitor-provided facts and the agency qualification rubric.",
    inputSchema: leadSchema,
    outputSchema: leadScoreSchema,
    execute: executeQualification,
  }),
};

// Shared type only: the client never imports the server tool at runtime.
export type LeadMessage = UIMessage<unknown, UIDataTypes, InferUITools<typeof leadTools>>;
