# Grammar Atlas design system

The redesign adopts the measured eduSeed (EduVibe) system described in [reference-design-audit.md](reference-design-audit.md), adapted for a research product and for WCAG 2.2 AA. Every template inherits it through one token layer in `src/app/globals.css` and the shared components in `src/ui/`.

Token **names** predate this redesign and are kept so no template needed a rename: `green` is the primary (indigo) and `copper` is the accent (orange). Tailwind utilities map to them through `@theme inline` (`bg-green`, `text-copper-ink`, `bg-cta`, `bg-navy` and so on).

## Typography

| Token / class | Value | Reference |
|---|---|---|
| `--font-sans`, `--font-display` | Urbanist Variable (self-hosted via `@fontsource-variable/urbanist`, SIL OFL) | Urbanist |
| `--font-code` | IBM Plex Mono (admin payloads only) | — |
| Body | 16px, weight 500, line height 1.63 | 16 / 26.08, 500 |
| `--t-body` (long-form) | 17px, line height 1.7 | 16 / 26 (raised one step for long reading) |
| Headings | weight 800, heading ink, `text-wrap: balance` | 800 |
| Home H1 | `clamp(2.125rem, …, 3.125rem)`, line height 1.2 | 44 / 55, 34 on phones |
| Banner H1 (`HeroHead`, `ArticleShell`, profile) | `clamp(1.75rem, …, 2.5rem)`, line height 1.35 | 40 / 56, 24 on phones (we floor at 28 for long titles) |
| `--t-h2` | `clamp(1.75rem, …, 2.5rem)` | section title 40, 32 on phones |
| `--t-h3` | 20px | card title 20 / 28 |
| `.eyebrow` / `Kicker` | 13px, 800, uppercase, tracking 0.1em, `--green-deep` | 16px, 800, 0.1em, `#525FE1` |
| `.label` | 13px, 700, uppercase, tracking 0.08em | — |
| Figures | `.num` tabular lining numerals | — |

Deviations: eyebrows are 13px (not 16px) and use `#3B47C4` (7.3:1) instead of `#525FE1`, because they sit on the warm wash at small sizes in data-dense pages.

## Colour

| Token | Value | Role |
|---|---|---|
| `--paper`, `--card` | `#FFFFFF` | page and cards |
| `--sage` | `#F5F5F5` | reference shade: inactive tabs, accordion bars, table heads, guide cards |
| `--sage-deep` | `#EEEEEE` | reference border/shape |
| `--green-wash` | `#EEF0FD` | indigo tint |
| `--copper-wash` | `#FFF6F4` | reference secondary-alt: icon tiles |
| `--lilac-wash` | `#F4F1FE` | map water, guide tiles |
| `--ink` | `#231F40` | headings, strong text (15.65:1) |
| `--ink-2` | `#55516A` | running text (7.58:1) |
| `--ink-3` | `#6F6B80` | reference body grey, tertiary text (5.13:1) |
| `--green` | `#525FE1` | primary: buttons, active states, links on hover, stats band |
| `--green-deep` | `#3B47C4` | link text, eyebrows (7.28:1) |
| `--copper` | `#F86F03` | accent graphics: arcs, icons, bullets, chart series |
| `--copper-ink` | `#B84A00` | orange text (5.23:1) |
| `--cta` / `--cta-deep` | `#C84F00` / `#A34100` | orange buttons with white labels (4.59:1) |
| `--amber` | `#FFA41B` | badges, decorative dots (navy text on it) |
| `--violet` | `#7152E9` | third accent (partially selective schools on the map) |
| `--navy` | `#231F40` | footer, primary-button hover |
| `--rule` / `--rule-strong` | ink at 10% / 20% | hairlines |
| `--wash`, `--wash-strong` | `linear-gradient(100deg, #FFF4EC, #FDF1F0, #F3EFFC)` and a stronger variant | page banners and alternate bands |

Semantic status colours (`--ok`, `--pend`, `--info`, `--bad`, `--none` and their washes) are always paired with an icon and a label. Dark surfaces use `.on-dark` (footer) and `.playground` (interactive explainers), both re-based on navy.

## Spacing and layout

| Token | Value |
|---|---|
| `--page` | 1200px content width + `--gutter` 16px each side |
| `--measure` | 690px reading column |
| `--section-y` | `clamp(3.5rem, …, 6.875rem)` (reference 115px bands) |
| `--section-y-sm` | `clamp(2.5rem, …, 4rem)` |
| `--header-h` | 72px on phones; 80px on desktop, shrinking to 68px once scrolled |
| Card padding | 20–32px (`p-5` → `sm:p-8`) |
| Grid gaps | 16px (phones) / 24px |

## Shape and elevation

