import { ToolResult } from "@/components/tool-result";
import { scoreLead } from "@/lib/qualification";
const input = {
  company: "Example Studio",
  project: "A new accessible website for a small architecture practice.",
  budget: "5k-15k",
  timeline: "this-quarter",
  decisionMaker: true,
} as const;
export default function Tools() {
  return (
    <div className="page-wrap">
      <p className="eyebrow">COMPONENT FIXTURES · SAMPLE DATA</p>
      <h1>Qualification tool states</h1>
      <p>
        These fixtures demonstrate UI behavior without calling an AI provider.
      </p>
      <div className="lab-grid">
        {(
          [
            "input-streaming",
            "input-available",
            "output-available",
            "output-error",
          ] as const
        ).map((state) => (
          <section className="lab-card" key={state}>
            <h2>{state.replaceAll("-", " ")}</h2>
            <ToolResult state={state} input={input} output={scoreLead(input)} />
          </section>
        ))}
      </div>
    </div>
  );
}
