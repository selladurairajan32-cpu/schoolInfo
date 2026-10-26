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
  upcomingEvents,
} from "@/server/insights";
import { allSchoolPoints, siteStats } from "@/server/schools";
import { HeroMap } from "@/ui/home/hero-map";
import { HomeFinder } from "@/ui/home/finder";
import {
  IconArrow,
  IconBook,
  IconCompare,
  IconInfo,
  IconLadder,
  IconPin,
  IconSeal,
} from "@/ui/icons";
import { ButtonLink, Kicker, Page } from "@/ui/kit";
import { Status } from "@/ui/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name}: find UK grammar schools, understand admissions, choose with confidence`,
  },
  description:
    "Explore grammar schools across England and Northern Ireland. Compare results, understand 11+ requirements, check admission criteria and make informed choices using official sources.",
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

const SECTION = "py-[clamp(2rem,1.4rem+2.6vw,3.5rem)]";
const PANEL =
  "rounded-[var(--r-3)] bg-card shadow-[0_0_0_1px_var(--rule),var(--shadow-card)]";
const TEXT_LINK =
  "inline-flex items-center gap-1 font-bold text-green-deep no-underline hover:text-green";

export default async function HomePage() {
  const entryYear = defaultEntryYear();
  const [stats, events, freshness, england, featured, index, points] =
    await Promise.all([
      siteStats(),
      upcomingEvents(3),
      dataFreshness(),
      cycleEvents("england", entryYear),
      featuredSchools(4),
      areaIndex(),
      allSchoolPoints(),
    ]);
  const comparison =
    featured.length >= 3
      ? await loadComparison(
          featured.slice(0, 3).map((f) => f.slug),
          entryYear,
        )
      : null;
  const offerDay = england.find(
    (e) => e.event_type === "national_offer_day" && e.scope === "nation",
  );
  const fetched = freshness
    .map((f) => f.last_success)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);

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

  const questions = [
    {
      q: "Which schools are near me?",
      a: "Enter your postcode to list grammar schools by straight-line distance, then filter by test, intake and sixth form.",
      href: "/grammar-schools",
      cta: "Search near a postcode",
      Icon: IconPin,
    },
    {
      q: "Can my child apply?",
      a: "Answer only the questions a school's published rules need, and see which criteria may apply, one by one.",
      href: "/tools/eligibility-checker",
      cta: "Check eligibility",
      Icon: IconLadder,
    },
    {
      q: "How are places allocated?",
      a: "Qualifying, ranking and offers are separate steps. See how oversubscription criteria order applicants.",
      href: "/admissions/oversubscription",
      cta: "Read how it works",
      Icon: IconBook,
    },
  ];

  const steps = [
    {
      word: "Qualify",
      text: "Reach the school's standard in its entrance test.",
    },
    {
      word: "Rank",
      text: "Qualified applicants are ordered by the published criteria.",
    },
    {
      word: "Offer",
      text: offerDay
        ? `Places go in that order, on ${formatWeekdayDate(offerDay.starts_on)}.`
        : "Places go in that order, through your home council.",
    },
  ];

  const regions = index.filter((g) => g.slug !== "northern-ireland");
  const ni = index.find((g) => g.slug === "northern-ireland");
  const guides = ADMISSIONS_GUIDES.filter((g) =>
    [
      "qualifying-is-not-an-offer",
      "oversubscription",
      "out-of-catchment",
      "northern-ireland",
    ].includes(g.slug),
  );

  return (
    <>
      {/* 01–02 — Hero and search: the search box comes before anything else, with three primary actions beneath it. */}
      <section
        data-hero
        aria-labelledby="hero-title"
        className="border-b border-rule bg-sage"
      >
        <Page className="grid items-center gap-x-10 gap-y-6 pt-6 pb-8 sm:pt-9 sm:pb-11 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:pt-10 lg:pb-12">
          <div className="min-w-0">
            <Kicker>England and Northern Ireland</Kicker>
            <h1
              id="hero-title"
              className="mt-2.5 max-w-[40rem] text-display leading-[1.15] font-extrabold tracking-[-0.015em] text-ink"
            >
              Find UK grammar schools. Understand admissions. Choose with
              confidence.
            </h1>
            <p className="mt-3 max-w-[40rem] text-lede leading-[1.55] text-ink-2">
              Explore grammar schools across England and Northern Ireland.
              Compare results, understand 11+ requirements, check admission
              criteria and make informed choices using official sources.
            </p>
            <div className="mt-5">
              <HomeFinder />
            </div>
            <nav
              aria-label="Main tasks"
              className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap"
            >
              {(
                [
                  ["Find schools", "/grammar-schools", IconPin, true],
                  ["Compare", "/compare", IconCompare, false],
                  [
                    "Check eligibility",
                    "/tools/eligibility-checker",
                    IconLadder,
                    false,
                  ],
                ] as const
              ).map(([label, href, Icon, primary]) => (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--r-2)] border px-3 text-center text-[0.9375rem] leading-tight font-bold no-underline transition-colors sm:px-4",
                    primary
                      ? "border-green bg-green text-white hover:bg-navy"
                      : "border-rule bg-card text-ink hover:border-green hover:text-green",
                  )}
                >
                  <Icon
                    size={17}
                    className={clsx(
                      "hidden shrink-0 sm:block",
                      primary ? "text-white" : "text-green",
                    )}
                  />
                  {label}
                </Link>
              ))}
            </nav>
            <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-2">
              <b className="font-semibold text-ink">
                {stats.listed} schools listed:
              </b>{" "}
              {stats.england} fully selective and {stats.partial} partially
              selective in England, {stats.ni} grammar schools in Northern
              Ireland.
              {fetched ? (
                <span className="text-ink-3">
                  {" "}
                  Data last fetched {relativeAge(fetched)}.
                </span>
              ) : null}
            </p>
          </div>
          <aside aria-label="Where the schools are" className="hidden lg:block">
            <div className={clsx(PANEL, "p-4")}>
              <HeroMap points={points} ni={stats.ni} />
            </div>
          </aside>
        </Page>
      </section>

      {/* 03 — Find schools by area */}
      <section aria-labelledby="areas" className={SECTION}>
        <Page>
          <Head
            id="areas"
            kicker="Find schools by area"
            title="Grammar schools near you"
            lede="Each area page lists its schools, the entrance test used there and how admissions work locally."
            action={
              <ButtonLink
                href="/grammar-schools#by-area"
                variant="secondary"
                arrow
              >
                Every council area
              </ButtonLink>
            }
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {regions.map((g) => (
              <section
                key={g.slug}
                aria-labelledby={`r-${g.slug}`}
                className={clsx(PANEL, "p-4")}
              >
                <h3
                  id={`r-${g.slug}`}
                  className="flex items-baseline justify-between gap-2 text-[1rem] font-bold"
                >
                  <Link
                    href={`/grammar-schools/${g.slug}`}
                    className="text-ink no-underline hover:text-green"
                  >
                    {g.name}
                  </Link>
                  <span className="font-mono text-[0.8125rem] font-normal text-ink-2">
                    {g.n}
                  </span>
                </h3>
                <p className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1 text-[0.875rem]">
                  {g.las.slice(0, 4).map((a) => (
                    <Link
                      key={a.slug}
                      href={`/grammar-schools/${a.slug}`}
                      className="text-ink-2 hover:text-green"
                    >
                      {a.name}
                    </Link>
                  ))}
                  {g.las.length > 4 ? (
                    <span className="text-ink-3">+{g.las.length - 4} more</span>
                  ) : null}
                </p>
              </section>
            ))}
            {ni ? (
              <section aria-labelledby="r-ni" className={clsx(PANEL, "p-4")}>
                <h3
                  id="r-ni"
                  className="flex items-baseline justify-between gap-2 text-[1rem] font-bold"
                >
                  <Link
                    href="/grammar-schools/northern-ireland"
                    className="text-ink no-underline hover:text-green"
                  >
                    Northern Ireland
                  </Link>
                  <span className="font-mono text-[0.8125rem] font-normal text-ink-2">
                    {ni.n}
                  </span>
                </h3>
                <p className="mt-1.5 text-[0.875rem] text-ink-2">
                  Year 8 transfer through the Education Authority.
                </p>
              </section>
            ) : null}
          </div>
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.9375rem]">
            <span className="text-ink-2">By type:</span>
            {(
              [
                ["Boys", "/grammar-schools?gender=boys"],
                ["Girls", "/grammar-schools?gender=girls"],
                ["Co-educational", "/grammar-schools?gender=mixed"],
                ["Sixth form", "/grammar-schools?sixthForm=1"],
                ["Boarding", "/grammar-schools?boarding=1"],
                [
                  "Partially selective",
                  "/grammar-schools?selectivity=partially_selective",
                ],
              ] as const
            ).map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="font-semibold text-green-deep"
              >
                {label}
              </Link>
            ))}
          </p>
        </Page>
      </section>

      {/* 04 — Three parent questions, each with one next step */}
      <section aria-labelledby="questions" className={clsx(SECTION, "bg-sage")}>
        <Page>
          <Head
            id="questions"
            kicker="Start with a question"
            title="What do you want to know?"
          />
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {questions.map((x, i) => (
              <li
                key={x.href}
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
              >
                <Link
                  href={x.href}
                  className={clsx(
                    PANEL,
                    "group/q flex h-full flex-col p-5 no-underline transition-shadow hover:shadow-[0_0_0_1px_var(--green),var(--shadow-card)]",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-green-wash text-green">
                      <x.Icon size={20} />
                    </span>
                    <span className="text-[1.125rem] leading-snug font-bold text-ink group-hover/q:text-green">
                      {x.q}
                    </span>
                  </span>
                  <span className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-2">
                    {x.a}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1 text-[0.9375rem] font-bold text-green-deep">
                    {x.cta}{" "}
                    <IconArrow
                      size={14}
                      className="transition-transform group-hover/q:translate-x-1"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Page>
      </section>

      {/* 05 — Compare grammar schools: a real comparison, as a compact table. */}
      {comparison && compareRows.length ? (
        <section aria-labelledby="compare" className={SECTION}>
          <Page>
            <Head
              id="compare"
              kicker="Compare grammar schools"
              title="See the differences side by side"
              lede="Admissions, results, inspection and demand in one table, with no overall score. Compare up to five schools, then share or print the comparison."
              action={
                <ButtonLink
                  href={`/compare?schools=${comparison.schools.map((s) => s.slug).join(",")}`}
                  arrow
                >
                  Open the full comparison
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
              Bold values differ between the schools. Demand figures describe
              past applications, not any child&apos;s chance of a place.
            </p>
          </Page>
        </section>
      ) : null}

      {/* 06 — How admissions work: Qualify → Rank → Offer */}
      <section aria-labelledby="how" className={clsx(SECTION, "bg-sage")}>
        <Page>
          <Head
            id="how"
            kicker="How admissions work"
            title="Passing the test is not the same as a place"
            action={
              <ButtonLink
                href="/admissions/qualifying-is-not-an-offer"
                variant="secondary"
                arrow
              >
                The full explanation
              </ButtonLink>
            }
          />
          <ol className="mt-6 grid gap-3 md:grid-cols-3">
            {steps.map((s, i) => (
              <li
                key={s.word}
                className={clsx(PANEL, "relative flex items-start gap-4 p-5")}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-green font-display text-[1.0625rem] font-extrabold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-display text-[1.25rem] font-extrabold text-ink">
                    {s.word}
                  </span>
                  <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-2">
                    {s.text}
                  </span>
                </span>
                {i < steps.length - 1 ? (
                  <IconArrow
                    aria-hidden
                    size={20}
                    className="absolute top-1/2 -right-[1.05rem] z-[1] hidden -translate-y-1/2 rounded-full bg-sage text-green md:block"
                  />
                ) : null}
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-start gap-2 text-[0.9375rem] text-ink-2">
            <IconInfo size={18} className="mt-0.5 shrink-0 text-copper-ink" />
            Each school publishes its own criteria, such as catchment, siblings
            or Pupil Premium. Living close to a school does not guarantee a
            place.
          </p>
        </Page>
      </section>

      {/* 07 — Inside a school profile: real records, with verification state visible. */}
      <section aria-labelledby="profiles" className={SECTION}>
        <Page>
          <Head
            id="profiles"
            kicker="Inside a school profile"
            title="Admissions and results, with their sources"
            lede="Every profile shows the entrance test, admissions policy, results, inspections and past demand, each with its year and how far it has been checked."
            action={
              <ButtonLink href="/grammar-schools" arrow>
                Explore all schools
              </ButtonLink>
            }
          />
          <div className={clsx(PANEL, "mt-6 overflow-hidden")}>
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_1.25rem] gap-6 border-b border-rule bg-sage px-5 py-2.5 text-[0.8125rem] font-bold text-ink-2 md:grid">
              <span>School</span>
              <span>Admissions</span>
              <span>Results</span>
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
                      {f.policy_status ? (
                        <span className="mt-1 flex flex-wrap items-center gap-1.5">
                          Admissions policy{" "}
                          <Status status={f.policy_status} quiet />
                        </span>
                      ) : f.first_prefs != null && f.offers != null ? (
                        <span className="block">
                          {f.first_prefs} first preferences, {f.offers} offers (
                          {f.entry_year})
                        </span>
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
          <p className="mt-3 text-small leading-relaxed text-ink-2">
            Progress 8 was not published for 2024/25 or 2025/26, and Ofsted
            report cards from November 2025 are kept separate from older single
            grades.{" "}
            <Link href="/methodology#results">How we handle results</Link>
          </p>
        </Page>
      </section>

      {/* 08 — Four featured guides */}
      <section aria-labelledby="guides" className={clsx(SECTION, "bg-sage")}>
        <Page>
          <Head
            id="guides"
            kicker="11+ and admissions guides"
            title="Plain-English guides"
            action={
              <ButtonLink href="/admissions" variant="secondary" arrow>
                Explore all guidance
              </ButtonLink>
            }
          />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/admissions/${g.slug}`}
                  className={clsx(
                    PANEL,
                    "group/g flex h-full flex-col p-5 no-underline transition-shadow hover:shadow-[0_0_0_1px_var(--green),var(--shadow-card)]",
                  )}
                >
                  <span className="text-[0.8125rem] font-bold text-copper-ink">
                    {READING_PATHS[g.path].title}
                  </span>
                  <span className="mt-1 flex-1 text-[1.0625rem] leading-snug font-bold text-ink group-hover/g:text-green">
                    {g.title}
                  </span>
                  <span className="mt-3 text-[0.875rem] text-ink-3">
                    Updated {formatDate(g.updated)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4">
            <Link href="/11-plus" className={TEXT_LINK}>
              How 11+ tests work <IconArrow size={14} />
            </Link>
          </p>
        </Page>
      </section>

      {/* 09 — Three upcoming dates */}
      <section aria-labelledby="dates" className={SECTION}>
        <Page>
          <Head
            id="dates"
            kicker="Upcoming dates"
            title="What happens next"
            action={
              <ButtonLink href="/calendar" variant="secondary" arrow>
                Full calendar
              </ButtonLink>
            }
          />
          {events.length ? (
            <ul className="mt-6 grid gap-3 md:grid-cols-3">
              {events.map((e) => {
                const d = new Date(`${e.starts_on}T12:00:00Z`);
                return (
                  <li
                    key={e.id}
                    className={clsx(
                      PANEL,
                      "grid grid-cols-[3.75rem_minmax(0,1fr)] gap-4 p-4",
                    )}
                  >
                    <span className="overflow-hidden rounded-[var(--r-2)] text-center shadow-card">
                      <span className="block bg-green py-0.5 text-[0.8125rem] font-bold text-white uppercase">
                        {d.toLocaleDateString("en-GB", {
                          month: "short",
                          timeZone: "Europe/London",
                        })}
                      </span>
                      <span className="block bg-card py-1 font-display text-[1.375rem] leading-none font-extrabold text-ink">
                        {d.toLocaleDateString("en-GB", {
                          day: "numeric",
                          timeZone: "Europe/London",
                        })}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink">
                        {e.title}
                      </span>
                      <span className="mt-0.5 block text-[0.875rem] text-ink-2">
                        {formatWeekdayDate(e.starts_on)} ·{" "}
                        {e.nation === "northern_ireland"
                          ? "Northern Ireland"
                          : "England"}
                      </span>
                      <Status
                        status={e.verification_status}
                        quiet
                        className="mt-1.5"
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-6 text-ink-2">No upcoming dates are held yet.</p>
          )}
        </Page>
      </section>

      {/* 10 — Trust and sources. The site footer follows. */}
      <section
        aria-labelledby="trust"
        className="pb-[clamp(2rem,1.4rem+2.6vw,3.5rem)]"
      >
        <Page>
          <div
            className={clsx(
              PANEL,
              "grid gap-5 p-5 sm:p-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8",
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
                Grammar Atlas is independent. Facts come from the DfE, Ofsted,
                the Department of Education NI and each school&apos;s own
                admission arrangements, and every figure shows its source.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                <Link href="/data-sources" className={TEXT_LINK}>
                  About our data <IconArrow size={14} />
                </Link>
                <Link href="/methodology" className={TEXT_LINK}>
                  Methodology <IconArrow size={14} />
                </Link>
                <Link href="/corrections" className={TEXT_LINK}>
                  Report a correction <IconArrow size={14} />
                </Link>
              </div>
            </div>
            <dl className="grid content-start gap-3 text-[0.9375rem]">
              {[
                [
                  "Fetched",
                  "When we last downloaded a source. It does not mean the figures are new.",
                ],
                [
                  "Published",
                  "The year or date the source itself covers, shown next to every figure.",
                ],
                [
                  "Verified",
                  "Whether a person has checked an admissions fact against the official document.",
                ],
              ].map(([t, d]) => (
                <div
                  key={t}
                  className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 border-b border-rule pb-3 last:border-b-0 last:pb-0"
                >
                  <dt className="font-bold text-ink">{t}</dt>
                  <dd className="text-ink-2">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Page>
      </section>
    </>
  );
}
