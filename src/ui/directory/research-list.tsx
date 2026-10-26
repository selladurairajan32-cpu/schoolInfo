import Link from "next/link";
import { clsx } from "clsx";
import { CATCHMENT_LABEL, EIF_GRADE, GENDER_LABEL, OUT_OF_AREA_LABEL } from "@/domain/labels";
import { formatDate, formatMiles } from "@/lib/format";
import type { SchoolDetail, SchoolListItem } from "@/server/schools";
import { IconArrow, IconPin } from "../icons";
import { CompareCheck } from "../shortlist";
import { Status } from "../status";
import { RowDisclosure } from "./row-disclosure";

type Bench = Record<string, number>;

/** Said once per list (or in the Northern Ireland group heading), never on every Northern Ireland row. */
const NI_NOTE = "Year 8 transfer. We hold intake and location for Northern Ireland schools; admissions criteria and results are not collected yet.";

const yearOf = (iso: string | null) => (iso ? iso.slice(0, 4) : "");
const pct = (n: number, d: number) => Math.round((n / d) * 100);
const AREA_LABEL: Record<string, string> = {
  achievement: "Achievement",
  attendance_and_behaviour: "Attendance and behaviour",
  curriculum_and_teaching: "Curriculum and teaching",
  inclusion: "Inclusion",
  leadership_and_governance: "Leadership and governance",
  personal_development_and_well_being: "Personal development",
  personal_development_and_wellbeing: "Personal development",
  safeguarding: "Safeguarding",
  early_years: "Early years",
  sixth_form: "Sixth form",
};

/** What we hold for a school, as five small marks rather than a sentence on every row. */
function coverage(s: SchoolListItem) {
  return [
    ["Entrance test", !!s.testNames?.length],
    ["Admissions policy", !!s.policyStatus],
    ["Offer history", s.firstPrefs !== null],
    ["Exam results", s.attainment8 !== null || s.alevelGrade !== null],
    ["Inspection", !!s.inspectionFramework],
  ] as const;
}

function Coverage({ s }: { s: SchoolListItem }) {
  const items = coverage(s);
  const held = items.filter(([, ok]) => ok).map(([l]) => l);
  return (
    <span className="inline-flex items-center gap-1" title={`Held: ${held.join(", ") || "none yet"}`}>
      <span aria-hidden className="flex gap-[3px]">
        {items.map(([l, ok]) => (
          <span key={l} className={clsx("size-[7px] rounded-full", ok ? "bg-green" : "border border-rule-strong bg-transparent")} />
        ))}
      </span>
      <span className="sr-only">Data held: {held.join(", ") || "none yet"}.</span>
    </span>
  );
}

function inspectionSummary(s: SchoolListItem): { main: string; sub: string | null } | null {
  if (!s.inspectionFramework) return null;
  const y = yearOf(s.inspectionDate);
  if (s.inspectionFramework === "report_card_2025") return { main: `Report card, ${y}`, sub: s.inspectionAchievement ? `Achievement: ${s.inspectionAchievement}` : null };
  if (s.inspectionFramework === "eif_2019" && s.inspectionGrade) return { main: EIF_GRADE[String(s.inspectionGrade)] ?? "Graded", sub: `Graded inspection, ${y}` };
  if (s.inspectionFramework === "eif_2019_ungraded") return { main: s.inspectionOutcome?.replace(/^School remains /, "Remains ") ?? "Ungraded inspection", sub: `Ungraded inspection, ${y}` };
  return { main: s.inspectionOutcome ?? "Inspected", sub: y };
}

