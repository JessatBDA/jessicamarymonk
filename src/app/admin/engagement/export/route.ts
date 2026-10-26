import { NextResponse } from "next/server";
import { adminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function cell(value: unknown) {
  const text = value == null ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function csv(rows: Record<string, unknown>[], columns: string[]) {
  const lines = [
    columns.map(cell).join(","),
    ...rows.map((row) => columns.map((column) => cell(row[column])).join(",")),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}

const kinds = {
  names: {
    filename: "hands-names-and-consents.csv",
    columns: [
      "source",
      "id",
      "created_at",
      "display_name",
      "name_display_consent",
      "name_display_consent_at",
      "name_display_status",
      "status",
      "place",
      "group_name",
      "age_range",
      "took_part",
      "is_school_or_group",
    ],
  },
  responses: {
    filename: "hands-questionnaire.csv",
    columns: [
      "id",
      "created_at",
      "hands_mean",
      "hands_use",
      "piece_feel",
      "display_name",
      "name_display_consent",
      "name_display_consent_at",
      "name_display_status",
      "age_range",
      "is_school_or_group",
      "group_name",
      "share_consent",
      "status",
    ],
  },
  works: {
    filename: "hands-works.csv",
    columns: [
      "id",
      "created_at",
      "title",
      "credit",
      "writing",
      "image_path",
      "display_name",
      "name_display_consent",
      "name_display_consent_at",
      "name_display_status",
      "age_range",
      "is_school_or_group",
      "group_name",
      "share_consent",
      "status",
    ],
  },
} as const;

export async function GET(request: Request) {
  const session = await adminSession();
  if (!session)
    return new NextResponse("Administrator sign-in required.", { status: 401 });
  const type = new URL(request.url).searchParams.get("type");
  if (type !== "names" && type !== "responses" && type !== "works")
    return new NextResponse("Choose names, responses or works.", { status: 400 });
  const { client } = session;
  let rows: Record<string, unknown>[] = [];
  if (type === "responses" || type === "names") {
    const { data, error } = await client
      .from("hands_responses")
      .select("*")
      .order("created_at", { ascending: true });
    if (error)
      return new NextResponse("Apply the Hands of Worcester database update first.", { status: 503 });
    rows =
      type === "names"
        ? (data || []).map((row) => ({ ...row, source: "questionnaire" }))
        : data || [];
  }
  if (type === "works" || type === "names") {
    const { data, error } = await client
      .from("hands_works")
      .select("*")
      .order("created_at", { ascending: true });
    if (error)
      return new NextResponse("Apply the Hands of Worcester database update first.", { status: 503 });
    rows =
      type === "names"
        ? [...rows, ...(data || []).map((row) => ({ ...row, source: "work" }))]
        : data || [];
  }
  if (type === "names") {
    const { data, error } = await client
      .from("hands_name_requests")
      .select("*")
      .order("created_at", { ascending: true });
    if (error)
      return new NextResponse("Apply the Hands of Worcester database update first.", { status: 503 });
    rows = [...rows, ...(data || []).map((row) => ({ ...row, source: "name request" }))];
  }
  const spec = kinds[type];
  return new NextResponse(csv(rows, [...spec.columns]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${spec.filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
