import Image from "next/image";
import Link from "next/link";
import { FeedbackForm } from "@/components/engagement/forms";
import { handsHero } from "@/content/hands-photos";
import { fetchApprovedHandsWorks } from "@/lib/hands-works";
import { pageMetadata } from "@/lib/site";

export const revalidate = 60;

export const metadata = pageMetadata(
  "Feedback",
  "Have you seen the art? Share what you thought, or send a picture, a collage, a poem or some writing.",
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
        <h1>Feedback.</h1>
        <p>
          Have you seen the art? What did you think? Have you created something
          inspired by the hands? Give us your feedback and share your related
          hand artwork, whether it be pictures, collages, poems or just text
          feedback.
        </p>
        <p>
          <Link className="text-link" href="/engagement/share-your-hands/leaflet">
            Printable sheet for a school or group ↗
          </Link>
        </p>
      </section>
      <FeedbackForm />
      <section className="story-section" aria-labelledby="shared-works-heading">
        <div>
          <h2 id="shared-works-heading">Shared with the project</h2>
          {works.length === 0 ? (
            <p>
              Feedback and pictures that Jessica approves will be shown here.
              A name is shown only when someone gave one and she has approved
              it.
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
                    {work.writing &&
                    work.writing.replace(/\s+/g, " ").trim() !== work.title.trim() ? (
                      <p className="shared-writing">{work.writing}</p>
                    ) : null}
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
