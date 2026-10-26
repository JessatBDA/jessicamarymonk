import { ArtworkView } from "@/components/pages/artwork";
import { requirePublished } from "@/lib/content";
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
  const label = image?.alt || "Studio work";
  return pageMetadata(
    entry.body.fields.seo_title || label,
    entry.body.fields.seo_description || label,
    `/paintings-illustrations/${slug}`,
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
