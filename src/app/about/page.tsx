export default function About() {
  return (
    <div className="page-wrap prose-page">
      <p className="eyebrow">THE PROJECT</p>
      <h1>A clearer first conversation.</h1>
      <p>
        LeadDesk is Surya Teja’s FlyRank Front-end AI Engineering capstone. It
        helps a small agency understand an incoming project without losing the
        details in an unstructured chat.
      </p>
      <h2>What the AI does</h2>
      <p>
        A server-side language model asks follow-up questions. Once the company
        and project need are known, it can call a typed qualification tool. The
        server scores budget, timing, purchasing authority, and a stated need
        using a fixed rubric.
      </p>
      <h2>How scoring works</h2>
      <p>
        Budget contributes up to 40 points, timing up to 30, confirmed
        purchasing authority 20, and a stated need 10. Scores of 70+ are
        Priority, 40–69 are Nurture, and lower scores are Discovery. A person
        reviews the result before any action.
      </p>
      <h2>Privacy and limits</h2>
      <p>
        Messages are sent to the configured Google AI provider. Avoid sharing
        sensitive information. Conversation state exists in the current tab and
        clears on refresh. Workspace preferences are stored locally on your
        device. This version has no CRM, email delivery, or booking integration.
      </p>
    </div>
  );
}
