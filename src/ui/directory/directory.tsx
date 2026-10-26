import Link from "next/link";
import { clsx } from "clsx";
import { CATCHMENT_LABEL, GENDER_LABEL, SELECTIVITY_SHORT } from "@/domain/labels";
import { formatMiles } from "@/lib/format";
import { policyCoverage, schoolDetails, type SearchResult } from "@/server/schools";
import { directoryQueryString, type DirectoryParams } from "@/server/search-params";
import { IconCheck, IconChevron, IconClose, IconFilter, IconInfo, IconList, IconMap, IconSort, IconTable } from "../icons";
import { Gap, Note } from "../kit";
import { CompareCheck, CompareTray } from "../shortlist";
import { Status } from "../status";
import { AutoApply } from "./auto-apply";
import { Filters, testOptions } from "./filters";
import { MapDesk } from "./map-desk";
import { ResearchList } from "./research-list";

type Bench = Record<string, number>;

type Sort = SearchResult["sort"];

/** Sort options, each labelled with its direction. Best match and nearest only appear when they can apply. */
const SORTS: [Sort, string][] = [
  ["relevance", "Best match"],
  ["distance", "Nearest first"],
  ["area", "By area"],
  ["name", "Name, A to Z"],
  ["demand", "First choices per offer, highest first"],
  ["gcse", "Attainment 8, highest first"],
  ["alevel", "A level, highest first"],
];


/* Quick type tabs over the results, like a category strip: each is a deep link that resets the intake filters. */
function TypeGlyph({ kind }: { kind: string }) {
  const p = {
    all: <path d="M3 17h14M4.5 17V8.5L10 4l5.5 4.5V17M8 17v-4h4v4M8 9.5h.01M12 9.5h.01" />,
    boys: <path d="M10 8.5a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5ZM5 17v-2.5a5 5 0 0 1 10 0V17" />,
    girls: <path d="M10 8.5a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5ZM10 10l-4.5 7h9Z" />,
    mixed: <path d="M7 8a2.25 2.25 0 1 0 0-4.5A2.25 2.25 0 0 0 7 8ZM13.5 8a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM3 16.5v-2a4 4 0 0 1 7.5-2M13.5 10l-3.5 6.5h7Z" />,
    boarding: <path d="M2.5 15.5V5M2.5 12h15v3.5M2.5 9.5h4.5a1.5 1.5 0 0 1 0 3M9 12V8.5h5.5a3 3 0 0 1 3 3v.5" />,
  }[kind];
  return (
    <svg viewBox="0 0 20 20" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
      {p}
    </svg>
  );
}

