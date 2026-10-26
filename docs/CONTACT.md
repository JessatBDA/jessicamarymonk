# Contact form

The public contact page saves an enquiry and, when email is configured, notifies Jessica. Apply the database update yourself before relying on it. Do not run it against any project other than Jessica Mary Monk (`wymhdylnnobdzvyrhibq`).

## Apply the database update

1. Open `supabase/migrations/20261026200000_contact_enquiries.sql`.
2. Run it in the Supabase SQL editor for that project, or with the Supabase CLI already linked to that project.
3. Reload `/admin/enquiries` after signing in.

The migration creates `public.contact_enquiries`. Visitors can insert a pending row only. They cannot read the table. An administrator can read, update and delete. A trigger forces new rows to stay pending, records the consent time, and limits repeats: 6 an hour for the same visitor hash, and 40 in 10 minutes across everyone. The website also stops one address after 5 submissions in 10 minutes. The form asks people to wait a few seconds before sending, and ignores a hidden field that scripts sometimes fill in.

## Environment variables

Set these on the server only. Do not prefix them with `NEXT_PUBLIC_`, and do not commit real values.

| Name | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | No | Sends the notification through the Resend REST API. If it is missing, the enquiry is still saved and the visitor still sees a thank-you. |
| `CONTACT_FROM_EMAIL` | No | Sender address. When unset, the site uses `Jessica Mary Monk website <website@jessicamarymonk.com>`. |

The message is sent to `info@jessicamarymonk.com`. The reply-to address is the enquirer’s email. Saving does not depend on the email being delivered. An email failure is not shown to the visitor after the row has been saved, and the message text is not written to logs.

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are still required for the save itself. The app does not use a service-role key.

## What Jessica does

Sign in and open **Contact enquiries**. **Mark as handled** after a reply. **Mark as waiting** puts it back. The public page and footer also show `info@jessicamarymonk.com`.
