# Route coverage report

Run on 2026-10-25 21:21 UTC against a production build (`next build && next start`) at `http://localhost:3100`, database loaded by the project ETL from the live official sources. Third-party map tiles and postcodes.io were blocked to keep runs deterministic.

## What each visit checks

Navigation status (expect 200; 404 for the probe; `/admin` must redirect to login) · uncaught page errors and console errors · an `h1` is present · `<main>` holds at least 200 characters · no broken images · no horizontal overflow at the viewport width · internal links that point outside the inventory. Every route is visited at **1440×900** and **390×844**, four pages at a time.

## Summary

| Metric | Value |
|---|---|
| Routes checked | 1728 |
| Visits (routes × 2 viewports) | 3456 |
| Passed | 3456 |
| Failed | 0 |
| Internal links outside the inventory | 0 |

## By template

| Template | Routes | Visits | Passed |
|---|---|---|---|
| 11+ explainer article | 1 | 2 | 2 |
| Account / sign-in | 1 | 2 | 2 |
| Admin console (internal) | 7 | 14 | 14 |
| Admissions calendar | 1 | 2 | 2 |
| Admissions hub | 1 | 2 | 2 |
| Admissions planner | 1 | 2 | 2 |
| Area listing | 57 | 114 | 114 |
| Catchment checker | 2 | 4 | 4 |
| Compare tool | 2 | 4 | 4 |
| Content article | 5 | 10 | 10 |
| Corrections form | 1 | 2 | 2 |
| Data sources status | 1 | 2 | 2 |
| Directory — ledger + area index | 3 | 6 | 6 |
| Directory — map view | 1 | 2 | 2 |
| Directory — table view | 1 | 2 | 2 |
| Eligibility checker | 2 | 4 | 4 |
| Entrance test detail | 4 | 8 | 8 |
| Guide article | 7 | 14 | 14 |
| Homepage | 1 | 2 | 2 |
| Not found | 1 | 2 | 2 |
| Practice tool | 1 | 2 | 2 |
| Research assistant | 1 | 2 | 2 |
| Saved comparison | 1 | 2 | 2 |
| School profile — chapter | 1392 | 2784 | 2784 |
| School profile — overview | 232 | 464 | 464 |
| Test providers index | 1 | 2 | 2 |

## Failures

None.

## Representative samples and why they were chosen

School profiles share two templates (overview and chapter) across 1624 URLs. **All of them were visited**; the samples below were additionally screenshot at eight widths because they stress the layout differently:

| Sample | Reason |
|---|---|
| `/schools/aylesbury-grammar-school` | richest record: published admissions policy, criteria, catchment, test, results, inspections, allocations |
| `/schools/queen-elizabeths-grammar-alford-a-selective-academy` | longest school name (54 characters) with sparse data |
| `/schools/abbey-christian-brothers-grammar-newry` | Northern Ireland school: different identifiers, no KS4/Ofsted, Year 8 entry |
| `/schools/maidstone-grammar-school/results` | full results charts and tables |
| `/schools/aylesbury-grammar-school/historical-admissions` | 13 years of applications and offers, wide table |
| `/grammar-schools/kent` | largest area listing (32 schools) |
| `/compare?schools=…` (three schools) | widest comparison table |
| `/tools/eligibility-checker?schools=aylesbury-grammar-school` | rule-driven questions for a school with a published policy |

## Responsive matrix (28 samples × 8 widths = 224 checks)

Checks per cell: no horizontal overflow; wide tables scroll inside their own region; the right navigation is active (desktop mega-nav ≥ 1024px, menu button below). Cells show **ok** or the failing check. Screenshots are in `docs/screenshots/` (full page at 1440 and 390, top of page at 320; desktop images downscaled to 960px wide and tall pages trimmed for size; the other widths were captured during the run and checked, but are not committed to keep the repository small).

