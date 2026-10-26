# Route inventory

Discovered on 26 October 2026. The full per-URL table (1,728 rows with discovery source and QA status) is in [grammar-atlas-route-inventory.md](grammar-atlas-route-inventory.md); the raw data is `docs/qa/routes.json`. This page is the template matrix used for the responsive and content work.

## Sources and reconciliation

| Source | Result |
|---|---|
| App Router filesystem (`src/app/**/page.tsx`) | 39 page patterns (27 static, 12 dynamic), 20 route handlers that are not pages |
| Navigation, footer and hard-coded links | all resolve to known routes; 4 relative tab suffixes in the profile layout are not routes |
| Live sitemaps (school-info-seven.vercel.app, fetched today) | 838 URLs |
| Local build sitemaps (same code, same official data) | 838 URLs, identical set |
| Database enumeration | 232 schools × 7 views (1,624 URLs, including `noindex` thin tabs left out of sitemaps), 4 entrance tests |
| Live link crawl (every route visited on 25 October) | 0 links pointing outside the inventory, 0 broken |
| Redirects and middleware | none configured; only `/admin` redirects to `/admin/login` |

Orphaned routes: none in the public site. Thin profile tabs (for example `/schools/<slug>/inspection` for Northern Ireland schools) are reachable from the chapter bar but deliberately left out of sitemaps. Broken routes: none.

## Template matrix

| Template | Routes | Example | Verification |
|---|---|---|---|
| Homepage | 1 | `/` | rendered live at 9 widths |
| Directory (ledger, table, map views) | 1 + query states | `/grammar-schools`, `?view=table`, `?view=map` | rendered live at 9 widths |
| Area listing | 57 | `/grammar-schools/kent` | all routes rendered |
| School profile overview | 232 | `/schools/aylesbury-grammar-school` | all routes rendered; 5 variations below at 9 widths |
| School profile chapters (admissions, 11+, catchment, results, inspection, applications) | 1,392 | `/schools/maidstone-grammar-school/results` | all routes rendered |
| Admissions hub | 1 | `/admissions` | 9 widths |
| Guide article | 7 | `/admissions/appeals` | 9 widths |
| 11+ explainer and content articles | 6 | `/11-plus`, `/methodology` | 9 widths |
| Test providers and test detail | 5 | `/11-plus/exam-providers`, `/11-plus/kent-test` | 9 widths |
| Practice tool | 1 | `/11-plus/preparation` | 9 widths |
| Compare tool and saved comparisons | 1 + user links | `/compare?schools=…` | 9 widths |
| Eligibility checker, catchment checker, planner | 3 | `/tools/*` | 9 widths |
| Research assistant, calendar, data sources | 3 | `/assistant`, `/calendar`, `/data-sources` | 9 widths |
| Corrections form, account | 2 | `/corrections`, `/account` | 9 widths |
| Not found | — | any unknown path | 9 widths |
| Admin console (staff only) | 7 | `/admin/login` | sign-in redirect checked; out of scope |

## School profile variations

Counts are from the 232 listed schools.

| Variation | Schools | Sample used | Why it matters for layout |
|---|---|---|---|
| Published admissions policy with criteria and catchment | 1 | `aylesbury-grammar-school` | longest admissions panels, criteria list, catchment map |
| Entrance test linked | 24 | `aylesbury-grammar-school` | test panel and registration dates |
| Results, inspections and applications held (England) | 166 | `maidstone-grammar-school` | charts, inspection grid, 13-year table |
| Northern Ireland (no results, Ofsted or contacts held) | 66 | `abbey-christian-brothers-grammar-newry` | sparse profile, many gaps shown |
| Partially selective | 3 | `st-bernards-high-school` | verification status chip in the header |
| Boarding | 7 | `reading-school` | extra tag |
| Name over 45 characters | 7 | `queen-elizabeths-grammar-alford-a-selective-academy` | title and breadcrumb wrapping |
