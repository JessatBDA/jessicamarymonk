import { query, projectRef, sqlString } from "./supabase-cli.mjs";
const id = process.argv[2];
const revoke = process.argv[3] === "--revoke";
if (
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id || "",
  )
)
  throw new Error(
    "Usage: node scripts/grant-admin.mjs <Supabase Auth user UUID> [--revoke]",
  );
if (revoke) {
  query(`delete from public.admin_users where user_id=${sqlString(id)}::uuid;`);
  console.log(`Administrator access revoked in ${projectRef}.`);
} else {
  const result = query(
    `insert into public.admin_users(user_id) select id from auth.users where id=${sqlString(id)}::uuid and email_confirmed_at is not null and is_anonymous=false on conflict do nothing returning user_id;`,
  );
  if (!result.rows?.length) {
    const existing = query(
      `select user_id from public.admin_users where user_id=${sqlString(id)}::uuid;`,
    );
    if (!existing.rows?.length)
      throw new Error(
        "No confirmed, non-anonymous Auth user found for this UUID. Create and confirm the account first.",
      );
  }
  console.log(
    `Administrator access granted in ${projectRef}. No password was read or stored.`,
  );
}