| Sample | 1920 | 1440 | 1280 | 1024 | 768 | 390 | 375 | 320 |
|---|---|---|---|---|---|---|---|---|
| Homepage | ok | ok | ok | ok | ok | ok | ok | ok |
| Directory — ledger + area index | ok | ok | ok | ok | ok | ok | ok | ok |
| Directory — table view | ok | ok | ok | ok | ok | ok | ok | ok |
| Directory — map view | ok | ok | ok | ok | ok | ok | ok | ok |
| Area listing | ok | ok | ok | ok | ok | ok | ok | ok |
| School profile — overview (rich) | ok | ok | ok | ok | ok | ok | ok | ok |
| School profile — overview (long name, sparse) | ok | ok | ok | ok | ok | ok | ok | ok |
| School profile — overview (Northern Ireland) | ok | ok | ok | ok | ok | ok | ok | ok |
| School profile — admissions chapter | ok | ok | ok | ok | ok | ok | ok | ok |
| School profile — results chapter | ok | ok | ok | ok | ok | ok | ok | ok |
| School profile — applications chapter | ok | ok | ok | ok | ok | ok | ok | ok |
| Admissions hub | ok | ok | ok | ok | ok | ok | ok | ok |
| Guide article | ok | ok | ok | ok | ok | ok | ok | ok |
| 11+ explainer article | ok | ok | ok | ok | ok | ok | ok | ok |
| Test providers index | ok | ok | ok | ok | ok | ok | ok | ok |
| Entrance test detail | ok | ok | ok | ok | ok | ok | ok | ok |
| Practice tool | ok | ok | ok | ok | ok | ok | ok | ok |
| Compare tool | ok | ok | ok | ok | ok | ok | ok | ok |
| Eligibility checker | ok | ok | ok | ok | ok | ok | ok | ok |
| Catchment checker | ok | ok | ok | ok | ok | ok | ok | ok |
| Admissions planner | ok | ok | ok | ok | ok | ok | ok | ok |
| Research assistant | ok | ok | ok | ok | ok | ok | ok | ok |
| Admissions calendar | ok | ok | ok | ok | ok | ok | ok | ok |
| Content article | ok | ok | ok | ok | ok | ok | ok | ok |
| Data sources status | ok | ok | ok | ok | ok | ok | ok | ok |
| Corrections form | ok | ok | ok | ok | ok | ok | ok | ok |
| Account / sign-in | ok | ok | ok | ok | ok | ok | ok | ok |
| Not found | ok | ok | ok | ok | ok | ok | ok | ok |

Responsive checks passed: **224 of 224**.

Touch targets under 24px (excluding inline text links and visually hidden inputs whose label is the target): Admissions planner @390: 1 (input ""); Admissions planner @375: 1 (input ""); Admissions planner @320: 1 (input ""). The planner hit is the 18px reminder-consent checkbox, wrapped in a label that spans its full sentence, so the whole label is the target (WCAG 2.5.8 passes).

## Other verification

| Check | Result |
|---|---|
| `npm run build` | passes |
| `npm run typecheck` | passes |
| `npm run lint` | passes (0 problems) |
| `npm test` (unit) | 60 / 60 pass |
| `npm run test:integration` | 28 / 28 pass |
| `npm run test:e2e` (axe on 20 pages + dark mode, functional, mobile) | 55 / 55 pass |

## Limitations

- The live site was used for sitemap comparison only; layouts were verified on the local production build of this branch (the deployed site still runs the previous design).
- Saved comparisons (`/compare/[slug]`) are user-generated and unbounded; one real share link was created and checked.
- Third-party map tiles were blocked during automated runs; map chrome (popups, controls, legends) was verified, tile imagery was not.
- `/admin/*` is staff-only and auth-gated: `/admin/login` and the redirect from `/admin` were checked; panel pages inherit the new tokens but were not redesigned or visually verified.

## Live production check

After the merge to main and Vercel's production deployment, the same check ran against https://school-info-seven.vercel.app on 2026-10-25 (finished 21:58 UTC) with `SKIP_API=1`, so it created no saved comparison in the production database. Results are in `docs/qa/coverage-live.json`.

| Metric | Value |
|---|---|
| Routes checked | 1,727 (the branch run's 1,728 minus the API-created saved comparison) |
| Visits (desktop 1440 + mobile 390) | 3,454 |
| Passed | 3,454 |
| Failed | 0 |
| Internal links outside the inventory | 0 |
