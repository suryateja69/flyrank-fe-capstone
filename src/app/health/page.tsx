import { HealthStatus } from "@/components/health-status";

export default function Health() {
  return (
    <div className="page-wrap prose-page">
      <p className="eyebrow">SERVICE STATUS</p>
      <h1>Health check</h1>
      <HealthStatus />
    </div>
  );
}
