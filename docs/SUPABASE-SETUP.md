# Supabase connection

The local CLI successfully authenticates to the owner's dedicated project:

- Project: `jessicamarymonk`
- Reference: `wymhdylnnobdzvyrhibq`
- Organisation: Jessica Mary Monk (`tdylezilvdsdqayciqst`)
- Region: `eu-west-1`
- Status: `ACTIVE_HEALTHY`

The folder is linked using `supabase link`. The hosted plugin still has a separate, narrower organisation grant; the CLI is the working connection.

Verified via `supabase db query --linked`: no tables currently exist in the public schema. No remote schema or user data was modified during connection setup.

The URL and publishable key are saved in ignored `.env.local`. No service-role key or CLI login token was copied into the application. Supabase temporary connection state is ignored.

Public-key access to `/auth/v1/settings` returned HTTP 200. The REST API root rejected a publishable key with “Secret API key required”; do not weaken that endpoint or place a secret key in the browser to work around it. Actual table permissions must be tested after migrations are implemented.

Phase 2 update: public signup is now disabled. Email/password sign-in remains enabled for privately provisioned accounts, with a 12-character minimum password length. Only the declared Auth settings were pushed to this project; unrelated settings were preserved.

Phase 2 schema, RLS, administrator provisioning, server authentication, CMS and Storage are now implemented and tested. See `PHASE2-VALIDATION.md` and `ADMIN-GUIDE.md`. The earlier empty-schema observations above record the connection baseline. A Phase 2 review preview is deployed, awaiting production approval. Payments remain disabled.
