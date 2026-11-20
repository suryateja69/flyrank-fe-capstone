"use client";
import dynamic from "next/dynamic";
const Experiment = dynamic(
  () => import("./webgl-experiment").then((module) => module.WebGLExperiment),
  {
    ssr: false,
    loading: () => (
      <div className="cube-stage skeleton" role="status">
        Loading visual experiment…
      </div>
    ),
  },
);
export function ExperimentLoader({ mode }: { mode: "hero" | "cube" }) {
  return <Experiment mode={mode} />;
}
