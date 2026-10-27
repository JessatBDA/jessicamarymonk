import Link from "next/link";
import Image from "next/image";
import portrait from "../../../images/jess-portrait.jpg";
import { Brushstroke } from "@/components/visuals";
import { ContentPhoto, Lines, RichText } from "@/components/content-render";
import {
  aboutBackground,
  aboutHandsHref,
  aboutHandsLink,
  aboutIntro,
  aboutNotice,
  aboutSection,
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
          priority
          sizes="(max-width: 760px) min(92vw, 420px), (max-width: 1100px) 40vw, 480px"
        />
      </div>
    </figure>
  );
}

export function AboutView({ entry }: { entry: Entry }) {
  const f = entry.body.fields;
  const cmsPortrait =
    entry.body.images.find((image) => image.role === "portrait") ||
    entry.body.images[0];
  const background = aboutBackground(f.background);
  const notice = aboutNotice(f.notice);
  const sections = [
    ["practice", "Artistic practice"],
    ["community", "Public art & community engagement"],
    ["commissions", "Commissions & collaborations"],
  ] as const;
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
        <div className="about-portrait">
          <Portrait image={cmsPortrait} />
        </div>
        <div>
          <h2>{f.name}</h2>
          {f.subtitle ? <p className="about-roles">{f.subtitle}</p> : null}
          <div className="lead">
            <RichText text={aboutIntro(f.intro)} />
          </div>
          {background === aboutHandsLink ? (
            <p>
              <Link className="text-link" href={aboutHandsHref}>
                The Hands of Worcester <span>↗</span>
              </Link>
            </p>
          ) : background ? (
            <RichText text={background} />
          ) : null}
          {notice ? <p className="notice">{notice}</p> : null}
          <Link className="text-link" href="/contact">
            Discuss a commission ↗
          </Link>
        </div>
      </section>
      {sections.map(([key, title]) => {
        const text = aboutSection(key, f[key]);
        return text ? (
          <section className="story-section" key={key}>
            <h2>{title}</h2>
            <RichText text={text} />
          </section>
        ) : null;
      })}
      {entry.body.images
        .filter((image) => image.role === "gallery")
        .map((image) => (
          <ContentPhoto key={image.id} image={image} label="Artist gallery" />
        ))}
    </div>
  );
}
