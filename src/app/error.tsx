"use client";
export default function ErrorPage({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <div className="page-wrap prose-page" role="alert">
      <h1>This page needs another try.</h1>
      <p>Your other workspace pages are still available.</p>
      <button className="primary-button" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
