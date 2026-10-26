import Link from "next/link";
import { Gallery } from "@/components/gallery";
import { Brushstroke } from "@/components/visuals";
import { publishedEntries } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Paintings & Illustrations",
  "Details from acrylic paintings and from charcoal, chalk and pastel drawings by Jessica Mary Monk.",
  "/paintings-illustrations",
);
export default async function Page() {
  return (
    <div className="wrap">
      <section className="page-intro">
        <p className="eyebrow">From the studio</p>
        <h1>
          Paintings &<br />
          illustrations.
        </h1>
        <p>
          Details from acrylic paintings and from charcoal, chalk and pastel
          drawings. Each photograph shows a detail of the piece, not the whole
          work.
        </p>
        <Link className="text-link" href="/public-art/the-hands-of-worcester">
          The Hands of Worcester <span>↗</span>
        </Link>
        <Brushstroke />
      </section>
      <Gallery artworks={await publishedEntries("artwork")} />
    </div>
  );
}
