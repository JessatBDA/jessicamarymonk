import "server-only";
import { expectedProjectUrl } from "@/lib/supabase/server";
import { panelNames } from "@/content/hands-of-worcester";

export function mergeHandsNames(approved: string[]) {
  const seen = new Map<string, string>();
  for (const name of [...panelNames(), ...approved]) {
    const clean = name.trim().replace(/\s+/g, " ");
    if (!clean) continue;
    const key = clean.toLocaleLowerCase("en-GB");
    if (!seen.has(key)) seen.set(key, clean);
  }
  return [...seen.values()].sort((a, b) =>
    a.localeCompare(b, "en-GB", { sensitivity: "base" }),
  );
}

/** Approved, consented names only. Falls back to an empty list. */
export async function fetchApprovedHandsNames(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url !== expectedProjectUrl || !key?.startsWith("sb_publishable_"))
    return [];
  try {
    const response = await fetch(`${url}/rest/v1/rpc/approved_hands_names`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      next: { revalidate: 60, tags: ["hands-names"] },
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];
    return data.flatMap((row) => {
      if (typeof row === "string") return [row];
      if (
        row &&
        typeof row === "object" &&
        "display_name" in row &&
        typeof row.display_name === "string"
      )
        return [row.display_name];
      return [];
    });
  } catch {
    return [];
  }
}
