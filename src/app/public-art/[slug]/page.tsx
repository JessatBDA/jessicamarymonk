import { ProjectView } from "@/components/pages/project";
import { handsHero } from "@/content/hands-photos";
import { handsSlug } from "@/content/hands-of-worcester";
import { requirePublished } from "@/lib/content";
import { pageMetadata, siteUrl } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await requirePublished("project", slug);
  const image =
    slug === handsSlug
      ? {
          url: handsHero.src,
          alt: handsHero.alt,
          width: handsHero.width,
          height: handsHero.height,
        }
      : undefined;
  return pageMetadata(
    entry.body.fields.seo_title || entry.title,
    entry.body.fields.seo_description || entry.body.fields.intro || entry.title,
    `/public-art/${slug}`,
    image,
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await requirePublished("project", slug);
  const jsonLd =
    slug === handsSlug
      ? {
          "@context": "https://schema.org",
          "@type": "VisualArtwork",
          name: "The Hands of Worcester",
          creator: { "@type": "Person", name: "Jessica Mary Monk" },
          artform: "Public art installation",
          artMedium: "Painted plaster casts sealed in resin",
          description:
            entry.body.fields.seo_description || entry.body.fields.intro,
          image: new URL(handsHero.src, siteUrl).href,
          locationCreated: {
            "@type": "Place",
            name: "Worcester, United Kingdom",
          },
        }
      : null;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProjectView entry={entry} />
    </>
  );
}
