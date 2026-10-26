import Link from "next/link";
import { clsx } from "clsx";
import { CATCHMENT_LABEL, GENDER_LABEL, SELECTIVITY_SHORT } from "@/domain/labels";
import { formatMiles, relativeAge } from "@/lib/format";
import type { SearchResult, SchoolListItem } from "@/server/schools";
import { directoryQueryString, type DirectoryParams } from "@/server/search-params";
import { IconArrow, IconCheck, IconChevron, IconClose, IconFilter, IconList, IconMap, IconPin, IconSeal, IconSort, IconTable } from "../icons";
import { Gap, Note, Tag } from "../kit";
import { CompareCheck, CompareTray, SaveButton } from "../shortlist";
import { Status } from "../status";
import { AutoApply } from "./auto-apply";
import { Filters, testOptions } from "./filters";
import { MapDesk } from "./map-desk";

type Bench = Record<string, number>;

const SORTS: [DirectoryParams["sort"] | undefined, string][] = [
  [undefined, "Best match"],
  ["name", "Name"],
  ["gcse", "Attainment 8"],
  ["alevel", "A level"],
  ["distance", "Distance"],
];

/* Ledger data: quiet sentence-case labels, bold values, and gaps in a lighter tone so real figures stand out. */
const LEDGER_LABEL = "text-[0.8125rem] font-semibold text-ink-3";
const LEDGER_GAP = "text-[0.9375rem] font-normal text-ink-3";

/** Attainment 8 on its full 0–90 scale, with the selective-school average for the same year. */
function A8Bar({ value, year, bench }: { value: number | null; year: string | null; bench: Bench }) {
  if (value === null) return <span className="text-[0.9375rem] font-normal text-ink-3">Not published</span>;
  const b = year ? bench[year] : undefined;
  return (
    <span className="block">
      <span className="font-mono text-[1.0625rem] font-bold text-ink">
        {value.toFixed(1)}
        <span className="text-[0.8125rem] font-normal text-ink-3"> / 90</span>
      </span>
      <span aria-hidden className="relative mt-1.5 block h-1.5 max-w-[9rem] rounded-full bg-sage-deep">
        <span className="absolute inset-y-0 left-0 rounded-full bg-green-bright" style={{ width: `${(value / 90) * 100}%` }} />
        {b !== undefined ? <span className="absolute -top-1 -bottom-1 w-[2px] bg-copper" style={{ left: `${(b / 90) * 100}%` }} /> : null}
      </span>
      {b !== undefined ? <span className="sr-only">Selective schools average {b.toFixed(1)}.</span> : null}
    </span>
  );
}

/* Crest panels stand in for school photographs, which we don't hold: a colour per intake and the school's initials. */
const CREST: Record<SchoolListItem["gender"], string> = {
  boys: "from-green to-navy",
  girls: "from-cta to-[#7a2a00]",
  mixed: "from-violet to-green-deep",
  unknown: "from-ink-2 to-navy",
};
const MINOR = new Set(["the", "of", "and", "for", "&", "school", "schools", "academy", "a", "an", "selective", "grammar", "high", "college"]);

