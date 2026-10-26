# Password setup and recovery correction

The initial Phase 2 preview sent password-recovery email redirects to the canonical production domain, which still ran Phase 1. Recovery also discarded email-delivery errors and could therefore show a success message when sending failed.

Corrected recovery to use the current trusted Vercel preview deployment while keeping SEO canonical URLs on production. Added a narrowly scoped Supabase redirect allowlist for this project's preview host pattern. Recovery requests now report delivery failures and rate limits. Invalid or expired callback links show an explanatory error instead of silently returning to sign-in; invalid links no longer sign out an existing session.

New review preview: https://jessicamarymonkcodex-bl0nj6nkm-herd-circle.vercel.app/admin

Validation: build, lint, TypeScript and six focused recovery regression checks passed. Hosted invalid-callback redirect and error-message checks passed. No recovery emails were sent by these checks. The prior Phase 2 end-to-end suite already exercised a valid token-hash recovery flow and password update; this correction preserves that path.

The owner's immediate setup was unblocked through `scripts/open-admin-recovery.mjs`. The authenticated local operator verifies membership, creates a one-time recovery token and opens the setup page directly in the local browser. No email is sent, no password is chosen by the agent, and no recovery token is printed or written into the project. The owner confirmed that the browser displayed “Choose a new password”. Completion of the owner's password entry has not been independently verified.

For future trusted local recovery:

```powershell
node scripts/open-admin-recovery.mjs YOUR_AUTH_USER_UUID https://jessicamarymonkcodex-bl0nj6nkm-herd-circle.vercel.app
```

Real recovery-email delivery still depends on the project's Supabase email settings, restrictions and rate limits. Production remains Phase 1 until promotion is approved.
