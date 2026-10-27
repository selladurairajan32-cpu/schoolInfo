# Grammar Atlas design system

A research-publication system: white paper, slate ink and one steel-blue accent. Information is separated by typography, rules and alignment rather than by coloured panels. Every template inherits it through one token layer in `src/app/globals.css` and the shared components in `src/ui/`.

Token **names** predate this system and are kept so no template needed a rename: `green` is the primary accent (steel blue) and `copper` the quiet warm secondary. Tailwind utilities map to them through `@theme inline` (`bg-green`, `text-copper-ink`, `bg-navy` and so on). The homepage redesign that introduced this system is described in [homepage-redesign-report.md](homepage-redesign-report.md).

## Typography

Three self-hosted faces (SIL OFL), each with a job:

| Face | Token / utility | Used for |
|---|---|---|
| Inter Variable, with its optical-size axis (`@fontsource-variable/inter/opsz.css`) | `--font-sans`, `--font-display`, `font-mono` (tabular lining numerals) | headings, navigation, controls, statistics, tables, labels, compact data |
| Source Sans 3 Variable (`@fontsource-variable/source-sans-3`) | `--font-read`, `.font-read`, `.read`, `.prose-atlas` | paragraphs, explanations, ledes, callouts, long-form guides |
| IBM Plex Mono | `--font-code` | raw codes and admin payloads only |

Both web faces have metric-matched local fallbacks (`Inter Fallback`, `Source Sans Fallback`: `size-adjust` and ascent/descent overrides on Arial), so line breaks do not move when the fonts swap in. Measured cumulative layout shift on the homepage is 0.0000–0.0004.

| Token | Phone → desktop | Notes |
|---|---|---|
| `--t-display` | 32 → 46px | homepage H1, weight 680, tracking −0.022em, line height 1.14 |
| `--t-h1` | 28 → 36px | page titles |
| `--t-h2` | 24 → 29px | section headings, weight 650, tracking −0.018em |
| `--t-h3` | 18 → 21px | subsections, weight 600 |
| `--t-lede` | 17 → 19px | introductions (Source Sans) |
| `--t-read` | 17 → 18px | explanatory body, line height 1.6–1.68 (Source Sans) |
| `--t-ui` / `--t-body` | 16px | general UI (Inter, weight 400, line height 1.55) |
| `--t-table`, `--t-small` | 15px | table cells, secondary text |
| `--t-meta` | 14px | metadata |
| `--t-label` | 13px | field labels, small caps; the floor for any text |

Weights are capped: Tailwind's `font-bold` renders at 650 and `font-extrabold` / `font-black` at 700, so nothing on the site is heavier than 700. Headings use `text-wrap: balance`, paragraphs `text-wrap: pretty`. Reading measure is 680px (`--measure`). Inter's `cv05` (lower-case l with a tail) keeps l, I and 1 distinct in data.

## Colour

| Token | Value | Contrast on white | Role |
|---|---|---|---|
| `--paper`, `--card` | `#FFFFFF` | — | page and panels |
| `--sage` | `#F2F6F9` | — | subtle section background, table heads, hero band |
| `--sage-deep` | `#E6EDF2` | — | bar tracks |
| `--green-wash` | `#E9F1F7` | — | accent tint: selection, keys |
| `--ink` | `#182535` | 15.5:1 | headings, strong text |
| `--ink-2` | `#425267` | 8.0:1 | body text |
| `--ink-3` | `#56667A` | 5.9:1 | metadata |
| `--green` | `#245D87` | 7.0:1 | primary accent: actions, links, active states |
| `--green-deep` | `#1B4A6D` | 9.4:1 | hover |
| `--green-bright` | `#3A7CB0` | 4.48:1 | chart marks and bullets only, never text |
| `--copper` | `#B7791F` | 3.6:1 | marks and rules only, never text |
| `--copper-ink` | `#8A5413` | 6.3:1 | warm text, and the fill behind white text (6.3:1) |
| `--violet` | `#3F7F86` | — | partially selective schools on maps (a muted teal) |
| `--navy` | `#182535` | — | footer |
| `--rule` / `--rule-strong` | `#DEE5EB` / `#C4D0DA` | — | hairlines |
| `--control` | `#7A8899` | 3.6:1 | form control borders |

On the `#F2F6F9` tint every text colour stays above 5.4:1. Semantic status colours (`--ok` 6.2:1, `--pend` 6.4:1, `--bad` 6.4:1, `--none`) are always paired with an icon and a label. Dark surfaces use `.on-dark` (footer) and `.playground` (interactive explainers), both re-based on slate `#182535`; footer body text is 10.3:1. Gradients and decorative washes are retired: `--wash` now resolves to the flat tint.

## Spacing and layout

| Token | Value |
|---|---|
| `--page` | 1200px content width; `--gutter` 16px → 24px (≥640px) → 32px (≥1440px) |
| `--measure` | 680px reading column |
| `--section-y` | 32px → 48px padding inside each major section |
| `--header-h` | 64px on phones; 68px on desktop, 60px once scrolled |
| Spacing | 8px rhythm with half steps; data rows 12–16px vertical, reading blocks 20–24px |

Density follows content type: reading sections get generous paragraph spacing; tables, directory rows and navigation are tighter.

## Shape and elevation

| Token | Value |
|---|---|
| `--r-1` / `--r-2` / `--r-3` / `--r-4` | 3px / **6px** (controls) / **10px** (panels) / 14px |
| `--shadow-card` | hairline-first: `0 1px 2px` + a soft 8px blur at 8% |
| `--shadow-lift` | finder card and hovered cards |
| `--shadow-menu` | mega panel, mobile sheet |

## Content tones and surfaces

