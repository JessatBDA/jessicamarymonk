import Link from "next/link";
import { ArtworkImage } from "@/components/content-render";
import { Brushstroke } from "@/components/visuals";
import { publishedEntries } from "@/lib/content";
import type { Entry } from "@/lib/content-model";
import { pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = {
  ...pageMetadata(
    "Shop — coming soon",
    "The Jessica Mary Monk shop is in preparation.",
    "/shop",
  ),
  robots: { index: false, follow: false },
};

/** Works whose availability mentions the shop, in gallery order. */
function comingToTheShop(artworks: Entry[]) {
  return artworks.filter((artwork) =>
    (artwork.body.fields.availability ?? "").toLowerCase().includes("shop"),
  );
}

function heroImage(artwork: Entry) {
  return (
    artwork.body.images.find((image) => image.role === "hero") ||
    artwork.body.images[0]
  );
}

function shopStatus(availability: string) {
  return /coming soon/i.test(availability) ? "Coming soon" : availability;
}

export default async function Page() {
  const coming = comingToTheShop(await publishedEntries("artwork"));
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
      {coming.length ? (
        <section className="story-section">
          <div>
            <p className="eyebrow">Originals</p>
            <h2>
              {coming.length === 1
                ? "First original coming to the shop"
                : "Originals coming to the shop"}
            </h2>
          </div>
          <div>
            {coming.map((artwork) => {
              const image = heroImage(artwork);
              const medium = (artwork.body.fields.medium ?? "").trim();
              const size = (artwork.body.fields.dimensions ?? "").trim();
              const href = `/paintings-illustrations/${artwork.slug}`;
              return (
                <article key={artwork.slug}>
                  {image ? (
                    <Link href={href} className="image-link" aria-label={artwork.title}>
                      <ArtworkImage
                        image={image}
                        sizes="(max-width: 760px) 92vw, 640px"
                      />
                    </Link>
                  ) : null}
                  <h3>
                    <Link href={href}>{artwork.title}</Link>
                  </h3>
                  {medium ? <p>{medium}</p> : null}
                  {size ? <p>{size}</p> : null}
                  <p>{shopStatus(artwork.body.fields.availability ?? "")}</p>
                  <p>
                    <Link className="text-link" href="/contact">
                      Interested in this painting? Get in touch.
                    </Link>
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
