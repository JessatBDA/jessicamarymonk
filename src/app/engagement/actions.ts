"use server";
import {
  allowSubmission,
  clientHash,
  discardImage,
  insertRow,
  nameSavedMessage,
  parseName,
  parseResponse,
  parseWork,
  prepareImage,
  readHoneypot,
  savedMessage,
  sharedFields,
  storeImage,
  type SubmitResult,
} from "@/lib/hands-submit";

async function guarded(): Promise<SubmitResult | null> {
  const hash = await clientHash();
  if (!allowSubmission(hash))
    return {
      ok: false,
      error: "Please wait a little while, then try again.",
    };
  return null;
}

export async function submitResponse(
  _previous: SubmitResult | null,
  form: FormData,
): Promise<SubmitResult> {
  if (readHoneypot(form)) return { ok: true, message: savedMessage };
  const blocked = await guarded();
  if (blocked) return blocked;
  const parsed = parseResponse(form);
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Please check the answers and try again.",
    };
  if (!parsed.data.share_consent)
    return {
      ok: false,
      error: "Please tick the box to say this may be shared, and that it is your own work.",
    };
  const saved = await insertRow("hands_responses", {
    ...parsed.data,
    client_hash: await clientHash(),
    status: "pending",
    name_display_status: "pending",
  });
  if (!saved.ok) return saved;
  return { ok: true, message: savedMessage };
}

export async function submitWork(
  _previous: SubmitResult | null,
  form: FormData,
): Promise<SubmitResult> {
  if (readHoneypot(form)) return { ok: true, message: savedMessage };
  const blocked = await guarded();
  if (blocked) return blocked;
  const file = form.get("image");
  const hasImage = file instanceof File && file.size > 0;
  const parsed = parseWork(form, hasImage);
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Please check the form and try again.",
    };
  const id = crypto.randomUUID();
  let imagePath: string | null = null;
  try {
    if (hasImage && file instanceof File) {
      const buffer = await prepareImage(file);
      imagePath = await storeImage(id, buffer);
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Please try that picture again.",
    };
  }
  const saved = await insertRow("hands_works", {
    id,
    title: parsed.data.title,
    credit: parsed.data.credit,
    writing: parsed.data.writing,
    image_path: imagePath,
    display_name: parsed.data.display_name,
    name_display_consent: parsed.data.name_display_consent,
    age_range: parsed.data.age_range,
    is_school_or_group: parsed.data.is_school_or_group,
    group_name: parsed.data.group_name,
    share_consent: true,
    status: "pending",
    name_display_status: "pending",
    client_hash: await clientHash(),
  });
  if (!saved.ok) {
    if (imagePath) await discardImage(imagePath);
    return saved;
  }
  return { ok: true, message: savedMessage };
}

export async function submitName(
  _previous: SubmitResult | null,
  form: FormData,
): Promise<SubmitResult> {
  if (readHoneypot(form)) return { ok: true, message: nameSavedMessage };
  const blocked = await guarded();
  if (blocked) return blocked;
  const parsed = parseName(form);
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Please add a name and try again.",
    };
  const saved = await insertRow("hands_name_requests", {
    ...parsed.data,
    client_hash: await clientHash(),
    status: "pending",
    name_display_status: "pending",
  });
  if (!saved.ok) return saved;
  return { ok: true, message: nameSavedMessage };
}

export async function submissionContext() {
  return sharedFields;
}
