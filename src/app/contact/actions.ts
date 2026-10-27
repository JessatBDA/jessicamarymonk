"use server";
import {
  allowContactSubmission,
  contactClientHash,
  contactHoneypotFilled,
  contactSavedMessage,
  contactTimingError,
  insertContactEnquiry,
  notifyContactEnquiry,
  parseContactEnquiry,
} from "@/lib/contact-submit";
import type { ContactResult } from "@/lib/contact-public";

export async function submitEnquiry(
  _previous: ContactResult | null,
  form: FormData,
): Promise<ContactResult> {
  if (contactHoneypotFilled(form))
    return { ok: true, message: contactSavedMessage };
  const timing = contactTimingError(form);
  if (timing) return { ok: false, error: timing };
  const hash = await contactClientHash();
  if (!allowContactSubmission(hash))
    return { ok: false, error: "Please wait a little while, then try again." };
  const parsed = parseContactEnquiry(form);
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Please check the form and try again.",
    };
  const saved = await insertContactEnquiry({
    name: parsed.data.name,
    email: parsed.data.email,
    topic: parsed.data.topic,
    message: parsed.data.message,
    client_hash: hash,
  });
  if (!saved.ok) return saved;
  await notifyContactEnquiry(parsed.data);
  return { ok: true, message: contactSavedMessage };
}
