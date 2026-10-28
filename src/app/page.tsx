import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { GENDER_LABEL } from "@/domain/labels";
import { ADMISSIONS_GUIDES, READING_PATHS } from "@/content/guides";
import { defaultEntryYear } from "@/lib/academic-year";
import { formatDate, formatWeekdayDate, relativeAge } from "@/lib/format";
import { SITE } from "@/lib/site";
import { unstable_cache } from "next/cache";
import { SITE_DATA_TAG, SITE_DATA_TTL } from "@/server/cache";
import { loadComparison, type CompareRow } from "@/server/compare";
import { areaIndex, cycleEvents, dataFreshness, featuredSchools, upcomingEvents } from "@/server/insights";
import { allSchoolPoints, siteStats } from "@/server/schools";
import { HeroMap } from "@/ui/home/hero-map";
import { HomeFinder } from "@/ui/home/finder";
import { IconArrow, IconBook, IconCalendar, IconCompare, IconInfo, IconLadder, IconMap, IconPin, IconQuestion, IconRoute, IconSeal, IconTable } from "@/ui/icons";
import { ButtonLink, Kicker, Page } from "@/ui/kit";
import { Status } from "@/ui/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name}: UK grammar schools, admissions and the 11+`,
  },
  description: "Find grammar schools in England and Northern Ireland, compare results and inspections, and understand 11+ tests and admission rules, all from official sources.",
  alternates: { canonical: "/" },
};

type SectionIcon = typeof IconPin;
type Tone = "indigo" | "violet" | "copper" | "amber";

/* Each section carries its own icon tile colour, so neighbouring sections read as different topics. */
const TILE: Record<Tone, string> = {
  indigo: "bg-green text-white",
  violet: "bg-violet text-white",
  copper: "bg-cta text-white",
  amber: "bg-amber text-navy",
};

/** Section title: icon tile and eyebrow, heading, optional lede, and an optional action on the right. */
function Head({ id, kicker, title, lede, action, Icon, tone = "indigo" }: { id: string; kicker: string; title: ReactNode; lede?: ReactNode; action?: ReactNode; Icon: SectionIcon; tone?: Tone }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
      <div data-reveal className="max-w-[46rem]">
        <div className="flex items-center gap-3">
          <span aria-hidden className={clsx("grid size-9 shrink-0 place-items-center rounded-[10px] shadow-[0_8px_16px_-8px_rgb(35_31_64/0.5)]", TILE[tone])}>
            <Icon size={18} />
          </span>
          <Kicker>{kicker}</Kicker>
        </div>
        <h2 id={id} className="mt-3 text-h2 text-ink">
          {title}
        </h2>
        {lede ? <p className="mt-3 text-[1.0625rem] leading-[1.65] text-ink-2">{lede}</p> : null}
      </div>
      {action}
    </div>
  );
}

const SECTION = "py-[var(--section-y)]";
/* Tinted bands alternate with white ones; each band has a hairline edge so the change is visible on any screen. */
const BAND_COOL = "border-y border-rule bg-[linear-gradient(180deg,var(--green-wash),var(--lilac-wash))]";
const BAND_WARM = "border-y border-rule bg-copper-wash";
const PANEL = "rounded-[var(--r-3)] bg-card shadow-[0_0_0_1px_var(--rule),var(--shadow-card)]";
const PANEL_LINK = "transition-[box-shadow,transform] duration-[var(--d-3)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_var(--green),var(--shadow-lift)]";
const TEXT_LINK = "inline-flex items-center gap-1 font-bold text-green-deep no-underline hover:text-green";
const CHIP = "inline-flex min-h-8 items-center rounded-full bg-sage px-3 text-[0.8125rem] font-semibold text-ink-2 no-underline transition-colors hover:bg-green-wash hover:text-green-deep";
/* One colour per school, shared by its column badge and its bars. */
const SERIES = ["bg-[var(--series-1)]", "bg-[var(--series-2)]", "bg-[var(--series-3)]", "bg-violet", "bg-amber"];
const MARKS = ["A", "B", "C", "D", "E"];

