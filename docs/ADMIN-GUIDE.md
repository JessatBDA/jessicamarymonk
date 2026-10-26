# Administrator access and CMS guide

## Access

Phase 2 is deployed to production. Use https://www.jessicamarymonk.com/admin for normal administration. The review preview remains available at:

https://jessicamarymonkcodex-5flwwnkxz-herd-circle.vercel.app/admin

Vercel may first ask you to sign in to the account that owns the deployment. The permanent admin address is:

https://www.jessicamarymonk.com/admin

Phase 2 replaced the Phase 1 production version after the owner explicitly requested deployment. Both the local application and preview use only the Jessica Mary Monk Supabase project `wymhdylnnobdzvyrhibq`.

## Create your account privately

1. Open your [Jessica Mary Monk project’s Authentication users](https://supabase.com/dashboard/project/wymhdylnnobdzvyrhibq/auth/users).
2. Choose **Add user → Create new user**. Enter your email and a unique password of at least 10 characters. Use the option to confirm the email when creating your own account. Save the password in your password manager. Do not send it in this chat.
3. Copy the new user’s UUID. Creating an Auth account alone does **not** grant website administrator access.
4. In this project’s [SQL Editor](https://supabase.com/dashboard/project/wymhdylnnobdzvyrhibq/sql/new), run the following, replacing the placeholder with that UUID:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_UUID'::uuid)
on conflict (user_id) do nothing;
```

Alternatively, from the authenticated local project folder:

```powershell
node scripts/grant-admin.mjs YOUR_AUTH_USER_UUID
```

The script refuses to operate unless the CLI is linked to the correct Jessica Mary Monk project. It accepts only a UUID, checks that the account is confirmed and not anonymous, and never reads your password.

5. Open `/admin` and sign in with the email and password you chose.

Public signup is disabled. Role metadata cannot grant access. Membership can only be changed by a trusted database operator, not through the public API or ordinary Auth accounts. The app contains no signup form, service-role credential or automatic first-user promotion.

## Managing content

- **Pages & biography:** edit homepage headings and introductions, biography, contact information, SEO fields and images.
- **Public art projects:** add projects, fill in optional project details, change URL names and display order, upload images and publish/unpublish.
- **Artwork & galleries:** create artwork, select categories and an optional series, and edit availability and commission information. The private reference, year, medium and dimensions are optional. The public gallery shows the images and their alternative text only: titles, years, medium, dimensions and captions stay hidden, including when those fields are empty. Manage images and feature work on the homepage.
- Use the formatting toolbar for bold, italic, headings and lists; **Formatted preview** shows the result. Raw HTML is not rendered.
- **Save draft** keeps changes private while preserving the current public version.
- **Preview saved draft** opens an authenticated preview of the last saved version. Save first; unsaved edits are not included.
- **Publish changes** saves and publishes the entry atomically. Public pages read current published content without waiting for another deployment.
- **Unpublish** removes a project/artwork and its images from anonymous access while keeping the draft. Fixed homepage/about/contact pages remain published.
- Lower display-order numbers appear first. If another browser window saves a newer revision, reload before saving to avoid overwriting it.
- The homepage can select a featured project by its URL name. Artwork marked featured can populate the painting/illustration selection; homepage image placements allow direct overrides.

## Images

Choose files directly from your computer. Multiple files can be selected. Each must be JPG, PNG or WebP, at most 3 MB and 40 megapixels. Up to 30 images are supported per entry. They are decoded, stripped of location metadata, resized within 2400 × 2400 pixels and converted to WebP.

Add a meaningful alternative description and optional caption. Set the placement (hero, portrait, painting, illustration, behind the scenes, finished installation or gallery, as appropriate) and use Move up/down to order them.

Removing an image from the draft does not immediately remove the currently published copy. Publish the updated version to remove it from public presentation. Stored files remain private when they are not referenced by a published snapshot; existing downloads cannot be recalled from a visitor’s device. Draft uploads left out of saved content remain private and may be cleaned up later by a trusted operator.

## Passwords, recovery and revocation

Change your password under **Your account**; the current password is required. Signing out revokes all of your account’s sessions.

**Forgot your password?** requests a Supabase recovery email. Recovery links require the same browser for the default PKCE flow. The callback also supports Supabase token-hash recovery links. Only accounts with administrator membership can enter the workspace. Resetting a password does not grant membership. Recovery email delivery depends on Supabase email settings, provider restrictions and rate limits; an SMTP delivery service has not been configured or tested. Recovery links generated without sending mail were used to test the callback and reset flow. The updated preview directs recovery back to its own deployment and reports delivery errors. A trusted local operator can also open private password setup without email using `scripts/open-admin-recovery.mjs`; see `PASSWORD-RECOVERY-FIX.md`.

To revoke access immediately:

```powershell
node scripts/grant-admin.mjs YOUR_AUTH_USER_UUID --revoke
```

Or delete that user’s row from `public.admin_users` in the project SQL Editor. The database checks current membership and session validity on every protected operation, so an old JWT cannot retain administrator permissions after revocation.

## Scope

Contact submissions, checkout and payments stay off. Share your hands and the Hands of Worcester name list are documented in [HANDS-ENGAGEMENT.md](HANDS-ENGAGEMENT.md), including the database update that still has to be applied by hand. No changes were made to the Herd Circle or British Drumming Academy applications or databases. The existing Jessica Mary Monk Vercel project happens to live under the account’s `herd-circle` hosting team; it is a separate website and uses only its own dedicated database.
