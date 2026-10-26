"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="admin-login">
      <h1>Unable to load the workspace</h1>
      <p>Your saved content is safe. Check your connection and try again.</p>
      <button className="admin-button" onClick={reset}>
        Try again
      </button>
      <p>
        <a href="/admin/login">Return to sign-in</a>
      </p>
    </main>
  );
}
