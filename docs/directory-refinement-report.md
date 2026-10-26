# All grammar schools directory: refinement report

Branch `claude/laughing-wozniak-6izb5k`, from `main` at `bccf835`. Not merged or deployed.

Scope: `/grammar-schools` and the shared directory components. Area pages (`/grammar-schools/[area]`) use the same desk, so they get the same cards, table, map and states.

## Changes

| Area | Change |
|---|---|
| Page order | Compact heading and search, then the result count, type tabs and active-filter chips, then the filters (rail on desktop, a "Filters" control on phones placed after the count), then a toolbar (sort and the Cards / Table / Map switch), results, pagination, and browse by area. |
| Hero | The key-figure column is gone; the counts are one line under the search. Phone hero height drops from 492 to 388px, and the first school appears at 889px instead of 982px. |
| Cards | The generated-initials "crest" panel is removed. Each card shows: name and location (large, with region); tags for intake, fully or partially selective (partially selective in orange), sixth form, boarding and Year 8 entry for NI; and a tinted admissions block. When a policy is held, the block shows the entrance test, admission criteria, out-of-area route, places for the entry year and verification status. When no policy is held, one line says it hasn't been collected yet. Results sit on a quieter second row: GCSE Attainment 8 with its year and selective-average tick, and A level average with its year, or "No sixth form". NI cards say England's DfE tables don't apply. A distance badge appears when a postcode is entered. Actions: Compare, Admissions, View school. |
| Missing data | Our gaps read "Not yet recorded by us" or "not yet collected". Gaps in the source read "no figure published". Neither is styled as a negative attribute. |
| Sorting | The default order is name A to Z with no search, best match for text, and nearest for a postcode. The sort box now shows the order actually applied: before, the no-search default was labelled "Best match". Each option names its direction ("Attainment 8, highest first"). "Best match" and "Nearest first" appear only when they can apply. A sort that can't apply (distance without a postcode) falls back to the default. |
| Filters | Unchanged in behaviour; they already combine with AND and are kept across sort, view and page. The radius hint says the distance only applies once a postcode is entered. The desktop rail stays in view while you scroll (it scrolls inside itself if taller than the screen). |
| Admissions-rule filters | Using out-of-area, score threshold or sibling priority shows: "Admissions-rule filters only match schools whose September 2027 policy we hold: 1 of 232 listed schools so far. Schools without a recorded policy are left out of these results, not ruled out." |
| Empty results | Each active filter is listed as a removal link, with "clear every filter" and the coverage note. With no filters, the page suggests checking the spelling or searching by town or postcode. |
| Invalid postcode | The postcode service's message is shown with a suggestion to search by name or town. |
| Past the last page | "There is no page 40. These results fill 10 pages", with links to the last and first pages, instead of "no schools match". |
| Table | Sentence-case headings. The school name column stays put when you scroll sideways. New columns for entrance test and admissions policy (criteria, places, status). Sort links show the active column and direction (`aria-sort`). NI rows show "Not used in NI" instead of England-only measures. A Compare box on each row. |
| Map | Shows every match at once, with no pagination, and states "166 of 232 matching schools are on the map; 66 have no recorded location (all of Northern Ireland's, for now), so they are listed but not plotted. Markers show where schools are, not catchment areas." |
| Browse by area | Region cards list each council area inline with its count, which is shorter and works on phones. The links are plain, so search engines can still follow them. |
| SEO | The title loses its dash. Canonical, noindex-for-filtered-pages and the area links are unchanged and checked. |

## Files modified

- `src/ui/directory/directory.tsx`: cards, table, toolbar, states, layout
- `src/ui/directory/filters.tsx`: radius hint
- `src/server/schools.ts`: applied sort in the result, fallback sorts, the out-of-range page, `policyCoverage()`
- `src/app/grammar-schools/page.tsx`: compact hero, map fetch, area index
- `src/app/grammar-schools/[area]/page.tsx`: map fetch
- `e2e/directory.spec.ts`: new
- `e2e/public.spec.ts`: selectors updated for the new markup

## Tests run (final build, local database)

| Check | Result |
|---|---|
| TypeScript | passes |
| ESLint | passes |
| Unit | 60 / 60 |
| Integration | 28 / 28 |
| Playwright, full suite | 76 / 76 |

The Playwright suite includes 8 new directory tests:
- the sort label matches the applied order;
- filters, sort and view are kept together;
- chip removal;
- the empty state with coverage;
- the out-of-range page;
- the map counts;
- NI rows and cards;
- the full journey: search → filter → sort → compare two schools → view a school → open the comparison → admissions.

Screenshots at 320, 375, 390, 768, 1024 and 1440px show no horizontal overflow.

## Screenshots

- Before (production): `docs/screenshots/directory-refine/before/`
- After: `docs/screenshots/directory-refine/after/`

## Data gaps (unchanged, now labelled honestly)

| Gap | Extent |
|---|---|
| Entrance test recorded | 24 of 166 English schools for 2027 entry; 1 of 66 in NI |
| Admissions policy held | 1 school (Aylesbury Grammar, awaiting verification) |
| Northern Ireland results | none held; England's DfE tables don't apply |
| Northern Ireland locations | none of 66, so NI schools are listed but not mapped |
| A level figure | missing for 5 English schools with a sixth form |
| Attainment 8 | present for every English school |
| Historical offers | held for all 166 English schools |
| Partially selective | 3 schools, correctly classified from GIAS |

## Not done

- **Card height:** phone cards are taller than before (520px against 442px), because they now carry the admissions block.
- **Table header:** it sticks to the top of the table's own scrolling area, not to the page.
- **Coverage notes:** the "history" filter isn't policy-based (all 166 English schools match), so it doesn't trigger the coverage note.
