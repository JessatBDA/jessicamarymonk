"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { serverClient } from "@/lib/supabase/server";
import { requireAdmin, adminSession } from "@/lib/auth";
import { authOrigin } from "@/lib/auth-origin";
export async function login(_state: { error: string }, form: FormData) {
  const input = z
    .object({ email: z.email().max(254), password: z.string().min(1).max(200) })
    .safeParse(Object.fromEntries(form));
  if (!input.success)
    return { error: "Enter a valid email address and password." };
  const client = await serverClient();
  const { error } = await client.auth.signInWithPassword(input.data);
  if (error)
    return {
      error: "Sign-in failed. Check your credentials or try again later.",
    };
  if (!(await adminSession())) {
    await client.auth.signOut();
    return {
      error:
        "This account does not have administrator access. Contact the project owner.",
    };
  }
  redirect("/admin");
}
export async function logout() {
  const client = await serverClient();
  await client.auth.signOut();
  redirect("/admin/login");
}
export async function changePassword(
  _state: { error: string; success?: boolean },
  form: FormData,
) {
  const { client, user } = await requireAdmin();
  const password = String(form.get("password") || "");
  const confirmation = String(form.get("confirmation") || "");
  const current = String(form.get("current") || "");
  if (
    password.length < 10 ||
    password.length > 128 ||
    password !== confirmation
  )
    return {
      error: "Use 10–128 characters and make sure the new passwords match.",
    };
  const { error: reauth } = await client.auth.signInWithPassword({
    email: user.email!,
    password: current,
  });
  if (reauth) return { error: "The current password is incorrect." };
  const { error } = await client.auth.updateUser({ password });
  if (error)
    return { error: "Unable to update the password. Please try again." };
  return { error: "", success: true };
}
export async function requestPasswordReset(
  _state: { error: string; success?: boolean },
  form: FormData,
) {
  const parsed = z.email().max(254).safeParse(form.get("email"));
  if (!parsed.success) return { error: "Enter a valid email address." };
  const client = await serverClient();
  const { error } = await client.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: new URL("/admin/auth/confirm", authOrigin()).href,
  });
  if (error)
    return {
      error:
        error.status === 429
          ? "Too many recovery requests. Please wait before trying again."
          : "The recovery email could not be sent. Please contact the project owner to check email delivery or open a private password setup link.",
    };
  return { error: "", success: true };
}
export async function resetPassword(
  _state: { error: string; success?: boolean },
  form: FormData,
) {
  const { client } = await requireAdmin();
  const password = String(form.get("password") || "");
  if (
    password.length < 10 ||
    password.length > 128 ||
    password !== form.get("confirmation")
  )
    return {
      error: "Use 10–128 characters and make sure the passwords match.",
    };
  const { error } = await client.auth.updateUser({ password });
  if (error)
    return {
      error:
        "This recovery session could not update the password. Request a new recovery email and retry.",
    };
  await client.auth.signOut();
  redirect("/admin/login");
}
