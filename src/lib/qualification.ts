import { z } from "zod";

export const leadSchema = z.object({
  company: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .describe("Business name provided by the visitor"),
  project: z
    .string()
    .trim()
    .min(10)
    .max(1000)
    .describe("Project need in the visitor’s words"),
  budget: z.enum(["under-5k", "5k-15k", "15k-plus", "unknown"]),
  timeline: z.enum(["this-month", "this-quarter", "exploring", "unknown"]),
  decisionMaker: z
    .boolean()
    .describe("True only if the visitor confirmed purchasing authority"),
});

export type LeadInput = z.infer<typeof leadSchema>;
export const leadScoreSchema = leadSchema.extend({
  score: z.number().int().min(0).max(100),
  category: z.enum(["Priority", "Nurture", "Discovery"]),
  reasons: z.array(z.string().max(1000)).max(10),
  nextAction: z.string().max(1000),
});
export type LeadScore = z.infer<typeof leadScoreSchema>;

// The LLM collects facts. This deterministic, inspectable rubric scores them.
export function scoreLead(input: LeadInput): LeadScore {
  const lead = leadSchema.parse(input);
  const budgetPoints = {
    "under-5k": 10,
    "5k-15k": 30,
    "15k-plus": 40,
    unknown: 0,
  };
  const timelinePoints = {
    "this-month": 30,
    "this-quarter": 20,
    exploring: 5,
    unknown: 0,
  };
  const score =
    budgetPoints[lead.budget] +
    timelinePoints[lead.timeline] +
    (lead.decisionMaker ? 20 : 0) +
    10;
  const category =
    score >= 70 ? "Priority" : score >= 40 ? "Nurture" : "Discovery";
  return {
    ...lead,
    score,
    category,
    reasons: [
      `Budget contributes ${budgetPoints[lead.budget]} points.`,
      `Timeline contributes ${timelinePoints[lead.timeline]} points.`,
      lead.decisionMaker
        ? "Confirmed decision-maker adds 20 points."
        : "Purchasing authority is unconfirmed.",
      "A stated project need adds 10 points.",
    ],
    nextAction:
      category === "Priority"
        ? "Offer a discovery call with the agency."
        : category === "Nurture"
          ? "Clarify scope and agree on a follow-up."
          : "Ask about budget, timing, and decision process.",
  };
}
