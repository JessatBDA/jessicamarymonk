import Link from "next/link";
import { ArtworkImage, RichText } from "@/components/content-render";
import type { Entry } from "@/lib/content-model";

export function ArtworkView({ entry }: { entry: Entry }) {
  const images = entry.body.images;
  const primary =
    images.find((image) => image.role === "hero") ||
    images.find((image) => image.role !== "behind") ||
    images[0];
  const rest = images.filter((image) => image !== primary);
  const description = entry.body.fields.description?.trim();
  const commission = entry.body.fields.commission?.trim();
  const caption = (primary?.caption ?? "").trim();
  const detail =
    !caption &&
    (primary?.alt ?? "").trim().toLowerCase().startsWith("detail");
  return (
    <div className="wrap artwork-detail">
      <section className="page-intro">
        <Link href="/paintings-illustrations" className="back-link">
          ← Paintings & illustrations
        </Link>
        {caption ? <h1>{caption}</h1> : null}
        {detail ? (
          <>
            <h1>A detail from the studio.</h1>
            <p>
              This photograph shows a detail of the piece, not the whole work.
            </p>
          </>
        ) : null}
      </section>
      {primary ? (
        <ArtworkImage
          image={primary}
          sizes="(max-width: 760px) 92vw, 1100px"
          priority
        />
      ) : null}
      {rest.map((image) => (
        <ArtworkImage
          key={image.id}
          image={image}
          sizes="(max-width: 760px) 92vw, 540px"
        />
      ))}
      {description ? <RichText text={description} /> : null}
      {commission ? (
        <section className="story-section">
          <h2>Commissions</h2>
          <RichText text={commission} />
        </section>
      ) : null}
      <section className="invitation">
        <Link className="text-link" href="/contact">
          Enquire about this work ↗
        </Link>
      </section>
    </div>
  );
}
