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
  const title =
    entry.body.fields.seo_title ||
    (image?.caption ?? "").trim() ||
    "Studio detail";
  const share = image
    ? {
        url: local?.src || `/media/${image.id}`,
        alt: image.alt,
        width: local?.width || image.width,
        height: local?.height || image.height,
      }
    : undefined;
  return pageMetadata(
    title,
    entry.body.fields.seo_description || description,
    `/paintings-illustrations/${slug}`,
    share,
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
