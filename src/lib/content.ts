import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import initialContent from "@/content/initial-content.json";
import { withHandsPresentation } from "@/content/hands-of-worcester";
import { publicClient, supabaseConfig } from "./supabase/server";
import type { ContentBody, Entry, EntryKind } from "./content-model";

function supabaseConfigured() {
  try {
    supabaseConfig();
    return true;
  } catch {
    return false;
  }
}

function repoEntries(kind: EntryKind): Entry[] {
  return initialContent
    .filter((entry) => entry.kind === kind)
    .map((entry) =>
      withHandsPresentation({
        id: `repo-${entry.kind}-${entry.slug}`,
        kind: entry.kind as EntryKind,
        slug: entry.slug,
        title: entry.title,
        body: entry.body as unknown as ContentBody,
        sort_order: entry.sort_order,
        revision: 0,
        updated_at: "1970-01-01T00:00:00.000Z",
      }),
    );
}

export const publishedEntries = cache(
  async (kind: EntryKind): Promise<Entry[]> => {
    if (!supabaseConfigured()) return repoEntries(kind);
    const { data, error } = await publicClient()
      .from("cms_public")
      .select("*")
      .eq("kind", kind)
      .order("sort_order")
      .order("published_at", { ascending: false });
    if (error) throw new Error("Published content is temporarily unavailable.");
    return (data as Entry[]).map(withHandsPresentation);
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
