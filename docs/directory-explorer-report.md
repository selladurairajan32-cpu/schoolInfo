# Directory restructure: School Research Explorer

Branch `claude/laughing-wozniak-6izb5k`, from `main` at `fd26680`. Not merged or deployed. The homepage and unrelated pages are unchanged.

## 1. What the data can support

We inspected the database before designing anything.

| Data | Coverage | Used for |
|---|---|---|
| Offer-day figures (DfE school-level applications and offers): first preferences, any preference, offers, offers to other council areas, applications from other council areas | All 166 English schools, every year 2014 to 2026 | **Demand** (first choices against offers), **out-of-area evidence** (share of offers to children from other council areas), **trend** (first choices against three years earlier), and a five-year table in the expanded row |
| Attainment 8, grade 5+ English and maths, A level average | All 166 English schools (A level: 161) | **Results**, as the difference from the selective-school average for the same year, so the comparison is within the selective cohort |
| Progress 8 | none for 2024/25 or 2025/26 (correctly) | stated once in the expanded results context |
| Inspections, three frameworks | 214 records | **Inspection**, with the framework named: an older single grade, an ungraded outcome, or a report card with its achievement area. Report-card areas appear in the expanded row; none are converted between frameworks |
| Entrance test | 24 English schools, 1 in NI | Admissions column |
| Admissions policy | 1 school | Admissions column and expanded criteria |
| Northern Ireland | intake and location only | stated once per list, not per row |

None of these figures are a probability. The expanded row says that first choices include children who did not qualify, and that past demand is not a chance of a place. There is no overall score.

## 2. Two listing structures evaluated

Both were built with the real data at `/grammar-schools` and measured on the same 24 schools. Screenshots are in `docs/screenshots/directory-explorer/option-*`.

| | A: research list (chosen) | B: comparison cards |
|---|---|---|
| Structure | One ruled row per school, with the same four kinds of evidence in fixed columns (Admissions, Demand, Results, Inspection) and a details panel that opens in place | A two-column card grid, each school drawn as three bars |
| Height per school, desktop (first draft) | 163px | 143px |
| Height per school, phone (first draft) | 313px | 289px |
| Evidence visible | test or policy, demand with out-of-area share and trend, results against the cohort, A level, inspection | demand ratio, out-of-area share, Attainment 8 |
| Differentiation | strong: aligned columns let you compare by eye (Caistor 64% of offers to other areas against Boston 0%; Boston first choices up 36% in three years) | visually striking, but the demand bar was scaled to the largest value on the page, which reads as a ranking that shifts from page to page |
| Missing data | a five-mark coverage indicator and a dash | empty bars |

**Decision: A.** It shows more distinct evidence, compares by aligned columns rather than relative bars, and avoids the implied ranking. B was removed. After tightening, A uses 161px per school at 1440px, 180px at 1024px, 204px at 768px, 284px at 390px and 355px at 320px. The previous cards used 323px on desktop and 520px on phones.

## 3. What changed

- **Default experience.** With no search, schools are grouped by place: region, then council area, each with a heading, and Northern Ireland last. The heading for Northern Ireland carries its one data note. The previous default was A to Z nationally. Text searches still order by best match and postcodes by distance.
- **Entry points** under the search: England (166), Northern Ireland (66) and Browse by area, plus a tip that a postcode lists the nearest schools.
- **Listing, level 1:**
  - name, town, intake, partially selective tag, boarding, and distance when a postcode is entered;
  - Admissions: test, plus criteria, places and status when a policy is held;
  - Demand: "292 first choices · 183 offers", then "14% to other areas · ↑5% in 3 yrs";
  - Results: Attainment 8 with its difference from the selective average, the year and A level;
  - Inspection, framework-aware;
  - coverage marks, Details, Compare, View school.
- **Listing, level 2** (Details, in place, with `aria-expanded`):
  - admissions for the entry year, with out-of-area route and priority order when held;
  - five offer days with bars;
  - results in context, with the Progress 8 note and report-card areas;
  - sources and dates;
  - links to admissions and the full profile.
- **Missing data:** a coverage indicator (held or not yet collected for test, policy, offers, results and inspection) and a dash replace the repeated paragraphs. A reading key explains Demand, Attainment 8 and the marks once; on phones it is folded away.
- **Sort options:** By area (the default without a search), Best match, Nearest first, Name A to Z, First choices per offer, Attainment 8, A level. Each is labelled with its direction.
- **Table view:** gains a Demand column, sortable.
- **Filters:** "School" and "Entrance test" stay collapsed unless one of their filters is in use. Admissions rules were already collapsed. The rail is shorter.
- **Kept from the previous release:** search, filters and chips, coverage notes, empty and out-of-range states, the map (every match, with counts), the comparison tray, area pages and browse-by-area.

## 4. Files

| File | Change |
|---|---|
| `src/ui/directory/research-list.tsx` | new: rows, facts, details, coverage |
| `src/ui/directory/row-disclosure.tsx` | new: accessible expand control |
| `src/ui/directory/directory.tsx` | uses the research list; sort options; table demand column; old cards removed |
| `src/ui/directory/filters.tsx` | secondary groups collapsed |
| `src/server/schools.ts` | demand, trend, results and inspection fields; area and demand sorts; `schoolDetails()` batch loader |
| `src/server/search-params.ts` | `area` and `demand` sorts |
| `src/app/grammar-schools/page.tsx` | entry points |
| `e2e/directory.spec.ts`, `e2e/public.spec.ts` | tests for the new structure |

## 5. Tests (final build, local database)

| Check | Result |
|---|---|
| TypeScript | passes |
| ESLint | passes |
| Unit | 60 / 60 |
| Integration | 28 / 28 |
| Playwright, full suite | 77 / 77 |

The Playwright suite includes the directory tests:
- the default sort is "By area";
- filters, sort and view are kept together;
- chip removal;
- the empty state and the coverage note;
- the out-of-range page;
- the map counts;
- the Northern Ireland note appears once;
- a row expands to show offer history, priority order, the demand caveat and sources;
- the journey: search → type filter → sort → compare two schools → view a school → open the comparison → admissions detail.

Screenshots at 320, 375, 390, 768, 1024 and 1440px show no horizontal overflow. Full-page captures are at 390 and 1440px in `docs/screenshots/directory-explorer/`, alongside an expanded row and both evaluated options.

## 6. What the layout cannot fix

The structure now shows every piece of evidence we hold, but admissions intelligence is still thin. Only 1 policy is held, and only 24 of 166 English schools have a recorded entrance test. Until those are collected, the Admissions column is mostly dashes, and the strongest differentiators are offer-day demand, out-of-area share, results and inspection.

The next priority is data:
1. link every English school to its entrance test; this is a small, finite task of about 20 test areas;
2. collect and verify 2027 admissions policies, starting with the most-searched areas;
3. Northern Ireland: Education Authority admissions criteria, and postcode locations so NI schools can be mapped.
