export default function Loading() {
  return (
    <div className="page-wrap" role="status">
      <span className="sr-only">Loading workspace</span>
      <div className="skeleton" style={{ height: 60, width: "65%" }} />
      <div className="skeleton" style={{ height: 300, marginTop: 30 }} />
    </div>
  );
}
