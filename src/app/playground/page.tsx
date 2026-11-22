import Link from "next/link";
import {
  HandDialog,
  HandDisclosure,
  HandTabs,
  MotionButton,
  ReferenceComponents,
} from "@/components/playground";
export default function Playground() {
  return (
    <>
      <header className="topbar">Workspace / Component lab</header>
      <div className="page-wrap">
        <div className="page-heading">
          <div>
            <p className="eyebrow">BUILT TO BE EXPLORED</p>
            <h1>Component lab</h1>
            <p>
              Keyboard-first patterns, state feedback, and visual experiments.
            </p>
          </div>
        </div>
        <div className="lab-links">
          <Link href="/playground/3d">Explore the 3D configurator</Link>
          <Link href="/playground/shader">View the shader hero</Link>
          <Link href="/playground/tools">Inspect tool states</Link>
          <Link href="/playground/buttons">Try buttons with a brain</Link>
        </div>
        <div className="lab-grid">
          <section className="lab-card">
            <h2>Custom modal</h2>
            <p>
              Tab cycles inside, Escape closes, and focus returns to the
              trigger.
            </p>
            <HandDialog />
          </section>
          <section className="lab-card">
            <h2>Custom tabs</h2>
            <p>Arrow keys, Home, and End move through the tabs.</p>
            <HandTabs />
          </section>
          <section className="lab-card">
            <h2>Custom disclosure</h2>
            <HandDisclosure />
          </section>
          <section className="lab-card">
            <h2>Motion and state</h2>
            <MotionButton />
          </section>
          <section className="lab-card">
            <h2>Library reference</h2>
            <ReferenceComponents />
          </section>
        </div>
      </div>
    </>
  );
}
