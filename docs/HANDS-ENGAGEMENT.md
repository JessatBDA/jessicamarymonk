# The Hands of Worcester — engagement

This is the manual follow-up for the Share your hands forms, the participant list, and the photographs on the project page. The two migrations in this repository have **not** been applied. Do not run `scripts/seed-cms.mjs` against production. It only inserts missing entries and will not replace the Hands of Worcester text that is already published.

No new environment variables are required. The existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are enough. The app does not use a service-role key. The URL must stay `https://wymhdylnnobdzvyrhibq.supabase.co`.

## Apply the database update

Use only the Jessica Mary Monk project `jessicamarymonk` (`wymhdylnnobdzvyrhibq`) in organisation `tdylezilvdsdqayciqst`.

1. Open `supabase/migrations/20261026160000_hands_engagement.sql`.
2. Run it in the Supabase SQL editor for that project, or with the Supabase CLI already linked to that project: `supabase db push`.
3. Then open `supabase/migrations/20261026190000_hands_age_ranges.sql` and run that in the same project. It widens the age-range check on `hands_responses` and `hands_works`. New form values such as `under-18` and `90-plus` are rejected until this second file has been applied. Existing rows stay valid: the new check still allows `''`, `prefer-not`, `under-16`, `16-17` and `18-over`.
4. Do not run either file against any other database.
5. Reload `/admin/engagement` after signing in. Until the first file is applied, the public forms show a short message that saving is not switched on yet. The thank-you list still shows the names transcribed from the exhibition panel: people who agreed to be shown, not everyone who took part.

The migration creates:

- `hands_responses` for the questionnaire
- `hands_works` for pictures, poems and other writing
- `hands_name_requests` for names added after the panel list
- a private Storage bucket, `hands-works`
- row level security so the public can insert but cannot read those tables
- `approved_hands_names()`, which returns only names with permission that an admin has approved
- `approved_hands_works()`, which returns approved pictures and writing, and a credit only when the name permission was approved
- triggers that force new rows to stay pending, record consent times, and reject an approval when name permission is missing
- a limit of 6 submissions an hour for the same visitor hash, and 40 submissions in 10 minutes across everyone

The in-app limit is 5 submissions in 10 minutes for one address, plus a hidden field that is discarded if a script fills it in. Addresses are stored only as a hash. Someone who calls the database directly can vary that hash until the shared 40-in-10-minutes limit. They still cannot approve their own row.

## What Jessica does in the admin

Sign in and open **Hands submissions**.

- **Show on the site** puts an approved picture or piece of writing on `/engagement/share-your-hands`.
- **Hide** takes it off again.
- **Approve name** adds that name to the thank-you list on the project page. The button stays unavailable when permission was not given. The database also refuses the approval.
- **Reject name** keeps the name off the public list.
- **Approve every consented name still waiting** approves only rows that have both a name and permission.
- The three downloads are CSV files: every name and its consent, the questionnaire answers, and the pictures and writing. Cells that start with `=`, `+`, `-` or `@` are prefixed so a spreadsheet does not treat them as formulas.

Approving a name updates the public list within about a minute, without a new deploy. If Supabase is unavailable, the page keeps showing the transcribed panel list.

## Age ranges

The questionnaire and the picture or writing form ask for an age range. The choices, in order, are Prefer not to say (stored as an empty value), Under 18 (`under-18`), 18 to 24 (`18-24`), 25 to 34 (`25-34`), 35 to 44 (`35-44`), 45 to 54 (`45-54`), 55 to 64 (`55-64`), 65 to 74 (`65-74`), 75 to 84 (`75-84`), 85 to 89 (`85-89`), and 90 or over (`90-plus`). The name form does not ask for an age.

A person under 18 still needs a parent, guardian or teacher to agree before their name is shown. The admin review screen labels the stored age, including older values (`under-16`, `16-17`, `18-over`, `prefer-not`), and warns when the age is under 18. Approving a name is still a decision for Jessica: the database does not block a name because of the age band.

## Proofread the participant names

The public project page says, once, that over 200 people have taken part and that more are getting involved. The names on the website are only those who agreed to be shown, so the length of the list is not the participant total.

The names in `src/content/hands-participants.json` were read from the exhibition panel. The file keeps the panel’s order, left column then right column. The website shows them A–Z. The panel lists some people together on one line, and some lines are groups. Do not add names to pad the file into a headcount.

Please proofread the file before treating every spelling as final. Lines that were hard to read, and were left as read rather than “corrected”, include:

- Syndey Griffin (may be Sydney)
- Gallies Wilson
- Jed Griggiths (may be Griffiths)
- Maizie Wilksinson and Max Wilksinson (may be Wilkinson)
- Michal Gorczak and Aleksandra Gorczak
- Karen Lewing
- Jill Desayrah
- Jay Rose Ana
- Lilly Rower (may be Rowe)
- Clare Holzapfal (may be Holzapfel)
- Paul Sobczyk
- Claire-Marie MindyKowski
- Helen Jane Alldridge
- Paul, with no surname read on the panel
- Gemma, with no surname read on the panel
- Jabba Riaz (may be Jabbar)
- Rachel Gardener (may be Gardiner)
- The Very Reverend Doctor Stephen Edwards, which is one person across two lines

Unusual spellings were kept on purpose. Change the JSON, then publish the site again, if a spelling should be different. New names sent through the website are stored in Supabase and are not added to this file.

## Match the CMS copy by hand

Production already has a Hands of Worcester entry, so the seed script will not overwrite it. The project page uses the text in `src/content/hands-of-worcester.ts` whenever the published field is still a placeholder. If a published field has real text, that text is kept.

To make the CMS match, open **Admin → Public art projects → The Hands of Worcester**, paste the same wording, and publish. Uploading a new image set in the CMS changes the card image on the public-art listing. The project page gallery stays the photographs in this repository: `images/hands-01.jpg` to `images/hands-11.jpg`, plus the earlier installation photographs.

`images/hands-02.jpg` is the page hero and the Open Graph image. It shows the whole sculpture on the Worcester Plinth container. People in the build photographs are not named.

## Preview

```powershell
npm.cmd run dev
```

- http://localhost:3000/public-art/the-hands-of-worcester
- http://localhost:3000/engagement/share-your-hands
- http://localhost:3000/engagement/add-your-name
- http://localhost:3000/engagement/share-your-hands/leaflet
- http://localhost:3000/admin/engagement after the migration, signed in as an admin
