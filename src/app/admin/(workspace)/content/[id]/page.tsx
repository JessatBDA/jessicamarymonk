import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ContentEditor } from "@/components/admin/content-editor";
import type { Entry } from "@/lib/content-model";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { client } = await requireAdmin();
  const { data, error } = await client
    .from("cms_entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) notFound();
  const { data: live } = await client
    .from("cms_public")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();
  return (
    <ContentEditor
      initial={data as Entry}
      publishedAt={live?.published_at || null}
    />
  );
}
