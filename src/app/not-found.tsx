import Link from "next/link";
const links = [
  ["/", "Home"],
  ["/public-art", "Public art"],
  ["/engagement/share-your-hands", "Share your hands"],
  ["/paintings-illustrations", "Paintings & illustrations"],
  ["/about", "About"],
  ["/contact", "Contact"],
] as const;
export default function NotFound() {
  return (
    <div className="wrap page-intro">
      <p className="eyebrow">404</p>
      <h1>This page is not here.</h1>
      <p>
        The link may be out of date. The work is still on the site, and you
        are welcome to look around.
      </p>
      <ul className="not-found-links">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link className="text-link" href={href}>
              {label} <span>↗</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
