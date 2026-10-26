import Image from "next/image";
import Link from "next/link";
import { ResponseForm, WorkForm } from "@/components/engagement/forms";
import { handsHero } from "@/content/hands-photos";
import { fetchApprovedHandsWorks } from "@/lib/hands-works";
import { pageMetadata } from "@/lib/site";

export const revalidate = 60;

export const metadata = pageMetadata(
  "Share your hands",
  "211 people took part. Tell Jessica Mary Monk what hands mean to you, or send a drawing, a poem or some writing. Names on the project page are those who agreed to be shown.",
  "/engagement/share-your-hands",
  {
    url: handsHero.src,
    alt: handsHero.alt,
    width: handsHero.width,
    height: handsHero.height,
  },
);

export default async function Page() {
  const works = await fetchApprovedHandsWorks();
  return (
    <article className="wrap share-page">
      <section className="page-intro">
        <Link className="back-link" href="/public-art/the-hands-of-worcester">
          ← The Hands of Worcester
        </Link>
        <p className="eyebrow">The Hands of Worcester</p>
        <h1>Share your hands.</h1>
        <p>
          211 people took part. What do hands mean to you? You can answer a few
          questions, or send a picture, a poem or some writing. Nothing is put
          on this website until Jessica has checked it. The names on the
          project page are those who agreed to be shown.
        </p>
        <p>
          <Link className="text-link" href="/engagement/share-your-hands/leaflet">
            Printable sheet for a school or group ↗
          </Link>
        </p>
      </section>
      <ResponseForm />
      <WorkForm />
      <section className="story-section" aria-labelledby="shared-works-heading">
        <div>
          <h2 id="shared-works-heading">Shared with the project</h2>
          {works.length === 0 ? (
            <p>
              Pictures and writing that Jessica approves will be shown here.
              Names are shown only when someone has given permission and she
              has approved that too.
            </p>
          ) : (
            <ul className="shared-works">
              {works.map((work) => (
                <li key={work.id}>
                  <article>
                    <h3>{work.title}</h3>
                    {work.imagePath && (
                      <Image
                        src={`/engagement/share-your-hands/image/${work.id}`}
                        alt={work.title}
                        width={1600}
                        height={1200}
                        unoptimized
                        sizes="(max-width: 760px) 100vw, 760px"
                      />
                    )}
                    {work.writing && <p className="shared-writing">{work.writing}</p>}
                    {(work.credit || work.groupName) && (
                      <p className="muted">
                        {[work.credit, work.groupName].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </article>
  );
}
