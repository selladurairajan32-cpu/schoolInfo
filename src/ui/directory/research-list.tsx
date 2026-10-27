import Link from "next/link";
import { clsx } from "clsx";
import { CATCHMENT_LABEL, EIF_GRADE, GENDER_LABEL, OUT_OF_AREA_LABEL } from "@/domain/labels";
import { formatDate, formatMiles } from "@/lib/format";
import type { SchoolDetail, SchoolListItem } from "@/server/schools";
import { IconArrow } from "../icons";
import { CompareCheck } from "../shortlist";
import { Status } from "../status";
import { RowDisclosure } from "./row-disclosure";

type Bench = Record<string, number>;

const yearOf = (iso: string | null) => (iso ? iso.slice(0, 4) : "");
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

/** Attainment 8 against the selective-school average for the same year, in words rather than a signed number. */
function a8Context(s: SchoolListItem, bench: Bench) {
  const b = s.attainment8Year ? bench[s.attainment8Year] : undefined;
  if (s.attainment8 === null || b === undefined) return null;
  const d = Math.round((s.attainment8 - b) * 10) / 10;
  if (Math.abs(d) < 0.5) return { text: "about the selective-school average", tone: "same" as const, avg: b };
  return { text: `${Math.abs(d).toFixed(1)} points ${d > 0 ? "above" : "below"} the selective-school average`, tone: d > 0 ? ("above" as const) : ("below" as const), avg: b };
}

const trendText = (t: { pct: number; since: number }) => (t.pct === 0 ? `First preferences level with ${t.since}` : `First preferences ${t.pct > 0 ? "up" : "down"} ${Math.abs(t.pct)}% since ${t.since}`);

function trend(s: SchoolListItem) {
  if (s.firstPrefs === null || !s.firstPrefsEarlier || !s.demandYear) return null;
  const pct = Math.round(((s.firstPrefs - s.firstPrefsEarlier) / s.firstPrefsEarlier) * 100);
  return { pct, since: s.demandYear - 3 };
}

/** The latest inspection, in the words of its own framework: an older single grade, an ungraded visit, or a report card. */
function inspection(s: SchoolListItem): { main: string; sub: string } | null {
  if (!s.inspectionFramework) return null;
  const y = yearOf(s.inspectionDate);
  if (s.inspectionFramework === "report_card_2025") return { main: s.inspectionAchievement ? `Achievement: ${s.inspectionAchievement}` : "Report card", sub: `Ofsted report card, ${y}` };
  if (s.inspectionFramework === "eif_2019" && s.inspectionGrade) return { main: EIF_GRADE[String(s.inspectionGrade)] ?? "Graded", sub: `Ofsted graded inspection, ${y}` };
  if (s.inspectionFramework === "eif_2019_ungraded") return { main: s.inspectionOutcome?.replace(/^School remains /, "Remains ") ?? "Ungraded inspection", sub: `Ofsted ungraded inspection, ${y}` };
  return { main: s.inspectionOutcome ?? "Inspected", sub: `Ofsted, ${y}` };
}

const LABEL = "text-[0.8125rem] text-ink-2";
const VALUE = "font-display text-[1.125rem] leading-tight font-extrabold text-ink";
const SUB = "text-[0.875rem] leading-snug text-ink-2";

