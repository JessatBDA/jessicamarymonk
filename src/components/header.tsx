"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
const links = [
  ["/public-art", "Public art"],
  ["/engagement/share-your-hands", "Share your hands"],
  ["/paintings-illustrations", "Paintings & illustrations"],
  ["/about", "About"],
  ["/contact", "Contact"],
];
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link href="/" className="wordmark" onClick={() => setOpen(false)}>
        Jessica Mary Monk<span>Public artist · Painter · Illustrator</span>
      </Link>
      <button
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close −" : "Menu +"}
      </button>
      <nav
        id="main-nav"
        className={open ? "navigation open" : "navigation"}
        aria-label="Main navigation"
      >
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname.startsWith(href) ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
