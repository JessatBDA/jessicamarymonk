import { NextResponse } from "next/server";
import { serverClient } from "@/lib/supabase/server";
import { adminSession } from "@/lib/auth";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const client = await serverClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  let error;
  if (code) {
    ({ error } = await client.auth.exchangeCodeForSession(code));
  } else if (tokenHash && (type === "recovery" || type === "invite")) {
    ({ error } = await client.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else
    return NextResponse.redirect(
      new URL("/admin/login?recovery=invalid", url.origin),
    );
  if (error) {
    return NextResponse.redirect(
      new URL("/admin/login?recovery=invalid", url.origin),
    );
  }
  if (!(await adminSession())) {
    await client.auth.signOut({ scope: "local" });
    return NextResponse.redirect(
      new URL("/admin/login?recovery=access-denied", url.origin),
    );
  }
  return NextResponse.redirect(new URL("/admin/recover-password", url.origin));
}
