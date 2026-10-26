# Responsive, content and data refinement: implementation report

Work done on branch `claude/laughing-wozniak-6izb5k`, restarted from `main` at `c1fc624`. Nothing was deployed or merged; production was only read (measurements, sitemaps and a link crawl).

## 1. Routes and templates inspected

[route-inventory.md](route-inventory.md): 39 page patterns, 838 sitemap URLs (live and local identical), 1,728 enumerated routes across 25 public templates. School profiles were sampled across five data variations: rich policy, results-heavy, Northern Ireland, long name, partially selective. Every enumerated route was then rendered at desktop and mobile widths (section 9).

## 2. Responsive problems discovered

[live-responsive-audit.md](live-responsive-audit.md): 20 pages × 9 widths measured on production. Twelve issues, three high:
- the header wraps at 1536px and up;
- banners fill the first phone screen;
- school details are capped at 960px.

The site had no overflow and no console errors to begin with.

## 3. Typography changes

All values come from tokens in `src/app/globals.css`:

| Role | Before (live) | After |
|---|---|---|
| Homepage title | 34 → 50px | 32 → 44px (`--t-display`) |
| Page titles | 28 → 40px | 28 → 38px (`--t-h1`) |
| Section headings | 28–30 → 40px | 22 → 30px (`--t-h2`) |
| Profile section headings | 22 → 28px | 20 → 24px |
| Card headings | 17–30px | 17 → 19px (`--t-h3`) |
| Body | 16–17px | 16px (`--t-body`) |
| Introductions | 19–20px | 17 → 19px (`--t-lede`) |
| Navigation | 16px | 15px (`--t-nav`) |
| Tables | 15–15.7px | 15px (`--t-table`) |
| Smallest text | 11.5px | 13px floor (`--t-label`); chart axes 12 → 13px |

## 4. Spacing improvements

New tokens: `--space-1…7`, `--section-y` (40 → 72px, was up to 110px per side), `--section-y-sm`, `--banner-top`, `--banner-bottom`, `--gutter` (16px phones, 24px from 640px), and `--header-h` (64px phones, 72px desktop, 64px scrolled; was 72/80).

The banner, section-heading, article, report, homepage card and footer spacing all read from these. Measured result:
- **Banners on phones:** homepage at 390px from 1,033 to 523px; profile from 674 to 528px.
- **Homepage sections:** padding from 204 to 132px at 1440.
- **Page heights:** total across the 180 measurements reduced (see [responsive-verification.md](responsive-verification.md)).

## 5. School details grid

- **Wider report:** school reports use a 1,320px container (`.container-wide`) instead of 1,200px, with a slimmer chapter rail (11.5rem instead of 12.5rem). The report column grows from 960 to 1,104px at 1440px and wider.
- **Facts panel:** `FactsPanel` is now one panel with no nested address card. Its fixed label column (112–160px) leaves values the rest of the width. Pairs run in two columns from 1280px, and the address spans both (894px, against 230px before). Values wrap anywhere rather than overflow.
- **Admissions at a glance:** proportionate figures (34 → 28px), a wider summary measure and a three-column detail row at 1280px.
- **Phones:** compact header action buttons, a smaller key-figures card, and a breadcrumb trail showing parent levels only.
- **Data quality:** verified with real records (Aylesbury, Maidstone, Abbey CBS Newry, Queen Elizabeth's Alford, St Bernard's High). All facts stay visible at every width, as asserted by the e2e tests.

## 6. Data records verified and corrected

[content-and-data-audit.md](content-and-data-audit.md):

| Check | Scope | Result |
|---|---|---|
| Structural (duplicates, missing, malformed) | 232 schools | no duplicates or malformed fields; Northern Ireland lacks contacts, coordinates, gender and age range (source gap) |
| Field-by-field against live GIAS | 166 of 166 English schools, 11 fields | all match |
| Latest inspection against Ofsted | 166 of 166 | 142 exact; 24 differ by a day between Ofsted's own CSV and report pages (source discrepancy, documented) |
| Curated admissions dates against their pages | 11 of 11 | all found at source |
| Published policy (Aylesbury 2027) against the PDF | PAN, qualifying score, registration date | all match |
| Links | 194 | 182 reachable; 10 school sites and the Kent County Council page block automated access (school URLs match GIAS) |

**Confirmed factual errors in the data: none**, so no data values were changed.

**Display defect fixed:** names were title-cased with a capital after an apostrophe ("Queen Elizabeth'S Grammar"). This is fixed in `titleCaseName`, with unit tests using real GIAS names.

**Editorial data changed (wording only):** two SEAG event titles in `data/curated/editorial.json`, "SEAG Entrance Assessment — Paper 1/2" → "SEAG Entrance Assessment, Paper 1/2". Production shows the old titles until the editorial import is run there.

## 7. Content rewritten

Rendered em dashes in prose fell from about 55 lines to 3, all of which are official page titles or a licence name. Remaining dashes are table placeholders for missing values and verbatim official text. Changes cover the homepage, navigation intros, directory and filters, profile and chapter text, admissions hub, eligibility and catchment tools, 11+ explainer, methodology, privacy, about, guides, visual explainers and the planner.

