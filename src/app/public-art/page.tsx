import Link from "next/link";
import { Brushstroke } from "@/components/visuals";
import { ContentPhoto } from "@/components/content-render";
import { publishedEntries } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata(
  "Public Art & Installations",
  "Public art and community installations by Jessica Mary Monk.",
  "/public-art",
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
          Explore Jessica’s public art practice, with community engagement at
          its heart.
        </p>
        <Brushstroke />
      </section>
      <section className="project-list">
        {projects.map((project) => (
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