/** The four visible facts, each a distinct kind of evidence. Empty kinds collapse rather than repeat a message. */
function Facts({ s, bench }: { s: SchoolListItem; bench: Bench }) {
  const b = s.attainment8Year ? bench[s.attainment8Year] : undefined;
  const diff = s.attainment8 !== null && b !== undefined ? s.attainment8 - b : null;
  const trend = s.firstPrefs !== null && s.firstPrefsEarlier ? Math.round(((s.firstPrefs - s.firstPrefsEarlier) / s.firstPrefsEarlier) * 100) : null;
  const insp = inspectionSummary(s);
  const cell = "min-w-0";
  const label = "text-[0.75rem] font-semibold tracking-[0.02em] text-ink-3 uppercase lg:sr-only";
  const main = "block text-[0.9375rem] leading-snug font-semibold text-ink";
  const sub = "block text-[0.8125rem] leading-snug text-ink-2";
  const none = "block text-[0.9375rem] text-ink-3";
  return (
    <>
      {/* With nothing recorded, the admissions cell only appears in the desktop columns; the coverage marks already say so. */}
      <div className={clsx(cell, !s.testNames?.length && !s.policyStatus && "hidden lg:block")}>
        <p className={label}>Admissions</p>
        {s.testNames?.length ? (
          <span className={main}>{s.testNames.join(", ")}</span>
        ) : !s.policyStatus ? (
          <span className={none}>
            —<span className="sr-only">No entrance test or admissions policy recorded yet</span>
          </span>
        ) : null}
        {s.policyStatus ? (
          <span className={clsx(sub, "mt-0.5 flex flex-wrap items-center gap-x-1.5")}>
            {s.catchmentType && s.catchmentType !== "unknown" ? CATCHMENT_LABEL[s.catchmentType] : "Policy held"}
            {s.pan ? ` · ${s.pan} places` : null}
            <Status status={s.policyStatus} quiet />
          </span>
        ) : null}
      </div>
      <div className={clsx(cell, "col-span-2 sm:col-span-1")}>
        <p className={label}>Demand{s.demandYear ? `, ${s.demandYear}` : ""}</p>
        {s.firstPrefs !== null && s.offers ? (
          <>
            <span className={main}>
              <span className="num">{s.firstPrefs}</span> first choices · <span className="num">{s.offers}</span> offers
            </span>
            <span className={sub}>
              {s.otherLaOffers !== null ? <span title="Share of offers made to children living in other council areas">{pct(s.otherLaOffers, s.offers)}% to other areas</span> : null}
              {trend !== null ? <span className={clsx("ml-1.5 whitespace-nowrap", trend > 0 ? "text-cta-deep" : "text-green-deep")}>{`${trend > 0 ? "↑" : trend < 0 ? "↓" : "→"} ${Math.abs(trend)}% in 3 yrs`}</span> : null}
            </span>
          </>
        ) : (
          <span className={none}>
            —<span className="sr-only">No offer data</span>
          </span>
        )}
      </div>
      <div className={cell}>
        <p className={label}>Results</p>
        {s.attainment8 !== null ? (
          <>
            <span className={main}>
              Attainment 8 <span className="num">{s.attainment8.toFixed(1)}</span>
              {diff !== null ? <span className={clsx("ml-1.5 text-[0.8125rem] font-semibold", diff >= 0 ? "text-green-deep" : "text-ink-2")}>{`${diff >= 0 ? "+" : "−"}${Math.abs(diff).toFixed(1)}`}</span> : null}
            </span>
            <span className={sub}>
              {s.attainment8Year}
              {s.alevelGrade ? ` · A level ${s.alevelGrade}` : s.hasSixthForm === false ? " · no sixth form" : ""}
            </span>
          </>
        ) : (
          <span className={none}>
            —<span className="sr-only">No results held</span>
          </span>
        )}
      </div>
      <div className={cell}>
        <p className={label}>Inspection</p>
        {insp ? (
          <>
            <span className={main}>{insp.main}</span>
            {insp.sub ? <span className={sub}>{insp.sub}</span> : null}
          </>
        ) : (
          <span className={none}>
            —<span className="sr-only">No inspection held</span>
          </span>
        )}
      </div>
    </>
  );
}

