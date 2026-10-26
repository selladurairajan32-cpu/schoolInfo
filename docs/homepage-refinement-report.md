# Homepage refinement report

Branch `claude/laughing-wozniak-6izb5k`, from `main` at `35327df`. Not merged or deployed.

The ten-section structure, typography (Urbanist), colours and components are unchanged. This pass fixes behaviour, accuracy and small layout details.

## Already in place before this pass

These were checked and needed no change:
- the ten homepage sections in the agreed order;
- the hero heading at 32px on phones and 44px on desktop;
- three primary actions under the search;
- school counts split by category;
- the real three-school comparison;
- verification status shown on the Aylesbury policy;
- the demand-is-not-probability note;
- fetched, published and verified explained separately;
- the skip link to `#main`;
- canonical URL, `robots.txt` and the sitemap index on the production domain;
- WebSite structured data.

## Changes

| Area | Change | Files |
|---|---|---|
| Navigation | "Compare" is a direct link in the desktop navigation, marked as the current page on `/compare`. The Tools menu no longer claims `/compare` as its own. | `src/ui/main-nav.tsx` |
| Search: stale results | Suggestions are keyed to the query that produced them. Previously the box showed the last query's results while a new one loaded. A late response for older text is now never shown, and an aborted request can no longer switch off the loading state of a newer one. | `src/ui/search.tsx` |
| Search: states | A finished lookup with no matches says so and offers "Search all schools for …". A failed lookup says suggestions are unavailable. Both are announced to screen readers. Escape closes the list, and a second Escape clears the field. | `src/ui/search.tsx` |
| Search: phones | The large search button is icon-only below 640px, with an accessible "Search" label. The finder card and field padding are tighter. At 320px the typing area grows from about 136px to over 150px (tested). | `src/ui/search.tsx`, `src/ui/home/finder.tsx` |
| Search tabs | The tabs follow the ARIA tabs pattern: arrow keys, Home and End move between them, and only the selected tab is in the Tab order. | `src/ui/home/finder.tsx` |
| Hero map | The spinning arc, the bobbing badge and the 166 dot animations are removed. A plain label reads "166 of 232 listed schools mapped", so the figure no longer competes with the 232 listed. | `src/ui/home/hero-map.tsx`, `src/app/page.tsx` |
| Comparison | The section always shows. If the example comparison can't load, it links to the comparison tool. Phones get a "Scroll sideways" hint and an edge shadow while more columns are off-screen. School columns are at least 12rem wide. | `src/app/page.tsx` |
| Nation accuracy | Qualify → Rank → Offer now names each system. English areas set their own tests, and NI uses SEAG. Some schools rank by score, others by criteria. Offers come from the home council (England, with the date) or the Education Authority (NI, no date because none is held). Each upcoming date is labelled with its entry year, for example "England, Year 7 entry in September 2027". | `src/app/page.tsx` |
| Performance | The homepage's seven queries plus the comparison run in one cached call (`unstable_cache`, tag `site-data`, 15-minute expiry). Today's date is part of the cache key, so the next three dates move on each day. Successful or partial imports, policy approvals and school edits clear the tag with `expire: 0`, so the next request recomputes rather than serving an old admissions fact. CLI imports run outside Next.js, so they rely on the 15-minute expiry. The page still renders per request, which keeps "last fetched" times accurate. | `src/server/cache.ts` (new), `src/app/page.tsx`, `src/etl/runner.ts`, `src/app/admin/actions.ts` |
| SEO | The title is shortened from 85 to 57 characters, and the meta description to 159 characters. | `src/app/page.tsx` |
| Code style | `page.tsx` and `directory.tsx` are restored to the codebase's long-line style; a default 80-column format pass in the previous PR had wrapped them. The only behavioural change in `directory.tsx` is the Northern Ireland card from that PR. | `src/app/page.tsx`, `src/ui/directory/directory.tsx` |
| Tests | New `e2e/homepage.spec.ts`. | `e2e/homepage.spec.ts` |

## Tests run (on the final build, against the local database)

| Check | Result |
|---|---|
| `npm run typecheck` | passes |
| `npm run lint` | passes, 0 problems |
| Unit tests (`npm test`) | 60 / 60 |
| Integration tests | 28 / 28 |
| Playwright, full suite | 68 / 68 |

The Playwright suite includes the new homepage tests:
- the Compare link;
- arrow keys on the search tabs;
- a late response for an older query never replacing newer results;
- the no-matches state;
- the skip link;
- typing room at 320px;
- the core journey: search → school profile → comparison → eligibility checker.

It also runs axe on 20 pages, including the homepage and dark mode, plus the overflow checks at 320px.

Responsive screenshots at 320, 375, 390, 768, 1024 and 1440px show no horizontal overflow at any width. Header and menu checks at 1024, 1280 and 1440px:
- the header is 72px tall;
- the last control sits inside the viewport (1000px of 1024);
- the open "Dates & data" menu stays within the screen.

## Screenshots

- Before (production): `docs/screenshots/homepage-refine/before/`
- After (this branch): `docs/screenshots/homepage-refine/after/`, including `nav-open-1024.jpg`

Full-page captures are at 390 and 1440px; the other widths show the first screen.

## Not resolved

- **Northern Ireland performance data:** we hold no reliable official school-level results for NI, so NI cards say England's DfE tables don't apply rather than showing figures.
- **Northern Ireland offer date:** none is held, so the Offer step gives no NI date.
- **Header button below 1280px:** "Check eligibility" is hidden in the header below 1280px, by existing design. The hero shows the same action.
- **CLI imports:** these can leave the homepage up to 15 minutes behind, because they run outside Next.js.

## Recommendations, by priority

1. Add an NI offer date and SEAG-era guidance once the Education Authority publishes them; the Offer step will pick the date up automatically.
2. Call `invalidateSiteData()` from any future admin action that edits public data.
3. Consider showing "Check eligibility" in the header from 1024px.
4. Run a Lighthouse check on production after deploying to confirm the effect of the cached data loading.
