import { ArtworkView } from "@/components/pages/artwork";
import { requirePublished } from "@/lib/content";
import { studioImages } from "@/lib/studio-images";
import { pageMetadata } from "@/lib/site";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await requirePublished("artwork", slug);
  const image =
    entry.body.images.find((item) => item.role === "hero") ||
    entry.body.images[0];
  const local = image?.file ? studioImages[image.file] : undefined;
  const description =
    image?.alt ||
    "A detail from an acrylic painting or a drawing by Jessica Mary Monk.";
  return pageMetadata(
    entry.body.fields.seo_title || "Studio detail",
    entry.body.fields.seo_description || description,
    `/paintings-illustrations/${slug}`,
    local
      ? {
          url: local.src,
          alt: description,
          width: local.width,
          height: local.height,
        }
      : undefined,
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ArtworkView entry={await requirePublished("artwork", slug)} />;
}
