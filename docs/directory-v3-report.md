# Directory redesign V3: find, understand, compare

Branch `claude/laughing-wozniak-6izb5k`, from `main` at `d29a774`. Not merged or deployed. The homepage, brand, fonts, colours and shared components are unchanged.

## Structural changes

1. **Two journeys.**
   - **Find schools for my child** is now what the page starts with when nothing is chosen. It offers a postcode form (with distance and a straight-line caveat) beside "Or explore by region", which lists every region and Northern Ireland with counts, plus "Browse all 232 schools, A to Z". It no longer opens on a national list beginning in Lincolnshire. The page never uses the visitor's location without them typing a postcode.
   - **Explore all grammar schools** is the browsing state: Browse England, Browse Northern Ireland, a region, or the A-to-Z list.

   Both live in the same route and share search, filter and view state.
2. **Header:** "Explore UK grammar schools", the requested description, a search box reading "Enter a school, town or postcode", and four entry points: Find schools near me, Browse England (166), Browse Northern Ireland (66), Explore by region. On phones the entry points scroll sideways on one line. There are no statistics cards.
3. **Results heading** names what is shown: "Grammar schools near HP21 7RP", "Results for 'Kent'", "Grammar schools in England".
4. **Rows** have three research dimensions instead of five columns:
   - Applications (first preferences, offers and the three-year trend, with the year);
   - GCSE results (Attainment 8 and its year, with the selective-school comparison in words);
   - Inspection (latest outcome in its own framework, with the year).

   The empty Admissions column is gone. The entrance test, when known, is a tag next to intake and selectivity, so 109 of 166 English rows carry it without reserving space. The coverage dots are gone from rows.
5. **Plain-language figures.** "−15.5" becomes "15.5 points below the selective-school average". The trend has its own line: "First preferences up 23% since 2023". First preferences and offers are labelled separately and never divided into a rate.
6. **Phones get their own layout:** name, place, tags, then three one-line facts:
   - "293 first preferences, 149 offers (2026)";
   - "Attainment 8 75.5, 3.4 points above selective average (2025/26)";
   - "Ofsted: Outstanding (graded inspection, 2022)".

   Compare, Details and View school follow.
7. **"Understanding these results"** is one collapsible panel above the list. It explains first preferences against offers (different groups, not a rate, not a chance), Attainment 8, inspection frameworks, and what data is held.
8. **Expanded details** form a research summary in two columns on wide screens and one on phones:
   - Admissions and eligibility (test, policy and criteria or a plain "not collected yet", link to admissions);
   - Historical applications and offers (a chart of first preferences against offers over eight years, a five-year table, and the share of offers to other council areas, with the caveat that it shows where offered children lived, not who is eligible);
   - Academic results (Attainment 8 with the selective average, English and maths grade 5+, A level);
   - Inspection findings (framework, date, report-card areas; scales not converted);
   - Sources and coverage, labelled "held" or "not yet collected".
9. **Filters** are grouped under Location (nation, postcode and distance), School (intake; type and facilities) and Admissions (entrance test; admissions rules). The distance options now match the start panel (5 to 100 miles, including 15, 25 and 40): the rail used to show "5 mi" for a 15-mile search. There are no performance filters, because sorting by Attainment 8 and A level already covers the data.
10. **Default sort:** browsing without a search is A to Z. "By area" grouping remains a sort option, a postcode sorts nearest first, and text sorts by best match.

The table and map views are unchanged and share the same state. The map still explains missing coordinates and that markers are not catchments.

## Files modified

| File | Change |
|---|---|
| `src/ui/directory/research-list.tsx` | rewritten: rows, phone facts, chart, details, coverage in details |
| `src/ui/directory/directory.tsx` | start panel, "Understanding these results", contextual heading, wiring |
| `src/ui/directory/filters.tsx` | Location, School and Admissions sections; distance options |
| `src/app/grammar-schools/page.tsx` | header copy, entry points, regions passed to the desk |
| `src/server/schools.ts` | A-to-Z browse default; eight-year history |
| `data/curated/editorial.json` | West Midlands test shortened to "West Midlands shared 11+ test" |
| `e2e/directory.spec.ts`, `e2e/public.spec.ts` | start-state test; updated expectations |

## Validation

Seven widths (320, 375, 390, 768, 1024, 1440, 1920) × nine states (start, England browse, postcode search, filtered, empty, Northern Ireland, table, map, page 2): no horizontal overflow in any of the 63.

Height per collapsed row:

| Width | England browse | Postcode | Northern Ireland |
|---|---|---|---|
| 1440 / 1920px | 208px | 254px | 207px |
| 1024px | 268px | | |
| 768px | 266px | | |
| 390px | 291px | | 180px |
| 375px | 294px | | |
| 320px | 359px | | |

Phone rows land just above the 180 to 250px target, because school names and the three facts wrap. Nothing meaningful was cut to hit the number.

## Tests run (final build)

| Check | Result |
|---|---|
| TypeScript | passes |
| ESLint | passes |
| Unit | 60 / 60 |
| Integration | 28 / 28 |
| Playwright, full suite | 78 / 78 |

The Playwright suite includes the new start-state test.

**One flaky test found:** "filters, sorting and views keep each other" failed once under parallel load and passed three times alone. The sort menu applies changes through a script that attaches after hydration, so the test now waits for the page to settle first.

## Screenshots

- Before: `docs/screenshots/directory-v3/before/`
- After: `docs/screenshots/directory-v3/after/`. This covers start, England browse (full page), postcode, table, map, empty and NI states at 390 and 1440px, plus an expanded row.

## Remaining data limitations

- **Admissions policies:** held for 1 school, so admissions criteria appear in the details for one school only.
- **Entrance tests:** 109 of 166 English schools; none for Northern Ireland beyond one.
- **Northern Ireland:** no results, inspections (Education and Training Inspectorate) or locations held; a single note says so above Northern Ireland results.

## Unresolved

- **Phone rows at 320px** average 359px, because long names wrap to two or three lines.
- **The sort menu** needs JavaScript to apply instantly. Without JavaScript a Sort button appears instead.
