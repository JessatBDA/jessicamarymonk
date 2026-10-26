import sharp from "sharp";
import { NextResponse } from "next/server";
import { z } from "zod";
import { adminSession } from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const session = await adminSession();
  if (!session)
    return NextResponse.json(
      { error: "Administrator sign-in required." },
      { status: 401 },
    );
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 3300000)
    return NextResponse.json(
      { error: "Choose a file under 3 MB." },
      { status: 413 },
    );
  try {
    const form = await request.formData();
    const file = form.get("file");
    const entryId = form.get("entryId");
    if (!(file instanceof File) || !z.uuid().safeParse(entryId).success)
      return NextResponse.json(
        { error: "Choose an image and a valid content entry." },
        { status: 400 },
      );
    if (
      file.size === 0 ||
      file.size > 3 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return NextResponse.json(
        { error: "Use a JPG, PNG or WebP image under 3 MB." },
        { status: 400 },
      );
    const { client } = session;
    const { data: entry } = await client
      .from("cms_entries")
      .select("id")
      .eq("id", entryId)
      .maybeSingle();
    if (!entry)
      return NextResponse.json(
        { error: "Content entry not found." },
        { status: 404 },
      );
    const input = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(input, {
      limitInputPixels: 40000000,
    }).metadata();
    if (
      !["jpeg", "png", "webp"].includes(metadata.format || "") ||
      (metadata.pages && metadata.pages > 1)
    )
      throw new Error("Unsupported image");
    const { data: buffer, info } = await sharp(input, {
      limitInputPixels: 40000000,
    })
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer({ resolveWithObject: true });
    const id = crypto.randomUUID();
    const path = `${entryId}/${id}.webp`;
    const { error: uploadError } = await client.storage
      .from("cms-images")
      .upload(path, buffer, {
        contentType: "image/webp",
        upsert: false,
        cacheControl: "0",
      });
    if (uploadError)
      return NextResponse.json(
        { error: "Image upload failed. Please try again." },
        { status: 502 },
      );
    const { error: assetError } = await client
      .from("cms_assets")
      .insert({
        id,
        entry_id: entryId,
        storage_path: path,
        filename: file.name.slice(0, 200),
        width: info.width,
        height: info.height,
        bytes: buffer.length,
      });
    if (assetError) {
      await client.storage.from("cms-images").remove([path]);
      return NextResponse.json(
        { error: "Unable to save the image. Please try again." },
        { status: 502 },
      );
    }
    return NextResponse.json(
      {
        image: {
          id,
          alt: file.name
            .replace(/\.[^.]+$/, "")
            .replace(/[-_]/g, " ")
            .slice(0, 300),
          caption: "",
          role: "gallery",
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "This image could not be processed. Use a valid, non-animated JPG, PNG or WebP under 3 MB and 40 megapixels.",
      },
      { status: 400 },
    );
  }
}
