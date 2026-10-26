# Content and data audit

Audit carried out on 26 October 2026 against the database loaded by the project ETL from the official sources (the same data the live site serves). Raw results: `docs/qa/data-audit.json` (produced by `scripts/qa/data-audit.mjs`). Every claim below reflects a check that was actually run; nothing is assumed.

## 1. Where each displayed field comes from

| Field | Source | Loaded by |
|---|---|---|
| Name, address, postcode, local authority, school type, age range, gender, sixth form, boarding, website, telephone, pupils, capacity (England) | DfE Get Information about Schools (GIAS) bulk extract | `src/etl/jobs/gias.ts` |
| Name, address, postcode, management type, pupils (Northern Ireland) | DE NI school-level census | `src/etl/jobs/ni-deni.ts` |
| Inspections | Ofsted management information, "latest inspections" CSV | `src/etl/jobs/ofsted.ts` |
| GCSE / A level results | DfE Explore Education Statistics API | `src/etl/jobs/ees-results.ts` |
| Applications and offers | DfE school-level applications and offers | `src/etl/jobs/apps-offers.ts` |
| Entrance tests, key dates, test links, partially selective list | `data/curated/editorial.json` (editorial research, each fact citing its page) | `src/etl/jobs/editorial.ts` |
| Admissions policy, criteria, published admission number, catchment, qualifying score | School's determined admission arrangements (PDF), extracted to a review queue | `src/etl/jobs/admissions-docs.ts` |

## 2. Automated structural checks (all 232 listed schools)

| Check | Result |
|---|---|
| Duplicate slugs, URNs, or name + postcode pairs | none |
| Missing or malformed postcodes | none |
| Malformed websites or telephone numbers | none |
| Implausible age ranges; sixth form flagged on an 11–16 school | none |
| England schools without a URN; Northern Ireland schools without a DENI number | none |
| Missing local authority | none |
| **Northern Ireland schools without coordinates, website, telephone, gender or age range** | **66 of 66** (see 6.1) |
| Pupils more than 20% above stated capacity | 28 schools; all 28 match GIAS exactly (official data, not an error) |
| Latest data years | results 2025/26 (provisional, labelled as such), applications and offers for September 2026 entry, inspections to 9 September 2026, census January 2026 |
| Events dated in the past | 2 (Buckinghamshire registration, 2 June 2026; SEAG registration, 20 October 2026); both show as passed |

## 3. Independent verification against authoritative sources

### 3.1 Every English school against its live GIAS record (166 of 166)

Each school's public GIAS page was fetched (one request at a time, backing off when GIAS rate-limited) and compared field by field with what Grammar Atlas shows: name, postcode, local authority, age range, gender, school type, website, telephone, open status, sixth form and pupil numbers.

