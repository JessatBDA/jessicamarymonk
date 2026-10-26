// Trusted local operator only. No email is sent and no recovery token is logged or saved.
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { cli, projectRef, query, sqlString } from "./supabase-cli.mjs";
const id = process.argv[2];
const destination = new URL(process.argv[3] || "");
if (
  !/^[0-9a-f-]{36}$/i.test(id || "") ||
  destination.protocol !== "https:" ||
  !/^jessicamarymonkcodex(-[a-z0-9-]+)?\.vercel\.app$/.test(
    destination.hostname,
  )
)
  throw new Error(
    "Provide an administrator UUID and the trusted Jessica Mary Monk deployment URL.",
  );
const membership = query(
  `select user_id from public.admin_users where user_id=${sqlString(id)}::uuid;`,
);
if (!membership.rows?.length)
  throw new Error("The user does not have administrator membership.");
const keys = cli([
  "projects",
  "api-keys",
  "--project-ref",
  projectRef,
  "--reveal",
  "--output",
  "json",
]);
const key =
  keys.find(
    (key) => key.type === "secret" && key.api_key?.startsWith("sb_secret_"),
  ) || keys.find((key) => key.name === "service_role");
if (!key?.api_key) throw new Error("No administrative API key available.");
const client = createClient(`https://${projectRef}.supabase.co`, key.api_key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const user = await client.auth.admin.getUserById(id);
if (user.error || !user.data.user?.email)
  throw new Error("Unable to find the administrator account.");
const link = await client.auth.admin.generateLink({
  type: "recovery",
  email: user.data.user.email,
});
if (link.error || !link.data.properties?.hashed_token)
  throw new Error("Unable to generate password recovery.");
const target = new URL("/admin/auth/confirm", destination.origin);
target.searchParams.set("token_hash", link.data.properties.hashed_token);
target.searchParams.set("type", "recovery");
if (process.platform !== "win32")
  throw new Error("This local browser opener supports Windows.");
execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    "Start-Process -FilePath $env:JMM_RECOVERY_URL",
  ],
  {
    env: { ...process.env, JMM_RECOVERY_URL: target.href },
    stdio: "ignore",
    windowsHide: true,
  },
);
console.log(
  "Opened a one-time password setup page in your default browser. No password or recovery token was printed or saved.",
);
