"use server";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

const tables = ["hands_responses", "hands_works", "hands_name_requests"] as const;
const submissionStatus = ["pending", "approved", "hidden"] as const;
const nameStatus = ["pending", "approved", "rejected"] as const;

function refresh() {
  updateTag("hands-names");
  updateTag("hands-works");
  revalidatePath("/public-art/the-hands-of-worcester");
  revalidatePath("/engagement/share-your-hands");
}

function fail(message: string): never {
  redirect(`/admin/engagement?error=${encodeURIComponent(message)}`);
}

export async function setSubmissionStatus(form: FormData) {
  const { client } = await requireAdmin();
  const table = z.enum(tables).safeParse(form.get("table"));
  const id = z.uuid().safeParse(form.get("id"));
  const status = z.enum(submissionStatus).safeParse(form.get("status"));
  if (!table.success || !id.success || !status.success)
    fail("That update could not be read. Reload and try again.");
  if (table.data === "hands_name_requests")
    fail("Use the name buttons for a name request.");
  const { error } = await client
    .from(table.data)
    .update({ status: status.data })
    .eq("id", id.data);
  if (error) fail("That could not be saved. Apply the database update if you have not already.");
  refresh();
  redirect("/admin/engagement?saved=1");
}

export async function setNameDisplay(form: FormData) {
  const { client } = await requireAdmin();
  const table = z.enum(tables).safeParse(form.get("table"));
  const id = z.uuid().safeParse(form.get("id"));
  const status = z.enum(nameStatus).safeParse(form.get("name_display_status"));
  if (!table.success || !id.success || !status.success)
    fail("That update could not be read. Reload and try again.");
  const { data, error: readError } = await client
    .from(table.data)
    .select("display_name,name_display_consent")
    .eq("id", id.data)
    .maybeSingle();
  if (readError || !data) fail("That entry could not be found.");
  const name = String(data.display_name || "").trim();
  if (status.data === "approved" && (!data.name_display_consent || !name))
    fail("A name can be approved only when permission was given and a name was entered.");
  const patch =
    table.data === "hands_name_requests"
      ? {
          name_display_status: status.data,
          status: status.data === "approved" ? "approved" : status.data === "rejected" ? "hidden" : "pending",
        }
      : { name_display_status: status.data };
  const { error } = await client.from(table.data).update(patch).eq("id", id.data);
  if (error) fail("That name could not be updated. Permission is required before a name can be approved.");
  refresh();
  redirect("/admin/engagement?saved=1");
}

export async function bulkApproveNames() {
  const { client } = await requireAdmin();
  for (const table of tables) {
    const patch =
      table === "hands_name_requests"
        ? { name_display_status: "approved", status: "approved" }
        : { name_display_status: "approved" };
    const { error } = await client
      .from(table)
      .update(patch)
      .eq("name_display_consent", true)
      .eq("name_display_status", "pending")
      .neq("display_name", "");
    if (error) fail("The names could not all be approved. Check that the database update has been applied.");
  }
  refresh();
  redirect("/admin/engagement?saved=1");
}