/** Up to two initials from the distinctive words of a name ("Queen Elizabeth's Grammar School" → "QE"). */
function initials(name: string) {
  const words = name.replace(/[^\p{L}\s'-]/gu, " ").split(/\s+/).filter(Boolean);
  const key = words.filter((w) => !MINOR.has(w.toLowerCase()));
  return (key.length ? key : words)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function Crest({ s, n }: { s: SchoolListItem; n: number }) {
  return (
    <div aria-hidden className={clsx("relative hidden overflow-hidden bg-gradient-to-br text-white sm:block", CREST[s.gender])}>
      <span className="absolute inset-0 opacity-25 [background-image:radial-gradient(rgb(255_255_255/0.55)_1px,transparent_1.5px)] [background-size:14px_14px]" />
      <span className="absolute -right-10 -bottom-12 size-40 rounded-full border-[18px] border-white/10" />
      <span className="absolute top-3 left-3 rounded-[4px] bg-white px-2 py-0.5 text-[0.8125rem] font-bold text-ink shadow-sm">{SELECTIVITY_SHORT[s.selectivity]}</span>
      <span className="absolute top-3 right-3 font-mono text-[0.8125rem] font-bold text-white/85">{String(n).padStart(2, "0")}</span>
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-[4.5rem] place-items-center rounded-[18px_18px_36px_36px] border-2 border-white/70 bg-white/10 font-display text-[1.75rem] font-extrabold tracking-wide backdrop-blur-[2px] transition-transform duration-[var(--d-4)] ease-[var(--ease-out)] group-hover/card:scale-105">{initials(s.name)}</span>
      </span>
      {s.verificationStatus === "officially_verified" ? (
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-navy/55 py-0.5 pr-2.5 pl-1.5 text-[0.8125rem] font-semibold backdrop-blur-sm">
          <IconSeal size={14} /> Official record
        </span>
      ) : null}
    </div>
  );
}

function Stat({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className={LEDGER_LABEL}>{label}</dt>
      <dd className="mt-0.5 text-[1rem] font-bold text-ink [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

/** One school as a listing card: crest, name and place, four key figures, then actions. */
function SchoolCards({ items, offset, bench, precision }: { items: SchoolListItem[]; offset: number; bench: Bench; precision?: "postcode_centroid" | "postcode_district" }) {
  return (
    <ol className="grid gap-4">
      {items.map((s, i) => {
        const place = [s.town, s.laName].filter((x, j, a) => x && a.indexOf(x) === j);
        return (
          <li key={s.id}>
            <article className="group/card relative grid overflow-hidden rounded-[var(--r-3)] bg-card shadow-[0_0_0_1px_var(--rule),var(--shadow-card)] transition-[box-shadow,transform] duration-[var(--d-3)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--green),var(--shadow-lift)] sm:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-[13.5rem_minmax(0,1fr)]">
              <Crest s={s} n={offset + i + 1} />
              <div className="flex min-w-0 flex-col">
                <div className="flex-1 px-4 pt-4 pb-4 sm:px-5">
                  <div className="flex items-start gap-3">
                    <span aria-hidden className={clsx("grid size-12 shrink-0 place-items-center rounded-[10px_10px_20px_20px] bg-gradient-to-br font-display text-[1.05rem] font-extrabold text-white sm:hidden", CREST[s.gender])}>
                      {initials(s.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[1.1875rem] leading-snug font-bold sm:text-[1.25rem]">
                        <Link href={`/schools/${s.slug}`} className="text-ink no-underline after:absolute after:inset-0 group-hover/card:text-green">
                          {s.name}
                        </Link>
                      </h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.9375rem] text-ink-2">
                        <span className="inline-flex items-start gap-1">
                          <IconPin size={15} className="mt-[0.2rem] shrink-0 text-cta" />
                          {place.join(", ") || "Location not recorded"}
                        </span>
                        {s.regionName && s.regionName !== s.laName ? <span className="text-ink-3">{s.regionName}</span> : null}
                      </p>
                    </div>
                    {s.distanceMiles !== null ? (
                      <p className="shrink-0 rounded-full bg-green-wash px-2.5 py-1 text-right font-mono text-[0.875rem] font-bold text-green" title={precision === "postcode_district" ? "Straight-line distance from the centre of the postcode district" : "Straight-line distance from your postcode's centre point"}>
                        {formatMiles(s.distanceMiles)}
                        <span className="sr-only"> in a straight line</span>
                      </p>
                    ) : null}
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-dashed border-rule pt-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
                    <Stat label="Pupils admitted">{s.gender !== "unknown" ? GENDER_LABEL[s.gender] : <span className={LEDGER_GAP}>Not recorded</span>}</Stat>
                    <Stat label="Entrance test">{s.testNames?.length ? s.testNames.join(", ") : <span className={LEDGER_GAP}>Not yet recorded</span>}</Stat>
                    <Stat label={<>Attainment 8{s.attainment8Year ? <span className="font-normal"> · {s.attainment8Year}</span> : null}</>}>
                      <A8Bar value={s.attainment8} bench={bench} year={s.attainment8Year} />
                    </Stat>
                    <Stat label={<>A level{s.alevelYear ? <span className="font-normal"> · {s.alevelYear}</span> : null}</>}>{s.alevelGrade ? <span className="font-mono text-[1.0625rem]">{s.alevelGrade}</span> : <span className={LEDGER_GAP}>Not published</span>}</Stat>
                  </dl>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-rule bg-sage/60 px-4 py-2.5 sm:px-5">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                    {s.hasSixthForm ? <Tag tone="green">Sixth form</Tag> : null}
                    {s.boarding === "boarding" ? <Tag tone="green">Boarding</Tag> : null}
                    {s.catchmentType ? <Tag tone="green">{CATCHMENT_LABEL[s.catchmentType]}</Tag> : null}
                    {s.policyStatus === "awaiting_verification" ? <Status status="awaiting_verification" quiet /> : null}
                    <span className="text-[0.8125rem] text-ink-3">Checked {relativeAge(s.lastCheckedAt)}</span>
                  </div>
                  <CompareCheck slug={s.slug} name={s.name} />
                  <div className="relative z-10 grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                    <Link href={`/schools/${s.slug}/admissions`} className="inline-flex min-h-10 items-center justify-center rounded-[5px] border border-cta bg-card px-3 text-[0.9375rem] font-bold text-cta-deep no-underline transition-colors hover:bg-cta hover:text-white">
                      Admissions<span className="sr-only">: {s.name}</span>
                    </Link>
                    <Link href={`/schools/${s.slug}`} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[5px] border border-green bg-card px-3 text-[0.9375rem] font-bold text-green no-underline transition-colors hover:bg-green hover:text-white">
                      View school<span className="sr-only">: {s.name}</span> <IconArrow size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

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
function SortForm({ p, basePath, hasLocation }: { p: DirectoryParams; basePath: string; hasLocation: boolean }) {
  const keep = new URLSearchParams(directoryQueryString({ ...p, area: undefined }, { sort: undefined, page: 1 }).slice(1));
  return (
    <form method="get" action={basePath} className="flex items-center gap-2">
      <AutoApply />
      {[...keep].map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <label htmlFor="sort-top" className="inline-flex items-center gap-1.5 text-[0.9375rem] whitespace-nowrap text-ink-2">
        <IconSort size={16} /> Sort by
      </label>
      <span className="relative">
        <select id="sort-top" name="sort" defaultValue={p.sort === "relevance" ? "" : (p.sort ?? "")} className="min-h-10 appearance-none rounded-[var(--r-2)] border border-control bg-card py-1.5 pr-9 pl-3 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-ink focus:border-green focus:shadow-[0_0_0_4px_rgb(82_95_225/0.18)] focus:outline-none">
          {SORTS.filter(([k]) => k !== "distance" || hasLocation).map(([k, l]) => (
            <option key={l} value={k ?? ""}>
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

function ResultsTable({ r, p, basePath, bench }: { r: SearchResult; p: DirectoryParams; basePath: string; bench: Bench }) {
  const head = "sticky top-0 z-[1] border-b border-rule bg-sage px-3 py-3 text-left align-bottom text-[0.8125rem] font-extrabold tracking-[0.06em] text-ink uppercase";
  const cell = "border-b border-rule px-3 py-3 align-top";
  const sortHref = (sort: DirectoryParams["sort"]) => `${basePath}${directoryQueryString(p, { sort, page: 1 })}`;
  return (
    <div className="relative max-h-[75vh] overflow-auto rounded-[5px] border border-rule bg-card" role="region" aria-label="Results table" tabIndex={0}>
      <table className="w-full min-w-[860px] border-collapse text-[0.95rem]">
        <caption className="sr-only">Grammar schools matching your search</caption>
        <thead>
          <tr>
            <th scope="col" className={head}>
              <Link href={sortHref("name")} className="text-ink-2 no-underline hover:text-ink">
                School {p.sort === "name" ? "↓" : ""}
              </Link>
            </th>
            <th scope="col" className={head}>
              Type
            </th>
            <th scope="col" className={head}>
              Test
            </th>
            <th scope="col" className={head}>
              Catchment
            </th>
            <th scope="col" className={clsx(head, "text-right")}>
              <Link href={sortHref("gcse")} className="text-ink-2 no-underline hover:text-ink">
                Attainment 8 {p.sort === "gcse" ? "↓" : ""}
              </Link>
            </th>
            <th scope="col" className={clsx(head, "text-right")}>
              <Link href={sortHref("alevel")} className="text-ink-2 no-underline hover:text-ink">
                A level {p.sort === "alevel" ? "↓" : ""}
              </Link>
            </th>
            {r.location ? (
              <th scope="col" className={clsx(head, "text-right")}>
                Distance
              </th>
            ) : null}
            <th scope="col" className={head}>
              <span className="sr-only">Shortlist</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {r.items.map((s) => {
            const b = s.attainment8Year ? bench[s.attainment8Year] : undefined;
            const diff = s.attainment8 !== null && b !== undefined ? s.attainment8 - b : null;
            return (
              <tr key={s.id} className="transition-colors hover:bg-paper">
                <th scope="row" className={clsx(cell, "text-left font-semibold")}>
                  <Link href={`/schools/${s.slug}`} className="text-ink no-underline hover:text-green hover:underline">
                    {s.name}
                  </Link>
                  <span className="block text-small font-normal text-ink-2">{[s.town, s.laName].filter(Boolean).join(", ")}</span>
                </th>
                <td className={clsx(cell, "text-ink-2")}>
                  {SELECTIVITY_SHORT[s.selectivity]}
                  <span className="block text-small">{GENDER_LABEL[s.gender]}</span>
                </td>
                <td className={clsx(cell, "text-ink-2")}>{s.testNames?.join(", ") ?? "—"}</td>
                <td className={clsx(cell, "text-ink-2")}>{s.catchmentType ? CATCHMENT_LABEL[s.catchmentType] : "—"}</td>
                <td className={clsx(cell, "text-right font-mono")}>
                  {s.attainment8 !== null ? (
                    <>
                      {s.attainment8.toFixed(1)}
                      <span className="block text-[0.8125rem] text-ink-2">
                        {s.attainment8Year}
                        {diff !== null ? ` · ${diff >= 0 ? "+" : "−"}${Math.abs(diff).toFixed(1)} vs sel.` : ""}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={clsx(cell, "text-right font-mono")}>
                  {s.alevelGrade ? (
                    <>
                      {s.alevelGrade}
                      <span className="block text-[0.8125rem] text-ink-2">{s.alevelYear}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                {r.location ? <td className={clsx(cell, "text-right font-mono whitespace-nowrap")}>{s.distanceMiles !== null ? formatMiles(s.distanceMiles) : "—"}</td> : null}
                <td className={clsx(cell, "py-2")}>
                  <SaveButton slug={s.slug} name={s.name} variant="icon" />
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
 * The research desk: a filter rail, a toolbar of views and orderings, removable
 * filter chips, and results as a ledger, a table or a street map.
 */
export async function DirectoryDesk({ p, result, basePath, lockArea = false, entryYear, bench, heading = "Grammar schools" }: { p: DirectoryParams; result: SearchResult; basePath: string; lockArea?: boolean; entryYear: number; bench: Bench; heading?: string }) {
  const view = p.view ?? "list";
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const chips = await activeChips(p, basePath, lockArea);
  const offset = (p.page - 1) * result.pageSize;
  const href = (o: Partial<DirectoryParams>) => `${basePath}${directoryQueryString(p, o)}`;

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]">
      <aside aria-label="Filters" className="min-w-0">
        <details className="group/f rounded-[8px] border border-rule bg-card lg:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-semibold text-ink">
            <span className="flex items-center gap-2">
              <IconFilter size={18} /> Refine results
              {chips.length ? <span className="grid size-6 place-items-center rounded-full bg-green font-mono text-[0.8125rem] font-bold text-white">{chips.length}</span> : null}
            </span>
            <span className="text-small font-normal text-ink-2 group-open/f:hidden">Show</span>
            <span className="hidden text-small font-normal text-ink-2 group-open/f:inline">Hide</span>
          </summary>
          <div className="border-t border-rule bg-card p-4 [--rail-bg:var(--card)]">
            <Filters p={p} basePath={basePath} lockArea={lockArea} idPrefix="fm" />
          </div>
        </details>
        <div className="hidden overflow-hidden rounded-[var(--r-3)] bg-card shadow-[0_0_0_1px_var(--rule),var(--shadow-card)] [--rail-bg:var(--card)] lg:block">
          <p className="flex items-center justify-between gap-2 border-b border-rule px-4 py-3.5 font-display text-[1.25rem] text-ink">
            <span className="flex items-center gap-2">
              <IconFilter size={18} className="text-green" /> Filters
            </span>
            {chips.length ? (
              <Link href={basePath} className="font-sans text-[0.875rem] font-semibold text-cta no-underline hover:underline">
                Clear all
              </Link>
            ) : null}
          </p>
          <div className="px-4 pb-4">
            <Filters p={p} basePath={basePath} lockArea={lockArea} idPrefix="fd" />
          </div>
        </div>
      </aside>

      <section aria-labelledby="results-heading" className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <h2 id="results-heading" className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-[1.5rem] leading-tight text-ink sm:text-[1.625rem]" aria-live="polite">
              {heading}
              <span className="rounded-full bg-navy px-3 py-1 font-sans text-[0.875rem] font-bold text-white">
                <span className="num">{result.total}</span> {result.total === 1 ? "school" : "schools"}
              </span>
            </h2>
            <p className="mt-1.5 text-[0.9375rem] text-ink-2">
              {result.query ? <>Matching &ldquo;{result.query}&rdquo;. </> : null}
              {result.location ? <>Within {p.radius ?? 30} miles of {result.location.label}. </> : null}
              {pages > 1 ? `Showing ${offset + 1}–${Math.min(offset + result.pageSize, result.total)}.` : result.total ? "Showing all." : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SortForm p={p} basePath={basePath} hasLocation={!!result.location} />
            <nav aria-label="Result views" className="flex rounded-[var(--r-2)] border border-rule bg-card p-1 shadow-card">
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
                className={clsx("inline-flex min-h-10 items-center gap-1.5 rounded-[4px] px-3.5 text-[0.95rem] font-bold no-underline transition-colors duration-[var(--d-2)]", view === v ? "bg-green text-white" : "text-ink-2 hover:text-green")}
              >
                <Icon size={16} /> {label}
              </Link>
            ))}
            </nav>
          </div>
        </div>

        <TypeTabs p={p} href={href} />

        {chips.length ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="sr-only">Active filters:</span>
            <ul className="flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <li key={c.label}>
                  <Link href={c.href} className="group/chip inline-flex min-h-9 items-center gap-1.5 rounded-[4px] border border-green/30 bg-green-wash py-1 pr-2 pl-3 text-[0.92rem] font-semibold text-green no-underline transition-colors hover:border-green">
                    {c.label}
                    <IconClose size={14} className="transition-transform duration-[var(--d-1)] group-hover/chip:rotate-90" />
                    <span className="sr-only">— remove this filter</span>
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
          <Note tone="caution" className="mt-5">
            {result.locationError}
          </Note>
        ) : null}
        {result.location ? (
          <p className="mt-4 max-w-[70ch] text-small leading-relaxed text-ink-2">
            Distances are straight lines from the centre of {result.location.precision === "postcode_district" ? "the postcode district" : "your postcode"}. Schools measure from your exact home address using their own published method, so their figures will differ, and
            distance alone doesn&apos;t tell you whether a child is eligible.
          </p>
        ) : null}

        <div className="mt-6">
          {result.items.length === 0 ? (
            <Gap title="No schools match these filters">
              Try removing a filter or widening the distance. Admissions-rule filters only match schools whose {entryYear} policy we hold. <Link href="/methodology#coverage">see coverage</Link>.
            </Gap>
          ) : view === "map" ? (
            <MapDesk
              offset={offset}
              items={result.items.map((s) => ({ slug: s.slug, name: s.name, sub: [s.town, s.laName].filter(Boolean).join(", "), lat: s.lat, lng: s.lng, distance: s.distanceMiles !== null ? formatMiles(s.distanceMiles) : null }))}
              origin={result.location ? { lat: result.location.latitude, lng: result.location.longitude, label: result.location.label } : null}
            />
          ) : view === "table" ? (
            <ResultsTable r={result} p={p} basePath={basePath} bench={bench} />
          ) : (
            <>
              <p className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-ink-2">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="h-1.5 w-6 rounded-full bg-green-bright" /> Bar: Attainment 8 out of 90
                </span>
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="h-3.5 w-[2px] bg-copper" /> Tick: average for all selective schools that year
                </span>
              </p>
              <SchoolCards items={result.items} offset={offset} bench={bench} precision={result.location?.precision} />
            </>
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
      </section>
      <CompareTray />
    </div>
  );
}
