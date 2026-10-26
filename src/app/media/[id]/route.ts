import { NextResponse } from "next/server";
import { z } from "zod";
import { publicClient, serverClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return new NextResponse(null, { status: 404 });
  let client = publicClient();
  let result = await client
    .from("cms_assets")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!result.data) {
    client = await serverClient();
    result = await client
      .from("cms_assets")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();
  }
  if (!result.data)
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  const { data, error } = await client.storage
    .from("cms-images")
    .download(result.data.storage_path);
  if (error || !data)
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  return new NextResponse(data, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
