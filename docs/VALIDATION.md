# Validation — 26 October 2026

## Phase 1 foundation

- `npm.cmd install`: successful; audit reported zero vulnerabilities.
- `npm.cmd run lint`: passed with no errors or warnings.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run build`: passed; all routes prerendered successfully.
- HTTP checks: all ten page routes plus robots and sitemap returned 200.
- `node scripts/verify-browser.mjs`: passed 30 page/viewport checks in headless Chrome at 390, 768 and 1440 pixels wide.
- Browser checks cover a single page heading, main landmark, horizontal overflow, mobile menu expansion, category filtering, disabled preview submissions and the custom 404.
- Browser testing found portfolio overflow at tablet width; fixed grid minimum sizing and repeated the full browser run successfully.
- Homepage screenshots at mobile and desktop widths were generated and visually inspected. Screenshots and machine-readable results are in `docs/previews/`.

## Limits and remaining work

This validates a public-facing foundation using labelled asset placeholders. It is not a complete application. No database, administrator account, real data collection, upload, CMS, order, chart, CSV, QR, payment or RLS operation has been implemented or tested.

The connected Supabase account lists the organisation **British Drumming Academy**. A dedicated project was quoted at **$0/month**. The project creation tool explicitly requires the user to select its owning organisation. That question is pending, so no project has been created and no existing project has been modified.

Final photos/content, real-device checks, manual keyboard and assistive-technology review, privacy configuration and the later-phase acceptance gates remain outstanding. Nothing has been deployed.

## Repeat browser checks

Start the production server after a successful build, then run `node scripts/verify-browser.mjs`. The script uses installed Chrome on this Windows machine. Other machines can provide `BROWSER_PATH` and `TEST_BASE_URL`. It creates a temporary browser profile outside the repository, closes its browser process and removes that profile afterward.
