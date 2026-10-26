import "server-only";
import { redirect } from "next/navigation";
import { serverClient } from "./supabase/server";
export async function adminSession() {
  const client = await serverClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  const { data: membership } = await client
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return null;
  const { data: allowed, error: accessError } =
    await client.rpc("cms_admin_access");
  if (accessError || allowed !== true) return null;
  return { client, user };
}
export async function requireAdmin() {
  const session = await adminSession();
  if (!session) redirect("/admin/login");
  return session;
}
