# Responsive verification

The live baseline (`docs/qa/measure-live.json`, production on 26 October 2026) and the development build (`docs/qa/measure-dev.json`) were measured with the same script (`scripts/qa/measure.mjs`), the same 20 pages and the same nine widths: 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920px. Values are computed font sizes (px) and rendered sizes (px); banner percentages are of the viewport height. Screenshots for the same page and width are in `docs/screenshots/responsive/before/` (live) and `docs/screenshots/responsive/after/` (development).

## Totals across all 180 page-width combinations

| Check | Live | Development |
|---|---|---|
| Combinations with horizontal overflow | 0 | 0 |
| Browser console errors | 0 | 0 |
| Text elements rendered below 12.5px | 5,364 | 0 |
| Total page height (all 180, px) | 1,139,017 | 1,061,336 |

## Baseline issues and their status

| # | Issue (from `live-responsive-audit.md`) | Status | Evidence |
|---|---|---|---|
| 1 | Navigation and CTA wrap to two lines at 1536px and up | **Fixed** | short labels at every width; e2e "header stays on one line on large screens" at 1920; `profile-rich-1920.jpg` |
| 2 | Banners fill the first screen on phones | **Fixed for profiles, homepage, area, directory; improved for test detail** | table below (e.g. homepage at 390: 122% → 62%; profile at 390: 80% → 63%); test detail at 320 still 88% because of its long official description |
| 3 | School details limited to 960px; label/value split 256/256 | **Fixed** | report column 960 → 1,104px at 1440 and 1920; facts panel rebuilt as one panel (table below) |
| 4 | Text below 12.5px (up to 142 per page) | **Fixed** | 0 across all measurements; 13px floor token |
| 5 | Section headings 40px on desktop | **Fixed** | 28.9–30px desktop, 24.5px tablet, 22px phone |
| 6 | Homepage title 50px; 204px section padding | **Fixed** | title 44px; padding 132px at 1440 (144px at 1920), page 13% shorter at 1440 |
| 7 | Banner dots over the breadcrumb on phones | **Fixed** | dots hidden below 640px; breadcrumb shows parent levels only |
| 8 | Profile buttons wrap; large figures card | **Improved** | buttons compact (still two rows at 320 and 390 with three actions); card 190 → about 150px |
| 9 | Area map dominates phones and tablets | **Fixed** | hidden below 640px, capped at 20rem on tablets: area banner at 768 99% → 62% |
| 10 | Navigation 16px | **Fixed** | 15px |
| 11 | Running text 17px, introductions 19–20px | **Fixed** | body 16px; introductions 17–19px |
| 12 | Calendar date card large | Unchanged | low severity; reads correctly |

## School facts panel (Aylesbury Grammar School, measured)

| Width | Live: label / value | Live: address box | Development: label / value | Development: address | Section height live → dev |
|---|---|---|---|---|---|
| 390 | 129 / 175 | full width | 112 / 196 | 196 (in the list) | 1,117 → 961 |
| 768 | 290 / 392 | full width | 160 / 502 | 502 | 968 → 821 |
| 1024 | 173 / 233 | 230 (side card) | 160 / 542 | 542 | 747 → 821 |
| 1440 | 261 / 353 | 230 (side card) | 152 / 343, two columns | 894 (spans both columns) | 726 → 548 |
| 1920 | 261 / 353 | 230 (side card) | 152 / 343, two columns | 894 (spans both columns) | 726 → 548 |

At 1024px the panel is one column, so it is slightly taller than before but no value is squeezed (233 → 542px). The nested address card is gone; the address and telephone are rows of the same list. All 11 facts remain visible at 390 and 1440 (e2e "school facts are all shown").

## Before and after, by page and width