| Where | Before | After |
|---|---|---|
| Homepage introduction | Explore schools, understand the rules, compare your options and plan the next step — all in one research workspace built on official records. | Find grammar schools, see how each one admits pupils, compare your shortlist and plan your application, all from official records. |
| Homepage dates band | Important dates, admissions policies and school research — connected instead of scattered across bookmarks. | Test dates, application deadlines and offer day for the schools you are considering, taken from official sources. |
| Homepage principle | We keep the test standard, the priority order and the offer apart — and never turn them into a probability. | Passing the test, being ranked under the criteria and receiving an offer are separate steps. We explain each one and never turn them into a percentage chance. |
| About | One platform, every grammar school, every important detail — with evidence for every decision. | Grammar Atlas explains how each grammar school in England and Northern Ireland admits pupils, using official records and showing the source for every fact. |
| Assistant title | School Intelligence Assistant | Research assistant |
| Profile | These are demand figures — not cut-off scores, distances or chances. | These are demand figures. They are not cut-off scores, distances or chances of a place. |
| Catchment tool | Does where you live matter for a school — and if so, how? | Find out whether where you live affects your priority for a school, and how. |
| Out-of-area label | Yes — lower priority than local applicants | Yes, at lower priority than local applicants |
| Privacy lists | **Postcode tools** — a postcode is sent… | **Postcode tools:** a postcode is sent… |
| Directory filter note | Straight-line from the postcode's centre — not the method schools use to rank applications. | Straight-line distance from the postcode's centre. Schools use their own method to rank applications. |

Official policy wording, quotations and source titles were not edited.

## 8. Screenshots

| Set | Location |
|---|---|
| Before (production) and after (development), same page and width | `docs/screenshots/responsive/before/` and `docs/screenshots/responsive/after/` (18 pairs) |
| Every template at 1440, 390 and 320px | `docs/screenshots/` (84 images) |

## 9. Build and regression results

All run on the final code, against a local production build loaded with the official data.

| Check | Result |
|---|---|
| `npm run build` | passes |
| `npm run typecheck` | passes |
| `npm run lint` | passes, 0 problems |
| Unit tests | 60 / 60 pass (title-casing cases added) |
| Integration tests | 28 / 28 pass |
| End-to-end (axe on 20 pages + dark mode, search, filters, profiles, NI, eligibility, compare, assistant, calendar, 404, admin, SEO, planner, practice, mobile overflow, plus new keyboard navigation, 1920px header, facts visibility and name casing) | 60 / 60 pass |
| Route rendering (every enumerated route at 1440 and 390: status, console errors, h1, content, images, overflow, internal links) | 1,728 routes, 3,456 / 3,456 visits pass, 0 links outside the inventory |
| Responsive matrix (28 pages × 9 widths: overflow, table containment, navigation mode) | 252 / 252 pass |
| Measurement comparison (20 pages × 9 widths, live vs development) | 0 overflow, 0 console errors, text under 12.5px 5,364 → 0 |
| Colour contrast | axe colour-contrast rule passes on all 20 audited pages, light and dark preference |

Not verified: map tiles (blocked during automated runs), staff-only admin panel pages beyond the sign-in redirect, and production itself (it still runs `main`).

## Completion matrix

| Area | Audit | Implementation | Verification |
|---|---|---|---|
| Global typography | Done: measured live at 9 widths | Done: token scale, 13px floor | Done: re-measured, 0 sub-12.5px text |
| Spacing and layout | Done | Done: spacing tokens, banners, sections, footer | Done: banner and page heights measured |
| Header and navigation | Done: 1920px wrap found | Done: short labels, 15px, 72/64px header | Done: e2e keyboard and 1920 tests |
| School directory | Done | Done: 13px labels, banner, filters | Done: all routes rendered, matrix |
| School details grid | Done: 960px column, 230px address | Done: 1,104px column, single facts panel | Done: measured at 6 widths, e2e facts test |
| School data accuracy | Done: 232 structural, 166 GIAS, 166 Ofsted, 11 dates, policy | No data errors found; name casing defect fixed | Done: unit tests; gaps documented |
| Editorial content | Done: 34 pages read | Done: about 55 prose dash lines → 3, titles and copy rewritten | Done: rendered copy re-scanned |
| Mobile responsiveness | Done (320–430) | Done | Done: 4 widths × 28 pages, all routes at 390 |
| Tablet responsiveness | Done (768, 1024) | Done | Done: matrix |
| Desktop responsiveness | Done (1280–1920) | Done | Done: matrix, all routes at 1440 |
| Functional regression | Baseline green | n/a | Done: build, lint, types, unit, integration, e2e, routes |

## 10. Unresolved issues

- Test detail banner on a 320px phone is still 88% of the screen, because the official test description is long.
- Profile action buttons still take two rows at 320 and 390px.
- The calendar's date card is unchanged (low severity).
- Data gaps listed in the content and data audit: Northern Ireland contacts and coordinates, the Kent Test, policies for 231 schools, and the 24 Ofsted date discrepancies.
- The editorial wording change needs the editorial import on production.
