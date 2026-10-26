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
  return pageMetadata(
    entry.body.fields.seo_title || entry.title,
    entry.body.fields.seo_description || entry.title,
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
