import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { publishedEntries } from "@/lib/content";
import { HomeView } from "@/components/pages/home";
import { AboutView } from "@/components/pages/about";
import { ProjectView } from "@/components/pages/project";
import { ArtworkView } from "@/components/pages/artwork";
import { ContactView } from "@/components/pages/contact";
import type { Entry } from "@/lib/content-model";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { client } = await requireAdmin();
  const { data } = await client
    .from("cms_entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const entry = data as Entry;
  let view: React.ReactNode;
  if (entry.kind === "project") view = <ProjectView entry={entry} />;
  else if (entry.kind === "artwork") view = <ArtworkView entry={entry} />;
  else if (entry.slug === "about") view = <AboutView entry={entry} />;
  else if (entry.slug === "contact") view = <ContactView entry={entry} />;
  else {
    const projects = await publishedEntries("project");
    view = (
      <HomeView
        entry={entry}
        project={
          projects.find(
            (project) => project.slug === entry.body.fields.feature_slug,
          ) || null
        }
        artworks={await publishedEntries("artwork")}
      />
    );
  }
  return (
    <>
      <div className="admin-preview-banner">
        <span>Private preview · Last saved draft · Not published</span>
        <Link href={`/admin/content/${id}`}>Return to editor →</Link>
      </div>
      <div className="admin-preview-content">{view}</div>
    </>
  );
}
