import Link from "next/link";
import { Brushstroke } from "@/components/visuals";
import { pageMetadata } from "@/lib/site";
export const metadata = {
  ...pageMetadata(
    "Shop — coming soon",
    "The Jessica Mary Monk shop is in preparation.",
    "/shop",
  ),
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <div className="wrap">
      <section className="page-intro">
        <p className="eyebrow">From the studio to your home</p>
        <h1>
          The shop.
          <br />
          Coming soon.
        </h1>
        <p>
          A future home for original artwork, prints and illustrated products.
        </p>
        <Brushstroke />
        <p>
          The shop has not launched. Products, prices and availability will be
          shared when ready.
        </p>
        <Link href="/paintings-illustrations" className="text-link">
          Explore paintings & illustrations ↗
        </Link>
      </section>
    </div>
  );
}
