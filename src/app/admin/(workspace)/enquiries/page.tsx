import { requireAdmin } from "@/lib/auth";
import { setEnquiryStatus } from "../../enquiry-actions";
import { contactTopicLabel } from "@/lib/contact-public";

function when(value: string) {
  return new Date(value).toLocaleString("en-GB", { timeZone: "Europe/London" });
}

function missingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /contact_enquiries|schema cache/i.test(error.message || "")
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error: notice, saved } = await searchParams;
  const { client } = await requireAdmin();
  const enquiries = await client
    .from("contact_enquiries")
    .select("id,created_at,name,email,topic,message,status")
    .order("created_at", { ascending: false })
    .limit(200);
  if (missingTable(enquiries.error)) {
    return (
      <>
        <p className="admin-kicker">Website</p>
        <h1>Contact enquiries</h1>
        <div className="admin-panel">
          <p>
            The database update has not been applied yet, so there is nothing
            to read. Apply{" "}
            <code>supabase/migrations/20261026200000_contact_enquiries.sql</code>{" "}
            to the Jessica Mary Monk project, then reload this page. The steps
            are in <code>docs/CONTACT.md</code>.
          </p>
        </div>
      </>
    );
  }
  if (enquiries.error) throw new Error("Unable to load contact enquiries.");
  const rows = enquiries.data || [];
  return (
    <>
      <p className="admin-kicker">Website</p>
      <h1>Contact enquiries</h1>
      <p>
        Messages sent from the contact page. Mark one as handled once you have
        replied. Nothing here is published on the website.
      </p>
      {saved && <p className="admin-badge">Saved.</p>}
      {notice && <p role="alert">{notice}</p>}
      <section className="admin-panel">
        <h2>{rows.length} received</h2>
        {rows.length === 0 && <p>No enquiries yet.</p>}
        {rows.map((row) => (
          <article className="admin-review" key={row.id}>
            <header>
              <strong>{row.name}</strong>
              <span className="admin-badge">{row.status}</span>
              <time dateTime={row.created_at}>{when(row.created_at)}</time>
            </header>
            <p>
              <a href={`mailto:${row.email}`}>{row.email}</a>
              {" · "}
              {contactTopicLabel(row.topic)}
            </p>
            <p className="enquiry-message">{row.message}</p>
            <div className="admin-actions">
              <form action={setEnquiryStatus}>
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="status" value="handled" />
                <button className="admin-button" type="submit">
                  Mark as handled
                </button>
              </form>
              <form action={setEnquiryStatus}>
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="status" value="pending" />
                <button className="admin-button secondary" type="submit">
                  Mark as waiting
                </button>
              </form>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
