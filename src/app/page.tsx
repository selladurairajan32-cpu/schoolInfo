import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { GENDER_LABEL } from "@/domain/labels";
import { ADMISSIONS_GUIDES, READING_PATHS } from "@/content/guides";
import { defaultEntryYear } from "@/lib/academic-year";
import { formatDate, formatWeekdayDate, relativeAge } from "@/lib/format";
import { SITE } from "@/lib/site";
import { loadComparison } from "@/server/compare";
import {
  areaIndex,
  cycleEvents,
  dataFreshness,
  featuredSchools,
  selectiveA8,
  upcomingEvents,
} from "@/server/insights";
import { allSchoolPoints, siteStats } from "@/server/schools";
import { HeroMap } from "@/ui/home/hero-map";
import { HomeFinder } from "@/ui/home/finder";
import {
  IconArrow,
  IconBook,
  IconCalendar,
  IconCompare,
  IconInfo,
  IconLadder,
  IconMap,
  IconPin,
  IconRoute,
  IconSeal,
  IconTarget,
} from "@/ui/icons";
import { ButtonLink, Kicker, Page } from "@/ui/kit";
import { Status } from "@/ui/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name}: find the right grammar school, understand your chances, plan your next step`,
  },
  description:
    "Find grammar schools in England and Northern Ireland, see how each one admits pupils, compare results and inspections side by side, and plan your application, with every fact sourced.",
  alternates: { canonical: "/" },
};

