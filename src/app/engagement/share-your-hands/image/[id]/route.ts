import { NextResponse } from "next/server";
import { z } from "zod";
import { publicClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return new NextResponse(null, { status: 404 });
  try {
    const { data, error } = await publicClient()
      .storage.from("hands-works")
      .download(`${id}.webp`);
    if (error || !data)
      return new NextResponse(null, {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    return new NextResponse(data, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=60",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
