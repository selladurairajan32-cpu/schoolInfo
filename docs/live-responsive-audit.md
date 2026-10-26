# Live responsive audit (baseline)

Measured on the production site, https://school-info-seven.vercel.app, on 26 October 2026 with Playwright (`scripts/qa/measure.mjs`, `LABEL=live`). Twenty representative pages covering every template and five school-profile variations were loaded at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px (180 page-width combinations). All values are computed CSS values or rendered element sizes, not estimates. Raw data: `docs/qa/measure-live.json`. Screenshots: `docs/screenshots/responsive/before/`.

## What was fine

- **No horizontal overflow** at any width on any page (0px in all 180 measurements).
- **No browser console errors** or uncaught exceptions on any page.
- Header height 72px (phones) and 80px (desktop); mobile menu and desktop mega-menu switch at 1024px as intended.
- Main titles render at 28px on phones and 40px on desktop, which is within target.

## Issues

| # | Severity | Template / URL | Widths | Problem (measured) | Screenshot |
|---|---|---|---|---|---|
| 1 | High | every page (header) | 1536px and up (seen at 1920) | Navigation switches to long labels ("Discover schools", "Understand admissions", …) that wrap onto two lines inside the 1200px container; the "Check eligibility" button also wraps to two lines. | `profile-rich-1920.jpg` |
| 2 | High | profiles, area pages, test detail, homepage | 320–430 | The page banner fills most or all of the first screen before any content: profile 792px tall at 320 (94% of the viewport), area page 838px (99%), test detail 845px (100%), homepage 1,012px (120%). | `profile-rich-320.jpg`, `area-390.jpg`, `test-detail-375.jpg`, `home-390.jpg` |
| 3 | High | school profile overview and chapters | 1440, 1920 | School details get 960px: the content container is capped at 1200px at every width, and the chapter rail takes 200px plus a 40px gap. At 1920px more than a third of the screen is empty margin. Label/value pairs in the facts grid split 256px/256px, so long values wrap. | `profile-rich-1440.jpg`, `profile-rich-1920.jpg` |
| 4 | Medium | directory, area listing, results chapter, compare | all | Text below 12.5px: row labels (ENTRANCE TEST, CATCHMENT, ATTAINMENT 8) and chart axis labels at 11.5px; up to 142 such elements per page (area listing), 121 on the directory, 72 on results. | `directory-1440.jpg`, `chapter-results-390.jpg` |
| 5 | Medium | guides, articles, chapters, directory, calendar | 768–1920 | Section headings (h2) render at 40px on desktop and 33–35px on tablet; chapter headings 30px on a 320px phone. Too heavy for information pages and above the 28–32px target. | `guide-1440.jpg`, `chapter-admissions-1440.jpg` |
| 6 | Medium | homepage | all | Title 50px on desktop; sections carry up to 204px vertical padding at 1440 (144px at 768, 112px at 320); the page is 13,503px tall at 320. | `home-1440.jpg`, `home-390.jpg` |
| 7 | Medium | every page with a banner | 320–430 | The decorative dot grid in the banner sits on top of the breadcrumb text. | `profile-rich-390.jpg`, `directory-320.jpg` |
| 8 | Medium | school profile header | 320–430 | Action buttons wrap onto two rows; the key-figures card is about 190px tall with three cramped columns of wrapped labels. | `profile-rich-390.jpg` |
| 9 | Medium | area listing | 320–768 | The isometric area map takes about 330px on phones and 470px on tablets while adding little information at that size. | `area-390.jpg`, `area-768.jpg` |
| 10 | Low | header navigation | 1024–1920 | Navigation text 16px, heavier than the 14–15px wanted for a dense menu. | `home-1440.jpg` |
| 11 | Low | articles, directory, tests | all | Running text 17px with 19–20px introductions; body text on information pages can be 16px. | `guide-1440.jpg` |
| 12 | Low | calendar | 768 | Next-date card uses large heading type for a date. | `calendar-768.jpg` |

## Key measurements (live)

| Page | Width | h1 | Largest h2 | Body | Banner height | Largest section padding | Report column | Text < 12.5px |
|---|---|---|---|---|---|---|---|---|
| Homepage | 320 | 34 | 28 | 17 | 1,012 (120vh) | 112 | — | 7 |
| Homepage | 1440 | 50 | 40 | 20 | 672 | 204 | — | 7 |
| Directory | 320 | 28 | 28 | 17 | 620 (73vh) | 72 | — | 121 |
| Directory | 1440 | 40 | 40 | 19 | 428 | 72 | — | 121 |
| Area listing | 320 | 28 | 28 | 17 | 838 (99vh) | 72 | — | 142 |
| Profile (rich) | 320 | 28 | 22 | 16 | 792 (94vh) | — | 288 | 29 |
| Profile (rich) | 1440 | 40 | 28 | 17 | 503 | — | 960 | 29 |
| Profile (rich) | 1920 | 40 | 28 | 17 | 503 | — | 960 | 29 |
| Admissions chapter | 1440 | 40 | 40 | 17 | 503 | — | 960 | 34 |
| Guide | 1440 | 40 | 40 | 16 | 340 | — | — | 3 |
| Test detail | 320 | 28 | 28 | 17 | 845 (100vh) | — | — | 6 |
