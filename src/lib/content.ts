import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import initialContent from "@/content/initial-content.json";
import { withHandsPresentation } from "@/content/hands-of-worcester";
import { publicClient, supabaseConfig } from "./supabase/server";
import type { ContentBody, Entry, EntryKind } from "./content-model";

type SeedEntry = {
  kind: EntryKind;
  slug: string;
  title: string;
  sort_order: number;
  body: ContentBody;
};

function seedEntryId(kind: string, slug: string) {
  let hash = 0;
  for (const char of `${kind}:${slug}`) {
    hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  }
  return `00000000-0000-4000-8000-${hash
    .toString(16)
    .padStart(12, "0")
    .slice(-12)}`;
}

function supabaseConfigured() {
  try {
    supabaseConfig();
    return true;
  } catch {
    return false;
  }
}

/** Bundled seed rows. Used when Supabase is unset, or before any artwork is published. */
export function seededEntries(kind: EntryKind): Entry[] {
  return (initialContent as unknown as SeedEntry[])
    .filter((entry) => entry.kind === kind)
    .map((entry) =>
      withHandsPresentation({
        id: seedEntryId(entry.kind, entry.slug),
        kind: entry.kind,
        slug: entry.slug,
        title: entry.title,
        body: entry.body,
        sort_order: entry.sort_order,
        revision: 0,
        updated_at: "1970-01-01T00:00:00.000Z",
      }),
    )
    .sort((a, b) => a.sort_order - b.sort_order);
}

export const publishedEntries = cache(
  async (kind: EntryKind): Promise<Entry[]> => {
    if (!supabaseConfigured()) return seededEntries(kind);
    const { data, error } = await publicClient()
      .from("cms_public")
      .select("*")
      .eq("kind", kind)
      .order("sort_order")
      .order("published_at", { ascending: false });
    if (error) throw new Error("Published content is temporarily unavailable.");
    const rows = (data as Entry[]).map(withHandsPresentation);
    // Production has no artwork rows yet. Show the seed until the first
    // artwork is published; after that the database list is the source.
    if (kind === "artwork" && rows.length === 0) return seededEntries(kind);
    return rows;
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