/** Section title: eyebrow, heading, optional lede, and an optional action on the right. */
function Head({
  id,
  kicker,
  title,
  lede,
  action,
}: {
  id: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div data-reveal className="max-w-[46rem]">
        <Kicker>{kicker}</Kicker>
        <h2 id={id} className="mt-2 text-h2 text-ink">
          {title}
        </h2>
        {lede ? (
          <p className="mt-3 text-[1.0625rem] leading-[1.65] text-ink-2">
            {lede}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

const SECTION = "py-[clamp(2rem,1.4rem+2.6vw,4rem)]";
const PANEL =
  "rounded-[var(--r-3)] bg-card shadow-[0_0_0_1px_var(--rule),var(--shadow-card)]";

export default async function HomePage() {
  const entryYear = defaultEntryYear();
  const [stats, events, freshness, england, featured, index, points, bench] =
    await Promise.all([
      siteStats(),
      upcomingEvents(4),
      dataFreshness(),
      cycleEvents("england", entryYear),
      featuredSchools(4),
      areaIndex(),
      allSchoolPoints(),
      selectiveA8(),
    ]);
  const comparison =
    featured.length >= 3
      ? await loadComparison(
          featured.slice(0, 3).map((f) => f.slug),
          entryYear,
        )
      : null;
  const closing = england.find(
    (e) => e.event_type === "application_deadline" && e.scope === "nation",
  );
  const offerDay = england.find(
    (e) => e.event_type === "national_offer_day" && e.scope === "nation",
  );
  const refreshed = freshness
    .map((f) => f.last_success)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);
  const benchYears = Object.keys(bench).sort();
  const latestYear = benchYears.at(-1);

  /* Comparison preview: the first rows of each group that hold real values, so the table stays short. */
  const compareRows = comparison
    ? (["admissions", "results", "inspection", "demand"] as const).flatMap(
        (g) =>
          comparison.rows
            .filter(
              (r) =>
                r.group === g &&
                r.values.some((v) => v && v !== "—" && v !== "Not recorded"),
            )
            .slice(0, g === "results" ? 2 : 1),
      )
    : [];
  const groupLabel = {
    admissions: "Admissions",
    results: "Academics",
    inspection: "Inspection",
    demand: "Demand",
  } as const;

  const journeys = [
    {
      title: "Preparing for the 11+",
      text: "Which test your area uses, when it is sat and how scores are used.",
      href: "/11-plus",
      Icon: IconTarget,
    },
    {
      title: "Year 8 transfer in Northern Ireland",
      text: "The SEAG assessment, each school's criteria and the Education Authority process.",
      href: "/admissions/northern-ireland",
      Icon: IconRoute,
    },
    {
      title: "Moving home",
      text: "How each school uses your address, what counts as home and when to move.",
      href: "/admissions/home-address",
      Icon: IconPin,
    },
    {
      title: "Applying from outside the area",
      text: "Which schools admit out-of-area applicants, and at what priority.",
      href: "/admissions/out-of-catchment",
      Icon: IconMap,
    },
  ];

  const admissionTopics: [string, string][] = [
    [
      "Catchment and distance",
      "/admissions/oversubscription#catchment-distance",
    ],
    ["Siblings and staff", "/admissions/oversubscription#siblings-staff"],
    ["Pupil Premium priority", "/admissions/oversubscription#pupil-premium"],
    ["Test scores and ranking", "/admissions/qualifying-is-not-an-offer"],
    ["Out-of-area applications", "/admissions/out-of-catchment"],
    ["Appeals", "/admissions/appeals"],
  ];

  const steps = [
    {
      title: "Meet the standard",
      text: "Your child sits the entrance test and must reach the school's qualifying standard to be considered.",
    },
    {
      title: "Be ranked under the criteria",
      text: "When there are more qualified applicants than places, the published oversubscription rules decide the order.",
    },
    {
      title: "Receive an offer",
      text: offerDay
        ? `Places are offered in that order through your home council, on ${formatWeekdayDate(offerDay.starts_on)}.`
        : "Places are offered in that order through your home council's coordinated process.",
    },
  ];

  const regions = index.filter((g) => g.slug !== "northern-ireland");
  const ni = index.find((g) => g.slug === "northern-ireland");

  return (
    <>
      {/* 01 — Hero and school finder: search comes before everything else, on every screen. */}
      <section
        data-hero
        aria-labelledby="hero-title"
        className="border-b border-rule bg-sage"
      >
        <Page className="grid items-start gap-x-10 gap-y-6 pt-6 pb-8 sm:pt-9 sm:pb-11 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:pt-11 lg:pb-12">
          <div className="min-w-0">
            <Kicker>Grammar schools in England and Northern Ireland</Kicker>
            <h1
              id="hero-title"
              className="mt-2.5 max-w-[40rem] text-display leading-[1.15] font-extrabold tracking-[-0.015em] text-ink"
            >
              Find the right school. Understand your chances. Plan your next
              step.
            </h1>
            <p className="mt-3 max-w-[38rem] text-lede leading-[1.55] text-ink-2">
              Explore every grammar school, understand its admissions rules,
              compare results and inspections, and decide with clear, sourced
              information.
            </p>
            <div className="mt-5">
              <HomeFinder />
            </div>
            <nav
              aria-label="Main tasks"
              className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
            >
              {[
                ["Find schools", "/grammar-schools", IconPin],
                ["Compare schools", "/compare", IconCompare],
                ["Check admissions", "/tools/eligibility-checker", IconLadder],
                ["Explore catchments", "/tools/catchment-checker", IconMap],
              ].map(([label, href, I]) => {
                const Icon = I as typeof IconPin;
                return (
                  <Link
                    key={href as string}
                    href={href as string}
                    className="inline-flex min-h-11 items-center gap-2 rounded-[var(--r-2)] border border-rule bg-card px-3.5 text-[0.9375rem] font-bold text-ink no-underline transition-colors hover:border-green hover:text-green"
                  >
                    <Icon size={17} className="shrink-0 text-green" />
                    {label as string}
                  </Link>
                );
              })}
            </nav>
          </div>
          <aside aria-label="Coverage" className="hidden lg:block">
            <div className={clsx(PANEL, "p-4")}>
              <HeroMap points={points} ni={stats.ni} />
              <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-rule pt-3 text-center">
                {[
                  [stats.england, "fully selective, England"],
                  [stats.partial, "partially selective"],
                  [stats.ni, "Northern Ireland"],
                ].map(([v, l]) => (
                  <div key={l as string}>
                    <dt className="text-[0.8125rem] leading-tight text-ink-2">
                      {l}
                    </dt>
                    <dd className="order-first font-display text-[1.5rem] font-extrabold text-ink num">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-rule pt-3 text-[0.875rem] text-ink-2">
                <IconSeal size={15} className="text-green" /> DfE · Ofsted · DE
                NI
                {refreshed ? (
                  <span className="text-ink-3">
                    Refreshed {relativeAge(refreshed)}
                  </span>
                ) : null}
              </p>
            </div>
          </aside>
        </Page>
      </section>

      {/* 02 — School results preview: real records, with admissions and performance side by side. */}
      <section aria-labelledby="preview" className={SECTION}>
        <Page>
          <Head
            id="preview"
            kicker="Explore schools"
            title="Each school, with admissions and results together"
            lede="A sample from the directory. Search by postcode to see the schools near you, then filter by test, intake, sixth form and admission rules."
            action={
              <ButtonLink href="/grammar-schools" arrow>
                View all {stats.listed} schools
              </ButtonLink>
            }
          />
          <div className={clsx(PANEL, "mt-6 overflow-hidden")}>
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_1.25rem] gap-6 border-b border-rule bg-sage px-5 py-2.5 text-[0.8125rem] font-bold text-ink-2 md:grid">
              <span>School</span>
              <span>Admissions</span>
              <span>Performance</span>
              <span />
            </div>
            <ul>
              {featured.map((f) => (
                <li
                  key={f.slug}
                  className="border-b border-rule last:border-b-0"
                >
                  <Link
                    href={`/schools/${f.slug}`}
                    className="group/r grid gap-x-6 gap-y-2 px-5 py-4 no-underline transition-colors hover:bg-green-wash/50 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_1.25rem] md:items-center"
                  >
                    <span className="min-w-0">
                      <span className="block text-[1.0625rem] leading-snug font-bold text-ink group-hover/r:text-green">
                        {f.name}
                      </span>
                      <span className="mt-0.5 block text-[0.9375rem] text-ink-2">
                        {[f.town, f.la].filter(Boolean).join(", ")}
                        {f.gender in GENDER_LABEL
                          ? ` · ${GENDER_LABEL[f.gender as keyof typeof GENDER_LABEL]}`
                          : ""}
                      </span>
                    </span>
                    <span className="text-[0.9375rem] text-ink-2">
                      <span className="block font-semibold text-ink">
                        {f.test ?? "Test not yet recorded"}
                      </span>
                      {f.first_prefs != null && f.offers != null ? (
                        <span className="block">
                          {f.first_prefs} first preferences, {f.offers} offers (
                          {f.entry_year})
                        </span>
                      ) : f.has_policy ? (
                        <span className="block">Admissions policy held</span>
                      ) : null}
                    </span>
                    <span className="text-[0.9375rem] text-ink-2">
                      {f.a8 !== null ? (
                        <span className="block">
                          Attainment 8{" "}
                          <b className="font-mono text-ink">
                            {Number(f.a8).toFixed(1)}
                          </b>{" "}
                          <span className="text-ink-3">{f.a8_year}</span>
                        </span>
                      ) : (
                        <span className="block">
                          Attainment 8 not published
                        </span>
                      )}
                      {f.aps_grade ? (
                        <span className="block">
                          A level{" "}
                          <b className="font-mono text-ink">{f.aps_grade}</b>{" "}
                          average
                        </span>
                      ) : null}
                    </span>
                    <IconArrow
                      size={16}
                      className="hidden text-ink-3 transition-transform group-hover/r:translate-x-1 group-hover/r:text-green md:block"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Page>
      </section>

      {/* 03 — Personalised journeys */}
      <section aria-labelledby="journeys" className={clsx(SECTION, "bg-sage")}>
        <Page>
          <Head
            id="journeys"
            kicker="Start from your situation"
            title="What would you like to do?"
          />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {journeys.map((j, i) => (
              <li
                key={j.href}
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
              >
                <Link
                  href={j.href}
                  className={clsx(
                    PANEL,
                    "group/j flex h-full flex-col p-4 no-underline transition-shadow hover:shadow-[0_0_0_1px_var(--green),var(--shadow-card)] sm:p-5",
                  )}
                >
                  <span className="grid size-10 place-items-center rounded-[8px] bg-green-wash text-green">
                    <j.Icon size={20} />
                  </span>
                  <span className="mt-3 text-[1.0625rem] leading-snug font-bold text-ink group-hover/j:text-green">
                    {j.title}
                  </span>
                  <span className="mt-1 flex-1 text-[0.9375rem] leading-relaxed text-ink-2">
                    {j.text}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-[0.9375rem] font-bold text-green-deep">
                    Start here{" "}
                    <IconArrow
                      size={14}
                      className="transition-transform group-hover/j:translate-x-1"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Page>
      </section>

      {/* 04 — Comparison preview: a real comparison, as a compact table. */}
      {comparison && compareRows.length ? (
        <section aria-labelledby="compare" className={SECTION}>
          <Page>
            <Head
              id="compare"
              kicker="Compare side by side"
              title="See the differences that matter"
              lede="Admissions, results, inspection and demand in one table, with no overall score. Compare up to five schools and share the link."
              action={
                <ButtonLink
                  href={`/compare?schools=${comparison.schools.map((s) => s.slug).join(",")}`}
                  arrow
                >
                  Open this comparison
                </ButtonLink>
              }
            />
            <div
              className={clsx(PANEL, "mt-6 overflow-x-auto")}
              role="region"
              aria-label="Example comparison"
              tabIndex={0}
            >
              <table className="w-full min-w-[44rem] border-collapse text-[0.9375rem]">
                <caption className="sr-only">
                  Example comparison of three grammar schools
                </caption>
                <thead>
                  <tr className="border-b border-rule bg-sage text-left">
                    <th
                      scope="col"
                      className="w-[11rem] px-4 py-3 text-[0.8125rem] font-bold text-ink-2"
                    >
                      Measure
                    </th>
                    {comparison.schools.map((s) => (
                      <th
                        key={s.slug}
                        scope="col"
                        className="px-4 py-3 align-bottom"
                      >
                        <Link
                          href={`/schools/${s.slug}`}
                          className="font-bold text-ink no-underline hover:text-green"
                        >
                          {s.name}
                        </Link>
                        <span className="block text-[0.8125rem] font-normal text-ink-2">
                          {[s.town, s.la].filter(Boolean).join(", ")}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((r) => (
                    <tr
                      key={`${r.group}-${r.label}`}
                      className="border-b border-rule last:border-b-0"
                    >
                      <th
                        scope="row"
                        className="px-4 py-3 text-left align-top font-normal"
                      >
                        <span className="block text-[0.8125rem] font-bold text-green-deep">
                          {groupLabel[r.group as keyof typeof groupLabel]}
                        </span>
                        <span className="text-ink">{r.label}</span>
                      </th>
                      {r.values.map((v, i) => (
                        <td
                          key={i}
                          className={clsx(
                            "px-4 py-3 align-top [overflow-wrap:anywhere]",
                            r.differs ? "font-semibold text-ink" : "text-ink-2",
                          )}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-small text-ink-2">
              Bold values differ between the schools. Every figure carries its
              year and source on the full comparison.
            </p>
          </Page>
        </section>
      ) : null}

      {/* 05 — Admissions intelligence: a timeline, plus the rules parents ask about most. */}
      <section
        aria-labelledby="admissions"
        className={clsx(SECTION, "bg-sage")}
      >
        <Page className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <Head
              id="admissions"
              kicker="Admissions intelligence"
              title="Understand how places are really decided"
              lede="Each school publishes its own oversubscription rules. We explain them in plain English and show which criteria may apply to your child, never a percentage chance."
            />
            <ol className="mt-6 grid gap-0">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 pb-5 last:pb-0"
                >
                  {i < steps.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute top-10 bottom-0 left-[1.25rem] w-px bg-rule-strong"
                    />
                  ) : null}
                  <span className="relative grid size-10 place-items-center rounded-full bg-green font-display font-extrabold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-1.5">
                    <span className="block text-[1.0625rem] font-bold text-ink">
                      {s.title}
                    </span>
                    <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-2">
                      {s.text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/tools/eligibility-checker" arrow>
                Check admissions
              </ButtonLink>
              <ButtonLink href="/admissions" variant="secondary">
                How admissions work
              </ButtonLink>
            </div>
          </div>
          <div className={clsx(PANEL, "self-start p-5")}>
            <p className="text-[1.0625rem] font-bold text-ink">
              Rules explained
            </p>
            <ul className="mt-2">
              {admissionTopics.map(([label, href]) => (
                <li key={href} className="border-b border-rule last:border-b-0">
                  <Link
                    href={href}
                    className="group/t flex min-h-12 items-center justify-between gap-3 text-[0.9875rem] font-semibold text-ink no-underline hover:text-green"
                  >
                    {label}
                    <IconArrow
                      size={15}
                      className="text-ink-3 transition-transform group-hover/t:translate-x-1 group-hover/t:text-green"
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex gap-2 rounded-[var(--r-2)] bg-copper-wash p-3 text-[0.9375rem] leading-snug text-ink">
              <IconInfo size={18} className="mt-0.5 shrink-0 text-copper-ink" />
              Living close to a school, or passing its test, does not guarantee
              a place.
            </p>
          </div>
        </Page>
      </section>

      {/* 06 — School performance, each measure with its context. */}
      <section aria-labelledby="performance" className={SECTION}>
        <Page>
          <Head
            id="performance"
            kicker="School performance"
            title="Results with the context you need"
            lede="We publish Department for Education and Ofsted figures exactly as released, with the year, and say clearly when a measure was not published."
            action={
              <ButtonLink
                href="/grammar-schools?view=table&sort=gcse"
                variant="secondary"
                arrow
              >
                Explore performance
              </ButtonLink>
            }
          />
          <dl
            className={clsx(
              PANEL,
              "mt-6 grid divide-y divide-rule md:grid-cols-2 md:divide-y-0 lg:grid-cols-4",
            )}
          >
            {[
              [
                "Attainment 8",
                latestYear
                  ? `${bench[latestYear]!.toFixed(1)} average for selective schools, ${latestYear}`
                  : "Published for every English school",
                "Average grade across eight GCSE subjects, on a 0 to 90 scale.",
              ],
              [
                "Progress 8",
                "Not published for 2024/25 or 2025/26",
                "Those cohorts sat no key stage 2 tests, so the DfE could not calculate it. We never carry an old value forward.",
              ],
              [
                "A level",
                "Average points and grade per entry",
                "Shown for schools with a sixth form, with the year it covers.",
              ],
              [
                "Inspections",
                "Older single grades kept separate",
                "Ofsted report cards, used from November 2025, are not converted into the older overall grades.",
              ],
            ].map(([term, fact, note], i) => (
              <div
                key={term}
                className={clsx(
                  "p-5",
                  i > 0 && "md:border-l md:border-rule",
                  i === 2 && "md:border-l-0 lg:border-l",
                )}
              >
                <dt className="text-[0.8125rem] font-bold text-green-deep">
                  {term}
                </dt>
                <dd className="mt-1">
                  <span className="block text-[1.0625rem] leading-snug font-bold text-ink">
                    {fact}
                  </span>
                  <span className="mt-1.5 block text-[0.9375rem] leading-relaxed text-ink-2">
                    {note}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-small text-ink-2">
            {stats.results.toLocaleString("en-GB")} published results figures
            and {stats.inspections} inspection records.{" "}
            <Link href="/methodology#results">How we handle results</Link>
          </p>
        </Page>
      </section>

      {/* 07 — Grammar and 11+: the two systems, plus upcoming dates. */}
      <section aria-labelledby="eleven" className={clsx(SECTION, "bg-sage")}>
        <Page>
          <Head
            id="eleven"
            kicker="Grammar schools and the 11+"
            title="Tests, eligibility and deadlines"
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)]">
            {[
              {
                title: "England: the 11+",
                count: stats.england,
                unit: "fully selective schools",
                text: `Across ${stats.las} council areas, plus ${stats.partial} partially selective schools. Each area sets its own test and timetable.${closing ? ` Apply through your home council by ${formatDate(closing.starts_on)}.` : ""}`,
                href: "/11-plus",
                cta: "Explore the 11+",
              },
              {
                title: "Northern Ireland: Year 8 transfer",
                count: stats.ni,
                unit: "grammar schools",
                text: "Schools that select academically use the SEAG Entrance Assessment, sat in P7. Each school publishes its own criteria.",
                href: "/admissions/northern-ireland",
                cta: "Explore NI transfer",
              },
            ].map((r) => (
              <article
                key={r.title}
                className={clsx(PANEL, "flex flex-col p-5")}
              >
                <p className="flex items-baseline gap-2">
                  <span className="font-display text-[2rem] leading-none font-extrabold text-green num">
                    {r.count}
                  </span>
                  <span className="font-semibold text-ink-2">{r.unit}</span>
                </p>
                <h3 className="mt-2 text-[1.1875rem] text-ink">{r.title}</h3>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-2">
                  {r.text}
                </p>
                <Link
                  href={r.href}
                  className="mt-4 inline-flex items-center gap-1 font-bold text-green-deep no-underline hover:text-green"
                >
                  {r.cta} <IconArrow size={14} />
                </Link>
              </article>
            ))}
            <div className={clsx(PANEL, "overflow-hidden")}>
              <p className="flex items-center justify-between border-b border-rule px-4 py-3 font-bold text-ink">
                <span className="inline-flex items-center gap-2">
                  <IconCalendar size={17} className="text-green" /> Coming up
                </span>
                <Link
                  href="/calendar"
                  className="text-[0.875rem] text-green-deep no-underline hover:underline"
                >
                  Full calendar
                </Link>
              </p>
              {events.length ? (
                <ul>
                  {events.map((e) => (
                    <li
                      key={e.id}
                      className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-3 border-b border-rule px-4 py-3 last:border-b-0"
                    >
                      <span className="text-center font-display leading-tight">
                        <span className="block text-[1.25rem] font-extrabold text-ink">
                          {new Date(
                            `${e.starts_on}T12:00:00Z`,
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            timeZone: "Europe/London",
                          })}
                        </span>
                        <span className="block text-[0.8125rem] font-bold text-ink-2 uppercase">
                          {new Date(
                            `${e.starts_on}T12:00:00Z`,
                          ).toLocaleDateString("en-GB", {
                            month: "short",
                            year: "numeric",
                            timeZone: "Europe/London",
                          })}
                        </span>
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.9375rem] leading-snug font-semibold text-ink">
                          {e.title}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-[0.8125rem] text-ink-2">
                          {e.nation === "northern_ireland"
                            ? "Northern Ireland"
                            : "England"}
                          <Status status={e.verification_status} quiet />
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-5 text-ink-2">
                  No upcoming dates are held yet.
                </p>
              )}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/grammar-schools" arrow>
              Explore grammar schools
            </ButtonLink>
            <ButtonLink href="/11-plus/exam-providers" variant="secondary">
              Test providers
            </ButtonLink>
            <ButtonLink href="/tools/planner" variant="secondary">
              Plan your application
            </ButtonLink>
          </div>
        </Page>
      </section>

      {/* 08 — Parent resources: an editorial list, not a row of cards. */}
      <section aria-labelledby="guides" className={SECTION}>
        <Page>
          <Head
            id="guides"
            kicker="Parent resources"
            title="Guides written in plain English"
            action={
              <ButtonLink href="/admissions" variant="secondary" arrow>
                Read all guides
              </ButtonLink>
            }
          />
          <ul className="mt-6 grid gap-x-10 border-t border-rule md:grid-cols-2">
            {ADMISSIONS_GUIDES.map((g) => (
              <li key={g.slug} className="border-b border-rule">
                <Link
                  href={`/admissions/${g.slug}`}
                  className="group/g grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4 no-underline"
                >
                  <span>
                    <span className="block text-[0.8125rem] font-bold text-copper-ink">
                      {READING_PATHS[g.path].title}
                    </span>
                    <span className="mt-0.5 block text-[1.0625rem] leading-snug font-bold text-ink group-hover/g:text-green">
                      {g.title}
                    </span>
                    <span className="mt-1 block text-[0.875rem] text-ink-3">
                      Updated {formatDate(g.updated)}
                    </span>
                  </span>
                  <IconBook
                    size={18}
                    className="text-ink-3 group-hover/g:text-green"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Page>
      </section>

      {/* 09 — Browse by location and school type */}
      <section aria-labelledby="browse" className={clsx(SECTION, "bg-sage")}>
        <Page>
          <Head
            id="browse"
            kicker="Browse"
            title="Schools by location and type"
            lede="England and Northern Ireland are the only UK nations with state grammar schools. Wales and Scotland have none."
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className={clsx(PANEL, "p-5")}>
              <p className="font-bold text-ink">England, by region</p>
              <ul className="mt-3 grid gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
                {regions.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/grammar-schools/${g.slug}`}
                      className="group/a flex min-h-10 items-baseline gap-2 py-1.5 text-[0.9375rem] text-ink no-underline hover:text-green"
                    >
                      <span className="group-hover/a:underline">{g.name}</span>
                      <span
                        aria-hidden
                        className="mb-1 flex-1 border-b border-dotted border-rule-strong"
                      />
                      <span className="font-mono text-[0.8125rem] text-ink-2">
                        {g.n}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-rule pt-4 text-[0.9375rem]">
                {ni ? (
                  <Link
                    href="/grammar-schools/northern-ireland"
                    className="font-bold text-green-deep no-underline hover:underline"
                  >
                    Northern Ireland ({ni.n})
                  </Link>
                ) : null}
                <Link
                  href="/grammar-schools#by-area"
                  className="font-bold text-green-deep no-underline hover:underline"
                >
                  Every council area
                </Link>
                <Link
                  href="/admissions/wales-and-scotland"
                  className="text-ink-2 hover:text-ink"
                >
                  Wales and Scotland
                </Link>
              </div>
            </div>
            <div className={clsx(PANEL, "p-5")}>
              <p className="font-bold text-ink">By school type</p>
              <ul className="mt-2">
                {(
                  [
                    ["Boys' schools", "/grammar-schools?gender=boys"],
                    ["Girls' schools", "/grammar-schools?gender=girls"],
                    ["Co-educational", "/grammar-schools?gender=mixed"],
                    ["With a sixth form", "/grammar-schools?sixthForm=1"],
                    ["Boarding", "/grammar-schools?boarding=1"],
                    [
                      "Partially selective",
                      "/grammar-schools?selectivity=partially_selective",
                    ],
                  ] as const
                ).map(([label, href]) => (
                  <li
                    key={href}
                    className="border-b border-rule last:border-b-0"
                  >
                    <Link
                      href={href}
                      className="group/t flex min-h-11 items-center justify-between text-[0.9375rem] font-semibold text-ink no-underline hover:text-green"
                    >
                      {label}
                      <IconArrow
                        size={14}
                        className="text-ink-3 group-hover/t:text-green"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Page>
      </section>

      {/* 10 — Trust: sources, freshness and method. The site footer follows. */}
      <section aria-labelledby="trust" className={SECTION}>
        <Page>
          <div
            className={clsx(
              PANEL,
              "grid gap-5 p-5 sm:p-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:gap-8",
            )}
          >
            <div>
              <h2
                id="trust"
                className="flex items-center gap-2 text-[1.375rem] text-ink"
              >
                <IconSeal size={22} className="text-green" /> Data you can check
              </h2>
              <p className="mt-2 text-[1rem] leading-relaxed text-ink-2">
                Grammar Atlas is independent. Every important figure shows its
                source, the year it covers and when we last checked it. We say
                which facts are published, which are missing and which are still
                being verified.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <ButtonLink href="/data-sources" arrow>
                  About our data
                </ButtonLink>
                <ButtonLink href="/methodology" variant="secondary">
                  Methodology
                </ButtonLink>
              </div>
            </div>
            <ul className="grid content-start gap-2 text-[0.9375rem]">
              {freshness.slice(0, 5).map((f) => (
                <li
                  key={f.job}
                  className="flex items-baseline justify-between gap-3 border-b border-rule pb-2 last:border-b-0"
                >
                  <span className="min-w-0 text-ink">
                    {f.source_name ?? f.job}
                  </span>
                  <span className="shrink-0 text-ink-2">
                    {f.last_success
                      ? `Checked ${relativeAge(f.last_success)}`
                      : "Not yet loaded"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Page>
      </section>
    </>
  );
}
