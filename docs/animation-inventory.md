# Animation and interaction inventory

Every motion in the redesigned Grammar Atlas, with the reference behaviour it comes from (see [reference-design-audit.md §6](reference-design-audit.md#6-motion-measured)). Only `transform`, `opacity`, colours, shadow and one height transition are animated, so nothing triggers layout thrash.

**Reduced motion.** Under `prefers-reduced-motion: reduce`: reveals are skipped (content is shown in place), floating and rotating decorations stop, `CountUp` renders its final value, and the global rule in `globals.css` cuts every remaining transition and animation to 1ms. Without JavaScript all content is visible, because reveals arm only after `RevealRoot` has marked on-screen elements as revealed.

| # | Interaction | Where | Trigger | Duration | Easing | Delay / stagger | Transform / opacity | Reference source |
|---|---|---|---|---|---|---|---|---|
| 1 | Section reveal | `SectionHead`, homepage sections and cards, report sections (`RSection`), related-reading cards | element enters viewport (−8% bottom margin, 8% visible) | 1s | `cubic-bezier(0.215, 0.61, 0.355, 1)` | `--i × 120ms` across a row | `translate3d(0, 3rem, 0)` → none; opacity 0 → 1 | Elementor `slide-up` (measured keyframe and easing) |
| 2 | Banner entrance | `HeroHead`, home hero copy and map | page load | 400ms | `--ease-out` | aside +120–150ms | `translateY(6px)` → 0; opacity 0 → 1 | Elementor `fadeIn` on hero |
| 3 | Header shrink on scroll | `.site-header-bar` | scroll > 24px (`html[data-scrolled]`) | 500ms | `ease-in` | — | height 80 → 68px | `.site-header.header-get-sticky { transition: height 0.5s ease-in }` |
| 4 | Header shadow | `.site-header` | same | 300ms | `--ease-out` | — | adds `0 3px 9px rgb(0 0 0 / .05)` + soft lift | `eduvibe-header-sticky` shadow |
| 5 | Chapter bar follows header | `ChapterNav` | same | 500ms | `ease-in` | — | `top` tracks `--header-h` | adaptation of 3 |
| 6 | Nav indicator | `MainNav` | hover, focus, open, active route | 400ms | `--ease-out` | — | 3px bar slides (`translateX` + width) | HFE pointer underline (0.3s) |
| 7 | Nav item colour and chevron | `MainNav` | hover / open | 300ms | `ease-out` | — | colour → indigo; chevron rotates 180° | nav `0.3s ease-out` |
| 8 | Mega panel open | `MainNav` panel | hover (110ms intent delay) or click; closes 220ms after leaving | 300ms | `--ease-out` | — | `translateY(12px)` → 0; opacity 0 → 1 | sub-menu `300ms ease-out` slide |
| 9 | Mega link hover | panel links | hover / focus | 300ms | `ease-out` | — | wash background; left padding nudges 4px; arrow slides in | sub-menu item hover |
| 10 | Mobile menu | `MobileNav` | tap | 400ms (sheet), 300ms (scrim) | `--ease-out` | — | `translate3d(100%, 0, 0)` → none; scrim fades | `eduVibeFadeInRight` (measured) |
| 11 | Button hover | `Button`, `ButtonLink`, header CTA, finder and search submit | hover / focus | 400ms | `--ease-out` | — | primary indigo → navy; accent orange → indigo; secondary fills indigo | `.edu-btn { transition: .4s }`, hover → `--color-dark`; secondary → primary (measured) |
| 12 | Button press | all buttons | active | 400ms | `--ease-out` | — | `scale(0.98)` | — (tactile feedback) |
| 13 | Arrow nudge | arrowed buttons and links | hover | 300ms | `--ease-out` | — | arrow `translateX(4px)` | "→" icons on reference buttons |
| 14 | Card lift | `.card-hover` (two-systems cards, tool cards, process steps, related cards, guide cards) | hover / focus-within | 400ms | `--ease-out` | — | `translateY(-6px)`; shadow → `--shadow-lift` | card `transform 0.4s` / shadow |
| 15 | Tool icon tilt | homepage tool cards | card hover | 500ms | `--ease-out` | — | icon tile `translateY(-4px) rotate(-6deg)` | icon-box hover |
| 16 | Thumbnail zoom | guide cards (`.zoom-on-hover`) | card hover | 600ms | `--ease-out` | — | `scale(1.06)` | `edu-blog .thumbnail img { transition: .4s }` scale |
| 17 | Washed circle grow | two-systems cards | card hover | 700ms | default | — | corner circle `scale(1.1)` | decorative card shapes |
| 18 | Region chip hover | homepage region links | hover | 400ms | `--ease-out` | — | `translateY(-2px)`; indigo ring + card shadow | tag hover |
| 19 | Directory row hover | directory ledger | hover | 400ms | `--ease-out` | — | row turns into a white shadowed card; index badge turns indigo | course list hover |
| 20 | Tabs and pagination | finder tabs, year picker, nation filters, filter chips, pagination, view toggle | hover / select | 300–400ms | default | — | background and colour | FAQ filter tabs, Slick dots |
| 21 | Accordion | `Disclosure` (`details.acc`) | toggle | 300ms | `--ease-out` | — | content height 0 → auto (`::details-content`, progressive); "+" bar `scaleY(0)` → "−"; bar fills white → card | accordion marker `transition: .4s` |
| 22 | Statistics count-up | homepage coverage band (`CountUp`) | 40% visible | 1.4s | ease-out cubic | — | number counts 0 → value | **addition**: the reference band is static; the count-up makes the real coverage figures land; the value is server-rendered and announced in full to assistive technology |
| 23 | Map dots settle | homepage map (`.hero-dot`) | load | 500ms | `--ease-out` | 300ms + 25ms per dot (40-dot cycle) | `scale(0.2)` → 1; opacity 0 → 1 | Elementor `fadeIn` on hero image |
| 24 | Orange arc | homepage map frame | continuous | 40s | linear | — | `rotate(360deg)` | static arc + `eduviberotate360` on decorations |
| 25 | Floating decorations | `HeroDecor`, tool band, floating info card, amber badge | continuous | 6s / 7s | `--ease-in-out` | staggered via negative delays | `translateY(-14px)` / `translateX(12px)` | `bounceSlide`, `eduvibe-zoom-in-out` (gentler amplitude) |
| 26 | Dashed circles | banners, footer, dates band | continuous | 40s | linear | — | `rotate(360deg)` | rotating dashed shapes |
| 27 | Footer links and back-to-top | `SiteFooter` | hover | 300–400ms | `--ease-out` | — | `»` marker `translateX(4px)`; button `translateY(-4px)` + indigo fill | footer link hover, `hfe-scroll-to-top-button` (0.3s) |
| 28 | "Next" card | guide articles | hover | 400ms | `--ease-out` | — | `translateY(-4px)`; arrow disc nudges right | — |
| 29 | Table-of-contents rail | `Toc`, `ContentsRail` | scroll-spy | 300–400ms | `--ease-out` | — | active border colour; rail marker slides | — (pre-existing, restyled) |
| 30 | Reading progress | articles | scroll | per frame | — | — | `scaleX` | — (pre-existing, recoloured) |
| 31 | Shortlist pop | `SaveButton` | add | 400ms | `--ease-out` | — | icon `scale(1.18)` pop | — (pre-existing) |

Pre-existing data-visualisation motion (isometric bar rise, admission journey, catchment modes, knowledge-map flow) was kept as is and re-coloured to the new palette.

**Not reproduced, by design:** autoplay carousels (they hide content and fight reduced motion; the guide and tool grids show everything at once), the pulsing video button (no video content), and page transitions (none on the reference).
