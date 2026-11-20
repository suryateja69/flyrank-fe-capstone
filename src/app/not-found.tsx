import Link from "next/link";
export default function NotFound() {
  return (
    <div className="page-wrap prose-page">
      <h1>That page isn’t here.</h1>
      <p>Return to the workspace to start a discovery conversation.</p>
      <Link className="primary-button" href="/">
        Back to overview
      </Link>
    </div>
  );
}