/**
 * One comparison value, laid out by its shape: a figure with its year, an inspection outcome
 * with its framework and date, a missing value, or plain text.
 */
function CompareValue({ v }: { v: string }) {
  const withYear = /^(.+) · (\d{4}\/\d{2})$/.exec(v);
  if (withYear) {
    return (
      <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="font-display text-[1.375rem] leading-none font-extrabold text-ink tabular-nums">{withYear[1]}</span>
        <span className="rounded-full bg-sage px-2 py-0.5 text-[0.8125rem] font-semibold text-ink-2 tabular-nums">{withYear[2]}</span>
      </span>
    );
  }
  const inspection = /^(.+?), (\d{4}-\d{2}-\d{2}): (.+)$/.exec(v);
  if (inspection) {
    return (
      <span className="block">
        <span className="inline-flex rounded-[var(--r-2)] bg-green-wash px-2.5 py-1 text-[0.9375rem] leading-snug font-bold text-green-deep">{inspection[3]}</span>
        <span className="mt-1.5 block text-[0.8125rem] text-ink-2">
          {inspection[1]} · {formatDate(inspection[2])}
        </span>
      </span>
    );
  }
  if (v === "—" || v.startsWith("Not ")) return <span className="text-ink-3">{v}</span>;
  if (/^[\d.,]+%?$/.test(v)) return <span className="font-display text-[1.375rem] leading-none font-extrabold text-ink tabular-nums">{v}</span>;
  return <span className="font-semibold text-ink">{v}</span>;
}

/** Proportion bar under a figure, in the school's column colour. */
function CompareBar({ row, i }: { row: CompareRow; i: number }) {
  const v = row.nums?.[i];
  if (v === null || v === undefined) return null;
  const max = row.scaleMax ?? Math.max(...row.nums!.filter((n): n is number => n !== null));
  return (
    <span aria-hidden className="mt-2.5 block h-1.5 w-full max-w-[11rem] overflow-hidden rounded-full bg-sage-deep">
      <span className={clsx("block h-full rounded-full", SERIES[i])} style={{ width: `${max ? Math.max(2, (v / max) * 100) : 0}%` }} />
    </span>
  );
}

/**
 * Everything the homepage reads, in one cached call. Counts, areas, featured records and the
 * example comparison change only when data is imported or edited, which clears the cache; the
 * date in the key moves "upcoming dates" on each day.
 */
const homeData = unstable_cache(
  async (entryYear: number, today: string) => {
    const [stats, events, freshness, england, featured, index, points] = await Promise.all([siteStats(), upcomingEvents(3, today), dataFreshness(), cycleEvents("england", entryYear), featuredSchools(4), areaIndex(), allSchoolPoints()]);
    const comparison =
      featured.length >= 3
        ? await loadComparison(
            featured.slice(0, 3).map((f) => f.slug),
            entryYear,
          ).catch(() => null)
        : null;
    return { stats, events, freshness, england, featured, index, points, comparison };
  },
  ["home-data"],
  { tags: [SITE_DATA_TAG], revalidate: SITE_DATA_TTL },
);

