import { leadSchema, leadScoreSchema } from "@/lib/qualification";
import { ScoreCard } from "./score-card";

export type ToolState =
  "input-streaming" | "input-available" | "output-available" | "output-error";
export function ToolResult({
  state,
  input,
  output,
}: {
  state: ToolState;
  input?: unknown;
  output?: unknown;
}) {
  if (state === "input-streaming")
    return (
      <div className="tool-status" role="status">
        <span className="pulse" />
        Collecting project details…
      </div>
    );
  if (state === "input-available") {
    const parsed = leadSchema.safeParse(input);
    return (
      <div className="tool-status" role="status">
        <strong>Scoring the inquiry</strong>
        <p>
          {parsed.success
            ? `Reviewing ${parsed.data.company} against budget, timing, and purchasing authority.`
            : "Validating the supplied project details."}
        </p>
      </div>
    );
  }
  if (state === "output-error")
    return (
      <div className="error-box" role="alert">
        <strong>Qualification could not finish</strong>
        <p>
          Your conversation is still available. Ask the assistant to try the
          qualification again.
        </p>
      </div>
    );
  const parsed = leadScoreSchema.safeParse(output);
  if (!parsed.success) {
    return (
      <div className="error-box" role="alert">
        The qualification returned incomplete data. Ask the assistant to try
        again.
      </div>
    );
  }
  return <ScoreCard lead={parsed.data} />;
}
