import type { LeadScore } from "@/lib/qualification";

export function ScoreCard({ lead }: { lead: LeadScore }) {
  return (
    <section
      className="score-card"
      aria-label={`Qualification for ${lead.company}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow">QUALIFICATION RESULT</span>
          <h3>{lead.company}</h3>
          <span className={`pill ${lead.category.toLowerCase()}`}>
            {lead.category}
          </span>
        </div>
        <div className="score-number">
          {lead.score}
          <span>/100</span>
        </div>
      </div>
      <p>{lead.project}</p>
      <ul>
        {lead.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      <div className="next-action">
        <strong>Suggested next step</strong>
        <p>{lead.nextAction}</p>
      </div>
      <small>
        This score supports a human review. No booking or outreach has been
        made.
      </small>
    </section>
  );
}
