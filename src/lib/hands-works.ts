import "server-only";
import { expectedProjectUrl } from "@/lib/supabase/server";

export type SharedWork = {
  id: string;
  title: string;
  writing: string;
  imagePath: string | null;
  credit: string;
  groupName: string;
};

/** Approved works only. Personal names are included only when consent was approved. */
export async function fetchApprovedHandsWorks(): Promise<SharedWork[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url !== expectedProjectUrl || !key?.startsWith("sb_publishable_"))
    return [];
  try {
    const response = await fetch(`${url}/rest/v1/rpc/approved_hands_works`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      next: { revalidate: 60, tags: ["hands-works"] },
    });
    if (!response.ok) return [];
    const data: unknown = await response.json();
    if (!Array.isArray(data)) return [];
    return data.flatMap((row) => {
      if (!row || typeof row !== "object") return [];
      const record = row as Record<string, unknown>;
      if (typeof record.id !== "string" || typeof record.title !== "string")
        return [];
      return [
        {
          id: record.id,
          title: record.title,
          writing: typeof record.writing === "string" ? record.writing : "",
          imagePath:
            typeof record.image_path === "string" ? record.image_path : null,
          credit: typeof record.credit === "string" ? record.credit : "",
          groupName:
            typeof record.group_name === "string" ? record.group_name : "",
        },
      ];
    });
  } catch {
    return [];
  }
}
