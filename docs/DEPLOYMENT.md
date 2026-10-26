# Production deployment

**Current:** Phase 2 was deployed with owner approval to https://www.jessicamarymonk.com. Admin: https://www.jessicamarymonk.com/admin. See `PHASE2-PRODUCTION.md`. The entries below describe earlier deployments.

Phase 2 review update: https://jessicamarymonkcodex-5flwwnkxz-herd-circle.vercel.app/admin is ready for review. It contains the tested CMS and authentication. The production deployment below remains the approved Phase 1 version; promotion of Phase 2 requires owner approval. See `PHASE2-VALIDATION.md`.

Deployed with the owner's explicit approval on 26 October 2026.

- Website: https://jessicamarymonkcodex.vercel.app
- Vercel project: `herd-circle/jessicamarymonkcodex`
- Deployment ID: `dpl_3QBDM44o88KwHeEZz8vGpppT8PE4`
- Vercel status: `READY`, target `production`
- Inspector: https://vercel.com/herd-circle/jessicamarymonkcodex/3QBDM44o88KwHeEZz8vGpppT8PE4

Unauthenticated HTTP checks returned 200 for the homepage, Hands of Worcester project, Contact, robots and sitemap. These responses contained expected site content and no localhost references. Canonical metadata uses the Vercel production domain when no custom site URL is configured.

This is the Phase 1 website preview with labelled asset placeholders. CMS, administrator authentication, database-backed forms and ecommerce are not implemented. Contact and feedback submissions remain disabled. No Supabase credentials are needed by the current public pages; local environment files, Supabase CLI state, reference images and internal documentation are excluded from deployment uploads.

The local folder is linked through ignored `.vercel/project.json`. Future authorised updates can use `npx.cmd vercel deploy --prod` from this directory. Production deployment approval is required for future changes under the original brief unless the user authorises those changes and deployment together.
