import Link from "next/link";
import { Brushstroke } from "@/components/visuals";
import { ContentPhoto, RichText } from "@/components/content-render";
import type { Entry } from "@/lib/content-model";
export function ArtworkView({ entry }: { entry: Entry }) {
  const f = entry.body.fields;
  return (
    <div className="wrap">
      <section className="page-intro">
        <Link href="/paintings-illustrations" className="back-link">
          ← Paintings & illustrations
        </Link>
        <p className="eyebrow">{f.category}</p>
        <h1>{entry.title}</h1>
        <Brushstroke />
      </section>
      <ContentPhoto
        image={
          entry.body.images.find((image) => image.role === "hero") ||
          entry.body.images[0]
        }
        label={entry.title}
      />
      <section className="story-section">
        <div>
          {[
            ["year", "Year"],
            ["medium", "Medium"],
            ["dimensions", "Dimensions"],
            ["availability", "Availability"],
          ].map(
            ([key, label]) =>
              f[key] && (
                <p key={key}>
                  <strong>{label}:</strong> {f[key]}
                </p>
              ),
          )}
        </div>
        <RichText text={f.description} />
      </section>
      <div className="two-columns">
        {entry.body.images
          .filter((image) => image.role !== "hero")
          .slice(
            entry.body.images.some((image) => image.role === "hero") ? 0 : 1,
          )
          .map((image) => (
            <ContentPhoto key={image.id} image={image} label={entry.title} />
          ))}
      </div>
      {f.commission && (
        <section className="story-section">
          <h2>Commissions</h2>
          <RichText text={f.commission} />
        </section>
      )}
      <section className="invitation">
        <Link className="text-link" href="/contact">
          Enquire about this work ↗
        </Link>
      </section>
    </div>
  );
}
