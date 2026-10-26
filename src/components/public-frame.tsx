"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "./header";
export function PublicFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div>
          <Link className="footer-name" href="/">
            Jessica Mary Monk
          </Link>
          <p>Public art. Shared experiences. Creative connections.</p>
        </div>
        <div className="footer-links">
          <Link href="/contact">Get in touch ↗</Link>
          <Link href="/privacy">Privacy</Link>
          <span>© {new Date().getFullYear()} Jessica Mary Monk</span>
        </div>
      </footer>
    </>
  );
}
