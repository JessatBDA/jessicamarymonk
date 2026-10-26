import Link from "next/link";
import { Brushstroke } from "@/components/visuals";
import { ContentPhoto } from "@/components/content-render";
import { handsHero } from "@/content/hands-photos";
import { publishedEntries } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Public art",
  "The Hands of Worcester, a community installation by Jessica Mary Monk with The Worcester Plinth.",
  "/public-art",
  {
    url: handsHero.src,
    alt: handsHero.alt,
    width: handsHero.width,
    height: handsHero.height,
  },
);
export default async function Page() {
  const projects = await publishedEntries("project");
  return (
    <div className="wrap">
      <section className="page-intro">
        <p className="eyebrow">In shared spaces</p>
        <h1>
          Public art &<br />
          installations.
        </h1>
        <p>
          Community-led public art by Jessica Mary Monk. The Hands of Worcester
          was made with The Worcester Plinth, with support from Arts Council
          England and The Elmley Foundation.
        </p>
        <Brushstroke />
      </section>
      <section className="project-list">
        {projects.map((project, index) => (
          <Link
            key={project.id}
            href={`/public-art/${project.slug}`}
            className="project-card"
          >
            <ContentPhoto
              image={
                project.body.images.find((image) => image.role === "hero") ||
                project.body.images[0]
              }
              label={project.title}
              priority={index === 0}
              sizes="(max-width: 760px) 92vw, 1100px"
            />
            <div>
              <h2>{project.title}</h2>
              <p>
                {project.body.fields.location}
                <span>Explore project ↗</span>
              </p>
            </div>
          </Link>
        ))}
      </section>
      <section className="invitation">
        <h2>A project in mind?</h2>
        <Link className="text-link" href="/contact">
          Enquire about a public art commission ↗
        </Link>
      </section>
    </div>
  );
}