| Page | Width | h1 | Largest h2 | Banner height | Largest section padding | Report column | Page height | Text < 12.5px |
|---|---|---|---|---|---|---|---|---|
| Homepage | 320 | 34 → 32 | 28 → 24 | 1012 (120%) → 607 (72%) | 112 → 80 | — → — | 13,503 → 12,159 | 7 → 0 |
| Homepage | 390 | 34.2 → 32.2 | 28 → 24 | 1033 (122%) → 523 (62%) | 112 → 80 | — → — | 12,022 → 10,716 | 7 → 0 |
| Homepage | 768 | 42.5 → 38.7 | 33.2 → 24.5 | 1115 (109%) → 853 (83%) | 144.4 → 97.6 | — → — | 9,733 → 8,670 | 7 → 0 |
| Homepage | 1440 | 50 → 44 | 40 → 28.9 | 672 (75%) → 640 (71%) | 203.6 → 132.4 | — → — | 6,985 → 6,103 | 7 → 0 |
| Homepage | 1920 | 50 → 44 | 40 → 30 | 672 (75%) → 640 (71%) | 220 → 144 | — → — | 7,076 → 6,174 | 7 → 0 |
| Directory | 320 | 28 → 28 | 28 → 25.6 | 620 (73%) → 553 (66%) | 72 → 72 | — → — | 11,747 → 11,631 | 121 → 0 |
| Directory | 390 | 28.2 → 28.1 | 28 → 25.6 | 554 (66%) → 492 (58%) | 72 → 72 | — → — | 11,115 → 10,983 | 121 → 0 |
| Directory | 768 | 34.7 → 32.8 | 33.2 → 25.6 | 542 (53%) → 451 (44%) | 72 → 72 | — → — | 8,945 → 8,808 | 121 → 0 |
| Directory | 1440 | 40 → 38 | 40 → 28.9 | 428 (48%) → 361 (40%) | 72 → 72 | — → — | 5,840 → 5,724 | 121 → 0 |
| Directory | 1920 | 40 → 38 | 40 → 30 | 428 (48%) → 361 (40%) | 72 → 72 | — → — | 5,840 → 5,725 | 121 → 0 |
| Area listing | 320 | 28 → 28 | 28 → 25.6 | 838 (99%) → 479 (57%) | 72 → 72 | — → — | 10,419 → 10,006 | 142 → 0 |
| Area listing | 390 | 28.2 → 28.1 | 28 → 25.6 | 824 (98%) → 446 (53%) | 72 → 72 | — → — | 9,652 → 9,146 | 142 → 0 |
| Area listing | 768 | 34.7 → 32.8 | 33.2 → 25.6 | 1009 (99%) → 640 (62%) | 72 → 72 | — → — | 8,889 → 8,501 | 142 → 0 |
| Area listing | 1440 | 40 → 38 | 40 → 28.9 | 439 (49%) → 396 (44%) | 72 → 72 | — → — | 5,415 → 5,324 | 142 → 0 |
| Area listing | 1920 | 40 → 38 | 40 → 30 | 439 (49%) → 396 (44%) | 72 → 72 | — → — | 5,415 → 5,325 | 142 → 0 |
| Profile (rich) | 320 | 28 → 28 | 22 → 20 | 792 (94%) → 658 (78%) | 0 → 0 | 288 → 288 | 11,866 → 11,293 | 29 → 0 |
| Profile (rich) | 390 | 28.2 → 28.1 | 22 → 20.2 | 674 (80%) → 528 (63%) | 0 → 0 | 358 → 358 | 10,285 → 9,574 | 29 → 0 |
| Profile (rich) | 768 | 34.7 → 32.8 | 24.6 → 21.9 | 576 (56%) → 467 (46%) | 0 → 0 | 736 → 720 | 7,533 → 6,973 | 29 → 0 |
| Profile (rich) | 1440 | 40 → 38 | 28 → 24 | 503 (56%) → 418 (46%) | 0 → 0 | 960 → 1104 | 6,276 → 5,574 | 29 → 0 |
| Profile (rich) | 1920 | 40 → 38 | 28 → 24 | 503 (56%) → 418 (46%) | 0 → 0 | 960 → 1104 | 6,276 → 5,574 | 29 → 0 |
| Profile (NI, sparse) | 320 | 28 → 28 | 22 → 20 | 706 (84%) → 573 (68%) | 0 → 0 | 288 → 288 | 6,061 → 5,531 | 0 → 0 |
| Profile (NI, sparse) | 390 | 28.2 → 28.1 | 22 → 20.2 | 610 (72%) → 507 (60%) | 0 → 0 | 358 → 358 | 5,321 → 4,851 | 0 → 0 |
| Profile (NI, sparse) | 768 | 34.7 → 32.8 | 24.6 → 21.9 | 621 (61%) → 507 (50%) | 0 → 0 | 736 → 720 | 4,281 → 3,809 | 0 → 0 |
| Profile (NI, sparse) | 1440 | 40 → 38 | 28 → 24 | 448 (50%) → 381 (42%) | 0 → 0 | 960 → 1104 | 3,400 → 2,900 | 0 → 0 |
| Profile (NI, sparse) | 1920 | 40 → 38 | 28 → 24 | 448 (50%) → 381 (42%) | 0 → 0 | 960 → 1104 | 3,400 → 2,900 | 0 → 0 |
| Profile (long name) | 320 | 28 → 28 | 22 → 20 | 747 (89%) → 615 (73%) | 0 → 0 | 288 → 288 | 10,324 → 9,856 | 21 → 0 |
| Profile (long name) | 390 | 28.2 → 28.1 | 22 → 20.2 | 722 (86%) → 597 (71%) | 0 → 0 | 358 → 358 | 9,046 → 8,478 | 21 → 0 |
| Profile (long name) | 768 | 34.7 → 32.8 | 24.6 → 21.9 | 621 (61%) → 507 (50%) | 0 → 0 | 736 → 720 | 6,648 → 6,147 | 21 → 0 |
| Profile (long name) | 1440 | 40 → 38 | 28 → 24 | 503 (56%) → 418 (46%) | 0 → 0 | 960 → 1104 | 5,345 → 4,750 | 21 → 0 |
| Profile (long name) | 1920 | 40 → 38 | 28 → 24 | 503 (56%) → 418 (46%) | 0 → 0 | 960 → 1104 | 5,345 → 4,750 | 21 → 0 |
| Admissions chapter | 320 | 28 → 28 | 30 → 22 | 792 (94%) → 658 (78%) | 0 → 0 | 288 → 288 | 11,921 → 11,398 | 34 → 0 |
| Admissions chapter | 390 | 28.2 → 28.1 | 30 → 22.1 | 674 (80%) → 528 (63%) | 0 → 0 | 358 → 358 | 10,060 → 9,491 | 34 → 0 |
| Admissions chapter | 768 | 34.7 → 32.8 | 34.8 → 24.5 | 576 (56%) → 467 (46%) | 0 → 0 | 736 → 720 | 7,562 → 7,072 | 34 → 0 |
| Admissions chapter | 1440 | 40 → 38 | 40 → 28.9 | 503 (56%) → 418 (46%) | 0 → 0 | 960 → 1104 | 6,852 → 6,361 | 34 → 0 |
| Admissions chapter | 1920 | 40 → 38 | 40 → 30 | 503 (56%) → 418 (46%) | 0 → 0 | 960 → 1104 | 6,852 → 6,363 | 34 → 0 |
| Results chapter | 320 | 28 → 28 | 30 → 22 | 685 (81%) → 581 (69%) | 0 → 0 | 288 → 288 | 11,578 → 11,215 | 72 → 0 |
| Results chapter | 390 | 28.2 → 28.1 | 30 → 22.1 | 617 (73%) → 497 (59%) | 0 → 0 | 358 → 358 | 10,148 → 9,770 | 72 → 0 |
| Results chapter | 768 | 34.7 → 32.8 | 34.8 → 24.5 | 576 (56%) → 467 (46%) | 0 → 0 | 736 → 720 | 8,189 → 7,850 | 72 → 0 |
| Results chapter | 1440 | 40 → 38 | 40 → 28.9 | 503 (56%) → 418 (46%) | 0 → 0 | 960 → 1104 | 5,824 → 5,536 | 72 → 0 |
| Results chapter | 1920 | 40 → 38 | 40 → 30 | 503 (56%) → 418 (46%) | 0 → 0 | 960 → 1104 | 5,824 → 5,537 | 72 → 0 |
| Guide article | 320 | 28 → 28 | 28 → 22 | 377 (45%) → 315 (37%) | 0 → 0 | — → — | 5,584 → 5,112 | 3 → 0 |
| Guide article | 390 | 28.2 → 28.1 | 28 → 22.1 | 314 (37%) → 257 (30%) | 0 → 0 | — → — | 4,942 → 4,469 | 3 → 0 |
| Guide article | 768 | 34.7 → 32.8 | 33.2 → 24.5 | 325 (32%) → 250 (24%) | 0 → 0 | — → — | 3,571 → 3,222 | 3 → 0 |
| Guide article | 1440 | 40 → 38 | 40 → 28.9 | 340 (38%) → 279 (31%) | 0 → 0 | — → — | 3,162 → 2,890 | 3 → 0 |
| Guide article | 1920 | 40 → 38 | 40 → 30 | 340 (38%) → 279 (31%) | 0 → 0 | — → — | 3,162 → 2,899 | 3 → 0 |
| Test detail | 320 | 28 → 28 | 28 → 22 | 845 (100%) → 739 (88%) | 0 → 0 | — → — | 5,536 → 5,267 | 6 → 0 |
| Test detail | 390 | 28.2 → 28.1 | 28 → 22.1 | 695 (82%) → 595 (70%) | 0 → 0 | — → — | 4,709 → 4,424 | 6 → 0 |
| Test detail | 768 | 34.7 → 32.8 | 33.2 → 24.5 | 588 (57%) → 488 (48%) | 0 → 0 | — → — | 3,609 → 3,342 | 6 → 0 |
| Test detail | 1440 | 40 → 38 | 40 → 28.9 | 510 (57%) → 401 (45%) | 0 → 0 | — → — | 2,340 → 2,086 | 6 → 0 |
| Test detail | 1920 | 40 → 38 | 40 → 30 | 510 (57%) → 401 (45%) | 0 → 0 | — → — | 2,340 → 2,089 | 6 → 0 |
| Compare | 320 | 28 → 28 | None → None | 308 (36%) → 271 (32%) | 0 → 0 | — → — | 5,461 → 5,303 | 13 → 0 |
| Compare | 390 | 28.2 → 28.1 | None → None | 280 (33%) → 244 (29%) | 0 → 0 | — → — | 5,238 → 5,060 | 13 → 0 |
| Compare | 768 | 34.7 → 32.8 | None → None | 311 (30%) → 243 (24%) | 0 → 0 | — → — | 4,642 → 4,457 | 13 → 0 |
| Compare | 1440 | 40 → 38 | None → None | 318 (35%) → 269 (30%) | 0 → 0 | — → — | 3,682 → 3,547 | 13 → 0 |
| Compare | 1920 | 40 → 38 | None → None | 318 (35%) → 269 (30%) | 0 → 0 | — → — | 3,682 → 3,547 | 13 → 0 |
| Calendar | 320 | 28 → 28 | 28 → 22 | 628 (74%) → 520 (62%) | 0 → 0 | — → — | 7,168 → 6,883 | 25 → 0 |
| Calendar | 390 | 28.2 → 28.1 | 28 → 22.1 | 550 (65%) → 448 (53%) | 0 → 0 | — → — | 6,248 → 5,949 | 25 → 0 |
| Calendar | 768 | 34.7 → 32.8 | 33.2 → 24.5 | 559 (55%) → 459 (45%) | 0 → 0 | — → — | 4,927 → 4,633 | 25 → 0 |
| Calendar | 1440 | 40 → 38 | 40 → 28.9 | 369 (41%) → 313 (35%) | 0 → 0 | — → — | 3,520 → 3,374 | 25 → 0 |
| Calendar | 1920 | 40 → 38 | 40 → 30 | 369 (41%) → 313 (35%) | 0 → 0 | — → — | 3,520 → 3,374 | 25 → 0 |

## Responsive matrix

`scripts/qa/responsive.mjs` checks 28 sample pages (every template plus profile variations) at 1920, 1440, 1280, 1024, 768, 430, 390, 375 and 320px for overflow, table containment and the right navigation mode: **252 of 252 pass** (`docs/qa/responsive.json`, matrix in `route-coverage-report.md`).
