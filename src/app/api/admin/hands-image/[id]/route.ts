import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await adminSession();
  if (!session)
    return new NextResponse(null, { status: 401, headers: { "Cache-Control": "no-store" } });
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return new NextResponse(null, { status: 404 });
  const { data, error } = await session.client.storage
    .from("hands-works")
    .download(`${id}.webp`);
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