export default async function HomePage() {
  const entryYear = defaultEntryYear();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const { stats, events, freshness, england, featured, index, points, comparison } = await homeData(entryYear, today);
  const offerDay = england.find((e) => e.event_type === "national_offer_day" && e.scope === "nation");
  const fetched = freshness
    .map((f) => f.last_success)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);

  /* Comparison preview: the first rows of each group that hold real values, so the table stays short. */
  const compareRows = comparison
    ? (["admissions", "results", "inspection", "demand"] as const).flatMap((g) => comparison.rows.filter((r) => r.group === g && r.values.some((v) => v && v !== "—" && v !== "Not recorded")).slice(0, g === "results" ? 2 : 1))
    : [];
  const compareGroups = (["admissions", "results", "inspection", "demand"] as const).map((group) => ({ group, rows: compareRows.filter((r) => r.group === group) })).filter((g) => g.rows.length);
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

  // England and Northern Ireland differ at each step, so each line says which system it describes.
  const steps = [
    { word: "Qualify", text: "Your child sits the entrance test. Each English area sets its own; Northern Ireland schools that select academically use the SEAG assessment." },
    { word: "Rank", text: "Applicants are ordered by each school's published criteria. Some rank by test score, others by catchment, siblings or distance." },
    {
      word: "Offer",
      text: offerDay
        ? `In England, offers come through your home council on ${formatWeekdayDate(offerDay.starts_on)}. In Northern Ireland, through the Education Authority.`
        : "In England, offers come through your home council. In Northern Ireland, through the Education Authority.",
    },
  ];

  const regions = index.filter((g) => g.slug !== "northern-ireland");
  const ni = index.find((g) => g.slug === "northern-ireland");
  const guides = ADMISSIONS_GUIDES.filter((g) => ["qualifying-is-not-an-offer", "oversubscription", "out-of-catchment", "northern-ireland"].includes(g.slug));

  return (
    <>
      {/* 01–02 — Hero and search: the search box comes before anything else, with three primary actions beneath it. */}
      <section data-hero aria-labelledby="hero-title" className="border-b border-rule bg-sage">
        <Page className="grid items-center gap-x-10 gap-y-6 pt-6 pb-8 sm:pt-9 sm:pb-11 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:pt-10 lg:pb-12">
          <div className="min-w-0">
            <Kicker>England and Northern Ireland</Kicker>
            <h1 id="hero-title" className="mt-2.5 max-w-[40rem] text-display leading-[1.15] font-extrabold tracking-[-0.015em] text-ink">
              Find UK grammar schools. Understand admissions. Choose with confidence.
            </h1>
            <p className="mt-3 max-w-[40rem] text-lede leading-[1.55] text-ink-2">
              Explore grammar schools across England and Northern Ireland. Compare results, understand 11+ requirements, check admission criteria and make informed choices using official sources.
            </p>
            <div className="mt-5">
              <HomeFinder />
            </div>
            <nav aria-label="Main tasks" className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
              {(
                [
                  ["Find schools", "/grammar-schools", IconPin, true],
                  ["Compare", "/compare", IconCompare, false],
                  ["Check eligibility", "/tools/eligibility-checker", IconLadder, false],
                ] as const
              ).map(([label, href, Icon, primary]) => (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--r-2)] border px-3 text-center text-[0.9375rem] leading-tight font-bold no-underline transition-colors sm:px-4",
                    primary ? "border-green bg-green text-white hover:bg-navy" : "border-rule bg-card text-ink hover:border-green hover:text-green",
                  )}
                >
                  <Icon size={17} className={clsx("hidden shrink-0 sm:block", primary ? "text-white" : "text-green")} />
                  {label}
                </Link>
              ))}
            </nav>
            <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-2">
              <b className="font-semibold text-ink">{stats.listed} schools listed:</b> {stats.england} fully selective and {stats.partial} partially selective in England, {stats.ni} grammar schools in Northern Ireland.
              {fetched ? <span className="text-ink-3"> Data last fetched {relativeAge(fetched)}.</span> : null}
            </p>
          </div>
          <aside aria-label="Where the schools are" className="hidden lg:block">
            <div className={clsx(PANEL, "p-4")}>
              <HeroMap points={points} ni={stats.ni} total={stats.listed} />
            </div>
          </aside>
        </Page>
      </section>

      {/* 03 — Find schools by area */}
      <section aria-labelledby="areas" className={SECTION}>
        <Page>
          <Head
            id="areas"
            Icon={IconMap}
            kicker="Find schools by area"
            title="Grammar schools near you"
            lede="Each area page lists its schools, the entrance test used there and how admissions work locally."
            action={
              <ButtonLink href="/grammar-schools#by-area" variant="secondary" arrow>
                Every council area
              </ButtonLink>
            }
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {regions.map((g) => (
              <section key={g.slug} aria-labelledby={`r-${g.slug}`} className={clsx(PANEL, "flex flex-col p-5")}>
                <h3 id={`r-${g.slug}`} className="flex items-start justify-between gap-3 text-[1.0625rem] leading-snug font-bold">
                  <Link href={`/grammar-schools/${g.slug}`} className="text-ink no-underline hover:text-green">
                    {g.name}
                  </Link>
                  <span className="shrink-0 rounded-full bg-green-wash px-2.5 py-0.5 text-[0.8125rem] font-bold text-green-deep tabular-nums">{g.n} {g.n === 1 ? "school" : "schools"}</span>
                </h3>
                <ul aria-label={`Council areas in ${g.name}`} className="mt-3 flex flex-wrap gap-1.5 border-t border-rule pt-3">
                  {g.las.slice(0, 4).map((a) => (
                    <li key={a.slug}>
                      <Link href={`/grammar-schools/${a.slug}`} className={CHIP}>
                        {a.name}
                      </Link>
                    </li>
                  ))}
                  {g.las.length > 4 ? (
                    <li>
                      <Link href={`/grammar-schools/${g.slug}`} className={clsx(CHIP, "bg-transparent text-green-deep")}>
                        +{g.las.length - 4} more
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </section>
            ))}
            {ni ? (
              <section aria-labelledby="r-ni" className={clsx(PANEL, "flex flex-col p-5 shadow-[inset_0_4px_0_var(--copper),0_0_0_1px_var(--rule),var(--shadow-card)]")}>
                <h3 id="r-ni" className="flex items-start justify-between gap-3 text-[1.0625rem] leading-snug font-bold">
                  <Link href="/grammar-schools/northern-ireland" className="text-ink no-underline hover:text-green">
                    Northern Ireland
                  </Link>
                  <span className="shrink-0 rounded-full bg-copper-wash px-2.5 py-0.5 text-[0.8125rem] font-bold text-copper-ink tabular-nums">{ni.n} schools</span>
                </h3>
                <p className="mt-3 border-t border-rule pt-3 text-[0.9375rem] text-ink-2">A separate system: Year 8 transfer through the Education Authority.</p>
              </section>
            ) : null}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-[var(--r-3)] border border-dashed border-rule-strong px-4 py-3">
            <span className="mr-1 text-[0.875rem] font-bold text-ink">Browse by type</span>
            {(
              [
                ["Boys", "/grammar-schools?gender=boys"],
                ["Girls", "/grammar-schools?gender=girls"],
                ["Co-educational", "/grammar-schools?gender=mixed"],
                ["Sixth form", "/grammar-schools?sixthForm=1"],
                ["Boarding", "/grammar-schools?boarding=1"],
                ["Partially selective", "/grammar-schools?selectivity=partially_selective"],
              ] as const
            ).map(([label, href]) => (
              <Link key={href} href={href} className="inline-flex min-h-9 items-center rounded-full border border-rule-strong bg-card px-3.5 text-[0.875rem] font-semibold text-ink no-underline transition-colors hover:border-green hover:bg-green hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </Page>
      </section>

      {/* 04 — Three parent questions, each with one next step */}
      <section aria-labelledby="questions" className={clsx(SECTION, BAND_COOL)}>
        <Page>
          <Head id="questions" Icon={IconQuestion} tone="violet" kicker="Start with a question" title="What do you want to know?" />
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {questions.map((x, i) => (
              <li key={x.href} data-reveal style={{ "--i": i } as React.CSSProperties}>
                <Link href={x.href} className={clsx(PANEL, PANEL_LINK, "group/q flex h-full flex-col p-6 no-underline")}>
                  <span className="grid size-12 place-items-center rounded-[12px] bg-green-wash text-green transition-colors group-hover/q:bg-green group-hover/q:text-white">
                    <x.Icon size={22} />
                  </span>
                  <span className="mt-4 text-[1.1875rem] leading-snug font-extrabold text-ink group-hover/q:text-green">{x.q}</span>
                  <span className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-2">{x.a}</span>
                  <span className="mt-5 inline-flex items-center gap-1.5 border-t border-rule pt-4 text-[0.9375rem] font-bold text-green-deep">
                    {x.cta} <IconArrow size={14} className="transition-transform group-hover/q:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Page>
      </section>

      {/* 05 — Compare grammar schools: a real comparison, as a compact table. */}
      <section aria-labelledby="compare" className={SECTION}>
        <Page>
          <Head
            id="compare"
            Icon={IconCompare}
            kicker="Compare grammar schools"
            title="See the differences side by side"
            lede="Admissions, results, inspection and demand in one table, with no overall score. Compare up to five schools, then share or print the comparison."
            action={
              <ButtonLink href={comparison && compareRows.length ? `/compare?schools=${comparison.schools.map((s) => s.slug).join(",")}` : "/compare"} arrow>
                {comparison && compareRows.length ? "Open the full comparison" : "Compare schools"}
              </ButtonLink>
            }
          />
          {comparison && compareRows.length ? (
            <>
              <p className="mt-8 flex items-center gap-1.5 text-[0.875rem] text-ink-2 md:hidden">
                <IconArrow size={14} className="text-green" /> Scroll sideways to see all three schools.
              </p>
              <div className={clsx(PANEL, "mt-2 overflow-x-auto md:mt-8")} role="region" aria-label="Example comparison, scrolls sideways" tabIndex={0}>
                <table className="w-full min-w-[42rem] border-separate border-spacing-0 text-[0.9375rem]">
                  <caption className="sr-only">Example comparison of three grammar schools</caption>
                  <thead>
                    <tr className="text-left">
                      <th scope="col" className="sticky left-0 z-[2] w-[8.5rem] border-b-2 border-rule-strong bg-card px-4 py-4 align-bottom sm:w-[13rem] sm:px-5">
                        <span className="label">Measure</span>
                      </th>
                      {comparison.schools.map((s, i) => (
                        <th key={s.slug} scope="col" className="min-w-[12rem] border-b-2 border-rule-strong px-5 py-4 align-bottom">
                          <span className="flex items-start gap-3">
                            <span aria-hidden className={clsx("mt-0.5 grid size-7 shrink-0 place-items-center rounded-[7px] text-[0.8125rem] font-extrabold text-white", SERIES[i])}>
                              {MARKS[i]}
                            </span>
                            <span className="min-w-0">
                              <Link href={`/schools/${s.slug}`} className="block leading-snug font-extrabold text-ink no-underline hover:text-green">
                                {s.name}
                              </Link>
                              <span className="mt-0.5 block text-[0.8125rem] font-medium text-ink-2">{[s.town, s.la].filter(Boolean).join(", ")}</span>
                            </span>
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  {compareGroups.map(({ group, rows }) => (
                    <tbody key={group}>
                      <tr>
                        <th colSpan={comparison.schools.length + 1} scope="colgroup" className="border-b border-rule bg-sage px-5 py-2 text-left">
                          <span className="label sticky left-5 text-ink">{groupLabel[group]}</span>
                        </th>
                      </tr>
                      {rows.map((r) => (
                        <tr key={`${r.group}-${r.label}`} className="group/row">
                          <th
                            scope="row"
                            className={clsx(
                              "sticky left-0 z-[1] border-b border-rule bg-card px-4 py-4 text-left text-[0.875rem] sm:px-5 sm:text-[0.9375rem] align-top font-semibold text-ink-2 transition-colors group-hover/row:bg-[color-mix(in_srgb,var(--green-wash)_55%,var(--card))]",
                              r.differs && "shadow-[inset_3px_0_0_var(--copper)]",
                            )}
                          >
                            {r.label}
                            {r.differs ? <span className="mt-1 block text-[0.75rem] font-bold tracking-[0.08em] text-copper-ink uppercase">Differs</span> : null}
                          </th>
                          {r.values.map((v, i) => (
                            <td key={i} className="border-b border-rule px-5 py-4 align-top [overflow-wrap:anywhere] transition-colors group-hover/row:bg-[color-mix(in_srgb,var(--green-wash)_55%,var(--card))]">
                              <CompareValue v={v} />
                              {r.nums ? <CompareBar row={r} i={i} /> : null}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  ))}
                </table>
              </div>
              <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-small text-ink-2">
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden className="h-4 w-[3px] rounded-full bg-copper" /> Rows that differ between the schools
                </span>
                <span>Demand figures describe past applications, not any child&apos;s chance of a place.</span>
              </p>
            </>
          ) : (
            <p className={clsx(PANEL, "mt-8 p-5 text-ink-2")}>
              The example comparison is unavailable at the moment. <Link href="/compare">Open the comparison tool</Link> to choose up to five schools yourself.
            </p>
          )}
        </Page>
      </section>

      {/* 06 — How admissions work: Qualify → Rank → Offer, on a dark band so the key message stands apart. */}
      <section aria-labelledby="how" className={clsx(SECTION, "on-dark relative overflow-hidden bg-paper")}>
        <span aria-hidden className="deco deco-dots -top-6 right-[6%] hidden h-28 w-40 text-copper md:block" />
        <Page className="relative">
          <Head
            id="how"
            Icon={IconRoute}
            tone="amber"
            kicker="How admissions work"
            title="Passing the test is not the same as a place"
            action={
              <Link
                href="/admissions/qualifying-is-not-an-offer"
                className="group/btn inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--r-2)] bg-white px-5 text-[0.9375rem] font-bold text-navy no-underline transition-colors hover:bg-amber"
              >
                The full explanation <IconArrow size={16} className="transition-transform group-hover/btn:translate-x-1" />
              </Link>
            }
          />
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.word} className="relative flex flex-col rounded-[var(--r-3)] border border-rule-strong bg-card p-6">
                <span className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-amber font-display text-[1.125rem] font-extrabold text-navy">{i + 1}</span>
                  <span className="font-display text-[1.375rem] font-extrabold text-ink">{s.word}</span>
                </span>
                <span className="mt-3 block text-[0.9375rem] leading-relaxed text-ink-2">{s.text}</span>
                {i < steps.length - 1 ? (
                  <span aria-hidden className="absolute top-1/2 -right-[1.05rem] z-[1] hidden size-7 -translate-y-1/2 place-items-center rounded-full border border-rule-strong bg-paper text-amber md:grid">
                    <IconArrow size={14} />
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="mt-6 flex items-start gap-2.5 rounded-[var(--r-2)] border-l-[3px] border-amber bg-white/[0.06] px-4 py-3 text-[0.9375rem] text-ink">
            <IconInfo size={18} className="mt-0.5 shrink-0 text-amber" />
            Living close to a school, or reaching its standard, does not guarantee a place.
          </p>
        </Page>
      </section>

      {/* 07 — Inside a school profile: real records, with verification state visible. */}
      <section aria-labelledby="profiles" className={SECTION}>
        <Page>
          <Head
            id="profiles"
            Icon={IconTable}
            kicker="Inside a school profile"
            title="Admissions and results, with their sources"
            lede="Every profile shows the entrance test, admissions policy, results, inspections and past demand, each with its year and how far it has been checked."
            action={
              <ButtonLink href="/grammar-schools" arrow>
                Explore all schools
              </ButtonLink>
            }
          />
          <div className={clsx(PANEL, "mt-8 overflow-hidden")}>
            <div aria-hidden className="hidden grid-cols-[minmax(0,1.35fr)_minmax(0,1.15fr)_8.5rem_7rem_1.25rem] gap-6 border-b-2 border-rule-strong px-6 py-3.5 md:grid">
              <span className="label">School</span>
              <span className="label">Entrance test and admissions</span>
              <span className="label">Attainment 8</span>
              <span className="label">A level</span>
              <span />
            </div>
            <ul>
              {featured.map((f) => (
                <li key={f.slug} className="border-b border-rule last:border-b-0">
                  <Link
                    href={`/schools/${f.slug}`}
                    className="group/r grid grid-cols-2 gap-x-6 gap-y-4 px-5 py-5 no-underline transition-colors hover:bg-[color-mix(in_srgb,var(--green-wash)_55%,var(--card))] md:grid-cols-[minmax(0,1.35fr)_minmax(0,1.15fr)_8.5rem_7rem_1.25rem] md:items-center md:px-6"
                  >
                    <span className="col-span-2 min-w-0 md:col-span-1">
                      <span className="block text-[1.0625rem] leading-snug font-extrabold text-ink group-hover/r:text-green">{f.name}</span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] text-ink-2">
                        {[f.town, f.la].filter(Boolean).join(", ")}
                        {f.gender in GENDER_LABEL ? <span className="rounded-full bg-sage px-2 py-0.5 text-[0.8125rem] font-semibold text-ink-2">{GENDER_LABEL[f.gender as keyof typeof GENDER_LABEL]}</span> : null}
                      </span>
                    </span>
                    <span className="col-span-2 min-w-0 rounded-[var(--r-2)] bg-sage px-3.5 py-3 text-[0.875rem] text-ink-2 md:col-span-1 md:bg-transparent md:p-0">
                      <span className="label mb-1 block md:hidden">Entrance test</span>
                      <span className="block text-[0.9375rem] font-bold text-ink">{f.test ?? "Test not yet recorded"}</span>
                      {f.policy_status ? (
                        <span className="mt-1.5 flex flex-wrap items-center gap-2">
                          Admissions policy <Status status={f.policy_status} />
                        </span>
                      ) : f.first_prefs != null && f.offers != null ? (
                        <span className="mt-1 block tabular-nums">
                          <b className="font-bold text-ink">{f.first_prefs}</b> first preferences · <b className="font-bold text-ink">{f.offers}</b> offers ({f.entry_year})
                        </span>
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="label mb-1 block md:hidden">Attainment 8</span>
                      {f.a8 !== null ? (
                        <>
                          <span className="flex items-baseline gap-1.5">
                            <span className="font-display text-[1.5rem] leading-none font-extrabold text-ink tabular-nums">{Number(f.a8).toFixed(1)}</span>
                            <span className="text-[0.8125rem] font-semibold text-ink-3 tabular-nums">{f.a8_year}</span>
                          </span>
                          <span aria-hidden className="mt-2 block h-1.5 w-full max-w-[8rem] overflow-hidden rounded-full bg-sage-deep">
                            <span className="block h-full rounded-full bg-green" style={{ width: `${Math.min(100, (Number(f.a8) / 90) * 100)}%` }} />
                          </span>
                        </>
                      ) : (
                        <span className="text-[0.875rem] text-ink-3">Not published</span>
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="label mb-1 block md:hidden">A level</span>
                      {f.aps_grade ? (
                        <span className="flex items-center gap-2">
                          <span className="grid size-10 place-items-center rounded-[8px] bg-green-wash font-display text-[1.25rem] font-extrabold text-green-deep">{f.aps_grade}</span>
                          <span className="text-[0.8125rem] leading-tight text-ink-2">
                            average
                            <br />
                            grade
                          </span>
                        </span>
                      ) : (
                        <span className="text-[0.875rem] text-ink-3">Not published</span>
                      )}
                    </span>
                    <IconArrow size={16} className="hidden text-ink-3 transition-transform group-hover/r:translate-x-1 group-hover/r:text-green md:block" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-small leading-relaxed text-ink-2">
            Attainment 8 bars run to 90, the highest possible score. Progress 8 was not published for 2024/25 or 2025/26, and Ofsted report cards from November 2025 are kept separate from older single grades.{" "}
            <Link href="/methodology#results" className="a">
              How we handle results
            </Link>
          </p>
        </Page>
      </section>

      {/* 08 — Four featured guides */}
      <section aria-labelledby="guides" className={clsx(SECTION, BAND_WARM)}>
        <Page>
          <Head
            id="guides"
            Icon={IconBook}
            tone="copper"
            kicker="11+ and admissions guides"
            title="Plain-English guides"
            action={
              <ButtonLink href="/admissions" variant="secondary" arrow>
                Explore all guidance
              </ButtonLink>
            }
          />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link href={`/admissions/${g.slug}`} className={clsx(PANEL, PANEL_LINK, "group/g flex h-full flex-col overflow-hidden no-underline")}>
                  <span aria-hidden className="block h-1 bg-[linear-gradient(90deg,var(--copper),var(--amber))]" />
                  <span className="flex flex-1 flex-col p-5">
                    <span className="inline-flex self-start rounded-full bg-copper-wash px-2.5 py-0.5 text-[0.8125rem] font-bold text-copper-ink">{READING_PATHS[g.path].title}</span>
                    <span className="mt-3 flex-1 text-[1.0625rem] leading-snug font-extrabold text-ink group-hover/g:text-green">{g.title}</span>
                    <span className="mt-4 flex items-center justify-between gap-2 border-t border-rule pt-3 text-[0.8125rem] text-ink-3">
                      Updated {formatDate(g.updated)}
                      <IconArrow size={14} className="text-copper-ink transition-transform group-hover/g:translate-x-1" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6">
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
            Icon={IconCalendar}
            kicker="Upcoming dates"
            title="What happens next"
            action={
              <ButtonLink href="/calendar" variant="secondary" arrow>
                Full calendar
              </ButtonLink>
            }
          />
          {events.length ? (
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {events.map((e) => {
                const d = new Date(`${e.starts_on}T12:00:00Z`);
                return (
                  <li key={e.id} className={clsx(PANEL, "grid grid-cols-[4rem_minmax(0,1fr)] gap-4 p-5")}>
                    <span className="self-start overflow-hidden rounded-[var(--r-2)] text-center shadow-[0_0_0_1px_var(--rule)]">
                      <span className="block bg-green py-1 text-[0.8125rem] font-bold tracking-[0.06em] text-white uppercase">
                        {d.toLocaleDateString("en-GB", {
                          month: "short",
                          timeZone: "Europe/London",
                        })}
                      </span>
                      <span className="block bg-card py-1.5 font-display text-[1.5rem] leading-none font-extrabold text-ink">
                        {d.toLocaleDateString("en-GB", {
                          day: "numeric",
                          timeZone: "Europe/London",
                        })}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <span className="block leading-snug font-bold text-ink">{e.title}</span>
                      <span className="mt-1 block text-[0.875rem] text-ink-2">
                        {formatWeekdayDate(e.starts_on)} · {e.nation === "northern_ireland" ? "Northern Ireland, Year 8" : "England, Year 7"} entry in September {e.entry_year}
                      </span>
                      <Status status={e.verification_status} className="mt-2.5" />
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-8 text-ink-2">No upcoming dates are held yet.</p>
          )}
        </Page>
      </section>

      {/* 10 — Trust and sources. The site footer follows. */}
      <section aria-labelledby="trust" className="pb-[var(--section-y)]">
        <Page>
          <div className="grid gap-6 rounded-[var(--r-4)] border border-rule [background:var(--wash)] p-6 sm:p-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10">
            <div>
              <h2 id="trust" className="flex items-center gap-3 text-[1.5rem] text-ink">
                <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-ok text-white">
                  <IconSeal size={18} />
                </span>
                Data you can check
              </h2>
              <p className="mt-3 text-[1rem] leading-relaxed text-ink-2">
                Grammar Atlas is independent. Facts come from the DfE, Ofsted, the Department of Education NI and each school&apos;s own admission arrangements, and every figure shows its source.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
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
            <dl className="grid content-start gap-2.5 text-[0.9375rem]">
              {[
                ["Fetched", "When we last downloaded a source. It does not mean the figures are new."],
                ["Published", "The year or date the source itself covers, shown next to every figure."],
                ["Verified", "Whether a person has checked an admissions fact against the official document."],
              ].map(([t, d]) => (
                <div key={t} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 rounded-[var(--r-2)] bg-card px-4 py-3 shadow-[0_0_0_1px_var(--rule)]">
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
