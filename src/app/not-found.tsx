import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap page-intro">
      <p className="eyebrow">404</p>
      <h1>Page not found.</h1>
      <p>This page may have moved or may not be published.</p>
      <Link className="text-link" href="/">
        Return to the homepage ↗
      </Link>
    </div>
  );
}
