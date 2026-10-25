# Reference route inventory — eduseed.in

Discovery run on 25 October 2026 from an isolated container. `robots.txt` sets `Crawl-Delay: 20`, so every page load was spaced at least 20 seconds apart and the crawl was limited to representative pages per template.

## Method

1. **Sitemaps** — `robots.txt` (no `Sitemap:` line) → `/sitemap.xml` (a sitemap index; `/sitemap_index.xml` returns 404) → `sitemap-misc.xml`, `productcat-sitemap.xml`, `post-sitemap.xml`, `page-sitemap.xml`, parsed recursively.
2. **Navigation and link graph** — Playwright loaded each sampled page at 1440px and 390px, recorded every `<a href>` with its text and zone (header/nav/footer/body), hovered the first dropdown, opened the mobile menu, and scrolled the full page to trigger reveal animations.
3. **Classification** — every URL from both sources was assigned a template from its URL structure and verified against the inspected representatives.
4. **Computed styles** — fonts, sizes, weights, colours, radii, shadows, transitions, keyframes and theme custom properties were read from the live DOM (`getComputedStyle`, `document.styleSheets`).

## Totals

| Metric | Count |
|---|---|
| URLs in sitemaps | 344 |
| Additional URLs found only through the link graph | 126 |
| Total discovered URLs | 470 |
| Internal link edges recorded | 2530 |
| Distinct templates | 24 |
| Pages loaded and inspected (desktop + mobile) | 34 |
| Templates with at least one inspected representative | 22 of 24 |

## Templates

| Template | URLs | Inspected representative(s) | Status |
|---|---|---|---|
| Blog post | 187 | /2025/10/15/how-to-help-your-child-succeed-at-the-11-plus-a-complete-parents-guide, /2026/10/06/prepare-children-for-ai-driven-future | Complete |
| Math topic article | 45 | /math/fractions | Complete |
| Tutorial / resource article | 45 | /getting-started-with-scratch | Complete |
| Tag archive | 45 | /tag/math | Complete |
| Date archive | 34 | /2025/10 | Complete |
| Course detail | 22 | /coding/python, /robotics/lego-wedo | Complete |
| Non-HTML / admin (excluded) | 15 | — | Excluded |
| Category archive | 11 | /category/coding | Complete |
| Worksheet category (shop) | 10 | /product-category/grade-1 | Complete |
| Program landing | 9 | /math-olympiad-coaching, /financial-literacy-for-kids | Complete |
| Worksheet product (shop) | 9 | /product/grade-1-time | Complete |
| HTML sitemap | 5 | /sitemap.html | Complete |
| Contact / enquiry form | 5 | /contact-us, /request-demo | Complete |
| Course category landing | 5 | /coding, /robotics, /online-math-class-kids, /math, /courses | Complete |
| Shop / account utility | 4 | /my-account | Complete |
| Event / competition landing | 4 | /code-it-4-0 | Complete |
| About / company page | 3 | /about-us, /careers | Complete |
| Interactive tool page | 3 | /math-kangaroo-readiness-checker, /divisibility-rules-explorer, /lens | Complete |
| Homepage | 2 | / | Complete |
| Resource hub | 2 | /free-math-worksheets, /coding-resources | Complete |
| Curriculum redirect/download | 2 | — | Excluded |
| Testimonials | 1 | /testimonials | Complete |
| Legal page | 1 | /privacy-policy | Complete |
| FAQ | 1 | /faq | Complete |

Templates marked *Pending* were not loaded to stay within the crawl delay. Their URLs share the WordPress/Elementor shell (header, page banner, footer) recorded on every inspected page; their unique body layouts were not inspected and no findings are claimed for them.

## Inspected pages