Each kind of content carries one hue, set with a `data-tone` attribute that redefines `--tone`, `--tone-strong`, `--tone-wash` and `--tone-line` (Tailwind: `text-tone`, `bg-tone`, `bg-tone-wash`, `border-tone-line`). Components inside inherit it, so the same bar, chip or tag recolours by context.

| Tone | Hue | Used for | On white / own wash / warm paper |
|---|---|---|---|
| `find` | blue `#1F5F8B` | finding schools, how-it-works | 6.8 / 6.0 / 6.4 : 1 |
| `data` | teal `#0F6B64` | school records, results | 6.4 / 5.6 / 5.9 : 1 |
| `learn` | ochre `#8A5413` | explanations, guides, important guidance | 6.3 / 5.6 / 5.8 : 1 |
| `compare` | slate `#41557A` | comparison, inspection | 7.5 / 6.5 / 7.0 : 1 |
| `date` | brick `#A3392F` | deadlines and countdowns | 6.6 / 5.8 / 6.1 : 1 |

Surfaces give each section its own identity: `.hero-deep` (deep slate lit by two radial glows, with a masked survey grid), `.glass` statistic tiles, `.panel` / `.panel-hover` (layered depth; the hover shadow is tinted with the tone through `color-mix()`), `.tone-bar` (a top bar that widens on hover), `.surface-tint` for data, `.surface-paper` (warm paper) for guidance, `.hatched` for passed dates, and `.numeral` outline figures. In the comparison table, hovering a school's column header highlights its column through `:has()`; date cards on phones sit in a `.snap-rail`.

## Visual grammar by content type

| Content | Treatment |
|---|---|
| Explanations | Source Sans 17–18px, 1.6–1.68 line height, ≤680px measure |
| School information | ruled rows; school name dominant (Inter 600, 19px); field labels 13px above values (`dt`/`dd`) |
| Comparisons | a console with a dark header and lettered school keys; groups colour-keyed by tone (admissions blue, results teal, inspection slate, applications ochre) with matching bars on one scale per row; "same for all" rows merged; stacked per measure on phones |
| Statistics | Inter 600 numerals with tight tracking and tabular figures; a quiet 14px description underneath |
| Important guidance | a 3px accent margin, inline icon, reading type (`Note`, homepage callout) |
| Admission dates | calendar cards: green month band for verified dates, dashed amber card for unverified, hatched grey for passed; a countdown chip and a "Next deadline" ring |
| Articles and guides | a lead article under a 2px ink rule with a larger headline and summary; further reading as a ruled list |
| Actions and tools | outlined or filled controls with arrows; only one filled action per view |

## Motion

| Token | Value |
|---|---|
| `--d-1` … `--d-4` | 140 / 220 / 320 / 520ms |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Reveal | 380ms, 12px rise, 60ms stagger |

Every motion is listed in [animation-inventory.md](animation-inventory.md). Only opacity and transform animate in the common paths. Under `prefers-reduced-motion: reduce`, reveals are skipped, the mobile sheet closes instantly and every remaining transition is cut to 1ms. Without JavaScript all content is visible.

## Components

| Component | File | Notes |
|---|---|---|
| Header | `src/ui/site-header.tsx` | wordmark, navigation, a visible search field (≥768px below the inline nav, and ≥1280px), shortlist; no competing call to action |
| Main navigation and mega panel | `src/ui/main-nav.tsx` | ink-2 items turning ink, a 2px indicator that slides between items, panel with intro in reading type |
| Mobile menu | `src/ui/main-nav.tsx` (`MobileNav`) | slides in and back out (`sheet-in` / `sheet-out`), focus trap, accordion groups |
| Search | `src/ui/search.tsx` | combobox with grouped suggestions; header trigger opens the command palette (`/`, Ctrl/⌘+K) |
| Homepage finder | `src/ui/home/finder.tsx` | segmented tabs with a sliding indicator, cross-faded panels, "Try" area links |
| Comparison preview | `src/ui/home/compare-preview.tsx` | group filter (`aria-pressed`), table ≥768px, stacked keyed list on phones |
| Page banner | `src/ui/hero.tsx` (`Hero`, `HeroHead`, `HeroFigures`, `PageHero`) | flat tint with a hairline; key figures in a white card |
| Section heading | `src/ui/kit.tsx` (`SectionHead`, `Kicker`, `PageHead`) | quiet eyebrow, 650 title, reading-font lede |
| Buttons | `src/ui/kit.tsx` (`Button`, `ButtonLink`, `ArrowLink`) | `primary` (accent → deeper), `secondary` (outline → tint), `quiet`; 44px tall |
| Editorial link | `.ed-link` (globals) | underline draws in from the left on hover or focus |
| Notes and gaps | `Note`, `Gap` (kit) | ruled margin, inline icon, reading type |
| Facts, stats, figures | `Facts`, `Stat`, `Figure` (kit) | tabular numerals |
| Tables | `TableFrame`, `th`, `td` (kit) | tinted head, 13px uppercase labels at 600 |
| Footer | `src/ui/site-footer.tsx` | slate, editorial link underlines, no decoration |
| Motion | `src/ui/motion.tsx` (`RevealRoot`) | one observer for all reveals |

## Accessibility guarantees

- Text contrast ≥ 4.5:1 everywhere (running text ≥ 7:1); the axe suite (`e2e/a11y.spec.ts`) passes on 20 pages plus a dark-mode check.
- Focus is visible (`:focus-visible` 2px accent outline); skip link kept.
- Touch targets ≥ 32px for inline links and ≥ 40px for controls (most 44px).
- Colour never carries meaning alone (status chips, school keys, chart markers, map legend).