/** The expandable part: admissions, five years of offers, results in context, and where each figure comes from. */
function Details({ s, d, bench, entryYear }: { s: SchoolListItem; d: SchoolDetail | undefined; bench: Bench; entryYear: number }) {
  const b = s.attainment8Year ? bench[s.attainment8Year] : undefined;
  const peak = Math.max(1, ...(d?.history ?? []).map((h) => h.firstPrefs ?? 0));
  const h2 = "text-[0.8125rem] font-bold text-ink";
  return (
    <div className="grid gap-x-8 gap-y-5 border-t border-dashed border-rule pt-4 text-[0.875rem] sm:grid-cols-2 xl:grid-cols-4">
      <section>
        <h4 className={h2}>Admissions, September {entryYear}</h4>
        {s.policyStatus ? (
          <dl className="mt-1.5 grid gap-1 text-ink-2">
            <div>
              <dt className="inline text-ink-3">Out-of-area: </dt>
              <dd className="inline">{s.outOfAreaRoute && s.outOfAreaRoute !== "unknown" ? OUT_OF_AREA_LABEL[s.outOfAreaRoute] : "not documented"}</dd>
            </div>
            {d?.criteria.length ? (
              <div>
                <dt className="text-ink-3">Priority order</dt>
                <dd>
                  <ol className="mt-0.5 list-decimal pl-5">
                    {d.criteria.slice(0, 6).map((c) => (
                      <li key={c.rank}>{c.title}</li>
                    ))}
                  </ol>
                </dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="mt-1.5 text-ink-2">
            We haven&apos;t collected this policy yet. {s.nation === "england" ? "The school's admission authority publishes it each year." : "Each Northern Ireland school publishes its own criteria."}
          </p>
        )}
        <Link href={`/schools/${s.slug}/admissions`} className="mt-1.5 inline-flex items-center gap-1 font-semibold text-green-deep">
          Admissions detail <IconArrow size={13} />
        </Link>
      </section>
      <section>
        <h4 className={h2}>Offer day, last five years</h4>
        {d?.history.length ? (
          <table className="mt-1.5 w-full text-left">
            <caption className="sr-only">First preferences, offers and offers to other council areas by year of entry</caption>
            <thead className="text-[0.75rem] text-ink-3">
              <tr>
                <th scope="col" className="font-semibold">Year</th>
                <th scope="col" className="font-semibold">1st choices</th>
                <th scope="col" className="text-right font-semibold">Offers</th>
                <th scope="col" className="text-right font-semibold">Other areas</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[0.8125rem] text-ink">
              {d.history.map((h) => (
                <tr key={h.year}>
                  <th scope="row" className="py-0.5 font-normal text-ink-2">{h.year}</th>
                  <td className="py-0.5">
                    <span className="flex items-center gap-1.5">
                      <span aria-hidden className="h-1.5 rounded-full bg-green-bright" style={{ width: `${((h.firstPrefs ?? 0) / peak) * 3.5}rem` }} />
                      {h.firstPrefs ?? "—"}
                    </span>
                  </td>
                  <td className="py-0.5 text-right">{h.offers ?? "—"}</td>
                  <td className="py-0.5 text-right">{h.otherLaOffers ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-1.5 text-ink-2">{s.nation === "england" ? "No offer-day figures are published for this school." : "Offer-day figures are published for England only."}</p>
        )}
        {d?.history.length ? <p className="mt-1 text-[0.8125rem] text-ink-3">First choices include children who did not reach the qualifying standard. Past demand is not a chance of a place.</p> : null}
      </section>
      <section>
        <h4 className={h2}>Results in context</h4>
        {s.attainment8 !== null ? (
          <ul className="mt-1.5 grid gap-1 text-ink-2">
            <li>
              Attainment 8 <b className="font-mono text-ink">{s.attainment8.toFixed(1)}</b> against a selective-school average of {b !== undefined ? <b className="font-mono text-ink">{b.toFixed(1)}</b> : "—"} ({s.attainment8Year})
            </li>
            {s.engMath5 !== null ? (
              <li>
                <b className="font-mono text-ink">{Math.round(s.engMath5)}%</b> grade 5 or above in English and maths ({s.engMath5Year})
              </li>
            ) : null}
            <li>{s.alevelGrade ? <>A level average <b className="font-mono text-ink">{s.alevelGrade}</b> per entry ({s.alevelYear})</> : s.hasSixthForm ? "No A level figure published" : "No sixth form"}</li>
            <li className="text-[0.8125rem] text-ink-3">Progress 8 was not published for 2024/25 or 2025/26.</li>
          </ul>
        ) : (
          <p className="mt-1.5 text-ink-2">{s.nation === "england" ? "No results are published for this school." : "England's DfE tables don't cover Northern Ireland; no NI results are held yet."}</p>
        )}
        {d?.evaluations.length ? (
          <>
            <h4 className={clsx(h2, "mt-3")}>Report card areas</h4>
            <ul className="mt-1 grid gap-0.5 text-ink-2">
              {d.evaluations.map((e) => (
                <li key={e.area}>
                  {AREA_LABEL[e.area] ?? e.area.replace(/_/g, " ")}: <span className="font-semibold text-ink">{e.grade}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>
      <section>
        <h4 className={h2}>Sources</h4>
        <ul className="mt-1.5 grid gap-1 text-ink-2">
          <li>{s.nation === "england" ? "School record: GIAS (DfE)" : "School record: Department of Education NI"}</li>
          {s.firstPrefs !== null ? <li>Offers: DfE school-level applications and offers, {s.demandYear}</li> : null}
          {s.attainment8 !== null ? <li>Results: DfE performance tables</li> : null}
          {s.inspectionDate ? <li>Inspection: Ofsted, {formatDate(s.inspectionDate)}</li> : null}
          {s.lastCheckedAt ? <li className="text-ink-3">Record last checked {formatDate(s.lastCheckedAt.slice(0, 10))}</li> : null}
        </ul>
        <Link href={`/schools/${s.slug}`} className="mt-1.5 inline-flex items-center gap-1 font-semibold text-green-deep">
          Full profile <IconArrow size={13} />
        </Link>
      </section>
    </div>
  );
}

/**
 * Option A: a dense research list. One ruled row per school with the same four kinds of evidence in fixed
 * columns, so schools can be compared by eye; everything else opens in place.
 */
export function ResearchList({ items, details, bench, entryYear, grouped, precision }: { items: SchoolListItem[]; details: Record<number, SchoolDetail>; bench: Bench; entryYear: number; grouped: boolean; precision?: "postcode_centroid" | "postcode_district" }) {
  const cols = "lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)_minmax(0,1.35fr)_minmax(0,1.05fr)_minmax(0,0.95fr)]";
  const groupOf = (s: SchoolListItem) => (s.nation === "northern_ireland" ? "Northern Ireland" : [s.regionName, s.laName].filter(Boolean).join(" · "));
  const groups = items.map(groupOf);
  return (
    <div className="rounded-[var(--r-3)] bg-card shadow-[0_0_0_1px_var(--rule),var(--shadow-card)]">
      <div aria-hidden className={clsx("sticky top-[var(--header-h)] z-[2] hidden gap-x-5 rounded-t-[var(--r-3)] border-b border-rule bg-sage px-5 py-2 text-[0.75rem] font-bold tracking-[0.03em] text-ink-2 uppercase lg:grid", cols)}>
        <span>School</span>
        <span>Admissions</span>
        <span>Demand</span>
        <span>Results</span>
        <span>Inspection</span>
      </div>
      {/* The reading key: inline from 640px, folded away on phones so the first school appears sooner. */}
      <div className="hidden flex-wrap items-center gap-x-4 gap-y-1 border-b border-rule px-5 py-2 text-[0.8125rem] text-ink-2 sm:flex">
        <span>
          <b className="font-semibold text-ink">Demand:</b> applications naming the school first, offers made, the share of offers to children from other council areas, and the change in first choices over three years.
        </span>
        <span>
          <b className="font-semibold text-ink">Attainment 8:</b> difference from the selective-school average that year.
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-[7px] rounded-full bg-green" /> held
          <span aria-hidden className="ml-1 size-[7px] rounded-full border border-rule-strong" /> not yet collected: test, policy, offers, results, inspection
        </span>
            </div>
      <details className="border-b border-rule px-4 py-2 text-[0.8125rem] text-ink-2 sm:hidden">
        <summary className="min-h-8 cursor-pointer font-semibold text-green-deep">How to read this list</summary>
        <div className="mt-1 grid gap-1">
        <span>
          <b className="font-semibold text-ink">Demand:</b> applications naming the school first, offers made, the share of offers to children from other council areas, and the change in first choices over three years.
        </span>
        <span>
          <b className="font-semibold text-ink">Attainment 8:</b> difference from the selective-school average that year.
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-[7px] rounded-full bg-green" /> held
          <span aria-hidden className="ml-1 size-[7px] rounded-full border border-rule-strong" /> not yet collected: test, policy, offers, results, inspection
        </span>
              </div>
      </details>
      {!grouped && items.some((s) => s.nation === "northern_ireland") ? <p className="border-b border-rule px-4 py-2 text-[0.8125rem] text-ink-2 sm:px-5">{NI_NOTE}</p> : null}
      <ol>
        {items.map((s, i) => {
          const ni = s.nation === "northern_ireland";
          const group = groups[i]!;
          const header = grouped && (i === 0 || group !== groups[i - 1]);
          return (
            <li key={s.id} className="border-b border-rule last:border-b-0">
              {header ? (
                <p className="border-b border-rule bg-paper px-4 py-1.5 text-[0.8125rem] sm:px-5">
                  <span className="font-bold text-green-deep">{group}</span>
                  {ni ? <span className="block text-ink-2 sm:ml-2 sm:inline">{NI_NOTE}</span> : null}
                </p>
              ) : null}
              <div className="px-4 py-3 transition-colors hover:bg-green-wash/25 sm:px-5">
                <div className={clsx("grid gap-x-5 gap-y-2", cols)}>
                  <div className="min-w-0">
                    <h3 className="text-[1.0625rem] leading-snug font-bold">
                      <Link href={`/schools/${s.slug}`} className="text-ink no-underline hover:text-green hover:underline">
                        {s.name}
                      </Link>
                    </h3>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.875rem] text-ink-2">
                      <span className="inline-flex items-center gap-1">
                        <IconPin size={13} className="shrink-0 text-cta" />
                        {s.town ?? s.laName ?? "Location not recorded"}
                      </span>
                      <span aria-hidden className="text-ink-3">·</span>
                      <span>{s.gender === "unknown" ? "Intake not recorded" : GENDER_LABEL[s.gender]}</span>
                      {s.selectivity === "partially_selective" ? <span className="rounded-[3px] bg-copper-wash px-1.5 text-[0.8125rem] font-semibold text-copper-ink">Partially selective</span> : null}
                      {s.boarding === "boarding" ? <span>· Boarding</span> : null}
                      {s.distanceMiles !== null ? (
                        <span className="rounded-full bg-green-wash px-2 font-mono text-[0.8125rem] font-bold text-green" title={precision === "postcode_district" ? "Straight-line distance from the centre of the postcode district" : "Straight-line distance from your postcode's centre point"}>
                          {formatMiles(s.distanceMiles)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  {ni ? null : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] lg:contents">
                      <Facts s={s} bench={bench} />
                    </div>
                  )}
                  <RowDisclosure name={s.name} before={<Coverage s={s} />} after={
                      <span className="flex items-center gap-3">
                        <CompareCheck slug={s.slug} name={s.name} />
                        <Link href={`/schools/${s.slug}`} className="inline-flex min-h-9 items-center gap-1 rounded-[5px] border border-green px-2.5 whitespace-nowrap text-[0.875rem] font-bold text-green no-underline hover:bg-green hover:text-white">
                          View<span className="hidden sm:inline">school</span>
                          <span className="sr-only">: {s.name}</span> <IconArrow size={13} />
                        </Link>
                      </span>
                    } className="order-last lg:order-none lg:col-span-5 lg:row-start-2" panelClassName="order-last lg:order-none lg:col-span-5 lg:row-start-3">
                    <Details s={s} d={details[s.id]} bench={bench} entryYear={entryYear} />
                  </RowDisclosure>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
