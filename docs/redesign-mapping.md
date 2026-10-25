# Reference-to-product mapping

How each eduSeed pattern ([reference-design-audit.md](reference-design-audit.md)) was applied to Grammar Atlas. The aim was the reference's craft (type, colour, rhythm, motion), not its content: no course, pricing or testimonial content was copied, and every figure on our pages comes from the database.

## Shared patterns → shared components

| Reference pattern | Grammar Atlas implementation | Applies to |
|---|---|---|
| White header, 15px nav items with chevrons, orange "Register Demo" | `SiteHeader` + `MainNav`: chevrons, sliding indicator, orange **Check eligibility** CTA | every page |
| HFE dropdown (white, shadow, 300ms slide) | mega panel: white card, indigo top rule, measured menu shadow, `menu-in` | every page (desktop) |
| Off-canvas mobile menu from the right | `MobileNav` `sheet-in`, CTA button at the end | every page (≤1023px) |
| Sticky header (height 0.5s ease-in, soft shadow) | header shrinks 80 → 68px with shadow; chapter bar follows | every page |
| Peach-into-lavender page banner, 40/800 title, "Home » Page" | `Hero` / `PageHero` / `HeroHead` + `HeroDecor` + `Breadcrumbs` | all 24 inner templates |
| Course sidebar card | `HeroFigures` white summary card | profiles, area pages, directory, calendar, data sources, tests |
| Section title (800 eyebrow, 40px title) | `SectionHead`, `Kicker`, `.eyebrow`, `--t-h2` | all templates |
| `edu-btn` (5px, 700, 0.4s, primary → navy) and orange secondary (→ primary) | `Button`/`ButtonLink` `primary` and `accent` | all templates |
| Card with `0 10px 20px rgba(0,0,0,.07)` | `.card`, `.card-hover`, `--shadow-card` applied to tables, notes, panels | all templates |
| Round soft-wash icon tiles | `.icon-tile`, tool-card glyph discs | home, notes |
| FAQ accordion (shade bars, + / −) | `Disclosure` (`details.acc`) | profiles (parent questions), guides, methodology, data pages |
| FAQ filter tabs | year picker, calendar nation filter, directory nation filter and chips, finder tabs | profiles, calendar, directory, area pages, home |
| Blog cards (shade, category chip, date, Read More) | homepage guide cards; article "read next" cards | home, guides |
| Archive sidebar (lists, search, counts) | directory filter rail (already present) restyled with chips and tabs | directory, area pages |
| Course meta row (small orange icons) | `Meta` rows on homepage cards; profile tag row | home, profiles |
| Statistics band (solid primary, four columns) | homepage coverage band with `CountUp` (real counts: schools, council areas, results figures, inspection records) | home |
| Navy footer, `»` quick links | `SiteFooter` | every page |
| `slide-up` reveals | `RevealRoot` + `data-reveal` | home, all `SectionHead`s, report sections, related cards |
| Floating dots, rings, dashed circles | `HeroDecor`, `.deco-*`, `float-*`, `spin-slow` | banners, home bands, footer |
| Elementor carousel arrows / dots | square shadowed pagination buttons | directory, area pages |

## Homepage

| Reference section | Grammar Atlas section | Data |
|---|---|---|
| Split hero: eyebrow, H1, lede, button, trust block; circular photo with orange arc and amber badge | **Finding grammar schools**: H1 with the reference's coloured-word treatment ("choose" with an orange swash), primary "Find a grammar school", "Understand admissions" link, an *official data* trust line; circular **map of every listed school with a recorded location** (166 in England; Northern Ireland has no locations in the data yet, which the map says) with orange arc and an amber badge counting the plotted schools | `allSchoolPoints`, `siteStats`, `dataFreshness` |
| — | School finder card overlapping the banner + **Exploring schools by region** chips | `topCouncilAreas` |
| Statistics band | Coverage band (counting up) | `siteStats` |
| Two programme cards | **Two systems**: England 11+ and Northern Ireland Year 8 transfer, with counts and facts taken from the site's own guides; national deadline from the database | `siteStats`, `cycleEvents` |
| Course grid on the wash | **Research tools**: directory, eligibility, catchment, compare, planner, calendar, 11+ practice, assistant. Meta rows restate claims the site already makes | static + `siteStats` |
| "Why us" split with three icon features | **Go beyond the school name**: real featured school records (test, Attainment 8) beside the three product principles (official data first, uncertainty visible, qualifying is not an offer) | `featuredSchools` |
| — | **Understanding admissions**: test result → priority order → offer (offer day from the database) | `cycleEvents` |
| Testimonials band on the wash | **Application timelines**: dates band with calendar tiles and verification status | `upcomingEvents` |
| Blog slider | **Parent guides**: three guide cards (reading path, updated date) | `ADMISSIONS_GUIDES` |
| — | Our promise strip | static |

Catchment guidance, 11+ examinations, comparisons and academic performance are reached from the tool cards, the two-systems cards and the process steps; featured schools and recent updates come from live records rather than editorial claims.

## Internal templates

| Template | Routes | Reference pattern applied |
|---|---|---|
| Directory — ledger + area index | `/grammar-schools` | banner with search and summary card; filter rail with reference tabs and chips; ledger rows lift into cards; shaded table head; square pagination |
| Directory — table / map views | `?view=table`, `?view=map` | same shell; shaded uppercase table head; map popups in card style |
| Area listing | `/grammar-schools/[area]` (57) | banner with area map; same directory body |
| School profile — overview | `/schools/[slug]` (232) | banner with tags, secondary buttons and summary card; numbered chapter tabs; numbered section heads; cards; accordions; calendar tiles |
| School profile — chapters | six per school (1,392) | same chrome; year picker as reference tabs; charts and tables in cards |
| Admissions hub | `/admissions` | banner, guide cards, application-year journey on the navy stage |
| Guide article | `/admissions/[guide]` (7) | blog-post layout: banner, card TOC, prose with orange dot bullets, figures, indigo "next" card, shaded sources, card "read next" |
| 11+ explainer, Content articles | `/11-plus`, `/about`, `/methodology`, `/privacy`, `/terms`, `/accessibility` | same article layout |
| Test providers, Entrance test detail | `/11-plus/exam-providers`, `/11-plus/[test]` (4) | banner with summary card; cards; date tiles |
| Practice tool | `/11-plus/preparation` | cards and timeline in reference colours; orange finish button |
| Compare tool, Saved comparison | `/compare`, `/compare/[slug]` | section tabs as reference tabs; year picker; table in a card |
| Eligibility / catchment checkers, planner | `/tools/*` | numbered indigo step badges; reference fields and buttons; cards |
| Research assistant | `/assistant` | banner; question card; suggested questions list |
| Admissions calendar | `/calendar` | banner with next-date card; nation tabs; orange month tiles with navy text |
| Data sources | `/data-sources` | banner with summary card; status cards |
| Corrections, account | `/corrections`, `/account` | reference form fields and buttons |
| Not found, error | 404, error boundary | banner with search |
| Admin console (internal) | `/admin/*` | inherits tokens and type; not separately restyled (staff-only, outside public scope) |

## Content and data rules kept

No figures were invented: every number on redesigned pages is read from the database at request time, and every statement on the homepage restates copy already present in the site's navigation, README principles or guides (the Northern Ireland bullets were checked against `src/content/guides.tsx`). Verification statuses, sources and "not yet recorded" gaps are displayed exactly as before.