/** The three research dimensions shown on every row. Missing evidence collapses to a dash rather than a sentence. */
function Dimensions({ s, bench }: { s: SchoolListItem; bench: Bench }) {
  const ctx = a8Context(s, bench);
  const t = trend(s);
  const insp = inspection(s);
  const dash = (
    <span className="text-ink-3" aria-label="Not held">
      —
    </span>
  );
  return (
    <>
      <div className="min-w-0">
        <p className={LABEL}>Applications{s.demandYear ? `, ${s.demandYear}` : ""}</p>
        {s.firstPrefs !== null && s.offers ? (
          <>
            <p className={VALUE}>
              <span className="num">{s.firstPrefs}</span> <span className="font-sans text-[0.9375rem] font-semibold text-ink-2">first preferences</span>
            </p>
            <p className={SUB}>
              <span className="num font-semibold text-ink">{s.offers}</span> offers made
            </p>
            {t ? <p className="text-[0.8125rem] text-ink-3">{trendText(t)}</p> : null}
          </>
        ) : (
          <p className={VALUE}>{dash}</p>
        )}
      </div>
      <div className="min-w-0">
        <p className={LABEL}>GCSE results{s.attainment8Year ? `, ${s.attainment8Year}` : ""}</p>
        {s.attainment8 !== null ? (
          <>
            <p className={VALUE}>
              <span className="num">{s.attainment8.toFixed(1)}</span> <span className="font-sans text-[0.9375rem] font-semibold text-ink-2">Attainment 8</span>
            </p>
            {ctx ? <p className={clsx(SUB, ctx.tone === "above" && "text-green-deep")}>{ctx.text}</p> : null}
          </>
        ) : (
          <p className={VALUE}>{dash}</p>
        )}
      </div>
      <div className="min-w-0">
        <p className={LABEL}>Inspection</p>
        {insp ? (
          <>
            <p className={clsx(VALUE, "text-[1.0625rem]")}>{insp.main}</p>
            <p className={SUB}>{insp.sub}</p>
          </>
        ) : (
          <p className={VALUE}>{dash}</p>
        )}
      </div>
    </>
  );
}

/** Phones: the same three dimensions as one plain line each, so a row stays short. */
function PhoneFacts({ s, bench }: { s: SchoolListItem; bench: Bench }) {
  const ctx = a8Context(s, bench);
  const insp = inspection(s);
  const b = "font-bold text-ink";
  return (
    <ul className="grid gap-1 text-[0.9375rem] leading-snug text-ink-2 sm:hidden">
      {s.firstPrefs !== null && s.offers ? (
        <li>
          <b className={b}>{s.firstPrefs}</b> first preferences, <b className={b}>{s.offers}</b> offers ({s.demandYear})
        </li>
      ) : null}
      {s.attainment8 !== null ? (
        <li>
          Attainment 8 <b className={b}>{s.attainment8.toFixed(1)}</b>
          {ctx ? `, ${ctx.text.replace("the selective-school average", "selective average")}` : ""} ({s.attainment8Year})
        </li>
      ) : null}
      {insp ? (
        <li>
          Ofsted: <b className={b}>{insp.main}</b> ({insp.sub.replace(/^Ofsted /, "")})
        </li>
      ) : null}
    </ul>
  );
}

