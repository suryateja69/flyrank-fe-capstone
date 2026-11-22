import Link from "next/link";
import { ButtonDemo } from "@/components/button-demo";

export default function ButtonsPage() {
  return (
    <>
      <header className="topbar">Workspace / Component lab / Buttons</header>
      <div className="page-wrap buttons-page">
        <p className="eyebrow">BUTTONS WITH A BRAIN · FE-AA1</p>
        <h1>A button that keeps you informed.</h1>
        <p className="buttons-intro">From the first press to the next attempt, every state has something useful to say.</p>
        <ButtonDemo />
        <section className="motion-notes" aria-labelledby="motion-notes-title">
          <h2 id="motion-notes-title">The motion has a job.</h2>
          <p>Hover and press use 120ms ease-out for immediate acknowledgement. Labels, icons, and colored surfaces crossfade and move by 4px over 200ms with cubic-bezier(.2,.8,.2,1), so the result settles gently. The error nudges once for 240ms; success stays for 1.8 seconds and error for 3.2 seconds before returning to idle. The result message remains readable afterward.</p>
          <p>The button keeps a fixed footprint. Only transform and opacity animate. Reduced motion removes movement, spinning, and transitions while preserving labels, icons, color, focus, and live status feedback.</p>
          <Link href="/playground">Back to component lab</Link>
        </section>
      </div>
    </>
  );
}
