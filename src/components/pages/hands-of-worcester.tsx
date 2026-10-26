import Image from "next/image";
import Link from "next/link";
import { HandsGallery } from "@/components/hands-gallery";
import { Lines } from "@/components/content-render";
import { Brushstroke } from "@/components/visuals";
import {
  artistStatement,
  fundingText,
  handsStats,
  panelQuote,
} from "@/content/hands-of-worcester";
import {
  earlierInstallation,
  handsGallery,
  handsHero,
} from "@/content/hands-photos";
import type { Entry } from "@/lib/content-model";
import {
  fetchApprovedHandsNames,
  mergeHandsNames,
} from "@/lib/hands-names";

export async function HandsOfWorcester({ entry }: { entry: Entry }) {
  const names = mergeHandsNames(await fetchApprovedHandsNames());
  const f = entry.body.fields;
  return (
    <div className="wrap">
      <section className="page-intro">
        <Link href="/public-art" className="back-link">
          ← Public art & installations
        </Link>
        <p className="eyebrow">{f.location} · Community installation</p>
        <h1>
          <Lines text={f.heading || entry.title} />
        </h1>
        <p>{f.intro}</p>
      </section>
      <figure className="hands-hero">
        <Image
          src={handsHero.src}
          alt={handsHero.alt}
          width={handsHero.width}
          height={handsHero.height}
          priority
          sizes="(max-width: 760px) 100vw, 1100px"
          style={{ width: "100%", height: "auto" }}
        />
        <figcaption>{handsHero.caption}</figcaption>
      </figure>
      <div className="project-summary">
        <p className="eyebrow">About the project</p>
        <div>
          <h2>
            <Lines text={f.summary_heading || "The story of the hands."} />
          </h2>
          <p>{f.summary}</p>
          <p>
            <strong>Where:</strong> {f.location}
          </p>
          {f.status && (
            <p>
              <strong>On show:</strong> {f.status}
            </p>
          )}
        </div>
      </div>
      <Brushstroke />
      <section className="story-section">
        <p className="eyebrow">01 / {f.concept_heading}</p>
        <div>
          <h2>{f.concept_heading}</h2>
          <blockquote className="pull-quote">
            <p>{panelQuote}</p>
            <footer>Exhibition panel</footer>
          </blockquote>
        </div>
      </section>
      <section className="story-section">
        <p className="eyebrow">02 / The artist</p>
        <div>
          <h2>In Jessica’s words</h2>
          <blockquote className="pull-quote">
            <p>{artistStatement}</p>
            <footer>Jessica Mary Monk</footer>
          </blockquote>
        </div>
      </section>
      <section className="story-section">
        <p className="eyebrow">03 / {f.community_heading}</p>
        <div>
          <h2>{f.community_heading}</h2>
          <p>{f.community}</p>
          <ul className="stat-list">
            {handsStats.map((stat) => (
              <li key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="story-section">
        <p className="eyebrow">04 / {f.making_heading}</p>
        <div>
          <h2>{f.making_heading}</h2>
          <p>{f.making}</p>
        </div>
      </section>
      <section className="selected" aria-labelledby="hands-gallery-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Photographs</p>
            <h2 id="hands-gallery-heading">On the plinth, and the build</h2>
          </div>
          <p className="muted">Select a photograph to enlarge it</p>
        </div>
        <HandsGallery images={handsGallery} labelledBy="hands-gallery-heading" />
      </section>
      <section className="selected" aria-labelledby="earlier-heading">
        <div className="section-heading">
          <h2 id="earlier-heading">The installation</h2>
        </div>
        <HandsGallery
          images={earlierInstallation}
          labelledBy="earlier-heading"
        />
      </section>
      <section className="story-section">
        <p className="eyebrow">Words from the panel</p>
        <figure className="word-cloud">
          <Image
            src="/images/hands-of-worcester/word-cloud.webp"
            alt="Word cloud from The Hands of Worcester exhibition panel. The largest word is Hands, surrounded by words about touch, community, feeling and care."
            width={1200}
            height={1970}
            sizes="(max-width: 760px) 100vw, 720px"
            style={{ width: "100%", height: "auto" }}
          />
          <figcaption>From the exhibition panel.</figcaption>
        </figure>
      </section>
      <section className="names-section" id="participants">
        <p className="eyebrow">With thanks</p>
        <h2>A thank you to all the participants</h2>
        <p>
          Thank you to all 211 participants. The names below are the people
          listed on the exhibition panel, together with names added later when
          someone has given permission and Jessica has approved it.
        </p>
        <ul className="names-list">
          {names.map((name) => (
            <li key={name.toLocaleLowerCase("en-GB")}>{name}</li>
          ))}
        </ul>
        <p>
          <Link className="text-link" href="/engagement/add-your-name">
            Add your name to the list <span>↗</span>
          </Link>
        </p>
      </section>
      <Brushstroke variant={1} />
      <section className="story-section">
        <p className="eyebrow">Visiting</p>
        <div>
          <h2>Encounter the work.</h2>
          <p>{f.exhibition}</p>
          <h3>Share your hands</h3>
          <p>
            Tell Jessica what hands mean to you, or send a drawing, a poem or
            a piece of writing. It is not put on the website until she has
            checked it.
          </p>
          <p className="hands-actions">
            <Link className="button" href="/engagement/share-your-hands">
              Share your hands ↗
            </Link>
            <Link className="text-link" href="/contact">
              Get in touch ↗
            </Link>
          </p>
          <p>
            <Link
              className="text-link"
              href="/engagement/the-hands-of-worcester"
            >
              Visitor questionnaire preview ↗
            </Link>
          </p>
        </div>
      </section>
      <section className="funding-note" aria-labelledby="funding-heading">
        <h2 id="funding-heading">Funding and thanks</h2>
        <Image
          src="/images/hands-of-worcester/funding.png"
          alt="Supported using public funding by the National Lottery through Arts Council England. With thanks to The Elmley Foundation."
          width={1600}
          height={743}
          sizes="(max-width: 760px) 100vw, 800px"
          style={{ width: "100%", height: "auto" }}
        />
        <p>{f.funding || fundingText}</p>
      </section>
      <section className="invitation">
        <Link className="text-link" href="/public-art">
          Explore public art & installations ↗
        </Link>
      </section>
    </div>
  );
}