/** First preferences and offers over the years held: bars for offers, a line for first preferences. */
function DemandChart({ history }: { history: SchoolDetail["history"] }) {
  const rows = [...history].filter((h) => h.firstPrefs !== null || h.offers !== null).sort((a, b) => a.year - b.year);
  if (rows.length < 2) return null;
  const W = 320;
  const H = 120;
  const pad = { l: 30, r: 8, t: 8, b: 20 };
  const max = Math.max(...rows.map((r) => Math.max(r.firstPrefs ?? 0, r.offers ?? 0))) * 1.1;
  const step = (W - pad.l - pad.r) / rows.length;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const x = (i: number) => pad.l + step * i + step / 2;
  const line = rows.map((r, i) => (r.firstPrefs !== null ? `${i ? "L" : "M"}${x(i).toFixed(1)},${y(r.firstPrefs).toFixed(1)}` : "")).join("");
  return (
    <figure className="mt-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[26rem]" role="img" aria-label={`First preferences and offers, ${rows[0]!.year} to ${rows.at(-1)!.year}. The table below gives the figures.`}>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={pad.l} x2={W - pad.r} y1={y(max * f * 0.9)} y2={y(max * f * 0.9)} stroke="var(--rule)" />
            <text x={pad.l - 4} y={y(max * f * 0.9) + 3} textAnchor="end" fontSize="9" fill="var(--ink-3)">
              {Math.round(max * f * 0.9)}
            </text>
          </g>
        ))}
        {rows.map((r, i) =>
          r.offers !== null ? <rect key={r.year} x={x(i) - step * 0.28} width={step * 0.56} y={y(r.offers)} height={H - pad.b - y(r.offers)} rx="2" fill="var(--green-wash)" stroke="var(--green-bright)" strokeWidth="0.8" /> : null,
        )}
        <path d={line} fill="none" stroke="var(--cta)" strokeWidth="2" />
        {rows.map((r, i) => (r.firstPrefs !== null ? <circle key={r.year} cx={x(i)} cy={y(r.firstPrefs)} r="2.6" fill="var(--cta)" /> : null))}
        {rows.map((r, i) => (
          <text key={r.year} x={x(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="var(--ink-3)">
            {String(r.year).slice(2)}
          </text>
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-x-4 text-[0.8125rem] text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-4 bg-cta" /> First preferences
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[2px] border border-green-bright bg-green-wash" /> Offers made
        </span>
      </figcaption>
    </figure>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0">
      <h4 className="text-[0.9375rem] font-bold text-ink">{title}</h4>
      <div className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

/** The expanded research summary: five short sections, two columns on wide screens and one on phones. */
function Details({ s, d, bench, entryYear }: { s: SchoolListItem; d: SchoolDetail | undefined; bench: Bench; entryYear: number }) {
  const ctx = a8Context(s, bench);
  const latest = d?.history[0];
  const coverage: [string, boolean][] = [
    ["Entrance test", !!s.testNames?.length],
    [`Admissions policy, ${entryYear}`, !!s.policyStatus],
    ["Applications and offers", s.firstPrefs !== null],
    ["Exam results", s.attainment8 !== null],
    ["Inspection", !!s.inspectionFramework],
  ];
  return (
    <div className="mt-3 grid gap-x-10 gap-y-5 rounded-[var(--r-3)] bg-paper p-4 sm:p-5 lg:grid-cols-2">
      <Section title="Admissions and eligibility">
        <p>
          {s.testNames?.length ? (
            <>
              Entrance test: <b className="font-semibold text-ink">{s.testNames.join(", ")}</b>.
            </>
          ) : (
            "We have not yet recorded which entrance test this school uses."
          )}
        </p>
        {s.policyStatus ? (
          <>
            <p className="mt-1">
              {s.catchmentType && s.catchmentType !== "unknown" ? CATCHMENT_LABEL[s.catchmentType] : "Admissions policy held"}
              {s.pan ? `, ${s.pan} places for September ${entryYear}` : ""}. Out-of-area applicants: {s.outOfAreaRoute && s.outOfAreaRoute !== "unknown" ? OUT_OF_AREA_LABEL[s.outOfAreaRoute]?.toLowerCase() : "not documented"}. <Status status={s.policyStatus} quiet />
            </p>
            {d?.criteria.length ? (
              <ol className="mt-1.5 list-decimal pl-5">
                {d.criteria.slice(0, 6).map((c) => (
                  <li key={c.rank}>{c.title}</li>
                ))}
              </ol>
            ) : null}
          </>
        ) : (
          <p className="mt-1">Its September {entryYear} admissions policy has not been collected yet; the school publishes it on its own website.</p>
        )}
        <Link href={`/schools/${s.slug}/admissions`} className="mt-1.5 inline-flex items-center gap-1 font-semibold text-green-deep">
          Admissions detail <IconArrow size={13} />
        </Link>
      </Section>

      <Section title="Historical applications and offers">
        {d?.history.length ? (
          <>
            <DemandChart history={d.history} />
            <table className="mt-2 w-full max-w-[26rem] text-left text-[0.875rem]">
              <caption className="sr-only">Applications naming the school first, offers made and offers to children living in other council areas, by year of entry</caption>
              <thead className="text-[0.8125rem] text-ink-3">
                <tr>
                  <th scope="col" className="font-semibold">Entry</th>
                  <th scope="col" className="text-right font-semibold">First preferences</th>
                  <th scope="col" className="text-right font-semibold">Offers</th>
                  <th scope="col" className="text-right font-semibold">Offers, other areas</th>
                </tr>
              </thead>
              <tbody className="font-mono text-ink">
                {d.history.slice(0, 5).map((h) => (
                  <tr key={h.year} className="border-t border-rule">
                    <th scope="row" className="py-1 font-sans font-normal text-ink-2">{h.year}</th>
                    <td className="py-1 text-right">{h.firstPrefs ?? "—"}</td>
                    <td className="py-1 text-right">{h.offers ?? "—"}</td>
                    <td className="py-1 text-right">{h.otherLaOffers ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {latest?.offers && latest.otherLaOffers !== null ? (
              <p className="mt-1.5 text-[0.875rem]">
                In {latest.year}, {latest.otherLaOffers} of {latest.offers} offers went to children living in other council areas. This shows where offered children lived, not who is eligible.
              </p>
            ) : null}
          </>
        ) : (
          <p>{s.nation === "england" ? "No offer-day figures are published for this school." : "Offer-day figures are published for schools in England only."}</p>
        )}
      </Section>

      <Section title="Academic results">
        {s.attainment8 !== null ? (
          <ul className="grid gap-1">
            <li>
              GCSE Attainment 8: <b className="font-mono text-ink">{s.attainment8.toFixed(1)}</b> in {s.attainment8Year}
              {ctx ? `, ${ctx.text} (${ctx.avg.toFixed(1)})` : ""}.
            </li>
            {s.engMath5 !== null ? (
              <li>
                <b className="font-mono text-ink">{Math.round(s.engMath5)}%</b> of pupils achieved grade 5 or above in English and maths ({s.engMath5Year}).
              </li>
            ) : null}
            <li>{s.alevelGrade ? <>A level: an average grade of <b className="font-mono text-ink">{s.alevelGrade}</b> per entry ({s.alevelYear}).</> : s.hasSixthForm ? "No A level figure is published." : "The school has no sixth form."}</li>
          </ul>
        ) : (
          <p>{s.nation === "england" ? "No results are published for this school." : "England's DfE performance tables don't cover Northern Ireland schools, and no Northern Ireland results are held yet."}</p>
        )}
      </Section>

      <Section title="Inspection findings">
        {s.inspectionFramework ? (
          <>
            <p>{inspection(s)?.sub}{s.inspectionDate ? ` (${formatDate(s.inspectionDate)})` : ""}.</p>
            {d?.evaluations.length ? (
              <ul className="mt-1 grid gap-0.5">
                {d.evaluations.map((e) => (
                  <li key={e.area}>
                    {AREA_LABEL[e.area] ?? e.area.replace(/_/g, " ")}: <span className="font-semibold text-ink">{e.grade}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 font-semibold text-ink">{inspection(s)?.main}</p>
            )}
            <p className="mt-1 text-[0.8125rem] text-ink-3">Report cards and older Ofsted grades use different scales and are not converted.</p>
          </>
        ) : (
          <p>{s.nation === "england" ? "No inspection is held for this school." : "Northern Ireland schools are inspected by the Education and Training Inspectorate; these reports are not held yet."}</p>
        )}
      </Section>

      <section className="min-w-0 lg:col-span-2">
        <h4 className="text-[0.9375rem] font-bold text-ink">Sources and coverage</h4>
        <ul className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[0.875rem] text-ink-2">
          {coverage.map(([label, ok]) => (
            <li key={label} className="inline-flex items-center gap-1.5">
              <span aria-hidden className={clsx("size-2 rounded-full", ok ? "bg-green" : "border border-rule-strong")} />
              {label}: <span className={ok ? "font-semibold text-ink" : ""}>{ok ? "held" : "not yet collected"}</span>
            </li>
          ))}
        </ul>
        <p className="mt-1.5 text-[0.8125rem] text-ink-3">
          {s.nation === "england" ? "School record: GIAS (DfE)" : "School record: Department of Education NI"}
          {s.firstPrefs !== null ? ` · Applications and offers: DfE, ${s.demandYear}` : ""}
          {s.attainment8 !== null ? " · Results: DfE performance tables" : ""}
          {s.inspectionDate ? " · Inspection: Ofsted" : ""}
          {s.lastCheckedAt ? ` · Record checked ${formatDate(s.lastCheckedAt.slice(0, 10))}` : ""}.{" "}
          <Link href={`/schools/${s.slug}`} className="font-semibold text-green-deep">
            Full profile
          </Link>
        </p>
      </section>
    </div>
  );
}

/**
 * The research list: one row per school with its name and type first, then three research dimensions
 * (applications, GCSE results, inspection) in aligned columns, and a research summary that opens in place.
 */
export function ResearchList({ items, details, bench, entryYear, grouped, precision }: { items: SchoolListItem[]; details: Record<number, SchoolDetail>; bench: Bench; entryYear: number; grouped: boolean; precision?: "postcode_centroid" | "postcode_district" }) {
  const cols = "md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]";
  const groupOf = (s: SchoolListItem) => (s.nation === "northern_ireland" ? "Northern Ireland" : [s.regionName, s.laName].filter(Boolean).join(" · "));
  const groups = items.map(groupOf);
  const hasNI = items.some((s) => s.nation === "northern_ireland");
  return (
    <div className="overflow-hidden rounded-[var(--r-3)] bg-card shadow-[0_0_0_1px_var(--rule),var(--shadow-card)]">
      {hasNI ? <p className="border-b border-rule bg-paper px-4 py-2 text-[0.875rem] text-ink-2 sm:px-5">Northern Ireland schools admit at Year 8. We hold their intake and location; admissions criteria, results and inspections are not collected yet.</p> : null}
      <ol>
        {items.map((s, i) => {
          const ni = s.nation === "northern_ireland";
          const header = grouped && (i === 0 || groups[i] !== groups[i - 1]);
          return (
            <li key={s.id} className="border-b border-rule last:border-b-0">
              {header ? <p className="border-b border-rule bg-sage/70 px-4 py-1.5 text-[0.8125rem] font-bold text-green-deep sm:px-5">{groups[i]}</p> : null}
              <div className="px-4 py-3.5 transition-colors duration-[var(--d-2)] hover:bg-green-wash/25 sm:px-5 sm:py-4">
                <div className={clsx("grid gap-x-6 gap-y-2.5 sm:gap-y-3", cols)}>
                  <div className="min-w-0 md:col-span-3 xl:col-span-1">
                    <h3 className="font-display text-[1.1875rem] leading-snug font-extrabold sm:text-[1.25rem]">
                      <Link href={`/schools/${s.slug}`} className="text-ink no-underline hover:text-green hover:underline">
                        {s.name}
                      </Link>
                    </h3>
                    <p className="mt-0.5 text-[0.9375rem] text-ink-2">
                      {[s.town, s.laName].filter((x, j, a) => x && a.indexOf(x) === j).join(", ") || "Location not recorded"}
                      {s.distanceMiles !== null ? (
                        <span className="ml-2 rounded-full bg-green-wash px-2 py-0.5 font-mono text-[0.8125rem] font-bold whitespace-nowrap text-green" title={precision === "postcode_district" ? "Straight-line distance from the centre of the postcode district" : "Straight-line distance from your postcode's centre point"}>
                          {formatMiles(s.distanceMiles)}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1.5 flex flex-wrap gap-1 text-[0.8125rem] font-semibold sm:gap-1.5">
                      {s.gender !== "unknown" ? <span className="rounded-[4px] bg-sage px-2 py-0.5 text-ink">{GENDER_LABEL[s.gender]}</span> : null}
                      <span className={clsx("rounded-[4px] px-2 py-0.5", s.selectivity === "partially_selective" ? "bg-copper-wash text-copper-ink" : "bg-sage text-ink")}>{s.selectivity === "partially_selective" ? "Partially selective" : "Fully selective"}</span>
                      {s.testNames?.length ? <span className="rounded-[4px] bg-green-wash px-2 py-0.5 text-green-deep">{s.testNames.join(", ")}</span> : null}
                      {ni ? <span className="rounded-[4px] bg-sage px-2 py-0.5 text-ink">Year 8 entry</span> : null}
                      {s.boarding === "boarding" ? <span className="rounded-[4px] bg-sage px-2 py-0.5 text-ink">Boarding</span> : null}
                    </p>
                  </div>
                  {ni ? null : (
                    <>
                      <PhoneFacts s={s} bench={bench} />
                      <div className="hidden gap-x-4 gap-y-3 sm:grid sm:grid-cols-3 md:contents">
                        <Dimensions s={s} bench={bench} />
                      </div>
                    </>
                  )}
                </div>
                <RowDisclosure
                  name={s.name}
                  className="mt-3"
                  before={<CompareCheck slug={s.slug} name={s.name} />}
                  after={
                    <Link href={`/schools/${s.slug}`} className="inline-flex min-h-9 items-center gap-1 rounded-[5px] px-1 text-[0.875rem] font-bold whitespace-nowrap text-green-deep no-underline hover:text-green hover:underline">
                      View school<span className="sr-only">: {s.name}</span> <IconArrow size={13} />
                    </Link>
                  }
                >
                  <Details s={s} d={details[s.id]} bench={bench} entryYear={entryYear} />
                </RowDisclosure>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
