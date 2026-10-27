# Homepage redesign: research-publication system

Branch `claude/fervent-edison-ahi61j`. Not merged and not deployed: production (https://school-info-seven.vercel.app/) is unchanged until this is approved.

Screenshots: before (production) [1440](screenshots/homepage-before-1440.jpg), [390](screenshots/homepage-before-390.jpg); after [1440](screenshots/homepage-redesign-1440.jpg), [1024](screenshots/homepage-redesign-1024.jpg), [768](screenshots/homepage-redesign-768.jpg), [390](screenshots/homepage-redesign-390.jpg), [375](screenshots/homepage-redesign-375.jpg). The "after" captures are of a production build (`next build && next start`) on a database freshly imported with `npm run etl -- all` (232 listed schools, the same counts as production).

## Second pass: stronger differentiation

Feedback on the first pass: too flat, with content types hard to tell apart. The second pass keeps the type system and data, and adds:

- **A deep slate hero** lit by two radial glows with a masked survey grid, white headline with a gradient second line, frosted coverage tiles, and the finder as the one bright, raised object (with a focus ring while typing).
- **Content tones**: blue for finding, teal for school data, ochre for guidance, slate for comparison, brick for dates. Each section opens with a toned tag, and its chips, bars, buttons and rules take the same hue (see [design-system.md](design-system.md#content-tones-and-surfaces)).
- **Journey cards** that overlap the hero, each in its own tone, with a filled button for tools and a tinted one for the guide.
- **School records** as a data panel: column header bar, monogram markers, test chips, Attainment 8 meters out of 90, A level grade badges.
- **Admissions steps** as numbered cards with a "Decided by" footer; the caution as an ochre guidance callout.
- **Comparison console** with a dark header, colour-keyed groups and bars, and column highlight on header hover.
- **Guidance on warm paper**: a lead article card with a "Start here" badge and a quoted short answer, and outline numerals for further reading.
- **Date cards** whose style and words both carry status, a "Next deadline" ring and countdowns; on phones a snap rail that opens on the next deadline.

Verification after the second pass: typecheck and lint clean; 81 of 81 Playwright tests pass (including axe on 20 pages); no horizontal overflow at 1440, 1024, 768, 390 or 375px; layout shift ≤ 0.0007. The screenshots linked above are from this pass.

## 1. Audit

### Deployed version against `main`

The live homepage HTML matches `main` at `c3cf761` (the merge of PR 14): identical headings, class strings and section order, the same coverage figures (163 fully selective, 3 partially selective, 66 Northern Ireland, 232 listed, 166 mapped). No discrepancy was found between the deployed source and `main`. The exact deployment SHA is not exposed by the site, so this is established by comparing markup rather than by the Vercel API.

### Findings on the previous homepage

| Area | Problem |
|---|---|
| Typography | One face (Urbanist) for everything at weight 500 body / 800 headings. Heavy headings everywhere, light body text with weak contrast against the page; labels at 800 uppercase with wide tracking. No distinction between reading text and interface text. |
| Colour | Indigo primary, orange CTA, amber, violet and a peach-to-lavender gradient banner. Orange carried emphasis in the header CTA, labels, bullets and map; violet marked one map category. Information sections alternated grey bands without a reason tied to content. |
| Hero | Three-sentence headline, a kicker, a second heading inside the finder ("School finder" / "Where would you like to start?"), an "Official school records" chip, three competing buttons beneath the finder and an orange header CTA: five calls to action above the fold. The map competed with the finder for attention. |
| Repetition | Seven of eight sections used the same pattern: kicker, H2, button on the right, then a grid of identical white cards with shadows. Areas, questions, guides and dates all looked alike. |
| Data | The comparison was a wide table needing sideways scrolling on phones; differences were marked only by bold text. Inspection dates were ISO strings. Directory rows mixed admissions and results in uneven blocks. |
| Dates | Calendar tiles in orange and indigo; no way to see what had already passed, nor how soon a deadline was. |
| Motion | Reveals travelled 48px over 1s, which delayed reading. Constant motion in the footer (spinning dashed ring) and banners on inner pages (floating dots and rings, a rotating arc). |
| Spacing | Section padding up to 72px with banded backgrounds, so each section read as a separate page. |

## 2. Foundations

- **Type.** Inter Variable (with optical sizing) for headings, navigation, controls, statistics and data; Source Sans 3 Variable for paragraphs, explanations and guides; IBM Plex Mono kept for codes only. Metric-matched local fallbacks prevent layout shift when the fonts load. Weights are capped at 700 site-wide by remapping Tailwind's `bold` and `extrabold`. Scale and line heights are listed in [design-system.md](design-system.md).
- **Colour.** White, slate ink `#182535`, body `#425267`, one steel-blue accent `#245D87`, tint `#F2F6F9`, rules `#DEE5EB`. Orange, purple and gradients are removed; a muted copper remains for marks only. All text pairs meet WCAG AA (running text ≥ 7:1).
- **Spacing.** Section padding 32px on phones to 48px on desktop; dense data rows and navigation, more generous reading blocks.
- **Motion.** 140–520ms durations, one decelerating curve, reveals of 12px over 380ms with 60ms staggers. Full list in [animation-inventory.md](animation-inventory.md).

These live in `src/app/globals.css` as tokens, so inner pages (profiles, guides, calendar, directory, tools) inherit the new type, palette and calmer motion without template changes.

## 3. Homepage, section by section

| Section | What it is now |
|---|---|
| Header | Wordmark, five menus and Compare, a search field you can see (opens the command palette; `/` and Ctrl/⌘+K still work), shortlist. The orange "Check eligibility" CTA is gone from the bar; the tool is in the Tools menu, the mobile menu and the homepage journeys. Active state is a 2px accent bar that slides between items. |
| Hero | One headline ("Find and understand UK grammar schools"), one sentence, one finder. The finder's mode switch is a segmented control with a sliding indicator; "Try" links point to the four council areas with the most schools and Northern Ireland (read from the database). The map is removed; coverage is shown instead as four statistics with their source and fetch date. |
| Start with your question | Three journeys in one ruled frame: *Find schools near me* (opens the map view), *Can my child apply?* (eligibility checker), *Understand admissions* (oversubscription guide). Tools are outlined controls; the guide is an editorial link, so the kind of next step is visible. |
| School records at a glance | A ruled directory of four real records: school name dominant, location and intake beneath, then *Entrance test* and policy status or past demand, then *Attainment 8* and *A level average*, each as label over value. Beside it, an area index with proportional bars and type filters. This replaces the separate "areas" and "inside a profile" sections. |
| How admissions work | Qualify → Rank → Offer as a numbered timeline with a connecting rule that draws in when it enters view; each step says what decides it. Offer day comes from the verified national event. A single callout carries the key caution. |
| Compare schools side by side | Three real schools keyed A, B, C. Measures are grouped (Admissions, Academic results, Inspection, Applications and offers) with a filter; numeric rows carry bars on a fixed scale (Attainment 8 out of 90, percentages out of 100), rows identical for every school collapse to one line, and the comparison's own caveats (different tests, different inspection frameworks) appear under their group. On phones each measure stacks with the A/B/C keys instead of a sideways-scrolling table. Inspection dates now read "2 Nov 2022" (this also improves `/compare`). |
| Guides | Editorial layout: one lead guide under a 2px rule with a larger headline, its summary and its "Short answer" quoted verbatim from the guide; three further guides as a ruled list with reading-path labels. |
| Admission dates | A timeline of the last passed date and the next four, with large day numerals, a "Today" divider, verification chips (official source / awaiting verification), greyed "Passed" entries and a countdown ("In 4 days"). A legend explains the three states. |
| Sources and method | Compact closing section: one paragraph, three links, and the Fetched / Published / Verified definitions. |

## 4. Content and data integrity

- Every figure on the page is read from the database at request time (cached with the site-data tag): counts, the four featured records, the comparison, region totals, top council areas, dates and offer day. Nothing is hard-coded.
- The one quotation (the lead guide's "Short answer") is copied word for word from `src/content/guides.tsx`.
- Step descriptions follow the wording of the "Qualifying is not an offer" guide (offers go down the ranked list until places run out; national offer day via the home council; the Education Authority in Northern Ireland).
- Existing links, search behaviour (suggestions, keyboard combobox, empty state, postcode search), the WebSite JSON-LD, canonical URL and metadata are unchanged.
- One new query, `recentPastEvents`, supplies the passed date for the timeline.

## 5. Verification

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run lint` | clean |
| `npm test` (unit) | 60 passed |
| `npm run test:integration` (PostGIS) | 28 passed |
| `npm run test:e2e` against a production build | 81 passed (desktop, mobile, axe WCAG 2.2 AA on 20 pages, dark-mode contrast) |
| Horizontal overflow at 1440 / 1024 / 768 / 390 / 375 | none |
| Smallest text on the homepage | 13px (the decorative `/` key hint is 12.8px) |
| Touch targets under 24px | none |
| Cumulative layout shift (homepage) | 0.0000–0.0004 |
| H1 size | 46px at 1440, 41px at 1024, 37px at 768, 32px on phones |

E2E changes: tests that targeted the removed "Main tasks" buttons and header CTA now target the question journeys and the header search; new tests cover the comparison filter, the visible header search and the mobile menu's keyboard close.

The palette change exposed one contrast regression elsewhere, caught by the axe suite: month headers on the calendar and school "key dates" (and the check-in stub on admissions figures) put navy text on copper. They now use white on the accent (7.0:1) and white on copper-ink (6.3:1).

## 6. Review against the brief

1. **Distinct purpose per section** — each section uses a different structure (finder, ruled journeys, directory, timeline, grouped table, editorial list, date timeline, definitions).
2. **Readability** — reading text in Source Sans 17–18px at ≤680px measure; UI and data in Inter with tabular figures; body contrast 8:1.
3. **Cohesion** — one accent, one rule colour, one motion curve, one heading weight ladder.
4. **Scannable data** — labelled fields, bars on a shared scale, merged identical rows, A/B/C keys, human dates.
5. **Motion** — perceptible on reveal, tabs, filters and hovers; nothing loops; reduced motion honoured.
6. **Mobile** — stacked comparison, segmented finder that fits at 375px, timeline connectors per step, countdowns on phones.
7. **Less clutter** — one call to action in the hero instead of five; two sections merged; decorations and gradients removed.
8. **Behaviour and accuracy** — all existing e2e journeys pass; all data is live.

### Known limits

- The homepage is longer on phones than before (about 10,700px against 9,900px at 390px), mostly because the comparison now shows every value in readable stacked rows rather than a table scrolled sideways. The group filter shortens it to one group at a time.
- Inner-page templates inherit the new tokens but were not restructured; some explainer figures on the dark stage keep their own illustrative colours.
