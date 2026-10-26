import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../auth-actions";

export const dynamic = "force-dynamic";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();
  return (
    <>
      <header className="admin-header">
        <Link href="/admin" className="admin-brand">
          Jessica Mary Monk<span>Artist’s workspace</span>
        </Link>
        <div>
          <Link href="/" target="_blank">
            View website ↗
          </Link>
          <form action={logout}>
            <button className="admin-link">Sign out</button>
          </form>
        </div>
      </header>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <nav aria-label="Admin navigation">
            <Link href="/admin">Overview</Link>
            <span>Website & Profile</span>
            <Link href="/admin/content?kind=page">Pages & biography</Link>
            <Link href="/admin/content?kind=project">Public art projects</Link>
            <Link href="/admin/content?kind=artwork">Artwork & galleries</Link>
            <Link href="/admin/account">Your account</Link>
            <span>Project engagement</span>
            <Link href="/admin/engagement">Hands submissions</Link>
          </nav>
          <div className="admin-help">
            <p>
              Shop & Orders
              <br />
              Planned · payments disabled
            </p>
            <p className="admin-email">{user.email}</p>
          </div>
        </aside>
        <main id="main" className="admin-main">
          {children}
        </main>
      </div>
    </>
  );
}
