export const dynamic = "force-dynamic";
export default async function Health() {
  const origin =
    process.env.APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  let result: {
    status: string;
    aiConfigured: boolean;
    timestamp: string;
  } | null = null;
  try {
    const response = await fetch(new URL("/api/health", origin), {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) result = await response.json();
  } catch {
    /* Render an explicit unavailable state below. */
  }
  return (
    <div className="page-wrap prose-page">
      <p className="eyebrow">SERVICE STATUS</p>
      <h1>Health check</h1>
      {result ? (
        <>
          <p>Application API · {result.status}</p>
          <p>
            AI provider ·{" "}
            {result.aiConfigured
              ? "Server key configured (provider call not checked)"
              : "Awaiting server key"}
          </p>
          <p>Fetched at {result.timestamp}</p>
        </>
      ) : (
        <p role="alert">
          The health endpoint could not be fetched. Please retry later.
        </p>
      )}
    </div>
  );
}
