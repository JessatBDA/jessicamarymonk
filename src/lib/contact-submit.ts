import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import {
  contactTopicLabel,
  contactTopicValues,
  publicContactEmail,
} from "@/lib/contact-public";
import { expectedProjectUrl } from "@/lib/supabase/server";

const buckets = new Map<string, { count: number; reset: number }>();
const minimumWaitMs = 3000;
const maximumAgeMs = 2 * 60 * 60 * 1000;

export const contactSavedMessage =
  "Thank you. Your message is with Jessica. She will reply when she can.";

const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please add your name.").max(120, "Please use a shorter name."),
  email: z
    .string()
    .trim()
    .min(3, "Please enter an email address Jessica can reply to.")
    .max(254, "Please enter an email address Jessica can reply to.")
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter an email address Jessica can reply to.",
    ),
  topic: z.enum(contactTopicValues),
  message: z
    .string()
    .trim()
    .min(1, "Please write a message.")
    .max(5000, "Please shorten the message so it is under 5,000 characters."),
  privacy_consent: z.literal(true, {
    error: "Please tick the box to say Jessica may use these details to reply.",
  }),
});

function configured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url !== expectedProjectUrl || !key?.startsWith("sb_publishable_")) return null;
  return { url, key };
}

export async function contactClientHash() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerStore.get("x-real-ip") || "local";
  return createHash("sha256").update(`contact-enquiry:${ip}`).digest("hex");
}

/** Five submissions in ten minutes for one address, matching the Hands form limit. */
export function allowContactSubmission(key: string) {
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

export function contactHoneypotFilled(form: FormData) {
  return String(form.get("company_website") || "").trim().length > 0;
}

export function contactTimingError(form: FormData, now = Date.now()) {
  const raw = String(form.get("started_at") || "").trim();
  if (!/^\d{10,16}$/.test(raw))
    return "Please take a moment to check your message, then send it again.";
  const started = Number(raw);
  if (!Number.isFinite(started) || started > now + 60_000)
    return "Please take a moment to check your message, then send it again.";
  if (now - started < minimumWaitMs)
    return "Please take a moment to check your message, then send it again.";
  if (now - started > maximumAgeMs)
    return "This page has been open for a while. Please refresh it and try again.";
  return null;
}

function singleLine(value: FormDataEntryValue | null) {
  return String(value || "").replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
}

function messageText(value: FormDataEntryValue | null) {
  return String(value || "").replace(/\r\n/g, "\n").trim();
}

export function parseContactEnquiry(form: FormData) {
  const topic = singleLine(form.get("topic"));
  return enquirySchema.safeParse({
    name: singleLine(form.get("name")),
    email: singleLine(form.get("email")),
    topic: (contactTopicValues as readonly string[]).includes(topic) ? topic : "",
    message: messageText(form.get("message")),
    privacy_consent: form.get("privacy_consent") === "yes",
  });
}

function saveError(status: number, code: string) {
  if (status === 401 || status === 404 || code === "42P01" || code === "PGRST205")
    return `Saving is not switched on yet. Please email ${publicContactEmail} instead.`;
  if (code === "42501") return "Please wait a little while, then try again.";
  return `We could not save that just now. Please email ${publicContactEmail} instead.`;
}

export async function insertContactEnquiry(row: {
  name: string;
  email: string;
  topic: string;
  message: string;
  client_hash: string;
}) {
  const config = configured();
  if (!config)
    return {
      ok: false as const,
      error: `Saving is not switched on yet. Please email ${publicContactEmail} instead.`,
    };
  const response = await fetch(`${config.url}/rest/v1/contact_enquiries`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      name: row.name,
      email: row.email,
      topic: row.topic,
      message: row.message,
      privacy_consent: true,
      status: "pending",
      client_hash: row.client_hash,
    }),
    cache: "no-store",
  });
  if (response.ok) return { ok: true as const };
  let code = "";
  let detail = "";
  try {
    const body = (await response.json()) as { code?: string; message?: string };
    code = typeof body.code === "string" ? body.code : "";
    detail = typeof body.message === "string" ? body.message : "";
  } catch {
    code = "";
  }
  if (detail === "Consent is required")
    return {
      ok: false as const,
      error: "Please tick the box to say Jessica may use these details to reply.",
    };
  return { ok: false as const, error: saveError(response.status, code) };
}

const defaultFrom = "Jessica Mary Monk website <website@jessicamarymonk.com>";

/** Sends after a successful save. Failures are swallowed and never include the message. */
export async function notifyContactEnquiry(enquiry: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return;
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || defaultFrom;
  const topic = enquiry.topic ? contactTopicLabel(enquiry.topic) : "No topic chosen";
  const subject = enquiry.topic
    ? `Website enquiry: ${contactTopicLabel(enquiry.topic)}`
    : "Website enquiry";
  const text = [
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Topic: ${topic}`,
    "",
    enquiry.message,
  ].join("\n");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [publicContactEmail],
        reply_to: enquiry.email,
        subject,
        text,
      }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!response.ok) console.error("Contact notification email was not sent.");
  } catch {
    console.error("Contact notification email was not sent.");
  }
}
