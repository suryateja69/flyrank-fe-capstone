"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-wrap prose-page">
      <h1>This page needs another try.</h1>
      <p>Your other workspace pages are still available.</p>
      <button className="primary-button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
