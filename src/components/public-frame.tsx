"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { publicContactEmail } from "@/lib/contact-public";
import { Header } from "./header";
const footerLinks = [
  ["/public-art", "Public art"],
  ["/engagement/share-your-hands", "Share your hands"],
  ["/paintings-illustrations", "Paintings & illustrations"],
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/privacy", "Privacy"],
] as const;
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
          <p>Public artist, painter and illustrator.</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <a href={`mailto:${publicContactEmail}`}>{publicContactEmail}</a>
          {footerLinks.map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
          <span>© {new Date().getFullYear()} Jessica Mary Monk</span>
        </nav>
      </footer>
    </>
  );
}
