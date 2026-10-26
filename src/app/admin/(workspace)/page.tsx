import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
export default async function Page() {
  const { client } = await requireAdmin();
  const { data: entries, error } = await client
    .from("cms_entries")
    .select("id,title,kind,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error("Unable to load your content.");
  const { data: published } = await client.from("cms_public").select("id");
  return (
    <>
      <p className="admin-kicker">Website & Profile</p>
      <h1>Your website, in your hands.</h1>
      <p>
        Edit a draft, preview it, then publish when you’re ready. The public
        website keeps its current version until you publish.
      </p>
      <div className="admin-summary">
        <section>
          <strong>{entries?.length || 0}</strong>
          <span>Content entries</span>
        </section>
        <section>
          <strong>{published?.length || 0}</strong>
          <span>Published</span>
        </section>
        <section>
          <strong>{(entries?.length || 0) - (published?.length || 0)}</strong>
          <span>Unpublished</span>
        </section>
      </div>
      <div className="admin-shortcuts">
        {[
          [
            "page",
            "Pages & biography",
            "Homepage, artist biography and contact information",
          ],
          [
            "project",
            "Public art projects",
            "Project stories, photographs and installation galleries",
          ],
          [
            "artwork",
            "Artwork & galleries",
            "Paintings, illustrations and portfolio categories",
          ],
        ].map(([kind, title, text]) => (
          <Link key={kind} href={`/admin/content?kind=${kind}`}>
            <h2>{title}</h2>
            <p>{text}</p>
            <span>Manage →</span>
          </Link>
        ))}
      </div>
      <section className="admin-panel">
        <h2>Recently edited</h2>
        {entries?.slice(0, 6).map((entry) => (
          <Link
            className="admin-list-row"
            key={entry.id}
            href={`/admin/content/${entry.id}`}
          >
            <span>
              {entry.title}
              <small>{entry.kind}</small>
            </span>
            <time dateTime={entry.updated_at}>
              {new Date(entry.updated_at).toLocaleDateString("en-GB", {
                timeZone: "Europe/London",
              })}
            </time>
          </Link>
        ))}
      </section>
    </>
  );
}
