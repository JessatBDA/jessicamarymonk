import { execFileSync } from "node:child_process";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
export const projectRef = "wymhdylnnobdzvyrhibq";
export function assertProject() {
  if (readFileSync("supabase/.temp/project-ref", "utf8").trim() !== projectRef)
    throw new Error(
      "Refusing to operate on any project other than Jessica Mary Monk.",
    );
}
export function cli(args) {
  assertProject();
  if (args.some((value) => !/^[-a-zA-Z0-9_./:\\ =]+$/.test(value)))
    throw new Error("Unexpected CLI argument");
  const result =
    process.platform === "win32"
      ? execFileSync(
          "powershell.exe",
          [
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            `& npx.cmd supabase ${args.map((value) => `'${value}'`).join(" ")}`,
          ],
          { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
        )
      : execFileSync("npx", ["supabase", ...args], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
  return JSON.parse(result.slice(result.search(/[\[{]/)));
}
export function query(sql) {
  const directory = mkdtempSync(join(tmpdir(), "jmm-sql-"));
  const file = join(directory, "query.sql");
  try {
    writeFileSync(file, sql);
    return cli(["db", "query", "--linked", "--file", file]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
export const sqlString = (value) => `'${String(value).replaceAll("'", "''")}'`;
