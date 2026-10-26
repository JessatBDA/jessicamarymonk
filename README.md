# Jessica Mary Monk

Next.js App Router, TypeScript and Tailwind application in the dedicated `jessicamarymonkcodex` folder.

- Production website: https://www.jessicamarymonk.com
- Production administration: https://www.jessicamarymonk.com/admin
- Tested Phase 2 review preview: https://jessicamarymonkcodex-5flwwnkxz-herd-circle.vercel.app/admin
- [Create your administrator account and use the CMS](docs/ADMIN-GUIDE.md)
- [Phase 2 audit](docs/PHASE2-AUDIT.md) · [Phase 2 validation](docs/PHASE2-VALIDATION.md)

Phase 2 is deployed to production with owner approval. Payments stay disabled. Hands of Worcester responses are documented in [docs/HANDS-ENGAGEMENT.md](docs/HANDS-ENGAGEMENT.md) and need the database update in that guide before they can be saved.

## Run locally

Node 20.9+ is required. PowerShell on this machine blocks `npm.ps1`; use `npm.cmd`.

```powershell
npm.cmd install
npm.cmd run dev
```

Open http://localhost:3000/admin. Local verification used a production build on port 3100 because port 3000 was already occupied; no unrelated process was stopped.

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

## Implemented

- Public design preserved: typography, brushstroke SVGs, whitespace, component arrangement and responsive layouts.
- Supabase Auth password login with HttpOnly cookies, session refresh, password changes, recovery callback and logout.
- Server-side administrator checks and database-controlled membership; public signup disabled.
- CMS for homepage, biography, contact details, public art projects and artwork.
- Formatting toolbar with a safe Markdown preview; no raw HTML rendering.
- Direct multi-image uploads, captions, alternative text, placements and ordering.
- Private Storage with validated image decoding, metadata stripping, resizing and WebP conversion.
- Separate saved drafts and public snapshots; authenticated preview, atomic publish and unpublish, revision-conflict protection.
- Published content and galleries read dynamically on public pages; editable per-entry SEO.
- Desktop/mobile administration, separate from the public design.

## Correct database

Only `jessicamarymonk` (`wymhdylnnobdzvyrhibq`) in the Jessica Mary Monk organisation (`tdylezilvdsdqayciqst`) is used. The local CLI is authenticated and linked. Application configuration rejects a different Supabase URL.

Copy `.env.example` to ignored `.env.local` if configuring another checkout. Supply the project URL and publishable key. Never use a service-role key in browser variables. The application itself does not require any service-role key. Vercel preview/production environment configuration contains only the project URL and publishable key.

## Database setup and account provisioning

Migrations in `supabase/migrations/` have been applied to the dedicated project. `node scripts/seed-cms.mjs` seeds only missing Phase 1 entries and never replaces existing edits. No artwork, prices, feedback or orders have been invented.

Create a confirmed Auth user in the project dashboard, choosing the password privately. Grant the user access via trusted SQL or:

```powershell
node scripts/grant-admin.mjs YOUR_AUTH_USER_UUID
```

Revoke with `--revoke`. See the full [admin guide](docs/ADMIN-GUIDE.md).

## Tests

`scripts/test-phase2.mjs` creates temporary accounts and fixtures only in the dedicated project, tests real Auth/RLS/Storage and the browser UI, then removes them. It retrieves the administrative test key through the authenticated CLI into process memory; no administrative key is written into the app or test artifacts.

```powershell
$env:TEST_BASE_URL='http://localhost:3100'
node scripts/test-phase2.mjs
node scripts/verify-browser.mjs
```

The scripts require a running local server and installed Chrome, or `BROWSER_PATH`. They are developer checks, not public runtime dependencies.

## Remaining scope

Original portrait/artwork/project photographs and approved biography/project facts are still needed for the other pages. Contact submissions are disabled pending their own secure collection work. Shop and checkout remain absent. The Hands of Worcester page, its photographs, and the Share your hands forms are in this repository; apply both Hands migrations and proofread the transcribed names before relying on them in production. The names on the page are those who agreed to be shown. See [docs/HANDS-ENGAGEMENT.md](docs/HANDS-ENGAGEMENT.md). Recovery email delivery requires appropriate Supabase email/SMTP configuration and has not been tested with a real inbox.

The reference files in `InitialImages/` and the user's `images/` folder are preserved. Herd Circle and British Drumming Academy applications/databases were not modified. The Vercel hosting team for this separate Jessica website is named `herd-circle`.

Official references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Storage permissions](https://supabase.com/docs/guides/storage/security/access-control).
