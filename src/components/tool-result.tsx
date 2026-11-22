import { leadSchema, leadScoreSchema } from "@/lib/qualification";
import { ScoreCard } from "./score-card";

export type ToolState =
  "input-streaming" | "input-available" | "output-available" | "output-error";
export function isToolState(value: unknown): value is ToolState {
  return value === "input-streaming" || value === "input-available" || value === "output-available" || value === "output-error";
}
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
      <div className="tool-status tool-collecting" role="status">
        <span className="pulse" />
        <strong>Collecting project details…</strong>
        <p>The assistant is preparing the scoring inputs. No score is available yet.</p>
        <div className="tool-skeleton" aria-hidden="true"><span /><span /><span /></div>
      </div>
    );
  if (state === "input-available") {
    const parsed = leadSchema.safeParse(input);
    return (
      <div className="tool-status tool-executing" role="status">
        <strong>Scoring the inquiry</strong>
        {parsed.success ? (
          <dl className="tool-input-summary">
            <div><dt>Business</dt><dd>{parsed.data.company}</dd></div>
            <div><dt>Project</dt><dd>{parsed.data.project}</dd></div>
            <div><dt>Budget</dt><dd>{parsed.data.budget === "unknown" ? "Not provided" : parsed.data.budget}</dd></div>
            <div><dt>Timing</dt><dd>{parsed.data.timeline}</dd></div>
            <div><dt>Purchasing authority</dt><dd>{parsed.data.decisionMaker ? "Confirmed" : "Unconfirmed"}</dd></div>
          </dl>
        ) : <p>Validating the supplied project details. Incomplete input cannot be scored.</p>}
        <p className="tool-execution-note"><span className="pulse" /> Applying the server-side rubric…</p>
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
