import Link from "next/link";
import { HandsOfWorcester } from "@/components/pages/hands-of-worcester";
import { Brushstroke } from "@/components/visuals";
import { ContentPhoto, Lines, RichText } from "@/components/content-render";
import { withHandsPresentation } from "@/content/hands-of-worcester";
import type { Entry } from "@/lib/content-model";
export function ProjectView({ entry }: { entry: Entry }) {
  if (entry.slug === "the-hands-of-worcester")
    return <HandsOfWorcester entry={withHandsPresentation(entry)} />;
  const f = entry.body.fields;
  const behind = entry.body.images.filter((image) => image.role === "behind");
  const finished = entry.body.images.filter((image) =>
    ["finished", "gallery"].includes(image.role),
  );
  return (
    <div className="wrap">
      <section className="page-intro">
        <Link href="/public-art" className="back-link">
          ← Public art & installations
        </Link>
        <p className="eyebrow">
          {f.location}
          {f.status ? ` · ${f.status}` : ""}
        </p>
        <h1>
          <Lines text={f.heading || entry.title} />
        </h1>
        <p>{f.intro}</p>
      </section>
      <ContentPhoto
        image={
          entry.body.images.find((image) => image.role === "hero") ||
          entry.body.images[0]
        }
        label="Finished installation — hero photograph"
      />
      <div className="project-summary">
        <p className="eyebrow">About the project</p>
        <div>
          <h2>
            <Lines text={f.summary_heading || "About the work."} />
          </h2>
          <RichText text={f.summary} />
          {f.notice && <p className="notice">{f.notice}</p>}
          {[
            ["year", "Year"],
            ["commissioner", "Commissioned by"],
            ["status", "Project status"],
          ].map(
            ([key, label]) =>
              f[key] && (
                <p key={key}>
                  <strong>{label}:</strong> {f[key]}
                </p>
              ),
          )}
        </div>
      </div>
      <Brushstroke />
      {[
        ["concept", "Background & artistic concept", "Artistic concept"],
        ["community", "Community involvement", "Community involvement"],
        ["making", "Making & materials", "Making & materials"],
      ].map(
        ([key, label, title], index) =>
          f[key] && (
            <section className="story-section" key={key}>
              <span className="eyebrow">
                0{index + 1} / {label}
              </span>
              <div>
                <h2>{f[`${key}_heading`] || title}</h2>
                <RichText text={f[key]} />
              </div>
            </section>
          ),
      )}
      {behind.length > 0 && (
        <>
          <div className="section-heading">
            <h2>Behind the scenes</h2>
            <span className="muted">A record of the making</span>
          </div>
          <div className="two-columns">
            {behind.map((image) => (
              <ContentPhoto
                key={image.id}
                image={image}
                label="Behind the scenes"
                shape="square"
              />
            ))}
          </div>
        </>
      )}
      {finished.length > 0 && (
        <section className="selected">
          <h2>The finished installation</h2>
          <div className="two-columns">
            {finished.map((image) => (
              <ContentPhoto
                key={image.id}
                image={image}
                label="Installation gallery photograph"
              />
            ))}
          </div>
        </section>
      )}
      {f.outcomes && (
        <section className="story-section">
          <h2>Project outcomes</h2>
          <RichText text={f.outcomes} />
        </section>
      )}
      <Brushstroke variant={1} />
      <section className="story-section">
        <p className="eyebrow">Visiting & taking part</p>
        <div>
          <h2>Encounter the work.</h2>
          <RichText text={f.exhibition} />
          {f.video?.startsWith("https://") && (
            <p>
              <a
                className="text-link"
                href={f.video}
                rel="noopener noreferrer"
                target="_blank"
              >
                Watch project video ↗
              </a>
            </p>
          )}
          {f.links && (
            <ul>
              {f.links
                .split("\n")
                .filter((url) => url.startsWith("https://"))
                .map((url) => (
                  <li key={url}>
                    <a href={url} rel="noopener noreferrer" target="_blank">
                      {url}
                    </a>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </section>
      <section className="invitation">
        <Link className="text-link" href="/public-art">
          Explore public art & installations ↗
        </Link>
      </section>
    </div>
  );
}
