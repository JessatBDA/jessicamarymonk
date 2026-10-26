"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  saveSchema,
  fieldsFor,
  publicPath,
  type Entry,
} from "@/lib/content-model";
export async function createEntry(form: FormData) {
  const { client } = await requireAdmin();
  const kind = z.enum(["project", "artwork"]).parse(form.get("kind"));
  const id = crypto.randomUUID();
  const { error } = await client
    .from("cms_entries")
    .insert({
      id,
      kind,
      slug: `untitled-${id.slice(0, 8)}`,
      title: kind === "project" ? "Untitled project" : "Untitled artwork",
      body: { fields: {}, images: [], featured: false },
    });
  if (error) throw new Error("Unable to create the draft.");
  redirect(`/admin/content/${id}`);
}
export async function saveEntry(input: unknown) {
  const { client } = await requireAdmin();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Check the content fields.",
    };
  const values = parsed.data;
  const { data: entry } = await client
    .from("cms_entries")
    .select("kind,slug")
    .eq("id", values.id)
    .single();
  if (!entry) return { ok: false, error: "Content not found." };
  const allowed = new Set(fieldsFor(entry.kind, entry.slug).map((f) => f.key));
  if (Object.keys(values.body.fields).some((key) => !allowed.has(key)))
    return {
      ok: false,
      error: "This entry contains an unsupported field. Reload and try again.",
    };
  for (const key of ["video", "email", "phone", "links"]) {
    const value = values.body.fields[key];
    if (!value) continue;
    if (key === "email" && !z.email().safeParse(value).success)
      return { ok: false, error: "Enter a valid public email address." };
    if (key === "phone" && !/^[+\d\s().-]{3,40}$/.test(value))
      return { ok: false, error: "Enter a valid public phone number." };
    if (
      (key === "video" || key === "links") &&
      value.split("\n").some((url) => {
        try {
          return new URL(url.trim()).protocol !== "https:";
        } catch {
          return true;
        }
      })
    )
      return {
        ok: false,
        error: "Video and related links must be valid https:// URLs.",
      };
  }
  const { data, error } = await client.rpc("save_cms_entry", {
    p_id: values.id,
    p_revision: values.revision,
    p_slug: values.slug,
    p_title: values.title,
    p_body: values.body,
    p_sort_order: values.sort_order,
    p_publish: values.publish,
  });
  if (error)
    return {
      ok: false,
      error:
        error.code === "23505"
          ? "That URL name is already in use. Choose another."
          : error.message.includes("another window")
            ? error.message
            : "Unable to save. Check the image descriptions and try again.",
    };
  revalidatePath("/", "layout");
  return { ok: true, entry: data as Entry, published: values.publish };
}
export async function unpublishEntry(id: string, revision: number) {
  const { client } = await requireAdmin();
  if (!z.uuid().safeParse(id).success || !Number.isInteger(revision))
    return { ok: false, error: "Invalid entry." };
  const { error } = await client.rpc("unpublish_cms_entry", {
    p_id: id,
    p_revision: revision,
  });
  if (error)
    return {
      ok: false,
      error: error.message.includes("Fixed pages")
        ? "Fixed website pages must stay published."
        : "Unable to unpublish. Reload the entry and try again.",
    };
  revalidatePath("/", "layout");
  return { ok: true };
}
export async function previewPath(id: string) {
  const { client } = await requireAdmin();
  const { data } = await client
    .from("cms_entries")
    .select("kind,slug")
    .eq("id", z.uuid().parse(id))
    .single();
  return data ? publicPath(data) : null;
}
