import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { publicClient } from "./supabase/server";
import type { Entry, EntryKind } from "./content-model";
export const publishedEntries = cache(
  async (kind: EntryKind): Promise<Entry[]> => {
    const { data, error } = await publicClient()
      .from("cms_public")
      .select("*")
      .eq("kind", kind)
      .order("sort_order")
      .order("published_at", { ascending: false });
    if (error) throw new Error("Published content is temporarily unavailable.");
    return data as Entry[];
  },
);
export const publishedEntry = cache(
  async (kind: EntryKind, slug: string): Promise<Entry | null> => {
    const entries = await publishedEntries(kind);
    return entries.find((entry) => entry.slug === slug) || null;
  },
);
export async function requirePublished(kind: EntryKind, slug: string) {
  const entry = await publishedEntry(kind, slug);
  if (!entry) notFound();
  return entry;
}
