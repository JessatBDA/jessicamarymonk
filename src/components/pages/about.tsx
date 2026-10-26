import Link from "next/link";
import { Brushstroke } from "@/components/visuals";
import { ContentPhoto, Lines, RichText } from "@/components/content-render";
import type { Entry } from "@/lib/content-model";
export function AboutView({ entry }: { entry: Entry }) {
  const f = entry.body.fields;
  return (
    <div className="wrap">
      <section className="page-intro">
        <p className="eyebrow">{f.eyebrow}</p>
        <h1>
          <Lines text={f.heading || ""} />
        </h1>
        <Brushstroke />
      </section>
      <section className="about-grid">
        <ContentPhoto
          image={
            entry.body.images.find((image) => image.role === "portrait") ||
            entry.body.images[0]
          }
          label="Jessica Mary Monk — artist portrait"
          shape="portrait"
        />
        <div>
          <h2>{f.name}</h2>
          <p className="lead">{f.subtitle}</p>
          <RichText text={f.intro} />
          <RichText text={f.background} />
          {f.notice && <p className="notice">{f.notice}</p>}
          <Link className="text-link" href="/contact">
            Discuss a commission ↗
          </Link>
        </div>
      </section>
      {[
        ["practice", "Artistic practice"],
        ["community", "Public art & community engagement"],
        ["commissions", "Commissions & collaborations"],
      ].map(
        ([key, title]) =>
          f[key] && (
            <section className="story-section" key={key}>
              <h2>{title}</h2>
              <RichText text={f[key]} />
            </section>
          ),
      )}
      {entry.body.images
        .filter((image) => image.role === "gallery")
        .map((image) => (
          <ContentPhoto key={image.id} image={image} label="Artist gallery" />
        ))}
    </div>
  );
}
