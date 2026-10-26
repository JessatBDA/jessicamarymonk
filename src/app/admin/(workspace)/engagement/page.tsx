import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { ageRangeLabel, isUnder18 } from "@/lib/hands-age";
import {
  bulkApproveNames,
  setNameDisplay,
  setSubmissionStatus,
} from "../../engagement-actions";

type Row = {
  id: string;
  created_at: string;
  display_name: string;
  name_display_consent: boolean;
  name_display_consent_at: string | null;
  name_display_status: string;
  status: string;
  table: "hands_responses" | "hands_works" | "hands_name_requests";
  summary: string;
  detail: string;
  image: boolean;
  ageRange: string | null;
};

const responseColumns =
  "id,created_at,hands_mean,hands_use,piece_feel,display_name,name_display_consent,name_display_consent_at,name_display_status,age_range,is_school_or_group,group_name,status";
const workColumns =
  "id,created_at,title,credit,writing,image_path,display_name,name_display_consent,name_display_consent_at,name_display_status,age_range,is_school_or_group,group_name,status";
const nameColumns =
  "id,created_at,display_name,place,took_part,name_display_consent,name_display_consent_at,name_display_status,status";

function clip(value: unknown) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > 280 ? `${text.slice(0, 277)}…` : text;
}

function when(value: string) {
  return new Date(value).toLocaleString("en-GB", { timeZone: "Europe/London" });
}

function missingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /hands_(responses|works|name_requests)|schema cache/i.test(error.message || "")
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error: notice, saved } = await searchParams;
  const { client } = await requireAdmin();
  const [responses, works, names] = await Promise.all([
    client.from("hands_responses").select(responseColumns).order("created_at", { ascending: false }).limit(200),
    client.from("hands_works").select(workColumns).order("created_at", { ascending: false }).limit(200),
    client.from("hands_name_requests").select(nameColumns).order("created_at", { ascending: false }).limit(200),
  ]);
  const firstError = responses.error || works.error || names.error;
  if (missingTable(firstError)) {
    return (
      <>
        <p className="admin-kicker">Project engagement</p>
        <h1>Hands of Worcester submissions</h1>
        <div className="admin-panel">
          <p>
            The database update has not been applied yet, so there is nothing
            to review.             Apply{" "}
            <code>supabase/migrations/20261026160000_hands_engagement.sql</code>{" "}
            and then{" "}
            <code>supabase/migrations/20261026190000_hands_age_ranges.sql</code>{" "}
            to the Jessica Mary Monk project, then reload this page. The steps
            are in <code>docs/HANDS-ENGAGEMENT.md</code>.
          </p>
        </div>
      </>
    );
  }
  if (firstError) throw new Error("Unable to load Hands of Worcester submissions.");

  const rows: Row[] = [
    ...(responses.data || []).map((row) => ({
      id: row.id,
      created_at: row.created_at,
      display_name: row.display_name,
      name_display_consent: row.name_display_consent,
      name_display_consent_at: row.name_display_consent_at,
      name_display_status: row.name_display_status,
      status: row.status,
      table: "hands_responses" as const,
      summary: "Questionnaire",
      detail: [row.hands_mean, row.hands_use, row.piece_feel].map(clip).filter(Boolean).join(" · "),
      image: false,
      ageRange: row.age_range,
    })),
    ...(works.data || []).map((row) => ({
      id: row.id,
      created_at: row.created_at,
      display_name: row.display_name,
      name_display_consent: row.name_display_consent,
      name_display_consent_at: row.name_display_consent_at,
      name_display_status: row.name_display_status,
      status: row.status,
      table: "hands_works" as const,
      summary: row.title,
      detail: clip(row.writing || row.credit),
      image: Boolean(row.image_path),
      ageRange: row.age_range,
    })),
    ...(names.data || []).map((row) => ({
      id: row.id,
      created_at: row.created_at,
      display_name: row.display_name,
      name_display_consent: row.name_display_consent,
      name_display_consent_at: row.name_display_consent_at,
      name_display_status: row.name_display_status,
      status: row.status,
      table: "hands_name_requests" as const,
      summary: "Name request",
      detail: [row.place, row.took_part ? `Workshop: ${row.took_part}` : ""].filter(Boolean).join(" · "),
      image: false,
      ageRange: null,
    })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <>
      <p className="admin-kicker">Project engagement</p>
      <h1>Hands of Worcester submissions</h1>
      <p>
        Approve a picture or piece of writing to show it on Share your hands.
        A name is shown on the public thank-you list only when the permission
        box was ticked and you approve the name. That list is people who agreed
        to be shown, not everyone who took part. Nothing here is published on
        its own. If new age ranges are rejected when someone sends a form,
        apply <code>supabase/migrations/20261026190000_hands_age_ranges.sql</code>.
      </p>
      {saved && <p className="admin-badge">Saved.</p>}
      {notice && <p role="alert">{notice}</p>}
      <div className="admin-actions">
        <form action={bulkApproveNames}>
          <button className="admin-button" type="submit">
            Approve every consented name still waiting
          </button>
        </form>
        <Link className="admin-button secondary" href="/admin/engagement/export?type=names">
          Download names and consents
        </Link>
        <Link className="admin-button secondary" href="/admin/engagement/export?type=responses">
          Download answers
        </Link>
        <Link className="admin-button secondary" href="/admin/engagement/export?type=works">
          Download pictures and writing
        </Link>
      </div>
      <section className="admin-panel">
        <h2>{rows.length} received</h2>
        {rows.length === 0 && <p>Nothing has been sent yet.</p>}
        {rows.map((row) => (
          <article className="admin-review" key={`${row.table}-${row.id}`}>
            <header>
              <strong>{row.summary}</strong>
              <span className="admin-badge">{row.status}</span>
              <time dateTime={row.created_at}>{when(row.created_at)}</time>
            </header>
            {row.detail && <p>{row.detail}</p>}
            {row.ageRange !== null && (
              <p>Age range: {ageRangeLabel(row.ageRange)}</p>
            )}
            {row.ageRange !== null && isUnder18(row.ageRange) && (
              <p>
                This person is under 18. Approve the name only if a parent or
                teacher gave permission.
              </p>
            )}
            <p>
              Name: {row.display_name.trim() || "Not given"}
              {" · "}
              Permission: {row.name_display_consent ? "Yes" : "No"}
              {row.name_display_consent_at
                ? ` (${when(row.name_display_consent_at)})`
                : ""}
              {" · "}
              Name status: {row.name_display_status}
            </p>
            {row.image && (
              // Private admin preview. next/image would cache a signed-in response.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="admin-review-image"
                src={`/api/admin/hands-image/${row.id}`}
                alt="Submitted picture"
              />
            )}
            <div className="admin-actions">
              {row.table !== "hands_name_requests" && (
                <>
                  <form action={setSubmissionStatus}>
                    <input type="hidden" name="table" value={row.table} />
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="status" value="approved" />
                    <button className="admin-button" type="submit">
                      Show on the site
                    </button>
                  </form>
                  <form action={setSubmissionStatus}>
                    <input type="hidden" name="table" value={row.table} />
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="status" value="hidden" />
                    <button className="admin-button secondary" type="submit">
                      Hide
                    </button>
                  </form>
                  <form action={setSubmissionStatus}>
                    <input type="hidden" name="table" value={row.table} />
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="status" value="pending" />
                    <button type="submit">Mark as waiting</button>
                  </form>
                </>
              )}
              <form action={setNameDisplay}>
                <input type="hidden" name="table" value={row.table} />
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="name_display_status" value="approved" />
                <button
                  className="admin-button"
                  type="submit"
                  disabled={!row.name_display_consent || !row.display_name.trim()}
                >
                  Approve name
                </button>
              </form>
              <form action={setNameDisplay}>
                <input type="hidden" name="table" value={row.table} />
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="name_display_status" value="rejected" />
                <button className="admin-button danger" type="submit">
                  Reject name
                </button>
              </form>
              <form action={setNameDisplay}>
                <input type="hidden" name="table" value={row.table} />
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="name_display_status" value="pending" />
                <button type="submit">Name waiting</button>
              </form>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
