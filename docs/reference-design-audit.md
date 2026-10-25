# Reference design audit — eduseed.in

All values below were **measured** from the live site on 25 October 2026 with Playwright (`getComputedStyle`, `document.styleSheets`, theme custom properties and pixel sampling of full-page screenshots). Thirty-four pages across 22 templates were inspected at 1440px and 390px; see [reference-route-inventory.md](reference-route-inventory.md) for the page list. Nothing here is inferred from "typical" education sites. Where a value could not be measured, the section says so.

The site is WordPress with the **EduVibe** theme, Elementor page builder, the HFE header/footer builder and WooCommerce for worksheets.

---

## 1. Typography

One family is used for everything: **Urbanist** (Google Fonts, SIL Open Font Licence), weights 400–800. Inter is loaded but only used by a plugin; icon fonts are Font Awesome, Remix Icon and icomoon.

| Role | Size / line height | Weight | Colour | Occurrences |
|---|---|---|---|---|
| Home hero H1 | 44px / 55px (34px / 42.5px on phones) | 800 | `#231F40` | homepage |
| Page-banner H1 (every inner page) | 40px / 56px (24px / 33.6px on phones) | 800 | `#231F40` | 31 of 34 pages |
| Section title (`.section-title .title`) | 40px; 32px below 575px | 800 | `#231F40` | theme rule |
| Section H2 (Elementor) | 36px / 44.64px | 800 | `#231F40` | 26 |
| Sub-section H2 | 24px / 36px, 18px / 28px | 700 | `#231F40` | 36 |
| Large card H3 | 30px / 42px | 800 | `#231F40` | 71 |
| Course-card H3 | 20px / 28px | 800 | `#231F40` | 10 |
| Article H4 | 24px / 33.12px | 700 | `#231F40` | 22 |
| Eyebrow (`.pre-title`) | 16px / 26px, tracking 0.1em, uppercase | 800 | `#525FE1` | every section |
| Body | 16px / 26.08px | 500 | `#6F6B80` | 133 |
| Hero lede | 20px / 32px | 500 | `#6F6B80` | homepage |
| Section description | 15px / 24.45px | 500 | `#6F6B80` | 11 |
| Navigation | 16px, padding 15px | 500 (theme nav 600) | `#020101` | header |
| Button (`.edu-btn`) | 18px / 60px tall (medium 16px / 50px, small 14px / 36px) | 700 | white | theme rule |
| Elementor button | 15px | 500 | white | 33 |

**Observations**
- Headings are always heavy (700–800) and set in the heading ink; body copy is a mid-grey at 500 weight, which gives the reference its soft, friendly contrast.
- No negative tracking anywhere; only the eyebrow is tracked (0.1em).
- Coloured heading treatment: a single word in a heading is sometimes set in the primary colour (e.g. "50000+" badge, testimonial names).

## 2. Colour

Theme custom properties (read from `:root`):

| Token | Value | Use observed |
|---|---|---|
| `--color-primary` | `#525FE1` | buttons, eyebrows, stats band, carousel dots, links |
| `--color-secondary` | `#F86F03` | "Register Demo" header button, "Try a Free Class" buttons, arcs, icons |
| `--color-secondary-alt` | `#FFF6F4` | warm icon wash |
| `--color-tertiary` | `#FFA41B` | the round "50000+ Hours of Learning" badge, decorative dots |
| `--color-tertiary-2` | `#7152E9` | secondary accent |
| `--color-heading` / `--color-dark` | `#231F40` | headings, footer background |
| `--color-body` | `#6F6B80` | body text |
| `--color-shade` | `#F5F5F5` | blog cards, accordion bars, inactive tabs |
| `--color-border` / `--color-shape` | `#EEEEEE` | hairlines |
| `--color-success` / `--color-warning` / `--color-info` / `--color-danger` | `#3EB75E` / `#FF8F3C` / `#1BA2DB` / `#FF0003` | states |

Background washes (pixel-sampled): hero `#FFF7F1 → #FFEADB` with a lavender right edge; course band `#FED6AD` (top-left) → `#F8EFF3` → `#F2EBF3`; testimonial band `#F6E8DF → #FCE6E2 → #FBF0EF`. In short, **a peach-into-lavender gradient** behind hero, page banners and alternate sections.

**Contrast (measured):** body `#6F6B80` on white is 5.13:1 (passes AA). White on `#F86F03` is 2.89:1 and white on `#525FE1` is 5.14:1, so the reference's orange buttons fail WCAG AA for their label size.

## 3. Layout and spacing

| Property | Value |
|---|---|
| Boxed container | 1140px content (Elementor boxed) inside 1200px with 15–30px gutters |
| Section vertical padding | 115px top/bottom on major bands (`115px 0px`); footer `50px 0 100px` |
| Column gap | Elementor default 10px column padding; cards in 4-up grids at 1440 (≈251px each) |
| Card padding | 20px |
| Header height | 80px branding row (129px including the top strip on phones) |
| Breakpoints | 1024px (tablet), 767px (mobile), 575px (title step), plus theme 1168/1218px |
| Mobile overflow | none on any inspected page |

## 4. Shape, borders and shadows

