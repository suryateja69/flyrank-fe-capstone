import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
export default function Home() {
  return (
    <>
      <header className="topbar">
        <span>
          Workspace <span className="breadcrumb">/</span> Overview
        </span>
        <Link href="/health" className="status-link">
          <span className="status-dot" /> Service status
        </Link>
      </header>
      <div className="page-wrap">
        <div className="page-heading">
          <div>
            <p className="eyebrow">LESS BACK-AND-FORTH. MORE CLARITY.</p>
            <h1>Good projects start here.</h1>
            <p>A thoughtful first conversation. A clearer path forward.</p>
          </div>
          <span className="date-label">Your discovery workspace</span>
        </div>
        <section className="overview-hero">
          <div>
            <span className="hero-kicker">
              <Sparkles size={15} /> YOUR NEXT CONVERSATION
            </span>
            <h2>
              From “we have an idea”
              <br />
              to “here’s the next step.”
            </h2>
            <p>
              Help a potential client share what they need.
              <br />
              Get an explainable qualification, ready for a human review.
            </p>
            <Link href="/discovery" className="primary-button">
              Start project discovery <ArrowUpRight size={18} />
            </Link>
            <div className="hero-details">
              <span>
                <Check size={14} /> One question at a time
              </span>
              <span>
                <Check size={14} /> Transparent scoring
              </span>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="floating-tag">
              <span className="mini-dot" /> A clearer next step
            </div>
            <div className="visual-card">
              <div className="visual-icon">
                <Target size={26} />
              </div>
              <div className="visual-line long" />
              <div className="visual-line short" />
              <div className="visual-score">
                <span>Project fit</span>
                <strong>
                  Ready to explore <ArrowUpRight size={15} />
                </strong>
              </div>
              <div className="visual-check">
                <Check size={18} />
              </div>
            </div>
            <span className="visual-spark">
              <Sparkles size={30} />
            </span>
          </div>
        </section>
        <section
          className="workflow-section"
          aria-labelledby="workflow-heading"
        >
          <div className="section-heading">
            <h2 id="workflow-heading">A little structure. A better start.</h2>
            <Link href="/about">
              How it works <ArrowRight size={16} />
            </Link>
          </div>
          <div className="workflow-grid">
            {[
              {
                Icon: MessageSquareText,
                title: "Understand the project",
                body: "An adaptive conversation gathers the business need, budget, timing, and decision process.",
              },
              {
                Icon: Target,
                title: "Find the fit",
                body: "A server-side tool applies a clear rubric and explains every point in the qualification.",
              },
              {
                Icon: ShieldCheck,
                title: "Keep people in control",
                body: "Review a suggested next action. You decide what happens next. No automatic outreach.",
              },
            ].map(({ Icon, title, body }) => (
              <article className="workflow-card" key={title}>
                <div className="workflow-icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="recent-section">
          <div className="section-heading">
            <h2>Ready when you are</h2>
            <span className="muted-small">Private to this browser session</span>
          </div>
          <div className="empty-overview">
            <span className="empty-inbox">
              <MessageSquareText size={23} />
            </span>
            <div>
              <h3>Your next project is a conversation away.</h3>
              <p>
                Start discovery to see a project’s needs and qualification in
                one place.
              </p>
            </div>
            <Link href="/discovery" className="text-button">
              Start a conversation <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <footer className="page-footer">
          <span>LeadDesk · Built with care, reviewed by people.</span>
          <Link href="/about">
            About this project <ArrowUpRight size={13} />
          </Link>
        </footer>
      </div>
    </>
  );
}
