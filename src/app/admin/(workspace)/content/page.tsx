import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createEntry } from "@/app/admin/content-actions";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind: queryKind } = await searchParams;
  const kind = ["page", "project", "artwork"].includes(queryKind || "")
    ? queryKind!
    : "page";
  const { client } = await requireAdmin();
  const { data: entries, error } = await client
    .from("cms_entries")
    .select("*")
    .eq("kind", kind)
    .order("sort_order")
    .order("updated_at", { ascending: false });
  if (error) throw new Error("Unable to load content.");
  const { data: live } = await client
    .from("cms_public")
    .select("id,published_at");
  const titles: Record<string, string> = {
    page: "Pages & biography",
    project: "Public art projects",
    artwork: "Artwork & galleries",
  };
  return (
    <>
      <div className="admin-title-row">
        <div>
          <h1>{titles[kind]}</h1>
          <p>Lower display-order numbers appear first.</p>
        </div>
        {kind !== "page" && (
          <form action={createEntry}>
            <input type="hidden" name="kind" value={kind} />
            <button className="admin-button">
              Add {kind === "project" ? "project" : "artwork"}
            </button>
          </form>
        )}
      </div>
      <div className="admin-panel">
        {entries?.length ? (
          entries.map((entry) => {
            const publication = live?.find((p) => p.id === entry.id);
            return (
              <Link
                className="admin-list-row"
                key={entry.id}
                href={`/admin/content/${entry.id}`}
              >
                <span>
                  {entry.title}
                  <small>
                    /{entry.slug} · Order {entry.sort_order}
                  </small>
                </span>
                <span className="admin-badge">
                  {publication
                    ? new Date(entry.updated_at) >
                      new Date(publication.published_at)
                      ? "Published · newer draft"
                      : "Published"
                    : "Draft"}
                </span>
              </Link>
            );
          })
        ) : (
          <p>No entries yet. Add your first {kind} to get started.</p>
        )}
      </div>
    </>
  );
}
