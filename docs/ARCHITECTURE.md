# Architecture and implementation plan

## One application

Next.js App Router, TypeScript and Tailwind. Public pages and future protected admin routes share one dedicated Supabase database, Auth and Storage project. Vercel-compatible runtime; no Sites hosting registration or deployment, per the brief. Stripe remains absent until payment work is authorised.

```text
src/
  app/                   Public routes, metadata, sitemap, robots
    admin/               Setup status only; protected CMS in Phase 2
    engagement/          Non-submitting questionnaire preview
  components/            Shared navigation, gallery and visual primitives
  lib/                   Shared site configuration and questionnaire draft
docs/                    Architecture, status and validation
InitialImages/           Unchanged user reference files
```

Phase 2 adds `src/lib/supabase/{server,client}.ts`, server-only authorisation/data services, validated server actions, protected admin layouts and `supabase/migrations/`. Server-only modules must not enter client bundles. Group public and admin layouts separately when admin becomes functional.

## Proposed entities and relationships

| Area | Entities and relationships |
| --- | --- |
| Access | `admin_users` references `auth.users`; database-controlled role membership, never editable user metadata. |
| CMS | `site_settings`, `content_sections`, draft/published revisions with SEO fields. |
| Portfolio | `artworks` belongs to a category; ordered `artwork_images` references Storage objects with captions and alt text. |
| Public art | `projects` has slug, status, concepts, materials, participation, outcomes, links, optional video and ordered `project_images`. |
| Shop | `products` optionally references `artworks`; categories, product images, variants with option values, GBP integer-pence prices and SKU. |
| Stock | Inventory per variant, edition size, edition numbers and optional certificate data. Unique originals restricted to a single sellable unit. |
| Orders | `orders` owns immutable `order_items` snapshots; customer/delivery, payment, fulfilment, refund and tracking data. No card data. |
| Contact | Private `contact_enquiries` with subject category, validated message and timestamps. |
| Engagement | `questionnaires` references `projects`; immutable `questionnaire_versions` owns ordered `questions` and `question_options`. |
| Responses | `questionnaire_responses` references exact project and version; `response_answers` references questions in that version. Separate consent records record optional quotation permission. |
| Abuse | Server-managed rate-limit counters with expiry; do not store raw IP addresses unnecessarily. |

Questionnaire changes create a new version; submitted versions remain immutable. Answers must satisfy the published version's types, options and required constraints. Public visitors may submit via a validated, rate-limited endpoint, but may never select responses. Quote selection requires recorded opt-in and admin review.

RLS on every application table. Anonymous reads only for published content; private tables deny anonymous selects. Admin membership is checked server-side and in RLS using a narrowly scoped membership function. Storage uploads restricted to admins, validated file signatures/types/sizes and random object names. Draft images require private access or publication-aware policies. Admin provisioning must happen through a trusted operator, with public signup disabled.

Future checkout must validate server prices, reserve inventory atomically, verify Stripe webhook signatures, enforce unique event/idempotency keys and release expired reservations. A browser success redirect never confirms payment. Prices and inventory snapshots preserve order history.

## Phases and acceptance gates

1. **Foundation:** implement public route structure and reference-inspired responsive design; validate lint, TypeScript, build and browser layouts. Use labelled placeholders for missing assets. Original artwork is needed for final visual approval.
2. **CMS:** new Supabase project, migrations/indexes/constraints/RLS, admin provisioning/login, server authorisation, rich text, direct uploads, multiple ordered images, drafts/previews/publishing, editable homepage/about/contact, artwork/project CRUD. Test actual persistence and anonymous/admin access boundaries before proceeding.
3. **Engagement:** reusable versioned question builder supporting every specified question type, validated anonymous submissions with abuse controls, privacy notice, optional quotation consent, private responses, filters/charts, CSV export protected against spreadsheet formulas, downloadable project QR codes and deletion. Test end-to-end and version preservation against the real database.
4. **Shop:** private product/category/variant/inventory/edition CRUD and order foundation. Reuse artwork records. Public shop remains hidden/coming soon and live checkout disabled. Test stock constraints and publishing.
5. **Release preparation:** mobile/tablet/desktop, keyboard/forms/errors, cross-account/RLS/storage checks, authentication, content SEO, build/lint/typecheck. Document deployment instructions; production deployment requires the owner's explicit approval.

## Current boundaries

Phases 1 and 2 are implemented. The dedicated Supabase project is linked through the CLI. Phase 2 uses `admin_users`, `cms_entries` (private drafts), `cms_public` (published snapshots) and `cms_assets` (relational file metadata) with private Storage and publication-aware image reads. Gallery ordering, captions and alt text are preserved inside each snapshot so editing a draft cannot alter the live gallery. Rich content uses safe Markdown rather than raw HTML. The initial entity table above remains the roadmap for later phases; no engagement/shop tables have been created. See `PHASE2-VALIDATION.md`. Final artist photographs and content are still needed. Contact and engagement submissions remain disabled. Phase 2 is available in a review preview; production promotion awaits approval.
