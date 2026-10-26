import { Gallery } from "@/components/gallery";
import { Brushstroke } from "@/components/visuals";
import { publishedEntries } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Paintings & Illustrations",
  "Explore paintings, portraits, drawings and illustration by Jessica Mary Monk.",
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
          A space for paintings, portraits, drawings, book illustration and
          theatre artwork.
        </p>
        <Brushstroke />
      </section>
      <Gallery artworks={await publishedEntries("artwork")} />
    </div>
  );
}