function TypeTabs({ p, href }: { p: DirectoryParams; href: (o: Partial<DirectoryParams>) => string }) {
  const g = p.gender.length === 1 ? p.gender[0] : p.gender.length ? "several" : "";
  const tabs: [string, string, Partial<DirectoryParams>, boolean][] = [
    ["all", "All schools", { gender: [], boarding: undefined }, !g && !p.boarding],
    ["boys", "Boys", { gender: ["boys"], boarding: undefined }, g === "boys" && !p.boarding],
    ["girls", "Girls", { gender: ["girls"], boarding: undefined }, g === "girls" && !p.boarding],
    ["mixed", "Co-educational", { gender: ["mixed"], boarding: undefined }, g === "mixed" && !p.boarding],
    ["boarding", "Boarding", { gender: [], boarding: true }, !g && !!p.boarding],
  ];
  return (
    <nav aria-label="School type" className="-mx-4 mt-2.5 overflow-x-auto px-4 pt-2 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
      <ul className="flex gap-2.5">
        {tabs.map(([k, label, o, on]) => (
          <li key={k} className="shrink-0">
            <Link
              href={href({ ...o, page: 1 })}
              aria-current={on ? "true" : undefined}
              className={clsx(
                "relative flex min-h-12 items-center gap-2.5 rounded-[var(--r-3)] border bg-card py-1.5 pr-4 pl-1.5 text-[0.9375rem] font-semibold no-underline shadow-card transition-[border-color,color,box-shadow] duration-[var(--d-2)]",
                on ? "border-green text-green shadow-[0_0_0_1px_var(--green)]" : "border-rule text-ink hover:border-green hover:text-green",
              )}
            >
              <span className={clsx("grid size-9 place-items-center rounded-[8px]", on ? "bg-green text-white" : "bg-green-wash text-green")}>
                <TypeGlyph kind={k} />
              </span>
              {label}
              {on ? (
                <span aria-hidden className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-green text-white ring-2 ring-card">
                  <IconCheck size={12} />
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Sort as a compact select that applies on change; hidden fields carry the rest of the search. */
function SortForm({ p, basePath, r }: { p: DirectoryParams; basePath: string; r: SearchResult }) {
  const keep = new URLSearchParams(directoryQueryString({ ...p, area: undefined }, { sort: undefined, page: 1 }).slice(1));
  const options = SORTS.filter(([k]) => (k !== "distance" || r.location) && (k !== "relevance" || r.query));
  return (
    <form method="get" action={basePath} className="flex items-center gap-2">
      <AutoApply />
      {[...keep].map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <label htmlFor="sort-top" className="inline-flex items-center gap-1.5 text-[0.9375rem] whitespace-nowrap text-ink-2">
        <IconSort size={16} /> Sort
      </label>
      <span className="relative">
        <select id="sort-top" name="sort" defaultValue={r.sort} className="min-h-10 max-w-[15rem] appearance-none rounded-[var(--r-2)] border border-control bg-card py-1.5 pr-9 pl-3 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink focus:border-green focus:shadow-[0_0_0_4px_rgb(82_95_225/0.18)] focus:outline-none">
          {options.map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
        <IconChevron size={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-2" />
      </span>
      <noscript>
        <button type="submit" className="min-h-10 rounded-[5px] border border-control px-3 font-semibold">
          Sort
        </button>
      </noscript>
    </form>
  );
}

const TABLE_HEAD = "sticky top-0 z-[2] border-b border-rule bg-sage px-3 py-2.5 text-left align-bottom text-[0.8125rem] font-bold text-ink-2";

/** A sortable column heading: a link to the same search in this order, with the direction shown. */
function SortHead({ k, current, href, children, right }: { k: Sort; current: Sort; href: string; children: React.ReactNode; right?: boolean }) {
  return (
    <th scope="col" className={clsx(TABLE_HEAD, right && "text-right")} aria-sort={current === k ? (k === "name" ? "ascending" : "descending") : undefined}>
      <Link href={href} className={clsx("no-underline hover:text-green", current === k ? "text-green" : "text-ink-2")}>
        {children}
        {current === k ? <span aria-hidden> {k === "name" ? "↑" : "↓"}</span> : null}
      </Link>
    </th>
  );
}

function ResultsTable({ r, p, basePath, bench, entryYear }: { r: SearchResult; p: DirectoryParams; basePath: string; bench: Bench; entryYear: number }) {
  const head = TABLE_HEAD;
  const cell = "border-b border-rule px-3 py-3 align-top";
  const sortHref = (sort: Sort) => `${basePath}${directoryQueryString(p, { sort, page: 1 })}`;
  return (
    <div className="relative max-h-[75vh] overflow-auto rounded-[var(--r-3)] border border-rule bg-card" role="region" aria-label="Results table, scrolls in both directions" tabIndex={0}>
      <table className="w-full min-w-[1080px] border-collapse text-[0.9375rem]">
        <caption className="sr-only">Grammar schools matching your search. Column headings that are links change the order.</caption>
        <thead>
          <tr>
            <th scope="col" className={clsx(head, "left-0 z-[3] min-w-[15rem]")} aria-sort={r.sort === "name" ? "ascending" : undefined}>
              <Link href={sortHref("name")} className={clsx("no-underline hover:text-green", r.sort === "name" ? "text-green" : "text-ink-2")}>
                School{r.sort === "name" ? <span aria-hidden> ↑</span> : null}
              </Link>
            </th>
            <th scope="col" className={head}>
              Intake and type
            </th>
            <th scope="col" className={head}>
              Entrance test
            </th>
            <th scope="col" className={head}>
              Admissions policy, {entryYear}
            </th>
            <SortHead k="demand" current={r.sort} href={sortHref("demand")}>
              Demand
            </SortHead>
            <SortHead k="gcse" current={r.sort} href={sortHref("gcse")} right>
              Attainment 8
            </SortHead>
            <SortHead k="alevel" current={r.sort} href={sortHref("alevel")} right>
              A level
            </SortHead>
            {r.location ? (
              <SortHead k="distance" current={r.sort} href={sortHref("distance")} right>
                Distance
              </SortHead>
            ) : null}
            <th scope="col" className={head}>
              <span className="sr-only">Compare</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {r.items.map((s) => {
            const b = s.attainment8Year ? bench[s.attainment8Year] : undefined;
            const diff = s.attainment8 !== null && b !== undefined ? s.attainment8 - b : null;
            const ni = s.nation === "northern_ireland";
            return (
              <tr key={s.id} className="group/tr">
                <th scope="row" className={clsx(cell, "sticky left-0 z-[1] bg-card text-left font-semibold shadow-[1px_0_0_var(--rule)] group-hover/tr:bg-paper")}>
                  <Link href={`/schools/${s.slug}`} className="text-ink no-underline hover:text-green hover:underline">
                    {s.name}
                  </Link>
                  <span className="block text-small font-normal text-ink-2">{[s.town, s.laName].filter((x, j, a) => x && a.indexOf(x) === j).join(", ")}</span>
                </th>
                <td className={clsx(cell, "text-ink-2 group-hover/tr:bg-paper")}>
                  {GENDER_LABEL[s.gender]}
                  <span className="block text-small">{s.selectivity === "fully_selective" ? "Fully selective" : SELECTIVITY_SHORT[s.selectivity]}</span>
                </td>
                <td className={clsx(cell, "text-ink-2 group-hover/tr:bg-paper")}>{s.testNames?.length ? s.testNames.join(", ") : <span className="text-ink-3">Not yet recorded</span>}</td>
                <td className={clsx(cell, "text-ink-2 group-hover/tr:bg-paper")}>
                  {s.policyStatus ? (
                    <>
                      {s.catchmentType && s.catchmentType !== "unknown" ? CATCHMENT_LABEL[s.catchmentType] : "Criteria held"}
                      <span className="block text-small">{s.pan ? `${s.pan} places` : null}</span>
                      <Status status={s.policyStatus} quiet className="mt-1" />
                    </>
                  ) : (
                    <span className="text-ink-3">Not yet collected</span>
                  )}
                </td>
                <td className={clsx(cell, "text-ink-2 group-hover/tr:bg-paper")}>
                  {s.firstPrefs !== null && s.offers ? (
                    <>
                      <span className="font-mono text-ink">{s.firstPrefs}</span> first choices · <span className="font-mono text-ink">{s.offers}</span> offers
                      <span className="block text-small">
                        {s.otherLaOffers !== null ? `${Math.round((s.otherLaOffers / s.offers) * 100)}% to other areas · ` : ""}
                        {s.demandYear}
                      </span>
                    </>
                  ) : (
                    <span className="text-ink-3">{ni ? "England only" : "—"}</span>
                  )}
                </td>
                <td className={clsx(cell, "text-right font-mono group-hover/tr:bg-paper")}>
                  {ni ? (
                    <span className="font-sans text-small text-ink-3">Not used in NI</span>
                  ) : s.attainment8 !== null ? (
                    <>
                      {s.attainment8.toFixed(1)}
                      <span className="block text-[0.8125rem] text-ink-2">
                        {s.attainment8Year}
                        {diff !== null ? ` · ${diff >= 0 ? "+" : "−"}${Math.abs(diff).toFixed(1)} vs selective avg.` : ""}
                      </span>
                    </>
                  ) : (
                    <span className="font-sans text-small text-ink-3">No figure published</span>
                  )}
                </td>
                <td className={clsx(cell, "text-right font-mono group-hover/tr:bg-paper")}>
                  {ni ? (
                    <span className="font-sans text-small text-ink-3">Not used in NI</span>
                  ) : s.alevelGrade ? (
                    <>
                      {s.alevelGrade}
                      <span className="block text-[0.8125rem] text-ink-2">{s.alevelYear}</span>
                    </>
                  ) : (
                    <span className="font-sans text-small text-ink-3">{s.hasSixthForm ? "No figure published" : "No sixth form"}</span>
                  )}
                </td>
                {r.location ? <td className={clsx(cell, "text-right font-mono whitespace-nowrap group-hover/tr:bg-paper")}>{s.distanceMiles !== null ? formatMiles(s.distanceMiles) : "—"}</td> : null}
                <td className={clsx(cell, "py-1.5 group-hover/tr:bg-paper")}>
                  <CompareCheck slug={s.slug} name={s.name} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function pageWindow(page: number, pages: number): (number | "…")[] {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1]! > 1) out.push("…");
    out.push(n);
  });
  return out;
}

/** Active filters as removable chips — each one a link to the same search without it. */
async function activeChips(p: DirectoryParams, basePath: string, lockArea: boolean) {
  const chips: { label: string; href: string }[] = [];
  const without = (o: Partial<DirectoryParams>) => `${basePath}${directoryQueryString(p, { ...o, page: 1 })}`;
  if (p.q) chips.push({ label: `“${p.q}”`, href: without({ q: "" }) });
  if (p.postcode) chips.push({ label: `Within ${p.radius ?? 30} mi of ${p.postcode.toUpperCase()}`, href: without({ postcode: undefined, radius: undefined, sort: p.sort === "distance" ? undefined : p.sort }) });
  if (!lockArea && p.nation) chips.push({ label: p.nation === "england" ? "England" : "Northern Ireland", href: without({ nation: undefined }) });
  for (const g of p.gender) chips.push({ label: GENDER_LABEL[g]!, href: without({ gender: p.gender.filter((x) => x !== g) }) });
  for (const s of p.selectivity) chips.push({ label: s === "fully_selective" ? "Grammar (fully selective)" : "Partially selective", href: without({ selectivity: p.selectivity.filter((x) => x !== s) }) });
  if (p.sixthForm) chips.push({ label: "Sixth form", href: without({ sixthForm: undefined }) });
  if (p.boarding) chips.push({ label: "Boarding", href: without({ boarding: undefined }) });
  if (p.test) {
    const t = (await testOptions()).find((x) => x.slug === p.test);
    chips.push({ label: t?.name ?? p.test, href: without({ test: undefined }) });
  }
  if (p.outOfArea) chips.push({ label: "Admits out-of-area", href: without({ outOfArea: undefined }) });
  if (p.scoreRoute) chips.push({ label: "Published score threshold", href: without({ scoreRoute: undefined }) });
  if (p.siblingPriority) chips.push({ label: "Sibling priority", href: without({ siblingPriority: undefined }) });
  if (p.history) chips.push({ label: "Has offer history", href: without({ history: undefined }) });
  return chips;
}

/**
 * The research desk: a filter rail, the result count with quick type tabs, removable filter chips,
 * a toolbar of orderings and views, then results as cards, a table or a street map.
 */
export async function DirectoryDesk({ p, result, basePath, lockArea = false, entryYear, bench, heading = "Grammar schools", listed }: { p: DirectoryParams; result: SearchResult; basePath: string; lockArea?: boolean; entryYear: number; bench: Bench; heading?: string; listed?: number }) {
  const view = p.view ?? "list";
  // The map shows every match at once (the page asks for them all), so it has no pages.
  const pages = view === "map" ? 1 : Math.max(1, Math.ceil(result.total / result.pageSize));
  const chips = await activeChips(p, basePath, lockArea);
  const offset = (p.page - 1) * result.pageSize;
  const href = (o: Partial<DirectoryParams>) => `${basePath}${directoryQueryString(p, o)}`;
  const rulesFilter = !!(p.outOfArea || p.scoreRoute || p.siblingPriority || p.history);
  const policyRules = !!(p.outOfArea || p.scoreRoute || p.siblingPriority);
  const covered = policyRules ? await policyCoverage(entryYear) : null;
  const mapped = result.items.filter((s) => s.lat !== null && s.lng !== null).length;
  const details = view === "list" ? await schoolDetails(result.items.map((s) => s.id), entryYear) : {};

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
      <aside aria-label="Filters" className="hidden min-w-0 lg:block">
        <div className="hidden overflow-hidden rounded-[var(--r-3)] bg-card shadow-[0_0_0_1px_var(--rule),var(--shadow-card)] [--rail-bg:var(--card)] lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:block lg:max-h-[calc(100vh-var(--header-h)-2rem)] lg:overflow-y-auto">
          <p className="flex items-center justify-between gap-2 border-b border-rule px-4 py-3.5 font-display text-[1.25rem] text-ink">
            <span className="flex items-center gap-2">
              <IconFilter size={18} className="text-green" /> Filters
            </span>
            {chips.length ? (
              <Link href={basePath} className="font-sans text-[0.875rem] font-semibold text-cta-deep no-underline hover:underline">
                Clear all
              </Link>
            ) : null}
          </p>
          <div className="px-4 pb-4">
            <Filters p={p} basePath={basePath} lockArea={lockArea} idPrefix="fd" />
          </div>
        </div>
      </aside>

      <div className="min-w-0">
      <section aria-labelledby="results-heading">
        <h2 id="results-heading" className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-[1.375rem] leading-tight text-ink sm:text-[1.5rem]" aria-live="polite">
          {heading}
          <span className="rounded-full bg-navy px-3 py-1 font-sans text-[0.875rem] font-bold text-white">
            <span className="num">{result.total}</span> {result.total === 1 ? "school" : "schools"}
          </span>
        </h2>
        <p className="mt-1.5 text-[0.9375rem] text-ink-2">
          {result.query ? <>Matching &ldquo;{result.query}&rdquo;. </> : null}
          {result.location ? <>Within {p.radius ?? 30} miles of {result.location.label}. </> : null}
          {view === "map" ? null : pages > 1 && !result.outOfRange ? `Showing ${offset + 1} to ${Math.min(offset + result.pageSize, result.total)}.` : result.total && !result.outOfRange ? "Showing all." : null}
        </p>

        <TypeTabs p={p} href={href} />

        {chips.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="sr-only">Active filters:</span>
            <ul className="flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <li key={c.label}>
                  <Link href={c.href} className="group/chip inline-flex min-h-9 items-center gap-1.5 rounded-[4px] border border-green/30 bg-green-wash py-1 pr-2 pl-3 text-[0.92rem] font-semibold text-green no-underline transition-colors hover:border-green">
                    {c.label}
                    <IconClose size={14} className="transition-transform duration-[var(--d-1)] group-hover/chip:rotate-90" />
                    <span className="sr-only">: remove this filter</span>
                  </Link>
                </li>
              ))}
            </ul>
            {chips.length > 1 ? (
              <Link href={basePath} className="a text-[0.92rem]">
                Clear all
              </Link>
            ) : null}
          </div>
        ) : null}

        {result.locationError ? (
          <Note tone="caution" className="mt-4">
            {result.locationError} Check the postcode, or search by school name or town instead.
          </Note>
        ) : null}
        {covered !== null ? (
          <Note className="mt-4">
            Admissions-rule filters only match schools whose September {entryYear} policy we hold: {covered} of {listed ?? "the"} listed schools so far. Schools without a recorded policy are left out of these results, not ruled out. <Link href="/methodology#coverage">About coverage</Link>
          </Note>
        ) : null}
        {result.location ? (
          <p className="mt-3 max-w-[70ch] text-small leading-relaxed text-ink-2">
            Distances are straight lines from the centre of {result.location.precision === "postcode_district" ? "the postcode district" : "your postcode"}. Schools measure from your home address by their own method, and distance alone doesn&apos;t tell you whether a child is eligible.
          </p>
        ) : null}
      </section>

      {/* Phones: the filter sheet sits after the count and type tabs, just above the results. */}
      <div role="complementary" aria-label="Filters" className="mt-4 lg:hidden">
          <details className="group/f rounded-[8px] border border-rule bg-card lg:hidden">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-semibold text-ink">
              <span className="flex items-center gap-2">
                <IconFilter size={18} /> Filters
                {chips.length ? <span className="grid size-6 place-items-center rounded-full bg-green font-mono text-[0.8125rem] font-bold text-white">{chips.length}</span> : null}
              </span>
              <span className="text-small font-normal text-ink-2 group-open/f:hidden">Show</span>
              <span className="hidden text-small font-normal text-ink-2 group-open/f:inline">Hide</span>
            </summary>
            <div className="border-t border-rule bg-card p-4 [--rail-bg:var(--card)]">
              <Filters p={p} basePath={basePath} lockArea={lockArea} idPrefix="fm" />
            </div>
          </details>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-rule py-2.5">
          <SortForm p={p} basePath={basePath} r={result} />
          <nav aria-label="Result views" className="flex rounded-[var(--r-2)] border border-rule bg-card p-1">
            {(
              [
                ["list", "Cards", IconList],
                ["table", "Table", IconTable],
                ["map", "Map", IconMap],
              ] as const
            ).map(([v, label, Icon]) => (
              <Link
                key={v}
                href={href({ view: v === "list" ? undefined : v, page: 1 })}
                aria-current={view === v ? "page" : undefined}
                className={clsx("inline-flex min-h-10 items-center gap-1.5 rounded-[4px] px-3 text-[0.9375rem] font-bold no-underline transition-colors duration-[var(--d-2)]", view === v ? "bg-green text-white" : "text-ink-2 hover:text-green")}
              >
                <Icon size={16} /> {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-4">
          {result.outOfRange ? (
            <Gap title={`There is no page ${p.page}`}>
              These results fill {Math.max(1, Math.ceil(result.total / result.pageSize))} {Math.ceil(result.total / result.pageSize) === 1 ? "page" : "pages"}. <Link href={href({ page: Math.ceil(result.total / result.pageSize) })}>Go to the last page</Link> or <Link href={href({ page: 1 })}>start from the first</Link>.
            </Gap>
          ) : result.items.length === 0 ? (
            <Gap title="No schools match this search">
              {chips.length ? (
                <>
                  These filters may be ruling schools out. Remove one:
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {chips.map((c) => (
                      <Link key={c.label} href={c.href} className="inline-flex min-h-9 items-center gap-1 rounded-[4px] border border-rule bg-card px-2.5 text-[0.9375rem] font-semibold text-ink no-underline hover:border-green hover:text-green">
                        {c.label} <IconClose size={13} />
                      </Link>
                    ))}
                  </span>
                  <span className="mt-2 block">
                    Or <Link href={basePath}>clear every filter</Link>.{rulesFilter ? ` Admissions-rule filters only match schools whose ${entryYear} policy we hold.` : ""}
                  </span>
                </>
              ) : (
                <>
                  Check the spelling, or search by town or postcode instead. <Link href={basePath}>See every school</Link>.
                </>
              )}
            </Gap>
          ) : view === "map" ? (
            <>
              <p className="mb-3 flex items-start gap-2 text-[0.9375rem] text-ink-2">
                <IconInfo size={17} className="mt-0.5 shrink-0 text-green" />
                <span>
                  <b className="text-ink">{mapped}</b> of {result.items.length} matching schools are on the map.
                  {result.items.length > mapped ? ` ${result.items.length - mapped} have no recorded location (all of Northern Ireland's, for now), so they are listed but not plotted.` : ""} Markers show where schools are, not catchment areas.
                </span>
              </p>
              <MapDesk
                offset={0}
                items={result.items.map((s) => ({ slug: s.slug, name: s.name, sub: [s.town, s.laName].filter(Boolean).join(", "), lat: s.lat, lng: s.lng, distance: s.distanceMiles !== null ? formatMiles(s.distanceMiles) : null }))}
                origin={result.location ? { lat: result.location.latitude, lng: result.location.longitude, label: result.location.label } : null}
              />
            </>
          ) : view === "table" ? (
            <ResultsTable r={result} p={p} basePath={basePath} bench={bench} entryYear={entryYear} />
          ) : (
            <ResearchList items={result.items} details={details} bench={bench} entryYear={entryYear} grouped={result.sort === "area"} precision={result.location?.precision} />
          )}
        </div>

        {pages > 1 ? (
          <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-between gap-4">
            {p.page > 1 ? (
              <Link href={href({ page: p.page - 1 })} rel="prev" className="inline-flex min-h-10 items-center rounded-[4px] border border-control bg-card px-3.5 font-semibold text-ink no-underline hover:border-ink">
                Previous
              </Link>
            ) : (
              <span />
            )}
            <ol className="flex items-center gap-1 font-mono text-[0.9rem]">
              {pageWindow(p.page, pages).map((n, i) =>
                n === "…" ? (
                  <li key={`gap${i}`} aria-hidden className="px-1 text-ink-3">
                    …
                  </li>
                ) : (
                  <li key={n}>
                    <Link
                      href={href({ page: n })}
                      aria-current={n === p.page ? "page" : undefined}
                      aria-label={`Page ${n} of ${pages}`}
                      className={clsx("grid h-11 min-w-11 place-items-center rounded-[var(--r-2)] px-2 font-bold no-underline shadow-card transition-colors duration-[var(--d-2)]", n === p.page ? "bg-green text-white" : "bg-card text-ink-2 hover:bg-green hover:text-white")}
                    >
                      {n}
                    </Link>
                  </li>
                ),
              )}
            </ol>
            {p.page < pages ? (
              <Link href={href({ page: p.page + 1 })} rel="next" className="inline-flex min-h-10 items-center rounded-[4px] border border-control bg-card px-3.5 font-semibold text-ink no-underline hover:border-ink">
                Next
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </div>
      </div>
      <CompareTray />
    </div>
  );
}
