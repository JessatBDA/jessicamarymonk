import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
const require = createRequire(import.meta.url);
const canonical = new URL("https://jessicamarymonkcodex.vercel.app");
function load(path, dependencies, environment = {}) {
  const output = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(
    output,
    {
      exports,
      require: (name) => {
        if (name in dependencies) return dependencies[name];
        throw new Error(`Unexpected test dependency: ${name}`);
      },
      process: { env: environment },
      URL,
      FormData,
    },
    { filename: path },
  );
  return exports;
}
const previewEnvironment = {
  VERCEL_ENV: "preview",
  VERCEL_URL: "jessicamarymonkcodex-verification-herd-circle.vercel.app",
};
const preview = load(
  "src/lib/auth-origin.ts",
  { "./site": { siteUrl: canonical } },
  previewEnvironment,
).authOrigin();
assert.equal(
  preview.origin,
  "https://jessicamarymonkcodex-verification-herd-circle.vercel.app",
);
assert.equal(
  load(
    "src/lib/auth-origin.ts",
    { "./site": { siteUrl: canonical } },
    { VERCEL_ENV: "production", VERCEL_URL: "temporary.vercel.app" },
  ).authOrigin().origin,
  canonical.origin,
);
let response = { error: null },
  captured;
const actions = load("src/app/admin/auth-actions.ts", {
  "next/navigation": {
    redirect: () => {
      throw new Error("Unexpected redirect");
    },
  },
  zod: require("zod"),
  "@/lib/supabase/server": {
    serverClient: async () => ({
      auth: {
        resetPasswordForEmail: async (email, options) => {
          captured = { email, options };
          return response;
        },
      },
    }),
  },
  "@/lib/auth": {},
  "@/lib/auth-origin": { authOrigin: () => preview },
});
const form = new FormData();
form.set("email", "cms-test@example.invalid");
assert.equal(
  (await actions.requestPasswordReset({ error: "" }, form)).success,
  true,
);
assert.equal(
  captured.options.redirectTo,
  `${preview.origin}/admin/auth/confirm`,
);
response = { error: { status: 429 } };
const limited = await actions.requestPasswordReset({ error: "" }, form);
assert.ok(limited.error.includes("Too many"));
assert.ok(!limited.success);
response = { error: { status: 500 } };
const failed = await actions.requestPasswordReset({ error: "" }, form);
assert.ok(failed.error.includes("could not be sent"));
assert.ok(!failed.success);
const bad = new FormData();
bad.set("email", "bad");
assert.ok((await actions.requestPasswordReset({ error: "" }, bad)).error);
console.log(
  "Passed recovery regression checks: preview origin, production origin, callback URL, rate-limit feedback, delivery-error feedback and invalid-email validation. No email sent.",
);