| URL | Discovery source | Template | Inspected | Unique design patterns | Status |
|---|---|---|---|---|---|
| https://eduseed.in | Sitemap (sitemap-misc.xml) | Homepage | Yes (1440 + 390) | H1 44px/55px w800; image/gradient section bg; 23 reveal-animated els | Complete |
| https://eduseed.in/coding | Sitemap (page-sitemap.xml) | Course category landing | Yes (1440 + 390) | H1 40px/56px w800; image/gradient section bg; 1 reveal-animated els | Complete |
| https://eduseed.in/coding/python | Sitemap (page-sitemap.xml) | Course detail | Yes (1440 + 390) | H1 40px/56px w800; 1 reveal-animated els | Complete |
| https://eduseed.in/robotics | Sitemap (page-sitemap.xml) | Course category landing | Yes (1440 + 390) | H1 40px/56px w800; image/gradient section bg; 1 reveal-animated els | Complete |
| https://eduseed.in/robotics/lego-wedo | Sitemap (page-sitemap.xml) | Course detail | Yes (1440 + 390) | H1 40px/56px w800; 1 reveal-animated els | Complete |
| https://eduseed.in/online-math-class-kids | Sitemap (page-sitemap.xml) | Course category landing | Yes (1440 + 390) | H1 40px/56px w800; 7 reveal-animated els | Complete |
| https://eduseed.in/math | Sitemap (page-sitemap.xml) | Course category landing | Yes (1440 + 390) | H1 40px/56px w800 | Complete |
| https://eduseed.in/math/fractions | Sitemap (page-sitemap.xml) | Math topic article | Yes (1440 + 390) | H1 40px/56px w800; 6 reveal-animated els; form (1 fields) | Complete |
| https://eduseed.in/courses | Sitemap (page-sitemap.xml) | Course category landing | Yes (1440 + 390) | H1 40px/56px w800; 2 reveal-animated els | Complete |
| https://eduseed.in/about-us | Sitemap (page-sitemap.xml) | About / company page | Yes (1440 + 390) | H1 40px/56px w800; image/gradient section bg; 30 reveal-animated els | Complete |
| https://eduseed.in/testimonials | Sitemap (page-sitemap.xml) | Testimonials | Yes (1440 + 390) | H1 40px/56px w800; image/gradient section bg; 1 reveal-animated els | Complete |
| https://eduseed.in/faq | Sitemap (page-sitemap.xml) | FAQ | Yes (1440 + 390) | H1 40px/56px w800; 1 reveal-animated els | Complete |
| https://eduseed.in/contact-us | Sitemap (page-sitemap.xml) | Contact / enquiry form | Yes (1440 + 390) | H1 40px/56px w800; 4 reveal-animated els; form (6 fields) | Complete |
| https://eduseed.in/request-demo | Sitemap (page-sitemap.xml) | Contact / enquiry form | Yes (1440 + 390) | H1 40px/56px w800; 1 reveal-animated els; form (6 fields) | Complete |
| https://eduseed.in/free-math-worksheets | Sitemap (page-sitemap.xml) | Resource hub | Yes (1440 + 390) | H1 40px/56px w800 | Complete |
| https://eduseed.in/getting-started-with-scratch | Sitemap (page-sitemap.xml) | Tutorial / resource article | Yes (1440 + 390) | H1 40px/56px w800 | Complete |
| https://eduseed.in/coding-resources | Sitemap (page-sitemap.xml) | Resource hub | Yes (1440 + 390) | H1 40px/56px w800 | Complete |
| https://eduseed.in/2025/10/15/how-to-help-your-child-succeed-at-the-11-plus-a-complete-parents-guide | Sitemap (post-sitemap.xml) | Blog post | Yes (1440 + 390) | H1 40px/56px w800; form (1 fields) | Complete |
| https://eduseed.in/2026/10/06/prepare-children-for-ai-driven-future | Sitemap (post-sitemap.xml) | Blog post | Yes (1440 + 390) | H1 40px/56px w800; form (1 fields) | Complete |
| https://eduseed.in/product-category/grade-1 | Sitemap (productcat-sitemap.xml) | Worksheet category (shop) | Yes (1440 + 390) | H1 40px/56px w800; form (1 fields) | Complete |
| https://eduseed.in/math-kangaroo-readiness-checker | Sitemap (page-sitemap.xml) | Interactive tool page | Yes (1440 + 390) |  | Complete |
| https://eduseed.in/divisibility-rules-explorer | Sitemap (page-sitemap.xml) | Interactive tool page | Yes (1440 + 390) | H1 40px/56px w800 | Complete |
| https://eduseed.in/careers | Sitemap (page-sitemap.xml) | About / company page | Yes (1440 + 390) | H1 40px/56px w800; image/gradient section bg; 17 reveal-animated els | Complete |
| https://eduseed.in/math-olympiad-coaching | Sitemap (page-sitemap.xml) | Program landing | Yes (1440 + 390) | H1 40px/56px w800; image/gradient section bg; 17 reveal-animated els | Complete |
| https://eduseed.in/financial-literacy-for-kids | Sitemap (page-sitemap.xml) | Program landing | Yes (1440 + 390) | H1 40px/56px w800; image/gradient section bg; 25 reveal-animated els | Complete |
| https://eduseed.in/my-account | Sitemap (page-sitemap.xml) | Shop / account utility | Yes (1440 + 390) | H1 40px/56px w800; form (5 fields) | Complete |
| https://eduseed.in/sitemap.html | Sitemap (sitemap-misc.xml) | HTML sitemap | Yes (1440 + 390) | H1 26px/normal w700; table | Complete |
| https://eduseed.in/code-it-4-0 | Sitemap (page-sitemap.xml) | Event / competition landing | Yes (1440 + 390) | H1 40px/56px w800; 2 reveal-animated els | Complete |
| https://eduseed.in/privacy-policy | Sitemap (page-sitemap.xml) | Legal page | Yes (1440 + 390) | H1 40px/56px w800; 11 reveal-animated els | Complete |
| https://eduseed.in/lens | Sitemap (page-sitemap.xml) | Interactive tool page | Yes (1440 + 390) | H1 40px/56px w800; image/gradient section bg; 28 reveal-animated els; form (6 fields) | Complete |
| https://eduseed.in/category/coding | Link graph (crawl) | Category archive | Yes (1440 + 390) | H1 40px/56px w800; form (1 fields) | Complete |
| https://eduseed.in/tag/math | Link graph (crawl) | Tag archive | Yes (1440 + 390) | H1 40px/56px w800; form (1 fields) | Complete |
| https://eduseed.in/2025/10 | Link graph (crawl) | Date archive | Yes (1440 + 390) | H1 44px/55px w800; image/gradient section bg; 23 reveal-animated els | Complete |
| https://eduseed.in/product/grade-1-time | Link graph (crawl) | Worksheet product (shop) | Yes (1440 + 390) | H1 40px/56px w800; form (1 fields) | Complete |

