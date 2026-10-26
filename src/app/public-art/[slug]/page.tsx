import { ProjectView } from "@/components/pages/project";
import { requirePublished } from "@/lib/content";
import { pageMetadata } from "@/lib/site";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await requirePublished("project", slug);
  return pageMetadata(
    entry.body.fields.seo_title || entry.title,
    entry.body.fields.seo_description || entry.body.fields.intro || entry.title,
    `/public-art/${slug}`,
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProjectView entry={await requirePublished("project", slug)} />;
}
