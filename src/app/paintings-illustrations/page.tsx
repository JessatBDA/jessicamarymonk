import Link from "next/link";
import { Gallery } from "@/components/gallery";
import { Brushstroke } from "@/components/visuals";
import { publishedEntries } from "@/lib/content";
import { studioImages } from "@/lib/studio-images";
import { pageMetadata } from "@/lib/site";
const studioCard = studioImages["art-02.jpg"];
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Paintings & illustrations",
  "Details from acrylic paintings and from charcoal, chalk and pastel drawings by Jessica Mary Monk. Titles and years are not shown.",
  "/paintings-illustrations",
  {
    url: studioCard.src,
    alt: "Detail of an acrylic painting: two hands holding yellow wooden drumsticks against a dark blue background.",
    width: studioCard.width,
    height: studioCard.height,
  },
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
