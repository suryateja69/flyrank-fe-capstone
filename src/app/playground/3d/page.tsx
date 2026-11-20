import { ExperimentLoader } from "@/components/experiment-loader";
export default function Scene() {
  return (
    <div className="page-wrap">
      <p className="eyebrow">REAL WEBGL · PROCEDURAL GEOMETRY</p>
      <h1>A small object. A different perspective.</h1>
      <p>Change its material or rotate the geometry with the controls below.</p>
      <ExperimentLoader mode="cube" />
    </div>
  );
}
