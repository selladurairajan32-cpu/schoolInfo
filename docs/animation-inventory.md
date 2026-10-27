# Animation and interaction inventory

Every motion on Grammar Atlas after the research-publication redesign. Motion is short, decelerating and tied to something the reader did or is about to read. Common paths animate only `transform` and `opacity` (plus colour and shadow on hover), so nothing triggers layout work. There is no constant motion: the floating dots, rings, spinning arcs and continuous map pulses of the previous design are gone.

**Reduced motion.** Under `prefers-reduced-motion: reduce`: reveals are skipped (content is shown in place), the mobile sheet closes at once, and the global rule in `globals.css` cuts every remaining transition and animation to 1ms. **Without JavaScript** all content is visible, because reveals arm only after `RevealRoot` has marked on-screen elements as revealed; print styles force every revealed element visible.

| # | Interaction | Where | Trigger | Duration | Easing | Delay / stagger | What moves |
|---|---|---|---|---|---|---|---|
| 1 | Section reveal | homepage section heads and blocks, `SectionHead`, report sections | element enters viewport (−8% bottom margin) | 380ms | `--ease-out` | `--i × 60ms` | `translateY(12px)` → none; opacity 0 → 1 |
| 2 | Hero entrance | homepage headline, lede, finder, coverage figures; `HeroHead` | page load | 320ms | `--ease-out` | 0 / 60 / 120 / 180ms | `translateY(6px)` → 0; opacity |
| 3 | Header on scroll | `.site-header` | scroll > 24px | 320ms | `--ease-out` | — | hairline becomes a soft shadow; desktop bar 68 → 60px |
| 4 | Nav indicator | `MainNav` | hover, focus, open, active route | 320ms | `--ease-out` | — | 2px bar slides (`translateX` + width) |
| 5 | Nav item colour and chevron | `MainNav` | hover / open | 220ms | `--ease-out` | — | ink-2 → ink; chevron rotates 180° and turns accent |
| 6 | Mega panel | `MainNav` | hover (110ms intent delay) or click; closes 220ms after leaving | 220ms | `--ease-out` | — | `translateY(-6px)` → 0; opacity |
| 7 | Mega link hover | panel links | hover / focus | 220ms | `--ease-out` | — | tint background; title turns accent; arrow slides in |
| 8 | Mobile menu open | `MobileNav` | tap | 320ms (sheet), 220ms (scrim) | `--ease-out` | — | sheet `translate3d(100%,0,0)` → none; scrim fades in |
| 9 | Mobile menu close | `MobileNav` | close button, scrim, Escape | 220ms | `--ease-in-out` | unmounts after 200ms | sheet slides back out; scrim fades out |
| 10 | Mobile menu groups | `MobileNav` (`details.acc`) | toggle | 220ms | `--ease-out` | — | height 0 → auto (`::details-content`); chevron rotates |
| 11 | Header search field | `SearchDialogTrigger` | hover | 220ms | `--ease-out` | — | border turns accent with a 3px soft ring; icon turns accent |
| 12 | Search focus | `Combobox`, finder postcode field | focus | 220ms | `--ease-out` | — | border turns accent; 4px soft ring |
| 13 | Search loading | `Combobox` | suggestion request in flight | 320ms | `--ease-out` | — | 2px rule under the field scales in and pulses |
| 14 | Suggestions | `Combobox` listbox | opens | 320ms | `--ease-out` | — | `translateY(6px)` → 0; opacity |
| 15 | Finder tabs | `HomeFinder` | click or arrow keys | 320ms (indicator), 320ms (panel) | `--ease-out` | — | white indicator slides between tabs; new panel rises 6px and fades in |
| 16 | Journey hover | homepage "Start with your question" | hover / focus | 220ms | `--ease-out` | — | column tints; tool action fills accent; arrow nudges 2px |
| 17 | Directory row hover | homepage school records | hover | 220ms | `--ease-out` | — | row tints; school name turns accent; arrow fades in and nudges |
| 18 | Area index hover | homepage "Browse by area" | hover | 140ms | default | — | row tints; bar deepens |
| 19 | Admissions steps | homepage timeline | list revealed | 700ms (rule), 320ms (markers) | `--ease-out` | rule +120ms; markers 200ms + 140ms each | connecting rule draws across (`scaleX`, `scaleY` on phones); step markers scale 0.85 → 1 and fade in |
| 20 | Comparison filter | `ComparePreview` | choosing a group | 320ms (rows), 520ms (bars) | `--ease-out` | bars 60ms per school | rows rise 6px and fade in; bars grow from the left (`scaleX`). Runs only after the reader changes the filter, never on first render |
| 21 | Comparison row hover | `ComparePreview` | hover | 140ms | default | — | row tints |
| 22 | Editorial underline | `.ed-link`: guide headlines, "Try" areas, text routes, footer links | hover / focus | 320ms | `--ease-out` | — | 1.5px underline draws from 0 to full width |
| 23 | Text-route arrow | homepage `TextLink`, `ArrowLink` | hover | 220ms | `--ease-out` | — | arrow `translateX(2–4px)` |
| 24 | Button hover and press | `Button`, `ButtonLink`, submit buttons | hover / active | 220ms | `--ease-out` | — | accent deepens; secondary outlines turn accent on a tint; press `scale(0.98)` |
| 25 | Card lift | `.card-hover` (related reading, tool pages) | hover / focus-within | 320ms | `--ease-out` | — | `translateY(-2px)`; stronger hairline and soft shadow |
| 26 | Accordion | `Disclosure` (`details.acc`) | toggle | 220ms | `--ease-out` | — | height 0 → auto; "+" bar `scaleY(0)` |
| 27 | Back to top | footer | hover | 220ms | `--ease-out` | — | `translateY(-2px)`; faint fill |
| 28 | Table-of-contents rail, reading progress | articles | scroll | per frame / 320ms | `--ease-out` | — | active rail marker; progress `scaleX` |
| 29 | Shortlist pop | `SaveButton` | add | 320ms | `--ease-out` | — | icon `scale(1.12)` pop |

Pre-existing data-visualisation motion inside explainer figures (isometric bar rise, admission journey, catchment modes, knowledge map) is kept and re-coloured to the slate palette; it sits on the dark `.playground` stage and plays only within those figures.

**Not used, by design:** autoplay carousels, parallax, bouncing or floating icons, zoom on hover, continuous rotation, and any scroll effect that hides content once it has been shown.