| Element | Value |
|---|---|
| Button radius | 5px (`.edu-btn`), 3px (Elementor buttons) |
| Carousel arrow button | 50×50, white, radius 5px, shadow `0 10px 20px rgba(0,0,0,0.07)` |
| Card shadow | `0 10px 20px rgba(0,0,0,0.07)` (same token) |
| Sub-menu shadow | `0 4px 10px -2px rgba(0,0,0,0.1)` |
| Sticky header shadow | `0 3px 9px rgba(0,0,0,0.05)` |
| Hairlines | 1px `#EEEEEE`; course cards outlined 1px `#6F6B80` on the home pair |
| Image frames | circular hero photo with a thin orange arc; collage circle in testimonials |

## 5. Components (by template)

**Header (all pages).** Logo left; nav items 16px with 15px padding; dropdown chevrons; orange "Register Demo" button closes the row. Dropdown (`ul.sub-menu`): white, 220px wide, shadow above, `0.3s ease-in` transition. Mobile: hamburger opens an off-canvas panel sliding in from the right (`eduVibeFadeInRight`: `translate3d(100%,0,0) → none`).

**Home hero.** Split composition: eyebrow, 44px H1, 20px lede, primary button with trailing arrow, a "Rated 5/5 by Parents / Google Reviews" trust block; right side a circular photo framed by an orange arc, an amber round badge with a white ring, and an orange play button. Faded decorative shapes (dots, rings, squiggles) float around it.

**Statistics band.** Solid primary `#525FE1` rounded box, four columns separated by thin white rules; line icon, large white number ("50.000+"), uppercase label.

**Programme pair.** Two large outlined cards with photo, 30px title, bullet list and primary "Explore More" button.

**Course grid.** On the warm wash: centred eyebrow + 40px title; 4-up white cards (20px padding) with image, 20px/800 title, centred description, two-column meta row with small orange icons (grade, sessions, projects, duration) and an orange "Try a Free Class →" button.

**"Why us" split.** Image collage left; right: eyebrow, title, three icon features (round soft-wash icon tile, bold title, grey text), primary button.

**Testimonials.** On the warm wash: circular collage, quote, name in heading ink, grade/location in primary; avatar switcher with a ring around the active one.

**Blog cards / archive.** Shade (`#F5F5F5`) cards: image, category chip, title, date with icon, "Read More →" in primary. Archive pages add a sidebar (Archives list, Search, Categories with counts) and a meta row (read time, comments, date).

**Page banner (all inner pages).** Full-width peach-to-lavender band, left-aligned 40px/800 title, breadcrumb "Home » Page", small faded decorative shapes.

**Course detail.** White content card with shadow; sticky right sidebar card (course logo, title, icon list of age/sessions/level, requirements, CTA "Register Now →"). FAQ below.

**FAQ / accordion.** Filter tabs (pill buttons: active primary, inactive shade). Items: shade bars, bold 16–20px question, "+" marker rotating to "−", 0.4s transition. Elementor toggles: 15px padding, 700 weight.

**Forms (contact, request demo, account).** Simple stacked fields, 16px text, light borders, primary submit.

**Footer.** Navy `#231F40`; columns: logo + mission + social squares; "Quick Links" with `»` chevrons; "Contact Info" with icons; centred copyright bar. Faint dots and a dashed circle as decoration.

## 6. Motion (measured)

| Interaction | Trigger | Duration / easing | Transform / opacity | Notes |
|---|---|---|---|---|
| Section reveal (`slide-up`) | element enters viewport (Elementor waypoint) | Elementor `animated` (≈1.25s default); `cubic-bezier(0.215, 0.61, 0.355, 1)` | `translate3d(0, 3rem, 0)` + opacity 0 → none, 1 | on section titles, columns, icon boxes, buttons; columns in a row stagger by delay |
| Decorative fade (`fadeIn`) | load | Elementor | opacity 0 → 1, `translateY(-10px) → 0` | floating shapes, hero image |
| Sticky header | scroll past header | `headerSticky` 0.95s ease | `translateY(-100%) → 0`; shadow `0 3px 9px rgba(0,0,0,.05)` | header height transitions `0.5s ease-in` |
| Dropdown | hover | `0.3s ease-in` (open `300ms ease-out`) | slide/fade | HFE sub-menu |
| Nav link | hover | `0.3s ease-out` | colour | |
| Button | hover | `0.4s` | background colour (primary → navy; orange → primary) | no lift |
| Card / thumbnail | hover | `0.4s` | image scale; card shadow/transform `0.4s` | `edu-blog .thumbnail a img` |
| Mobile menu | tap | `eduVibeFadeInRight` | `translate3d(100%,0,0) → none` | |
| Accordion | click | `0.4s` | marker rotation | |
| Carousels | auto + arrows/dots | Swiper/Slick `0.3–0.4s` | slide | testimonials, student achievers, blog |
| Decorative | continuous | `bounceSlide`, `eduvibe-zoom-in-out` | translateY 0 → -30px; scale 0.9 ↔ 1.1 | floating shapes |
| Video button | hover | 1.25s infinite | pulsing ring | home hero |

No page transitions or animated counters were observed (the statistics band renders static numbers).

## 7. Responsive behaviour

At 390px the header collapses to logo + hamburger (129px including the top strip), titles step down (banner H1 24px, home H1 34px), grids become single columns, decorative absolute elements are hidden on tablet/mobile (`elementor-hidden-tablet elementor-hidden-mobile`), and no inspected page overflowed horizontally.

## 8. Limitations

- Two link-graph families (curriculum redirects and PDF downloads) were excluded as non-HTML.
- Elementor's per-element animation durations are set in data attributes; the exact duration was not exposed, so the theme default is quoted.
- WhatsApp chat widget and cookie/consent behaviour were not analysed (third-party, not design-system material).
