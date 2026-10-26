import { readFileSync } from "node:fs";
import { query, sqlString } from "./supabase-cli.mjs";
const entries = JSON.parse(
  readFileSync("src/content/initial-content.json", "utf8"),
);
// Seeds only missing entries; never overwrites the artist's edits.
query(
  `begin; ${entries.map((entry) => `with added as (insert into public.cms_entries(kind,slug,title,body,sort_order) values (${sqlString(entry.kind)},${sqlString(entry.slug)},${sqlString(entry.title)},${sqlString(JSON.stringify(entry.body))}::jsonb,${entry.sort_order}) on conflict(kind,slug) do nothing returning *) insert into public.cms_public(id,kind,slug,title,body,sort_order) select id,kind,slug,title,body,sort_order from added;`).join("\n")} commit;`,
);
console.log(
  "Initial Phase 1 content seeded without overwriting existing content.",
);
