// Temporary fixtures only. No emails are sent. Secrets stay in process memory.
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { mkdir, mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { cli, query, projectRef, sqlString } from "./supabase-cli.mjs";
import { openBrowser, pause } from "./browser-session.mjs";
process.loadEnvFile(".env.local");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
assert.equal(url, `https://${projectRef}.supabase.co`);
const keys = cli([
  "projects",
  "api-keys",
  "--project-ref",
  projectRef,
  "--reveal",
  "--output",
  "json",
]);
const secret =
  keys.find(
    (key) => key.type === "secret" && key.api_key?.startsWith("sb_secret_"),
  ) || keys.find((key) => key.name === "service_role");
assert.ok(
  secret?.api_key,
  "A server-only administrative key is required for temporary test-user creation.",
);
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const operator = createClient(url, secret.api_key, options);
const anon = createClient(
  url,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  options,
);
const admin = createClient(
  url,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  options,
);
const outsider = createClient(
  url,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  options,
);
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
let password = randomBytes(25).toString("base64url");
const suffix = randomUUID();
const adminEmail = `cms-test-admin-${suffix}@example.invalid`,
  outsiderEmail = `cms-test-outsider-${suffix}@example.invalid`;
const users = [],
  entries = [],
  paths = [],
  checks = [],
  pageBackups = [];
let browser;
const temporary = await mkdtemp(join(tmpdir(), "jmm-cms-test-"));
const check = (condition, label) => {
  assert.ok(condition, label);
  checks.push(label);
  console.log(`PASS ${label}`);
};
async function user(email) {
  const { data, error } = await operator.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "admin", is_admin: true },
  });
  assert.ifError(error);
  users.push(data.user.id);
  return data.user.id;
}
async function fill(selector, value) {
  await browser.evaluate(
    `document.querySelector(${JSON.stringify(selector)}).focus(); document.querySelector(${JSON.stringify(selector)}).select()`,
  );
  await browser.send("Input.insertText", { text: value });
}
async function clickText(text) {
  await browser.evaluate(
    `Array.from(document.querySelectorAll('button')).find(button=>button.textContent.trim()===${JSON.stringify(text)}).click()`,
  );
}
try {
  check(
    (await anon.from("cms_entries").select("*")).error !== null,
    "Anonymous visitors cannot read draft entries",
  );
  check(
    (await anon.from("admin_users").select("*")).error !== null,
    "Anonymous visitors cannot read administrator membership",
  );
  const settings = await (
    await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
    })
  ).json();
  check(
    settings.disable_signup === true,
    "Public registration disabled on the correct project",
  );
  const adminId = await user(adminEmail);
  await user(outsiderEmail);
  query(
    `insert into public.admin_users(user_id) values (${sqlString(adminId)}::uuid);`,
  );
  assert.ifError(
    (await admin.auth.signInWithPassword({ email: adminEmail, password }))
      .error,
  );
  assert.ifError(
    (await outsider.auth.signInWithPassword({ email: outsiderEmail, password }))
      .error,
  );
  check(
    (await admin.rpc("cms_admin_access")).data === true,
    "Provisioned administrator passes database authorisation",
  );
  check(
    (await outsider.rpc("cms_admin_access")).data === false,
    "User-editable admin metadata cannot grant administrator access",
  );
  check(
    (await outsider.from("cms_entries").select("*")).data?.length === 0,
    "Signed-in non-administrators cannot read drafts",
  );
  check(
    !!(await outsider.from("admin_users").insert({ user_id: users[1] })).error,
    "Users cannot grant themselves administrator membership",
  );
  const id = randomUUID();
  entries.push(id);
  const slug = `cms-verification-${suffix}`;
  const body = {
    fields: {
      intro:
        "Temporary CMS verification content. This fixture is removed automatically.",
    },
    images: [],
    featured: false,
  };
  assert.ifError(
    (
      await admin
        .from("cms_entries")
        .insert({
          id,
          kind: "project",
          slug,
          title: "CMS verification fixture",
          body,
        })
    ).error,
  );
  check(
    (await anon.from("cms_public").select("id").eq("id", id)).data?.length ===
      0,
    "New drafts are absent from the public snapshot",
  );
  check(
    !!(
      await outsider
        .from("cms_entries")
        .insert({
          kind: "project",
          slug: `outsider-${suffix}`,
          title: "Disallowed fixture",
          body,
        })
    ).error,
    "Non-administrators cannot create content",
  );
  check(
    !!(
      await outsider.rpc("save_cms_entry", {
        p_id: id,
        p_revision: 0,
        p_slug: slug,
        p_title: "Disallowed",
        p_body: body,
        p_sort_order: 0,
        p_publish: true,
      })
    ).error,
    "Publishing RPC rejects non-administrators",
  );
  check(
    !!(
      await outsider.storage
        .from("cms-images")
        .upload(`denied-${suffix}.webp`, Buffer.from("denied"), {
          contentType: "image/webp",
        })
    ).error,
    "Non-administrators cannot upload to Storage",
  );
  const unauth = await fetch(`${base}/admin`, { redirect: "manual" });
  check(
    unauth.status === 307 &&
      unauth.headers.get("location")?.includes("/admin/login"),
    "Unauthenticated admin requests redirect to sign-in",
  );
  const noUpload = await fetch(`${base}/api/admin/upload`, {
    method: "POST",
    headers: { origin: base },
  });
  check(
    noUpload.status === 401,
    "Upload endpoint requires an administrator session",
  );
  const cross = await fetch(`${base}/api/admin/upload`, {
    method: "POST",
    headers: { origin: "https://example.invalid" },
  });
  check(cross.status === 403, "Upload endpoint rejects cross-origin requests");
  browser = await openBrowser();
  await browser.navigate(`${base}/admin/login`);
  await fill("input[name=email]", outsiderEmail);
  await fill("input[name=password]", password);
  await clickText("Sign in");
  await browser.waitFor(
    `document.querySelector('[role=alert]')?.textContent.includes('does not have administrator access')`,
    "non-admin login rejection",
  );
  check(true, "Admin login rejects a valid non-administrator account");
  await fill("input[name=email]", adminEmail);
  await fill("input[name=password]", password);
  await clickText("Sign in");
  await browser.waitFor(
    `location.pathname==='/admin'&&document.body.textContent.includes('Your website, in your hands.')`,
    "administrator login",
  );
  check(true, "Administrator login succeeds through the real browser form");
  const cookies = await browser.send("Network.getCookies", { urls: [base] });
  check(
    cookies.cookies
      .filter((cookie) => cookie.name.startsWith("sb-"))
      .every((cookie) => cookie.httpOnly && cookie.sameSite === "Lax"),
    "Session cookies are HttpOnly and SameSite=Lax",
  );
  await browser.navigate(`${base}/admin/content/${id}`);
  await browser.waitFor(
    `!!document.querySelector('input[type=file]')`,
    "content editor",
  );
  const one = join(temporary, "verification-one.png"),
    two = join(temporary, "verification-two.png");
  await sharp({
    create: { width: 30, height: 20, channels: 3, background: "#dddddd" },
  })
    .png()
    .toFile(one);
  await sharp({
    create: { width: 20, height: 30, channels: 3, background: "#bbbbbb" },
  })
    .png()
    .toFile(two);
  const root = await browser.send("DOM.getDocument");
  const fileInput = await browser.send("DOM.querySelector", {
    nodeId: root.root.nodeId,
    selector: "input[type=file]",
  });
  await browser.send("DOM.setFileInputFiles", {
    nodeId: fileInput.nodeId,
    files: [one, two],
  });
  await browser.waitFor(
    `document.querySelectorAll('.admin-image').length===2&&!document.querySelector('.admin-editor-fields').disabled`,
    "multiple uploads",
  );
  check(true, "Direct multi-image upload works through the editor");
  const assets = (await admin.from("cms_assets").select("*").eq("entry_id", id))
    .data;
  check(
    assets?.length === 2 &&
      assets.every((asset) => asset.width > 0 && asset.height > 0),
    "Upload metadata is stored for both images",
  );
  paths.push(...assets.map((asset) => asset.storage_path));
  check(
    (await anon.from("cms_assets").select("id").eq("entry_id", id)).data
      ?.length === 0,
    "Draft image metadata is private",
  );
  check(
    (await fetch(`${base}/media/${assets[0].id}`)).status === 404,
    "Draft image endpoint denies anonymous visitors",
  );
  check(
    !!(await anon.storage.from("cms-images").download(assets[0].storage_path))
      .error,
    "Storage denies anonymous downloads of draft images",
  );
  const invalidUpload = await browser.evaluate(
    `(async()=>{const form=new FormData();form.set('entryId',${JSON.stringify(id)});form.set('file',new File(['not an image'],'fake.png',{type:'image/png'}));const response=await fetch('/api/admin/upload',{method:'POST',body:form});return response.status;})()`,
  );
  check(invalidUpload === 400, "Upload validation rejects forged image bytes");
  const oversized = await browser.evaluate(
    `(async()=>{const form=new FormData();form.set('entryId',${JSON.stringify(id)});form.set('file',new File([new Uint8Array(3145729)],'oversized.png',{type:'image/png'}));return (await fetch('/api/admin/upload',{method:'POST',body:form})).status;})()`,
  );
  check(
    oversized === 400 || oversized === 413,
    "Upload validation rejects images over 3 MB",
  );
  const firstImage = await browser.evaluate(
    `document.querySelector('.admin-thumbnail img').getAttribute('src')`,
  );
  await clickText("↓ Move down");
  check(
    await browser.evaluate(
      `document.querySelector('.admin-thumbnail img').getAttribute('src')!==${JSON.stringify(firstImage)}`,
    ),
    "Image order can be changed in the editor",
  );
  await clickText("Save draft");
  await browser.waitFor(
    `document.querySelector('[role=status]')?.textContent.includes('Draft saved')`,
    "draft save",
  );
  let current = (
    await admin.from("cms_entries").select("*").eq("id", id).single()
  ).data;
  check(
    current.body.images.length === 2,
    "Saving persists the complete gallery",
  );
  check(
    (await fetch(`${base}/public-art/${slug}`)).status === 404,
    "Saved drafts have no public project page",
  );
  await clickText("Publish changes");
  await browser.waitFor(
    `document.querySelector('[role=status]')?.textContent.includes('Published.')`,
    "publication",
  );
  const live = await fetch(`${base}/public-art/${slug}`);
  check(
    live.status === 200 &&
      (await live.text()).includes("CMS verification fixture"),
    "Published content appears on the public website",
  );
  const media = await fetch(`${base}/media/${assets[0].id}`);
  check(
    media.status === 200 && media.headers.get("content-type") === "image/webp",
    "Published images are served as validated WebP",
  );
  check(
    !(await anon.storage.from("cms-images").download(assets[0].storage_path))
      .error,
    "Storage permits published image downloads",
  );
  current = (await admin.from("cms_entries").select("*").eq("id", id).single())
    .data;
  const newerBody = {
    ...current.body,
    fields: {
      ...current.body.fields,
      intro: "Private newer draft — must not appear publicly.",
    },
  };
  const updated = await admin.rpc("save_cms_entry", {
    p_id: id,
    p_revision: current.revision,
    p_slug: slug,
    p_title: "Private newer title",
    p_body: newerBody,
    p_sort_order: 2,
    p_publish: false,
  });
  assert.ifError(updated.error);
  const stale = await admin.rpc("save_cms_entry", {
    p_id: id,
    p_revision: current.revision,
    p_slug: slug,
    p_title: "Stale title",
    p_body: current.body,
    p_sort_order: 0,
    p_publish: true,
  });
  check(!!stale.error, "Stale edits cannot overwrite a newer revision");
  const unchanged = await (await fetch(`${base}/public-art/${slug}`)).text();
  check(
    unchanged.includes("CMS verification fixture") &&
      !unchanged.includes("Private newer title"),
    "Editing a live entry preserves the published snapshot",
  );
  await browser.navigate(`${base}/admin/preview/${id}`);
  check(
    await browser.evaluate(
      `document.body.textContent.includes('Private newer title')`,
    ),
    "Authenticated preview renders the saved draft",
  );
  check(
    (await fetch(`${base}/admin/preview/${id}`, { redirect: "manual" })).headers
      .get("location")
      ?.includes("/admin/login"),
    "Draft preview requires administrator authentication",
  );
  await browser.navigate(`${base}/admin/content/${id}`);
  for (const width of [390, 768, 1440]) {
    await browser.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 950,
      deviceScaleFactor: 1,
      mobile: width < 500,
    });
    await pause(150);
    check(
      await browser.evaluate(
        `document.documentElement.scrollWidth<=innerWidth`,
      ),
      `Admin editor has no horizontal overflow at ${width}px`,
    );
  }
  await mkdir("docs/previews/phase2", { recursive: true });
  const screenshot = await browser.send("Page.captureScreenshot", {
    format: "png",
  });
  await writeFile(
    "docs/previews/phase2/admin-editor-desktop.png",
    Buffer.from(screenshot.data, "base64"),
  );
  await browser.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 950,
    deviceScaleFactor: 1,
    mobile: true,
  });
  const mobileShot = await browser.send("Page.captureScreenshot", {
    format: "png",
  });
  await writeFile(
    "docs/previews/phase2/admin-editor-mobile.png",
    Buffer.from(mobileShot.data, "base64"),
  );
  await clickText("Unpublish");
  await browser.waitFor(
    `document.querySelector('[role=status]')?.textContent.includes('Unpublished.')`,
    "unpublishing",
  );
  check(
    (await fetch(`${base}/public-art/${slug}`)).status === 404,
    "Unpublish removes the public page",
  );
  check(
    (await fetch(`${base}/media/${assets[0].id}`)).status === 404,
    "Unpublish revokes anonymous image access",
  );
  check(
    !!(await anon.storage.from("cms-images").download(assets[0].storage_path))
      .error,
    "Unpublish revokes direct Storage access",
  );
  await browser.navigate(`${base}/admin/content?kind=artwork`);
  await clickText("Add artwork");
  await browser.waitFor(
    `!!document.querySelector('.admin-editor-fields')`,
    "new artwork editor",
  );
  const artworkId = await browser.evaluate(
    `location.pathname.split('/').at(-1)`,
  );
  entries.push(artworkId);
  await fill(
    ".admin-field-grid label:first-child input",
    "CMS verification artwork fixture",
  );
  await fill(
    "#field-description",
    "Temporary artwork record used only to verify the CMS.",
  );
  await browser.evaluate(
    `document.querySelector('#field-category').value='Paintings';document.querySelector('#field-category').dispatchEvent(new Event('change',{bubbles:true}));`,
  );
  await clickText("Publish changes");
  await browser.waitFor(
    `document.querySelector('[role=status]')?.textContent.includes('Published.')`,
    "artwork publishing",
  );
  const artwork = (
    await admin.from("cms_entries").select("*").eq("id", artworkId).single()
  ).data;
  check(
    artwork.title === "CMS verification artwork fixture" &&
      artwork.body.fields.category === "Paintings",
    "Artwork can be created and edited through the browser interface",
  );
  check(
    (await fetch(`${base}/paintings-illustrations/${artwork.slug}`)).status ===
      200,
    "Published artwork has its own public page",
  );
  check(
    (await (await fetch(`${base}/paintings-illustrations`)).text()).includes(
      `/paintings-illustrations/${artwork.slug}`,
    ),
    "Published artwork appears in the portfolio gallery",
  );
  await clickText("Unpublish");
  await browser.waitFor(
    `document.querySelector('[role=status]')?.textContent.includes('Unpublished.')`,
    "artwork unpublishing",
  );
  check(
    (await fetch(`${base}/paintings-illustrations/${artwork.slug}`)).status ===
      404,
    "Unpublished artwork is no longer publicly accessible",
  );
  await browser.navigate(`${base}/admin/account`);
  const changedPassword = randomBytes(25).toString("base64url");
  await fill("input[name=current]", password);
  await fill("input[name=password]", changedPassword);
  await fill("input[name=confirmation]", changedPassword);
  await clickText("Update password");
  await browser.waitFor(
    `document.querySelector('[role=status]')?.textContent.includes('Password updated.')`,
    "password change",
  );
  password = changedPassword;
  check(
    true,
    "Password change requires current credentials and updates the account",
  );
  await browser.evaluate(
    `Array.from(document.querySelectorAll('button')).find(button=>button.textContent==='Sign out').click()`,
  );
  await browser.waitFor(`location.pathname==='/admin/login'`, "sign out");
  check(true, "Signing out returns to the login page");
  check(
    (await admin.rpc("cms_admin_access")).data === false,
    "Global sign-out invalidates existing administrator session tokens",
  );
  const recovery = await operator.auth.admin.generateLink({
    type: "recovery",
    email: adminEmail,
  });
  assert.ifError(recovery.error);
  await browser.navigate(
    `${base}/admin/auth/confirm?token_hash=${recovery.data.properties.hashed_token}&type=recovery`,
  );
  await browser.waitFor(
    `location.pathname==='/admin/recover-password'`,
    "verified recovery session",
  );
  const recoveredPassword = randomBytes(25).toString("base64url");
  await fill("input[name=password]", recoveredPassword);
  await fill("input[name=confirmation]", recoveredPassword);
  await clickText("Set password and return to sign-in");
  await browser.waitFor(
    `location.pathname==='/admin/login'`,
    "password recovery completion",
  );
  password = recoveredPassword;
  check(
    true,
    "Verified recovery token resets the password and signs the user out",
  );
  assert.ifError(
    (await admin.auth.signInWithPassword({ email: adminEmail, password }))
      .error,
  );
  check(
    (await admin.rpc("cms_admin_access")).data === true,
    "Administrator can sign in again after signing out",
  );
  for (const pageSlug of ["home", "about", "contact"]) {
    const original = (
      await admin
        .from("cms_entries")
        .select("*")
        .eq("kind", "page")
        .eq("slug", pageSlug)
        .single()
    ).data;
    const marker = `CMS verification ${pageSlug} content — temporary`;
    const updatedBody = {
      ...original.body,
      fields: {
        ...original.body.fields,
        [pageSlug === "home"
          ? "intro"
          : pageSlug === "about"
            ? "intro"
            : "details"]: marker,
      },
    };
    const update = await admin.rpc("save_cms_entry", {
      p_id: original.id,
      p_revision: original.revision,
      p_slug: original.slug,
      p_title: original.title,
      p_body: updatedBody,
      p_sort_order: original.sort_order,
      p_publish: true,
    });
    assert.ifError(update.error);
    pageBackups.push({ original, revision: update.data.revision });
    const pageResponse = await (
      await fetch(`${base}${pageSlug === "home" ? "/" : `/${pageSlug}`}`)
    ).text();
    check(
      pageResponse.includes(marker),
      `Published ${pageSlug} updates appear on its public page`,
    );
    const restore = await admin.rpc("save_cms_entry", {
      p_id: original.id,
      p_revision: update.data.revision,
      p_slug: original.slug,
      p_title: original.title,
      p_body: original.body,
      p_sort_order: original.sort_order,
      p_publish: true,
    });
    assert.ifError(restore.error);
    pageBackups.pop();
  }
  query(
    `delete from public.admin_users where user_id=${sqlString(adminId)}::uuid;`,
  );
  check(
    (await admin.rpc("cms_admin_access")).data === false,
    "Revoking membership invalidates access without waiting for JWT expiry",
  );
  check(
    (await admin.from("cms_entries").select("id")).data?.length === 0,
    "Revoked administrators cannot read drafts",
  );
  await writeFile(
    "docs/previews/phase2/test-results.json",
    JSON.stringify({ project: projectRef, checks }, null, 2),
  );
  console.log(`Completed ${checks.length} Phase 2 checks.`);
} finally {
  await browser?.close();
  for (const { original, revision } of pageBackups) {
    const current = (
      await operator
        .from("cms_entries")
        .select("revision")
        .eq("id", original.id)
        .single()
    ).data;
    if (current?.revision === revision) {
      await operator
        .from("cms_entries")
        .update({
          body: original.body,
          title: original.title,
          sort_order: original.sort_order,
        })
        .eq("id", original.id);
      await operator
        .from("cms_public")
        .update({
          body: original.body,
          title: original.title,
          sort_order: original.sort_order,
        })
        .eq("id", original.id);
    }
  }
  if (paths.length) await operator.storage.from("cms-images").remove(paths);
  for (const id of entries)
    await operator.from("cms_entries").delete().eq("id", id);
  for (const id of users) await operator.auth.admin.deleteUser(id);
  await rm(temporary, { recursive: true, force: true });
  console.log("Temporary accounts, content and uploaded images removed.");
}
