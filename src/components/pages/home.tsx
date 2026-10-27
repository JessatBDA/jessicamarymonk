import Link from "next/link";
import Image from "next/image";
import portrait from "../../../images/jess-portrait.jpg";
import { Brushstroke } from "@/components/visuals";
import {
  ArtworkImage,
  ContentPhoto,
  Lines,
  RichText,
} from "@/components/content-render";
import {
  homeIntro,
  homePracticeHeading,
  homePracticeText,
} from "@/lib/artist-copy";
import type { ContentImage, Entry } from "@/lib/content-model";

function Portrait({ image }: { image?: ContentImage }) {
  if (image) {
    return (
      <ContentPhoto
        image={image}
        label="Jessica Mary Monk — artist portrait"
        shape="portrait"
      />
    );
  }
  return (
    <figure className="content-photo">
      <div className="photo-frame portrait">
        <Image
          src={portrait}
          alt="Jessica Mary Monk smiling, holding her dog on a beach at sunset"
          fill
          sizes="(max-width: 760px) min(92vw, 420px), 340px"
        />
      </div>
    </figure>
  );
}
export function HomeView({
  entry,
  project,
  artworks = [],
}: {
  entry: Entry;
  project: Entry | null;
  artworks?: Entry[];
}) {
  const f = entry.body.fields;
  const photo = (role: string) =>
    entry.body.images.find((image) => image.role === role);
  const seascape = artworks.find((artwork) => artwork.slug === "seascape");
  const seascapeImage =
    photo("seascape") || seascape?.body.images[0] || photo("painting");
  const illustration = artworks.find(
    (artwork) =>
      artwork.body.featured &&
      [
        "Illustrations",
        "Drawings",
        "Portraits",
        "Book illustration",
        "Theatre artwork",
      ].includes(artwork.body.fields.category),
  );
  const illustrationImage =
    photo("illustration") || illustration?.body.images[0];
  return (
    <>
      <section className="home-hero wrap">
        <div className="eyebrow">{f.eyebrow}</div>
        <h1>
          <Lines text={f.heading || ""} />
          <span>
            {(f.subtitle || "").split("|").map((part, i) => (
              <span className="subtitle-part" key={i}>
                {i > 0 && <i>|</i>}
                {part.trim()}
              </span>
            ))}
          </span>
        </h1>
        <div className="hero-bottom">
          <p>{homeIntro(f.intro)}</p>
          <Link className="text-link" href="/public-art">
            Explore public art <span>↗</span>
          </Link>
        </div>
        <Brushstroke />
      </section>
      {project && (
        <section className="wrap feature">
          <div className="feature-copy">
            <p className="eyebrow">{f.feature_label}</p>
            <h2>
              <Lines text={f.feature_heading || project.title} />
            </h2>
            <p className="muted">{project.body.fields.location}</p>
            <p>{project.body.fields.intro}</p>
            <Link className="text-link" href={`/public-art/${project.slug}`}>
              Discover the project <span>↗</span>
            </Link>
            {project.slug === "the-hands-of-worcester" && (
              <Link className="text-link" href="/engagement/share-your-hands">
                Share your hands <span>↗</span>
              </Link>
            )}
            <span className="index-label">{f.feature_index}</span>
          </div>
          <Link
            className="image-link"
            href={`/public-art/${project.slug}`}
            aria-label={`Explore ${project.title}`}
          >
            <ContentPhoto
              image={
                photo("hero") ||
                project.body.images.find((image) => image.role === "hero") ||
                project.body.images[0]
              }
              label={project.title}
              number="01"
            />
          </Link>
        </section>
      )}
      <div className="wrap">
        <Brushstroke variant={1} />
      </div>
      <section className="wrap selected">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{f.studio_label}</p>
            <h2>{f.studio_heading}</h2>
          </div>
          <Link className="text-link" href="/paintings-illustrations">
            Explore the work ↗
          </Link>
        </div>
        <div className="art-grid">
          {seascapeImage ? (
            <figure>
              <Link
                href={
                  seascape
                    ? `/paintings-illustrations/${seascape.slug}`
                    : "/paintings-illustrations"
                }
              >
                <ArtworkImage
                  image={seascapeImage}
                  sizes="(max-width: 760px) 92vw, 60vw"
                />
              </Link>
            </figure>
          ) : null}
          <figure>
            {illustrationImage ? (
              <Link
                href={
                  illustration
                    ? `/paintings-illustrations/${illustration.slug}`
                    : "/paintings-illustrations"
                }
              >
                <ArtworkImage
                  image={illustrationImage}
                  sizes="(max-width: 760px) 46vw, 30vw"
                />
              </Link>
            ) : (
              <ContentPhoto label="Selected illustration" shape="portrait" />
            )}
          </figure>
        </div>
      </section>
      <section className="practice">
        <div className="wrap practice-inner">
          <Portrait image={photo("portrait")} />
          <div>
            <p className="eyebrow">{f.practice_label}</p>
            <h2>
              <Lines text={homePracticeHeading(f.practice_heading)} />
            </h2>
            <RichText text={homePracticeText(f.practice_text)} />
            <Link href="/about" className="text-link">
              About Jessica ↗
            </Link>
          </div>
        </div>
      </section>
      <section className="wrap invitation">
        <p className="eyebrow">{f.invitation_label}</p>
        <h2>{f.invitation_heading}</h2>
        <p>{f.invitation_text}</p>
        <Link className="button" href="/contact">
          Start a conversation ↗
        </Link>
      </section>
    </>
  );
}
