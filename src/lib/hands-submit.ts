import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import sharp from "sharp";
import { z } from "zod";
import { ageRanges } from "@/lib/hands-age";
import { expectedProjectUrl, publicClient } from "@/lib/supabase/server";

const buckets = new Map<string, { count: number; reset: number }>();

export const tookPartValues = ["", "yes", "no", "prefer-not"] as const;

export type SubmitResult = { ok: true; message: string } | { ok: false; error: string };

function configured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url !== expectedProjectUrl || !key?.startsWith("sb_publishable_")) return null;
  return { url, key };
}

export async function clientHash() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerStore.get("x-real-ip") || "local";
  return createHash("sha256").update(`hands-worcester:${ip}`).digest("hex");
}

export function allowSubmission(key: string) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const current = buckets.get(key);
  if (!current || now > current.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (current.count >= 5) return false;
  current.count += 1;
  return true;
}

export function readHoneypot(form: FormData) {
  return String(form.get("company_website") || "").trim();
}

function clean(value: FormDataEntryValue | null, max: number) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function multiline(value: FormDataEntryValue | null, max: number) {
  return String(value || "").replace(/\r\n/g, "\n").trim().slice(0, max);
}

export function sharedFields(form: FormData) {
  const age = clean(form.get("age_range"), 40);
  const tookPart = clean(form.get("took_part"), 20);
  return {
    display_name: clean(form.get("display_name"), 80),
    name_display_consent: form.get("name_display_consent") === "yes",
    age_range: (ageRanges as readonly string[]).includes(age) ? age : "",
    is_school_or_group: form.get("is_school_or_group") === "yes",
    group_name: clean(form.get("group_name"), 120),
    place: clean(form.get("place"), 120),
    took_part: (tookPartValues as readonly string[]).includes(tookPart)
      ? tookPart
      : "",
    share_consent: form.get("share_consent") === "yes",
  };
}

const responseSchema = z.object({
  hands_mean: z.string().trim().min(1).max(2000),
  hands_use: z.string().trim().min(1).max(2000),
  piece_feel: z.string().trim().min(1).max(2000),
  display_name: z.string().max(80),
  name_display_consent: z.boolean(),
  age_range: z.enum(ageRanges),
  is_school_or_group: z.boolean(),
  group_name: z.string().max(120),
  share_consent: z.literal(true),
});

export function parseResponse(form: FormData) {
  const shared = sharedFields(form);
  return responseSchema.safeParse({
    hands_mean: multiline(form.get("hands_mean"), 2000),
    hands_use: multiline(form.get("hands_use"), 2000),
    piece_feel: multiline(form.get("piece_feel"), 2000),
    ...shared,
  });
}

const workSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    credit: z.string().max(120),
    writing: z.string().max(8000),
    display_name: z.string().max(80),
    name_display_consent: z.boolean(),
    age_range: z.enum(ageRanges),
    is_school_or_group: z.boolean(),
    group_name: z.string().max(120),
    share_consent: z.literal(true),
    has_image: z.boolean(),
  })
  .refine((value) => value.has_image || value.writing.trim().length > 0, {
    message: "Add a picture, a poem, or some writing.",
  });

export function parseWork(form: FormData, hasImage: boolean) {
  const shared = sharedFields(form);
  return workSchema.safeParse({
    title: clean(form.get("title"), 160),
    credit: clean(form.get("credit"), 120),
    writing: multiline(form.get("writing"), 8000),
    has_image: hasImage,
    ...shared,
  });
}

const nameSchema = z.object({
  display_name: z.string().trim().min(1).max(80),
  place: z.string().max(120),
  took_part: z.enum(tookPartValues),
  name_display_consent: z.boolean(),
});

export function parseName(form: FormData) {
  const shared = sharedFields(form);
  return nameSchema.safeParse({
    display_name: shared.display_name,
    place: shared.place,
    took_part: shared.took_part,
    name_display_consent: shared.name_display_consent,
  });
}

export async function insertRow(table: string, row: Record<string, unknown>) {
  const config = configured();
  if (!config) {
    return {
      ok: false as const,
      error:
        "Saving is not switched on yet. Please try again once the Hands of Worcester database update has been applied.",
    };
  }
  const response = await fetch(`${config.url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
    cache: "no-store",
  });
  if (response.ok) return { ok: true as const };
  if (response.status === 401 || response.status === 404)
    return {
      ok: false as const,
      error:
        "Saving is not switched on yet. Please try again once the Hands of Worcester database update has been applied.",
    };
  return {
    ok: false as const,
    error: "We could not save that just now. Please wait a moment and try again.",
  };
}

export async function prepareImage(file: File) {
  if (file.size === 0 || file.size > 3 * 1024 * 1024)
    throw new Error("Please choose a picture under 3 MB.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Please choose a JPG, PNG or WebP picture.");
  const input = Buffer.from(await file.arrayBuffer());
  const metadata = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
  if (
    !["jpeg", "png", "webp"].includes(metadata.format || "") ||
    (metadata.pages && metadata.pages > 1)
  )
    throw new Error("Please choose a JPG, PNG or WebP picture.");
  const buffer = await sharp(input, { limitInputPixels: 40_000_000 })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  if (buffer.length > 1_500_000)
    throw new Error("That picture is too big after saving. Please try a smaller one.");
  return buffer;
}

export async function storeImage(id: string, buffer: Buffer) {
  const config = configured();
  if (!config) throw new Error("Saving is not switched on yet.");
  const path = `${id}.webp`;
  const client = publicClient();
  const { error } = await client.storage.from("hands-works").upload(path, buffer, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw new Error("We could not save the picture. Please try again.");
  return path;
}

export async function discardImage(path: string) {
  const config = configured();
  if (!config) return;
  await fetch(`${config.url}/rest/v1/rpc/discard_unlinked_hands_upload`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_path: path }),
    cache: "no-store",
  });
}

export const savedMessage =
  "Thank you. We have received this. It will not appear on the website unless Jessica approves it.";

export const nameSavedMessage =
  "Thank you. If you ticked permission for the name to be shown, Jessica will check it before it is added to the list. If you did not tick that box, the name will not be shown.";