| Token | Value |
|---|---|
| `--r-1` / `--r-2` / `--r-3` / `--r-4` | 3px / **5px** (buttons, tabs, fields) / **10px** (cards) / 16px |
| `--shadow-card` | `0 10px 20px rgb(0 0 0 / 0.07)` (measured) |
| `--shadow-lift` | `0 22px 40px -14px rgb(35 31 64 / 0.22)` (hover) |
| `--shadow-menu` | `0 4px 10px -2px rgb(0 0 0 / 0.1), 0 24px 48px -24px …` (measured base) |

## Motion

| Token | Value |
|---|---|
| `--d-1` … `--d-4` | 150 / 300 / **400** / 700ms (reference: nav 0.3s, buttons and cards 0.4s) |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Reveal easing | `cubic-bezier(0.215, 0.61, 0.355, 1)` (measured `slide-up`) |

All motion is listed in [animation-inventory.md](animation-inventory.md). Under `prefers-reduced-motion: reduce`, reveals are skipped, decorations stop, counters show their final value and every other transition is cut to 1ms.

## Components

| Component | File | Notes |
|---|---|---|
| Header | `src/ui/site-header.tsx` | sticky, shrinks on scroll, orange "Check eligibility" CTA (≥1280px) |
| Main navigation and mega panel | `src/ui/main-nav.tsx` | 15px-padded items with chevrons, sliding 3px indicator, panel with indigo top rule and `menu-in` motion |
| Mobile menu | `src/ui/main-nav.tsx` (`MobileNav`) | slides in from the right (`sheet-in`), focus trap, CTA button |
| Page banner | `src/ui/hero.tsx` (`Hero`, `HeroHead`, `HeroFigures`, `PageHero`, `HeroDecor`) | wash, floating dots, ring and dashed circle; key figures in a white card |
| Breadcrumb | `src/ui/breadcrumbs.tsx` | "Home » Page", JSON-LD kept |
| Section heading | `src/ui/kit.tsx` (`SectionHead`, `Kicker`, `PageHead`) | eyebrow + 800 title; `align="center"` option; reveals |
| Buttons | `src/ui/kit.tsx` (`Button`, `ButtonLink`, `ArrowLink`) | `primary` (indigo → navy), `accent` (orange → indigo), `secondary`, `quiet`; 50px tall |
| Cards | `.card`, `.card-hover` (globals) | white, 10px radius, measured shadow, lift on hover |
| Icon tile | `.icon-tile` | round warm wash behind a line icon |
| Tags and status | `Tag` (kit), `Status` (`src/ui/status.tsx`) | soft-wash chips; status chips are rounded pills with icon + words |
| Notes and gaps | `Note`, `Gap` (kit) | 4px edge, floating icon disc |
| Facts, stats, figures | `Facts`, `Stat`, `Figure` (kit) | 800-weight figures |
| Accordion | `Disclosure` (kit), `details.acc` | shade bars, +/− marker, animated height (`::details-content`) |
| Tables | `TableFrame`, `th`, `td` (kit); directory table | shade head, uppercase 800 labels, card frame |
| Tabs and segmented controls | finder tabs, `YearPicker`, calendar nation filter, directory nation filter, filter chips | reference FAQ tabs: separate 5px pills, shade inactive, indigo active |
| Search field | `src/ui/search.tsx` | 5px frame, indigo submit, focus ring |
| Filter panel | `src/ui/directory/filters.tsx` | chip and segmented styles above |
| Directory rows and pagination | `src/ui/directory/directory.tsx` | rows lift into cards on hover; square shadowed page buttons |
| Report chrome | `src/ui/report/chrome.tsx`, `parts.tsx` | numbered chapter tabs with indigo badges, numbered section heads |
| Article layout | `src/ui/article/article.tsx`, `progress.tsx` | card TOC with active rail, indigo "next" card, shaded sources box, card "read next" grid |
| Footer | `src/ui/site-footer.tsx` | navy, `»` link markers, back-to-top button |
| Motion | `src/ui/motion.tsx` (`RevealRoot`, `CountUp`) | one observer for all reveals; count-up statistics |
| Home map | `src/ui/home/hero-map.tsx` | every listed school with a recorded location plotted on the coastline (badge, legend and caption describe only what is plotted), in a circular frame with an orange arc and amber badge |

## Accessibility guarantees

- Text contrast ≥ 4.5:1 everywhere (≥ 7:1 for running text); the automated axe suite (`e2e/a11y.spec.ts`) passes on 20 pages plus a dark-mode check.
- Focus is visible (`:focus-visible` 2px indigo outline); skip link kept.
- Touch targets ≥ 40px (most 44–50px).
- Colour never carries meaning alone (status chips, chart markers, map legend).
