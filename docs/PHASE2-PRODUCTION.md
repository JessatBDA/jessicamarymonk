# Phase 2 production deployment — 26 October 2026

Deployed after the owner explicitly requested “deploy”.

- Website: https://www.jessicamarymonk.com
- Administration: https://www.jessicamarymonk.com/admin
- Deployment ID: `dpl_4FBnXnVjzSnM3dDYustLWTmbj4pe`
- Inspector: https://vercel.com/herd-circle/jessicamarymonkcodex/4FBnXnVjzSnM3dDYustLWTmbj4pe
- Vercel status: `READY`, target `production`

The existing Vercel project already had the artist's custom domain assigned; the production deployment automatically used it. The deployed app includes the Phase 2 CMS, administrator authorisation, private drafts and uploads, recovery corrections and 10-character password minimum.

Unauthenticated checks: homepage, flagship project and login returned 200. `/admin` returned 307 to `/admin/login` with private/no-store cache headers and noindex. Canonical metadata points at `www.jessicamarymonk.com`.

Supabase's Auth site URL and approved callback URLs were updated only in project `wymhdylnnobdzvyrhibq` to include the artist's custom domain. Existing preview callback entries were retained. Other project settings were preserved. No changes to Herd Circle or British Drumming Academy applications/databases; no payments or Project Engagement activation.

Historical Phase 1/Phase 2 preview reports remain in the documentation. This file supersedes their statements that production promotion is pending. Use the custom production domain for sign-in and password recovery rather than old preview links.