## Every discovered URL

| URL | Discovery source | Template | Inspected | Status |
|---|---|---|---|---|
| https://eduseed.in/about-us | Sitemap (page-sitemap.xml) | About / company page | Yes | Complete |
| https://eduseed.in/careers | Sitemap (page-sitemap.xml) | About / company page | Yes | Complete |
| https://eduseed.in/iimb-incubation | Sitemap (page-sitemap.xml) | About / company page | No | Not loaded (template covered) |
| https://eduseed.in/2024/01/19/the-most-suitable-programming-language-for-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/01/25/taking-you-through-the-journey-of-one-of-our-outstanding-students-mabel | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/01/27/top-5-logical-thinking-activities-in-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/01/27/unlock-your-childs-power-the-magic-of-growth-mindset | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/02/02/7-tips-to-improve-public-speaking-in-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/02/02/ignite-childs-chore-and-learning-interest | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/02/06/parental-control-and-online-safety-tips-for-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/02/09/power-of-reading | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/02/14/financial-literacy-for-kids-growing-beyond-the-piggy-bank | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/02/17/balance-childrens-screen-time-educational-and-productive | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/02/21/olympiad-exams-for-kids-unveiling-the-hidden-benefits | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/02/22/imagine-a-world-where-children-can-bring-these-fantasies-to-life-not-just-in-the-physical-world-but-in-the-digital-one-too | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/02/28/embarking-on-a-journey-a-guide-to-different-olympiad-exams-for-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/02/29/machine-learning | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/03/07/today-were-embarking-on-a-unique-adventure-learning-to-code-through-the-lens-of-blooms-taxonomy | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/03/13/empowering-future-innovators | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/03/15/financial-literacy-engaging-activities-for-ages-11-to-13 | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/03/15/financial-literacy-engaging-activities-for-ages-5-to-7 | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/03/15/financial-literacy-engaging-activities-for-ages-8-to-10 | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/03/15/planting-the-seeds-of-financial-literacy-engaging-activities | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/03/25/block-vs-text-decoding-the-coding-debate | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/04/01/in-todays-digital-age-coding-is-a-fundamental-skill-that-can-benefit-children-in-numerous-ways | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/04/08/why-python-is-ideal-for-beginner-coders | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/04/11/beginner-friendly-python-libraries | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/04/22/understanding-databases | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/04/26/summer-holidays-are-a-great-time-for-kids-to-relax-and-enjoy-their-freedom-from-school-schedules | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/05/04/multiple-intelligences-in-your-child | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/05/14/essential-skills-not-taught-in-schools-that-every-child-should-learn | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/06/02/top-5-math-institutes-for-children | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/06/06/the-zettelkasten-method-for-young-coders | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/06/14/engaging-math-projects-for-children | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/06/21/in-the-quest-to-improve-student-achievement-educators-and-learners-alike-are-constantly-searching-for-the-most-effective-learning-techniques | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/06/27/lets-explore-five-key-ways-in-which-coding-fosters-critical-thinking-in-young-minds | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/07/04/mathematics-often-evokes-a-mix-of-fascination-and-fear-especially-among-young-learners | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/07/11/in-todays-world-children-are-constantly-exposed-to-digital-devices-and-a-flood-of-information | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/07/20/how-do-you-know-if-your-child-is-interested-in-coding | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/08/05/in-recent-years-homeschooling-has-become-an-increasingly-popular-choice-for-many-families | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/08/08/as-parents-we-all-strive-to-prepare-our-children-for-successful-and-fulfilling-futures | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/08/20/computational-thinking-for-children | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/08/24/math-fun-facts | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/08/29/best-coding-classes-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/08/30/improve-mental-math-skills-in-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/09/02/meet-ishaan-a-rising-young-coder-and-hackathon-champion | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/09/07/top-10-essential-presentation-skills-for-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/09/10/connect-with-achievers | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/09/10/mental-math-tips-and-tricks-for-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/09/13/top-7-strategies-to-help-kids-craft-their-personal-narratives | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/09/20/however-with-this-rise-in-online-learning-concerns-about-safety-have-also-emerged | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/09/20/the-benefits-of-stem-education-for-children | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/09/25/aditri-aruns-codingjourney-an-inspiring-young-coders-path-to-leadership | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/09/25/building-strong-problem-solving-skills-in-children | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/09/30/the-power-of-project-based-learning-for-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/10/03/entrepreneurial-skills-in-your-child | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/10/04/developing-research-skills-in-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/10/09/how-to-help-your-child-overcome-stage-fright-and-anxiety | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/10/14/little-leaders-developing-leadership-skills-in-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/10/15/difference-between-abacus-and-vedic-math | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/10/19/raising-resilient-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/10/22/integrating-math-in-everyday-life | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/10/25/gamification-in-education | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/11/06/choosing-the-best-extracurriculars-for-your-childs-growth | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/11/08/the-role-of-math-in-coding-why-its-more-important-than-you-think | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/11/14/coding-myths-busted | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/11/21/math-kangaroo-preparation-guide | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/11/26/understanding-different-learning-styles-in-kid | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/12/03/teaching-kids-to-persevere | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/12/12/psat-preparatory-guide | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/12/21/shsat-preparatory-guide | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2024/12/23/top-10-classic-board-games | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/01/03/how-to-check-sof-imo-2024-2025-results-a-step-by-step-guide | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/01/05/creative-ways-to-teach-geometry-and-spatial-understanding-to-children | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/01/06/level-2-sof-imo | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/01/06/math-league-preparatory-guide | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/01/13/a-comprehensive-guide-to-the-amc-math-competitive-exam | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/01/20/flashget-empowering-parents-to-protect-their-children-online | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/01/20/how-to-navigate-the-overwhelming-choices-of-edtech-tools | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/01/28/youngcodingachieverpratyush | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/01/30/ap-computer-science-a-exam-all-you-need-to-know | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/01/30/why-abacus-is-a-powerful-tool-for-math-skills-and-what-comes-next | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/02/10/current-trends-in-education-navigating-the-future-of-learning | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/02/17/top-10-free-coding-resources-for-kids-that-parents-will-love | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/02/21/seamo-preparatory-guide | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/02/26/how-to-motivate-kids-without-pressure-during-exams | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/02/26/nature-and-code-coding-lessons-from-animals | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/03/11/best-summer-classes-for-kids-2025-fun-learning-combined | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/03/12/scholarship-exams-available-for-school-students | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/03/14/online-coding-classes-for-kids-top-10 | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/03/19/public-speaking-for-the-digital-age-tips-for-virtual-presentations | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/03/19/sof-imo-results-eligibility-guide | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/03/24/mathcounts-preparatory-guide | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/03/26/how-mental-math-matters-a-guide-for-parents | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/04/03/summer-reading-list-for-children | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/04/09/mathematical-thinking-and-logical-reasoning-skills-every-child-needs | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/04/15/how-image-generation-ai-is-empowering-the-next-generation | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/04/19/online-math-classes-for-kids-top-5 | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/04/19/vocational-education-kids-india | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/04/22/whats-next-for-young-programmers-coders | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/04/25/avoid-silly-mistakes-in-math-tips | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/05/02/responsible-ai-chatgpt-use-for-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/05/18/more-summer-reads-for-children-15-exciting-book-picks-to-keep-the-pages-turning | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/05/27/coding-activities-for-kids-and-kindergartners | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/05/27/fun-summer-chores-kids-responsibility | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/05/27/perfect-score-in-math-kangaroo-2025-what-made-it-possible | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/06/02/why-mental-math-still-matters-in-the-age-of-calculators | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/06/03/best-online-extracurricular-classes-for-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/06/04/math-magic-engaging-games-that-make-learning-math-fun-for-preschool-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/06/14/raising-independent-learners-tips-for-busy-parents | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/06/18/online-learning-platforms-kids-india-2025 | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/06/20/coding-games-for-kids-where-fun-meets-future-skills | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/06/23/how-to-help-your-child-who-is-struggling-to-solve-word-problems | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/06/26/back-to-school-time-management-tips-for-success | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/06/29/amc-8-preparatory-guide | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/06/29/nmtc-2025-guide-syllabus-pattern-preparation | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/07/10/how-to-create-a-squid-game-in-scratch | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/07/16/data-science-for-kids-5-fun-easy-ways-to-get-started | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/07/21/math-word-problems-made-easy-addition-and-subtraction-keywords-for-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/07/27/top-live-classes-and-skill-based-courses-for-kids-in-2025 | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/08/16/interesting-stem-activities-to-try-with-your-child-at-home | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/09/02/unlocking-math-fun-with-the-canada-jay-mathematical-competition-cjmc | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/09/02/you-dont-need-to-be-a-coder-to-raise-one-5-non-technical-ways-to-support-your-childs-journey-in-tech | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/09/09/lighthouse-parenting-style-guiding-kids-like-coders-of-their-own-lives | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/09/10/top-5-fun-math-puzzles-every-kid-can-solve | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/09/11/why-kids-should-learn-scratch-before-python-the-smart-path-to-coding-success | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/09/18/the-future-of-learning-coding-in-every-subject | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/09/26/how-can-kids-start-learning-robotics-a-beginners-guide-for-parents | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/10/04/ramanujam-national-maths-challenge-everything-parents-and-students-need-to-know | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/10/06/free-demo-classes-how-they-help-parents-choose-the-right-coding-program | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/10/09/all-about-fll-first-lego-league | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/10/10/the-olympiad-journey-from-ioqm-to-imo | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/10/13/ikmc-2026-preparation-guide-for-students | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/10/15/how-to-help-your-child-succeed-at-the-11-plus-a-complete-parents-guide | Sitemap (post-sitemap.xml) | Blog post | Yes | Complete |
| https://eduseed.in/2025/10/18/c-vs-python-which-coding-language-should-kids-start-with | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/10/23/map-growth-test-a-complete-parents-preparation-guide-for-u-s-families | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/10/23/naplan-a-parents-preparation-guide-years-3-5-7-9-australia | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/10/30/10-fun-tricks-to-help-your-child-master-mental-math-2 | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/11/05/scratch-jr-vs-scratch-which-is-better-for-young-learners | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/11/08/why-learning-to-code-is-the-first-step-to-understanding-artificial-intelligence-ai-for-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/11/12/the-role-of-artificial-intelligence-in-kids-education-a-parents-guide-to-using-ai-wisely | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/11/19/left-brain-right-brain-and-coding-what-science-says-about-how-kids-learn | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/12/03/faq-about-coding-for-children-what-every-parent-should-know | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/12/03/helping-kids-overcome-common-math-mistakes | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/12/04/gauss-method-of-addition-the-day-a-10-year-old-outsmarted-his-teacher | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/12/05/why-eduseed-is-the-best-alternative-for-online-coding-and-math-classes-in-india | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/12/06/the-road-to-ioi-international-olympiad-in-informatics-how-students-can-train-for-the-worlds-top-coding-olympiad | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/12/08/tynker-vs-scratch-which-coding-platform-should-your-child-start-with | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/12/08/us-curriculum-math-tutoring-from-india | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/12/19/5-questions-to-ask-your-child-instead-of-what-did-you-learn-today | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/12/20/the-end-of-the-homework-war-a-guide-to-raising-a-self-driven-learner | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/12/26/what-is-moems-and-how-can-your-child-prepare-for-it | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2025/12/29/how-eduseeds-online-learning-portal-prepares-your-child-for-math-kangaroo-success | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/01/08/sof-imo-2025-26-result-answer-key-level-2 | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/01/10/common-core-math-explained-answers-to-parents-most-common-questions | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/01/10/the-math-behind-curiosity-why-kids-who-ask-why-excel-later-in-tech | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/01/21/10-memory-boosting-techniques-for-kids-every-parent-can-try-at-home | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/01/23/online-math-olympiad-coaching | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/01/26/first-grade-common-core-math-explained-standards-skills-and-strategies | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/01/27/fun-daily-activities-to-improve-spatial-skills-in-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/01/27/key-stage-1-maths-explained-what-your-child-learns-in-years-1-and-2-ks1 | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/02/02/igcse-vs-ib-in-india-a-parents-guide-to-choosing-the-right-international-board | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/02/05/screen-time-tv-shows-for-kids-age-wise-parent-guide | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/02/07/sasmo-vs-seamo-a-clear-comparison-for-parents-students | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/02/16/how-micro-learning-is-changing-the-way-students-study | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/02/19/games-and-activities-for-overactive-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/02/23/india-board-exams-why-emotional-intelligence-matters-more-than-marks | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/03/03/learning-beyond-books-how-experiences-shape-real-education | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/03/04/how-to-make-study-time-fun-and-interesting-without-getting-angry-at-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/03/10/which-board-is-best-for-homeschooling-in-india-a-complete-parents-guide | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/03/16/how-a-childs-brain-learns-math-a-story-happening-inside-the-mind | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/03/21/fun-and-educational-summer-activities-for-kids-at-home-a-parents-guide | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/03/28/20-best-educational-youtube-channels-for-kids-parent-approved | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/03/31/10-surprising-signs-your-child-may-be-gifted | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/03/31/math-program-guide-for-parents | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/04/16/boys-vs-girls-brain-development-practical-insights-every-parent-should-know | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/04/21/australias-social-media-ban-for-kids-what-parents-should-really-learn | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/04/23/what-is-an-iq-score-a-simple-guide-for-parents | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/04/24/difference-between-eduseed-programs-which-one-is-right-for-your-child | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/05/05/diy-learning-kits-at-home-fun-summer-activities-for-students | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/06/10/how-to-introduce-coding-to-a-6-year-old-without-screen-addiction | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/06/15/should-kids-still-learn-to-code-if-ai-can-do-it-for-them | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/06/19/vedic-maths-for-kids-benefits-and-why-parents-choose-it | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/07/18/10-simple-activities-to-help-your-child-follow-instructions | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/08/13/why-is-my-child-struggling-with-math-10-possible-reasons | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/08/24/how-to-identify-math-learning-gaps-in-your-child | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/09/17/coding-vs-robotics-for-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/09/23/online-vs-offline-classes-for-kids | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/09/25/best-math-kangaroo-preparation-programs | Sitemap (post-sitemap.xml) | Blog post | No | Not loaded (template covered) |
| https://eduseed.in/2026/10/06/prepare-children-for-ai-driven-future | Sitemap (post-sitemap.xml) | Blog post | Yes | Complete |
| https://eduseed.in/category/coding | Link graph (crawl) | Category archive | Yes | Complete |
| https://eduseed.in/category/financial-literacy-kids | Link graph (crawl) | Category archive | No | Not loaded (template covered) |
| https://eduseed.in/category/general | Link graph (crawl) | Category archive | No | Not loaded (template covered) |
| https://eduseed.in/category/learning | Link graph (crawl) | Category archive | No | Not loaded (template covered) |
| https://eduseed.in/category/mathematics | Link graph (crawl) | Category archive | No | Not loaded (template covered) |
| https://eduseed.in/category/parenting | Link graph (crawl) | Category archive | No | Not loaded (template covered) |
| https://eduseed.in/category/parenting/health-wellness | Link graph (crawl) | Category archive | No | Not loaded (template covered) |
| https://eduseed.in/category/robotics | Link graph (crawl) | Category archive | No | Not loaded (template covered) |
| https://eduseed.in/category/student-achievers | Link graph (crawl) | Category archive | No | Not loaded (template covered) |
| https://eduseed.in/category/technology | Link graph (crawl) | Category archive | No | Not loaded (template covered) |
| https://eduseed.in/category/uncategorized | Link graph (crawl) | Category archive | No | Not loaded (template covered) |
| https://eduseed.in/coding-free-trial | Sitemap (page-sitemap.xml) | Contact / enquiry form | No | Not loaded (template covered) |
| https://eduseed.in/contact-us | Sitemap (page-sitemap.xml) | Contact / enquiry form | Yes | Complete |
| https://eduseed.in/free-math-tutoring-trial | Sitemap (page-sitemap.xml) | Contact / enquiry form | No | Not loaded (template covered) |
| https://eduseed.in/registration-form | Sitemap (page-sitemap.xml) | Contact / enquiry form | No | Not loaded (template covered) |
| https://eduseed.in/request-demo | Sitemap (page-sitemap.xml) | Contact / enquiry form | Yes | Complete |
| https://eduseed.in/coding | Sitemap (page-sitemap.xml) | Course category landing | Yes | Complete |
| https://eduseed.in/courses | Sitemap (page-sitemap.xml) | Course category landing | Yes | Complete |
| https://eduseed.in/math | Sitemap (page-sitemap.xml) | Course category landing | Yes | Complete |
| https://eduseed.in/online-math-class-kids | Sitemap (page-sitemap.xml) | Course category landing | Yes | Complete |
| https://eduseed.in/robotics | Sitemap (page-sitemap.xml) | Course category landing | Yes | Complete |
| https://eduseed.in/coding/app-development | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/coding/artificial-intelligence | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/coding/generative-ai-course-teens | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/coding/html-css | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/coding/java-course | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/coding/javascript | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/coding/javascript-web-dev | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/coding/python | Sitemap (page-sitemap.xml) | Course detail | Yes | Complete |
| https://eduseed.in/coding/python-ai | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/coding/python-apps | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/coding/python-data-structures | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/coding/scratch-junior | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/coding/scratch-programming | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/robotics/arduino-robotics | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/robotics/lego-bricq-essential | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/robotics/lego-mindstorms | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/robotics/lego-spike-essential | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/robotics/lego-spike-prime | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/robotics/lego-wedo | Sitemap (page-sitemap.xml) | Course detail | Yes | Complete |
| https://eduseed.in/robotics/logic-blocks | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/robotics/mechanics-in-motion | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/robotics/microbit | Sitemap (page-sitemap.xml) | Course detail | No | Not loaded (template covered) |
| https://eduseed.in/lego_wedo_curriculum | Link graph (crawl) | Curriculum redirect/download | No | Not loaded |
| https://eduseed.in/python_curriculum | Link graph (crawl) | Curriculum redirect/download | No | Not loaded |
| https://eduseed.in/2024/01 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2024/02 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2024/03 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2024/04 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2024/05 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2024/06 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2024/07 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2024/08 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2024/09 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2024/10 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2024/11 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2024/12 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2025/01 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2025/02 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2025/03 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2025/04 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2025/05 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2025/06 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2025/07 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2025/08 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2025/09 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2025/10 | Link graph (crawl) | Date archive | Yes | Complete |
| https://eduseed.in/2025/11 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2025/12 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2026/01 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2026/02 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2026/03 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2026/04 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2026/05 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2026/06 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2026/07 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2026/08 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2026/09 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/2026/10 | Link graph (crawl) | Date archive | No | Not loaded (template covered) |
| https://eduseed.in/code-it | Sitemap (page-sitemap.xml) | Event / competition landing | No | Not loaded (template covered) |
| https://eduseed.in/code-it-2 | Sitemap (page-sitemap.xml) | Event / competition landing | No | Not loaded (template covered) |
| https://eduseed.in/code-it-3-0 | Sitemap (page-sitemap.xml) | Event / competition landing | No | Not loaded (template covered) |
| https://eduseed.in/code-it-4-0 | Sitemap (page-sitemap.xml) | Event / competition landing | Yes | Complete |
| https://eduseed.in/faq | Sitemap (page-sitemap.xml) | FAQ | Yes | Complete |
| https://eduseed.in/page-sitemap.html | Link graph (crawl) | HTML sitemap | No | Not loaded (template covered) |
| https://eduseed.in/post-sitemap.html | Link graph (crawl) | HTML sitemap | No | Not loaded (template covered) |
| https://eduseed.in/productcat-sitemap.html | Link graph (crawl) | HTML sitemap | No | Not loaded (template covered) |
| https://eduseed.in/sitemap-misc.html | Link graph (crawl) | HTML sitemap | No | Not loaded (template covered) |
| https://eduseed.in/sitemap.html | Sitemap (sitemap-misc.xml) | HTML sitemap | Yes | Complete |
| http://www.eduseed.in | Link graph (crawl) | Homepage | No | Not loaded (template covered) |
| https://eduseed.in | Sitemap (sitemap-misc.xml) | Homepage | Yes | Complete |
| https://eduseed.in/divisibility-rules-explorer | Sitemap (page-sitemap.xml) | Interactive tool page | Yes | Complete |
| https://eduseed.in/lens | Sitemap (page-sitemap.xml) | Interactive tool page | Yes | Complete |
| https://eduseed.in/math-kangaroo-readiness-checker | Sitemap (page-sitemap.xml) | Interactive tool page | Yes | Complete |
| https://eduseed.in/privacy-policy | Sitemap (page-sitemap.xml) | Legal page | Yes | Complete |
| https://eduseed.in/math/2d-shapes | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/3d-shapes | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/addition | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/angles | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/area-and-perimeter | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/area-formulas | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/bodmas-rule | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/calculating-percentages | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/cubes-and-cuboids | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/cylinder-cone-and-sphere | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/decimals | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/difference-between-place-value-and-face-value | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/divisibility-rules | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/division | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/expanded-form-of-a-number | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/exponents-and-powers | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/factors | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/flat-and-curved-surface | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/fractions | Sitemap (page-sitemap.xml) | Math topic article | Yes | Complete |
| https://eduseed.in/math/highest-common-factor-hcf | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/improper-fractions-and-mixed-numbers | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/integers | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/least-common-multiple-lcm | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/lines | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/multiples | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/multiplication | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/operations-on-decimals | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/operations-on-fractions | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/pemdas-rule | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/percentage | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/perfect-abundant-deficient-numbers | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/perimeter-formulas | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/polygons | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/prime-and-composite-numbers | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/prime-factorization | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/prisms-and-pyramids | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/quadrilaterals | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/ratio-and-proportion | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/roman-numerals | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/rounding-off | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/scientific-notation | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/subtraction | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/symmetry | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/understanding-place-value | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/math/volume-and-surface-area | Sitemap (page-sitemap.xml) | Math topic article | No | Not loaded (template covered) |
| https://eduseed.in/wp-admin/post.php | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2023/12/AppInventor_Curriculum.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2023/12/JavaScript_Curriculum.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2023/12/Lego_Bricq_Curriculum.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2023/12/Lego_Spike_Curriculum.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2023/12/Lego_WeDo_Curriculum.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2023/12/ScratchJr_Curriculum.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2023/12/python_curriculum.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2024/01/Scratch_Curriculum.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2024/02/AI_PictoBlox_Curriculum.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2024/11/Scratch-Worksheet-1.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2024/11/Scratch-Worksheet-2.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2024/11/Scratch-Worksheet-3.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-content/uploads/2026/04/eduSeed-Math-Program-Brochure.pdf | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/wp-login.php | Link graph (crawl) | Non-HTML / admin (excluded) | No | Not loaded |
| https://eduseed.in/cbse-xi-python | Sitemap (page-sitemap.xml) | Program landing | No | Not loaded (template covered) |
| https://eduseed.in/coding-workshop-for-schools | Sitemap (page-sitemap.xml) | Program landing | No | Not loaded (template covered) |
| https://eduseed.in/computer-science-ai | Sitemap (page-sitemap.xml) | Program landing | No | Not loaded (template covered) |
| https://eduseed.in/express | Sitemap (page-sitemap.xml) | Program landing | No | Not loaded (template covered) |
| https://eduseed.in/financial-literacy-for-kids | Sitemap (page-sitemap.xml) | Program landing | Yes | Complete |
| https://eduseed.in/math-kangaroo-prep | Sitemap (page-sitemap.xml) | Program landing | No | Not loaded (template covered) |
| https://eduseed.in/math-olympiad-coaching | Sitemap (page-sitemap.xml) | Program landing | Yes | Complete |
| https://eduseed.in/online-math-tutoring | Sitemap (page-sitemap.xml) | Program landing | No | Not loaded (template covered) |
| https://eduseed.in/vedic-maths | Sitemap (page-sitemap.xml) | Program landing | No | Not loaded (template covered) |
| https://eduseed.in/coding-resources | Sitemap (page-sitemap.xml) | Resource hub | Yes | Complete |
| https://eduseed.in/free-math-worksheets | Sitemap (page-sitemap.xml) | Resource hub | Yes | Complete |
| https://eduseed.in/cart | Sitemap (page-sitemap.xml) | Shop / account utility | No | Not loaded (template covered) |
| https://eduseed.in/checkout | Sitemap (page-sitemap.xml) | Shop / account utility | No | Not loaded (template covered) |
| https://eduseed.in/my-account | Sitemap (page-sitemap.xml) | Shop / account utility | Yes | Complete |
| https://eduseed.in/my-account/lost-password | Link graph (crawl) | Shop / account utility | No | Not loaded (template covered) |
| https://eduseed.in/tag/academics | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/activities-for-kids | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/avoid-silly-mistakes | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/children | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/coding | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/coding-activities | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/coding-activities-for-kids | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/coding-for-kids | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/coding-worksheets-for-kids | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/contest | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/cool-math-tricks | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/educational | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/financial-terms | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/free-coding-worksheet | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/interactive-math-learning | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/kids | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/kids-math | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/kids-technology | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/learning | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/learning-for-kids | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/level-2 | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/logical-thinking | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/math | Link graph (crawl) | Tag archive | Yes | Complete |
| https://eduseed.in/tag/math-tutoring | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/olympiad | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/olympiads | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/online-math-class | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/online-math-courses | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/online-math-olympiad-coaching | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/online-platforms | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/parenting | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/parents | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/practical-learning | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/public-speaking | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/python | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/real-world | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/result | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/school | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/screen-time | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/sof-imo-coaching | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/soft-skills-for-kids | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/summer | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/vacation | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/vocational-education | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/tag/workforce | Link graph (crawl) | Tag archive | No | Not loaded (template covered) |
| https://eduseed.in/testimonials | Sitemap (page-sitemap.xml) | Testimonials | Yes | Complete |
| https://eduseed.in/adding-interactivity-to-websites-using-javascript | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/build-your-first-webpage | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/canvas-component-in-app-inventor-and-how-to-use-it-for-games | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/create-and-code-games-in-scratch-jr | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/creating-animations-with-scratch-jr | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/css-for-kids-making-websites-colorful-and-stylish | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/difference-between-global-and-local-variable-in-app-inventor | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/difference-between-image-and-imagesprite-in-app-inventor | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/difference-between-player-and-sound-in-app-inventor | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/different-kinds-of-arrangements-in-app-inventor-and-when-to-use-them | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/easy-level-challenges-for-your-kids-in-app-inventor | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/exploring-conditionals-and-loops-in-scratch | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/exploring-conditions-in-scratch-junior | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/getting-started-with-python | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/getting-started-with-scratch | Sitemap (page-sitemap.xml) | Tutorial / resource article | Yes | Complete |
| https://eduseed.in/getting-started-with-scratch-junior | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/hard-level-challenges-for-your-kids-in-app-inventor | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/hello-world-create-your-first-app-in-app-inventor-text-to-speech-app | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/how-to-create-a-clicker-game-in-scratch | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/how-to-install-apps-built-in-app-inventor | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/how-to-make-a-story-in-scratch | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/how-to-set-app-icon-in-app-inventor | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/html-tags-for-kids-building-blocks-of-web | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/learn-block-categories-in-scratchjr | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/learn-more-about-sprites-in-scratch-jr | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/learn-scratch-blocks-categories | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/logical-reasoning-questions-with-answers-for-kids | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/medium-level-challenges-for-your-kids-in-app-inventor | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/mobile-app-development-made-easy-for-kids-using-app-inventor | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/navigating-to-a-new-screen-in-app-inventor | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/operators-in-python | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/pen-tool-in-scratch | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/perfect-abundant-deficient-numbers | Link graph (crawl) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/procedures-in-app-inventor-and-how-they-relate-to-functions | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/python-data-types-variables | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/quadratic-equations | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/roman-system | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/sensor-components-in-appinventor-and-how-to-use-them-in-our-app | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/simple-python-projects-for-kids | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/the-art-of-storytelling-crafting-stories-in-scratch-jr | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/understanding-loops-in-scratch-junior | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/understanding-variables-in-scratch | Sitemap (page-sitemap.xml) | Tutorial / resource article | No | Not loaded (template covered) |
| https://facebook.com/eduseed.in | Link graph (crawl) | Tutorial / resource article | No | Not loaded (template covered) |
| https://instagram.com/eduseed.in | Link graph (crawl) | Tutorial / resource article | No | Not loaded (template covered) |
| https://learn.eduseed.in | Link graph (crawl) | Tutorial / resource article | No | Not loaded (template covered) |
| https://eduseed.in/product-category/grade-1 | Sitemap (productcat-sitemap.xml) | Worksheet category (shop) | Yes | Complete |
| https://eduseed.in/product-category/grade-1/grade-1-addition | Sitemap (productcat-sitemap.xml) | Worksheet category (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product-category/grade-1/grade-1-time | Sitemap (productcat-sitemap.xml) | Worksheet category (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product-category/grade-2 | Sitemap (productcat-sitemap.xml) | Worksheet category (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product-category/grade-3 | Sitemap (productcat-sitemap.xml) | Worksheet category (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product-category/grade-4 | Sitemap (productcat-sitemap.xml) | Worksheet category (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product-category/grade-5 | Sitemap (productcat-sitemap.xml) | Worksheet category (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product-category/grade-6 | Sitemap (productcat-sitemap.xml) | Worksheet category (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product-category/kindergarten-math | Sitemap (productcat-sitemap.xml) | Worksheet category (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product-category/kindergarten-math/number-sense | Sitemap (productcat-sitemap.xml) | Worksheet category (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product/grade-1-addition-pictorial-word-problems | Link graph (crawl) | Worksheet product (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product/grade-1-data-handling | Link graph (crawl) | Worksheet product (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product/grade-1-days-of-the-week | Link graph (crawl) | Worksheet product (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product/grade-1-logical-reasoning-grouping | Link graph (crawl) | Worksheet product (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product/grade-1-measurement | Link graph (crawl) | Worksheet product (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product/grade-1-odd-or-even | Link graph (crawl) | Worksheet product (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product/grade-1-olympiad-type-questions | Link graph (crawl) | Worksheet product (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product/grade-1-subtraction-pictorial-word-problems | Link graph (crawl) | Worksheet product (shop) | No | Not loaded (template covered) |
| https://eduseed.in/product/grade-1-time | Link graph (crawl) | Worksheet product (shop) | Yes | Complete |
