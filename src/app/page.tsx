import portrait from "../../images/jess-portrait.jpg";
import { HomeView } from "@/components/pages/home";
import { metaDescription } from "@/lib/artist-copy";
import { requirePublished, publishedEntries } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const {
    body: { fields: f },
  } = await requirePublished("page", "home");
  return pageMetadata(
    f.seo_title || "Public artist, painter and illustrator",
    metaDescription(f.seo_description),
    "/",
    {
      url: portrait.src,
      alt: "Jessica Mary Monk smiling, holding her dog on a beach at sunset",
      width: portrait.width,
      height: portrait.height,
    },
  );
}
export default async function Page() {
  const entry = await requirePublished("page", "home");
  const projects = await publishedEntries("project");
  const artworks = await publishedEntries("artwork");
  const project = entry.body.fields.feature_slug
    ? projects.find((p) => p.slug === entry.body.fields.feature_slug)
    : projects.find((p) => p.body.featured);
  return (
    <HomeView entry={entry} project={project || null} artworks={artworks} />
  );
}