**Result: 166 of 166 schools match on every compared field.** The three partially selective schools are recorded by GIAS as "Non-selective", which the site already flags (`awaiting verification`, with a note that the number of selective places must be confirmed from the school's arrangements).

### 3.2 Every English school's latest inspection against Ofsted (166 of 166)

Each school's Ofsted provider page was fetched and the inspection date we show was looked for on it.

- 142 schools: the inspection date we show appears on the Ofsted page.
- 24 schools: the date differs by one day. Tracing three of them (Maidstone, Aylesbury, Barton Court) to the raw file shows **Ofsted's own management information CSV and Ofsted's report pages disagree**. For example, for Maidstone Grammar School (URN 118835) the CSV gives an ungraded inspection on 09/10/2024 published 11/11/2024, while the report page shows 8 October 2024, published 12 November 2024. Publication dates in the CSV are consistently a day earlier than the report pages. Our importer copies the CSV exactly and the site cites the CSV as its source, so this is a **source discrepancy, not an import error**. It is left unchanged and recorded here; we have not picked one Ofsted publication over the other.

### 3.3 Every curated admissions date against its cited page (11 of 11)

| Event | Date | Source checked | Result |
|---|---|---|---|
| Secondary applications close (England, Sept 2027 entry) | 31 Oct 2026 | GOV.UK how to apply | date on page |
| National offer day (Sept 2027 entry) | 1 Mar 2027 | GOV.UK how to apply | date on page |
| Secondary applications close (Sept 2028 entry) | 31 Oct 2027 | GOV.UK | rule ("by 31 October") on page |
| National offer day (Sept 2028 entry) | 1 Mar 2028 | GOV.UK | rule on page |
| Objection deadline, Schools Adjudicator | 15 May 2027 | GOV.UK admission criteria | date on page |
| Buckinghamshire STT registration deadline | 2 Jun 2026 | Aylesbury Grammar School admissions policy 2027 (PDF), page 2, para 3.3 | "by 2 June 2026" in the PDF |
| SEAG registration closes | 20 Oct 2026 | SEAG key dates | date on page |
| SEAG Paper 1 | 14 Nov 2026 | SEAG key dates | date on page |
| SEAG Paper 2 | 21 Nov 2026 | SEAG key dates | date on page |
| SEAG outcomes issued | 23 Jan 2027 | SEAG key dates | date on page |
| SEAG re-mark window | 25 Jan – 3 Feb 2027 | SEAG key dates | dates on page |

### 3.4 The published admissions policy (Aylesbury Grammar School, 2027 entry)

Checked in the stored PDF: published admission number for Year 7 is **186** (page 2) and the qualifying score is **121** in the Secondary Transfer Test (page 2, paras 3.3–3.4). Both match the site.

### 3.5 Links (194 checked)

Every school website, every stored source document and every editorial source was requested; failures were retried in a real browser.

- 181 reachable on the first request; Chatham Grammar, blocked on that request, loads normally in a browser (182 in total).
- **12 not reachable from the audit environment:** 10 school websites (Dartford Grammar, King Edward VI Handsworth School, Parkstone, Sir Joseph Williamson's Mathematical School, Skegness Grammar, Upton Court Grammar, West Kirby Grammar, Southend High School for Boys, Wilmington Grammar School for Boys and Wilmington Grammar School for Girls) plus the Kent County Council Kent Test page (referenced twice). They return bot challenges (Cloudflare, a security plugin), 403 or 502 to cloud networks, or time out. **All 10 school URLs match GIAS exactly**, so they are the authoritative values and were not changed.

## 4. Confirmed data errors

**None found in the displayed data.** Every value checked matched its authoritative source. No corrections were applied to data, so nothing was changed for appearance alone.

## 5. Verification gaps (unresolved, reported rather than guessed)

| # | Gap | Scope | Why it is open |
|---|---|---|---|
| 5.1 | Northern Ireland schools have no website, telephone, gender, age range or map location | 66 schools | The DE NI census used by the importer does not include them; postcode geocoding for NI stays off until Land & Property Services licence terms are confirmed (`NI_POSTCODES_ENABLED`). Pages show these as gaps. |
| 5.2 | Kent Test details | 1 test, 32 Kent schools | Kent County Council blocks automated access; the test is marked "not available" with a link to the council page. |
| 5.3 | Partially selective schools' number of selective places | 3 schools | Needs the schools' admission arrangements; shown as awaiting verification. |
| 5.4 | Admissions policies, criteria and catchment for 231 schools | 231 schools | Only Aylesbury Grammar School's 2027 policy has been extracted and reviewed; the others show "we don't hold verified admissions rules", with a link to the school. |
| 5.5 | Ofsted CSV vs report-page date differences | 24 schools | Two official Ofsted publications disagree by one day (3.2). |
| 5.6 | Unreachable school websites | 10 schools | See 3.5; values match GIAS. |
| 5.7 | Northern Ireland inspections (ETI) and results | 66 schools | Not integrated; profiles say so. |

## 6. Editorial audit

Rendered text was extracted from 34 pages covering every template (`main` element only) and read in full.

**Stock phrasing:** no "unlock", "navigate your journey", "comprehensive insights", "seamless" or similar in visible copy (matches in the code are module and component names).

**Em dashes:** 222 rendered across the 34 pages. They fall into three groups:

| Group | Count (approx.) | Decision |
|---|---|---|
| "—" as the empty-value marker in tables (directory table, results, compare) | ~120 | keep: standard notation for "no figure" |
| Inside verbatim official text (SEAG key-date quotes, dataset titles, GOV.UK page titles) and citation separators | ~45 | keep: quotations and source titles must not change |
| In our own sentences and definition lists | ~55 | rewrite |

**Other editorial issues**

| Template | Issue | Example |
|---|---|---|
| Homepage | dash-joined sentences, some slightly promotional | "Important dates, admissions policies and school research — connected instead of scattered across bookmarks." |
| About | slogan rather than explanation | "One platform, every grammar school, every important detail — with evidence for every decision." |
| Research assistant | inflated page title | "School Intelligence Assistant" |
| Methodology, privacy | "Term — description" lists read as notes | "Postcode tools — a postcode is sent to postcodes.io…" |
| Profiles | dash asides | "These are demand figures — not cut-off scores, distances or chances." |
| Tools and hub | dash asides | "It can't tell you whether a place will be offered — that depends on…" |
| Area pages, directory | dash asides in explanations | "Straight-line from the postcode's centre — not the method schools use…" |

Facts and official wording in admissions policies and quoted sources are out of scope for rewriting.
