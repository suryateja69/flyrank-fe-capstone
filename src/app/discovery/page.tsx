import { Chat } from "@/components/chat";
import { Check, ShieldCheck } from "lucide-react";
export default function Discovery() {
  return (
    <>
      <header className="topbar">
        Workspace <span className="breadcrumb">/</span> Project discovery
      </header>
      <div className="page-wrap">
        <div className="page-heading">
          <div>
            <p className="eyebrow">LET’S MAKE IT CONCRETE</p>
            <h1>Tell us what you’re building.</h1>
            <p>A few details today. A more useful conversation tomorrow.</p>
          </div>
        </div>
        <div className="discovery-grid">
          <Chat />
          <aside className="discovery-notes">
            <span className="eyebrow">A LITTLE CONTEXT</span>
            <h2>
              Thoughtful questions.
              <br />
              Useful answers.
            </h2>
            <p>
              The assistant will help clarify your project, then suggest a next
              step based on a transparent rubric.
            </p>
            <ul>
              {[
                "Your business and project need",
                "A comfortable budget range",
                "When you’d like to get started",
                "Who’s involved in the decision",
              ].map((item) => (
                <li key={item}>
                  <Check size={15} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="privacy-note">
              <ShieldCheck size={21} />
              <strong>You’re in control.</strong>
              <p>
                Chat text is sent to the configured AI provider. Conversations
                stay in this browser tab and clear on refresh. No meetings are
                booked automatically.
              </p>
            </div>
            <span className="muted-small">
              20 messages per conversation · 2,000 characters per message
            </span>
          </aside>
        </div>
      </div>
    </>
  );
}
