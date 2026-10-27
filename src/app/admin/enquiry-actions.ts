"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

const statuses = ["pending", "handled"] as const;

function fail(message: string): never {
  redirect(`/admin/enquiries?error=${encodeURIComponent(message)}`);
}

export async function setEnquiryStatus(form: FormData) {
  const { client } = await requireAdmin();
  const id = z.uuid().safeParse(form.get("id"));
  const status = z.enum(statuses).safeParse(form.get("status"));
  if (!id.success || !status.success)
    fail("That update could not be read. Reload and try again.");
  const { error } = await client
    .from("contact_enquiries")
    .update({ status: status.data })
    .eq("id", id.data);
  if (error)
    fail("That could not be saved. Apply the contact database update if you have not already.");
  revalidatePath("/admin/enquiries");
  redirect("/admin/enquiries?saved=1");
}
