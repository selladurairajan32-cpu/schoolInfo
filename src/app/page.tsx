import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { clsx } from "clsx";
import { GENDER_LABEL } from "@/domain/labels";
import { ADMISSIONS_GUIDES, READING_PATHS } from "@/content/guides";
import { defaultEntryYear } from "@/lib/academic-year";
import { formatDate, formatWeekdayDate, relativeAge } from "@/lib/format";
import { SITE } from "@/lib/site";
import { unstable_cache } from "next/cache";
import { SITE_DATA_TAG, SITE_DATA_TTL } from "@/server/cache";
import { loadComparison } from "@/server/compare";
import { areaIndex, cycleEvents, dataFreshness, featuredSchools, recentPastEvents, topCouncilAreas, upcomingEvents } from "@/server/insights";
import { siteStats } from "@/server/schools";
import { ComparePreview, type PreviewGroup, type PreviewRow } from "@/ui/home/compare-preview";
import { HomeFinder } from "@/ui/home/finder";
import { IconArrow, IconBook, IconInfo, IconLadder, IconMap } from "@/ui/icons";
import { ButtonLink, Page } from "@/ui/kit";
import { Status } from "@/ui/status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name}: UK grammar schools, admissions and the 11+`,
  },
  description: "Find grammar schools in England and Northern Ireland, compare results and inspections, and understand 11+ tests and admission rules, all from official sources.",
  alternates: { canonical: "/" },
};

/*
 * Section rhythm: 32px on phones rising to 56px on desktop. Reading sections and data
 * sections share the outer rhythm; their inner density differs (see each section).
 */
const SECTION = "py-[var(--section-y)]";

/** Section heading: an H2, an optional reading-font lede, and an optional action on the right. */
function Head({ id, title, lede, action, className }: { id: string; title: ReactNode; lede?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div data-reveal className={clsx("flex flex-wrap items-end justify-between gap-x-8 gap-y-3", className)}>
      <div className="max-w-[42rem] min-w-0">
        <h2 id={id} className="text-h2 text-ink">
          {title}
        </h2>
        {lede ? <p className="read mt-2">{lede}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Quiet text route with an underline that draws in on hover. */
function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={clsx("group/ed inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-green no-underline hover:text-green-deep", className)}>
      <span className="ed-link">{children}</span>
      <IconArrow size={14} className="shrink-0 transition-transform duration-[var(--d-2)] ease-[var(--ease-out)] group-hover/ed:translate-x-0.5" />
    </Link>
  );
}

/**
 * Everything the homepage reads, in one cached call. Counts, areas, featured records and the
 * example comparison change only when data is imported or edited, which clears the cache; the
 * date in the key moves the dates timeline on each day.
 */
const homeData = unstable_cache(
  async (entryYear: number, today: string) => {
    const [stats, events, past, freshness, england, featured, index, popular] = await Promise.all([
      siteStats(),
      upcomingEvents(4, today),
      recentPastEvents(1, today),
      dataFreshness(),
      cycleEvents("england", entryYear),
      featuredSchools(4),
      areaIndex(),
      topCouncilAreas(4),
    ]);
    const comparison =
      featured.length >= 3
        ? await loadComparison(
            featured.slice(0, 3).map((f) => f.slug),
            entryYear,
          ).catch(() => null)
        : null;
    return { stats, events, past, freshness, england, featured, index, popular, comparison };
  },
  ["home-data-v2"],
  { tags: [SITE_DATA_TAG], revalidate: SITE_DATA_TTL },
);

const DAY = 86_400_000;
const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / DAY);

export default async function HomePage() {
  const entryYear = defaultEntryYear();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const { stats, events, past, freshness, england, featured, index, popular, comparison } = await homeData(entryYear, today);
  const offerDay = england.find((e) => e.event_type === "national_offer_day" && e.scope === "nation");
  const fetched = freshness
    .map((f) => f.last_success)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);

  /* Comparison preview: per group, the first rows that hold a real value for at least one school. */
  const real = (v: string) => v !== "—" && !v.startsWith("Not ");
  const limits: Record<PreviewGroup, number> = { admissions: 3, results: 3, inspection: 1, demand: 2 };
  const compareRows: PreviewRow[] = comparison
    ? (Object.keys(limits) as PreviewGroup[]).flatMap((g) =>
        comparison.rows
          .filter((r) => r.group === g && r.values.some(real))
          .slice(0, limits[g])
          .map((r) => ({ group: g, label: r.label, values: r.values, differs: r.differs, note: r.note, nums: r.nums, scaleMax: r.scaleMax })),
      )
    : [];

  const journeys = [
    {
      q: "Find schools near me",
      a: "Enter a postcode to see grammar schools by straight-line distance, then filter by test, intake and sixth form.",
      href: "/grammar-schools?view=map",
      cta: "Open the school map",
      kind: "tool" as const,
      Icon: IconMap,
    },
    {
      q: "Can my child apply?",
      a: "Answer only the questions a school’s published rules need, and see which criteria may apply. It never estimates a chance.",
      href: "/tools/eligibility-checker",
      cta: "Check eligibility",
      kind: "tool" as const,
      Icon: IconLadder,
    },
    {
      q: "Understand admissions",
      a: "Qualifying, ranking and offers are separate steps. Read how oversubscription criteria set the order in which places are offered.",
      href: "/admissions/oversubscription",
      cta: "Read the guide",
      kind: "guide" as const,
      Icon: IconBook,
    },
  ];

  // England and Northern Ireland differ at each step, so each line says which system it describes.
  const steps = [
    {
      word: "Qualify",
      text: "Your child sits the entrance test and must reach the school’s standard. Each English area sets its own test; Northern Ireland schools that select academically use SEAG.",
      by: "The test standard",
    },
    {
      word: "Rank",
      text: "Qualified applicants are put in order by the school’s published oversubscription criteria, such as test score, catchment, siblings or distance.",
      by: "Oversubscription criteria",
    },
    {
      word: "Offer",
      text: offerDay
        ? `Places go down the ranked list until they run out. In England, offers come through your home council on ${formatWeekdayDate(offerDay.starts_on)}; in Northern Ireland, through the Education Authority.`
        : "Places go down the ranked list until they run out. In England, offers come through your home council; in Northern Ireland, through the Education Authority.",
      by: "Places available",
    },
  ];

  const regions = [...index.filter((g) => g.slug !== "northern-ireland"), ...index.filter((g) => g.slug === "northern-ireland")];
  const regionMax = Math.max(1, ...regions.map((r) => r.n));
  const lead = ADMISSIONS_GUIDES.find((g) => g.slug === "qualifying-is-not-an-offer");
  const more = ADMISSIONS_GUIDES.filter((g) => ["oversubscription", "out-of-catchment", "northern-ireland"].includes(g.slug));
  const timeline = [...past.map((e) => ({ ...e, passed: true })), ...events.map((e) => ({ ...e, passed: false }))];

  return (
    <>
      {/* Hero: one headline, one sentence, one finder. Coverage figures sit beside it as quiet statistics. */}
      <section aria-labelledby="hero-title" className="border-b border-rule bg-sage">
        <Page className="grid gap-x-14 gap-y-7 pt-8 pb-9 sm:pt-11 sm:pb-12 lg:grid-cols-[minmax(0,1fr)_18.5rem] lg:items-end lg:pt-13 lg:pb-13">
          <div className="min-w-0">
            <h1 id="hero-title" className="anim-rise max-w-[36rem] text-display text-ink">
              Find and understand UK grammar schools
            </h1>
            <p className="anim-rise mt-3 max-w-[38rem] font-read text-lede leading-[1.55] text-ink-2 [animation-delay:60ms] sm:mt-4">
              Search every state grammar school in England and Northern Ireland, see how each one admits pupils, and compare results and inspections. Every fact comes from an official source.
            </p>
            <div className="anim-rise mt-6 max-w-[44rem] [animation-delay:120ms] sm:mt-7">
              <HomeFinder areas={[...popular.map((a) => ({ slug: a.slug, name: a.name })), { slug: "northern-ireland", name: "Northern Ireland" }]} />
            </div>
          </div>

          <aside aria-labelledby="coverage" className="anim-rise min-w-0 [animation-delay:180ms] lg:border-l lg:border-rule-strong lg:pl-8">
            <h2 id="coverage" className="sr-only">
              Coverage
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-rule-strong pt-4 lg:grid-cols-1 lg:gap-y-0 lg:pt-0 lg:border-t-0">
              {(
                [
                  [stats.listed, "grammar schools listed"],
                  [stats.england, "fully selective, England"],
                  [stats.ni, "grammar schools, Northern Ireland"],
                  [stats.partial, "partially selective, England"],
                ] as const
              ).map(([n, label], i) => (
                <div key={label} className={clsx("flex flex-col lg:border-b lg:border-rule lg:py-3.5", i === 0 && "lg:pt-0")}>
                  <dt className="order-2 mt-0.5 text-[0.875rem] leading-snug text-ink-2">{label}</dt>
                  <dd className={clsx("order-1 font-display leading-none font-semibold tracking-[-0.03em] text-ink num", i === 0 ? "text-[2.25rem] lg:text-[2.75rem]" : "text-[1.625rem] lg:text-[1.875rem]")}>{n}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3.5 text-[0.8125rem] leading-snug text-ink-3">
              From the DfE school register and the Department of Education NI census.
              {fetched ? ` Last fetched ${relativeAge(fetched)}.` : null}
            </p>
          </aside>
        </Page>
      </section>

      {/* Start with your question: three journeys in one ruled frame, each with a different kind of next step. */}
      <section aria-labelledby="start" className={SECTION}>
        <Page>
          <Head id="start" title="Start with your question" />
          <ul className="mt-6 grid overflow-hidden rounded-[var(--r-3)] border border-rule md:grid-cols-3">
            {journeys.map((x, i) => (
              <li key={x.href} data-reveal style={{ "--i": i } as CSSProperties} className="border-rule not-first:border-t md:not-first:border-t-0 md:not-first:border-l">
                <Link href={x.href} className="group/j flex h-full flex-col p-5 no-underline transition-colors duration-[var(--d-2)] ease-[var(--ease-out)] hover:bg-sage/70 sm:p-6">
                  <span className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-[var(--r-2)] border border-rule-strong text-green transition-colors duration-[var(--d-2)] group-hover/j:border-green/50 group-hover/j:bg-card">
                      <x.Icon size={18} />
                    </span>
                    <h3 className="text-h3 text-ink">{x.q}</h3>
                  </span>
                  <span className="read mt-3 block flex-1 text-[1.0625rem]">{x.a}</span>
                  {x.kind === "tool" ? (
                    <span className="mt-5 inline-flex min-h-10 items-center gap-2 self-start rounded-[var(--r-2)] border border-green/40 bg-card px-3.5 text-[0.9375rem] font-semibold text-green transition-[background-color,border-color,color] duration-[var(--d-2)] group-hover/j:border-green group-hover/j:bg-green group-hover/j:text-white">
                      {x.cta}
                      <IconArrow size={15} className="transition-transform duration-[var(--d-2)] ease-[var(--ease-out)] group-hover/j:translate-x-0.5" />
                    </span>
                  ) : (
                    <span className="mt-5 inline-flex min-h-10 items-center gap-1.5 self-start text-[0.9375rem] font-semibold text-green">
                      <span className="ed-link">{x.cta}</span>
                      <IconArrow size={15} className="transition-transform duration-[var(--d-2)] ease-[var(--ease-out)] group-hover/j:translate-x-0.5" />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Page>
      </section>

      {/* School discovery: a compact directory of real records beside an index of areas. */}
      <section aria-labelledby="schools" className={clsx(SECTION, "border-t border-rule")}>
        <Page>
          <Head
            id="schools"
            title="School records at a glance"
            lede="Each profile brings together the entrance test, admissions policy, results, inspections and past demand, with the source and year of every figure."
            action={<TextLink href="/grammar-schools">Browse all {stats.listed} schools</TextLink>}
          />
          <div className="mt-6 grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div data-reveal className="min-w-0">
              <ul className="border-y border-rule-strong">
                {featured.map((f) => (
                  <li key={f.slug} className="group/r relative border-b border-rule transition-colors duration-[var(--d-2)] last:border-b-0 hover:bg-sage/60">
                    <div className="grid gap-x-8 gap-y-3 px-1 py-4 sm:px-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.85fr)] md:py-5">
                      <div className="min-w-0">
                        <h3 className="text-[1.125rem] leading-snug font-semibold tracking-[-0.01em] sm:text-[1.1875rem]">
                          <Link href={`/schools/${f.slug}`} className="text-ink no-underline after:absolute after:inset-0 after:content-[''] group-hover/r:text-green">
                            {f.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-[0.875rem] text-ink-3">
                          {[f.town, f.la].filter(Boolean).join(", ")}
                          {f.gender in GENDER_LABEL ? ` · ${GENDER_LABEL[f.gender as keyof typeof GENDER_LABEL]}` : ""}
                        </p>
                      </div>
                      <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-[0.9375rem] md:block">
                        <dt className="text-[0.8125rem] text-ink-3 md:mb-0.5">Entrance test</dt>
                        <dd className="text-ink">{f.test ?? <span className="text-ink-3">Not yet recorded</span>}</dd>
                        {f.policy_status ? (
                          <>
                            <dt className="text-[0.8125rem] text-ink-3 md:sr-only">Admissions policy</dt>
                            <dd className="md:mt-1.5">
                              <span className="sr-only md:not-sr-only md:mr-1.5 md:text-[0.8125rem] md:text-ink-3">Policy</span>
                              <Status status={f.policy_status} quiet />
                            </dd>
                          </>
                        ) : f.first_prefs != null && f.offers != null ? (
                          <>
                            <dt className="text-[0.8125rem] text-ink-3 md:sr-only">Demand ({f.entry_year})</dt>
                            <dd className="text-ink-2 md:mt-1.5 md:text-[0.875rem]">
                              <span className="font-mono font-medium text-ink">{f.first_prefs}</span> first preferences, <span className="font-mono font-medium text-ink">{f.offers}</span> offers
                              <span className="hidden text-ink-3 md:inline"> ({f.entry_year})</span>
                            </dd>
                          </>
                        ) : null}
                      </dl>
                      <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-[0.9375rem] md:block">
                        <dt className="text-[0.8125rem] text-ink-3 md:mb-0.5">Attainment 8</dt>
                        <dd>
                          {f.a8 !== null ? (
                            <>
                              <span className="font-mono text-[1.0625rem] font-semibold text-ink">{Number(f.a8).toFixed(1)}</span> <span className="text-[0.8125rem] text-ink-3">{f.a8_year}</span>
                            </>
                          ) : (
                            <span className="text-ink-3">Not published</span>
                          )}
                        </dd>
                        {f.aps_grade ? (
                          <>
                            <dt className="text-[0.8125rem] text-ink-3 md:mt-1.5 md:mb-0.5">A level average</dt>
                            <dd>
                              <span className="font-mono font-semibold text-ink">{f.aps_grade}</span>
                            </dd>
                          </>
                        ) : null}
                      </dl>
                    </div>
                    <IconArrow aria-hidden size={16} className="absolute top-5 right-1 text-ink-3 opacity-0 transition-[opacity,transform] duration-[var(--d-2)] ease-[var(--ease-out)] group-hover/r:translate-x-0.5 group-hover/r:text-green group-hover/r:opacity-100 sm:right-3" />
                  </li>
                ))}
              </ul>
              <p className="mt-3 max-w-[48rem] text-[0.875rem] leading-relaxed text-ink-3">
                Progress 8 was not published for 2024/25 or 2025/26. Ofsted report cards from November 2025 are kept separate from older single grades.{" "}
                <Link href="/methodology#results" className="a font-medium">
                  How we handle results
                </Link>
              </p>
            </div>

            <aside data-reveal style={{ "--i": 1 } as CSSProperties} aria-labelledby="by-area" className="min-w-0 md:max-lg:grid md:max-lg:grid-cols-2 md:max-lg:gap-x-12">
              <div>
                <h3 id="by-area" className="text-[1rem] font-semibold text-ink">
                  Browse by area
                </h3>
                <ul className="mt-2.5 grid gap-px">
                  {regions.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/grammar-schools/${r.slug}`} className="group/a -mx-2 grid min-h-9 grid-cols-[minmax(0,1fr)_3rem_1.75rem] items-center gap-3 rounded-[var(--r-2)] px-2 text-[0.9375rem] text-ink-2 no-underline transition-colors duration-[var(--d-1)] hover:bg-sage hover:text-ink">
                        <span className="truncate">{r.name}</span>
                        <span aria-hidden className="h-1 rounded-full bg-sage-deep">
                          <span className="block h-full rounded-full bg-green/70 transition-colors group-hover/a:bg-green" style={{ width: `${(r.n / regionMax) * 100}%` }} />
                        </span>
                        <span className="text-right font-mono text-[0.875rem] text-ink-3">{r.n}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mt-6 text-[1rem] font-semibold text-ink md:max-lg:mt-0">By type</h3>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
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
                    <li key={href}>
                      <Link href={href} className="inline-flex min-h-9 items-center rounded-full border border-rule-strong px-3 text-[0.875rem] font-medium text-ink-2 no-underline transition-colors duration-[var(--d-2)] hover:border-green hover:text-green">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <TextLink href="/grammar-schools#by-area" className="mt-5">
                  Every council area
                </TextLink>
              </div>
            </aside>
          </div>
        </Page>
      </section>

      {/* How admissions work: a three-stage timeline whose rule draws across as it enters view. */}
      <section aria-labelledby="how" className={clsx(SECTION, "border-y border-rule bg-sage")}>
        <Page>
          <Head id="how" title="How admissions work" lede="Passing the test makes a child eligible to be considered. Whether a place is offered is decided in two further steps." />
          <ol data-reveal className="relative mt-8 grid gap-7 md:grid-cols-3 md:gap-8">
            {/* One rule from the first marker to the last on wider screens; a segment per step on phones. */}
            <span aria-hidden className="steps-line absolute top-[1.125rem] left-[1.125rem] hidden h-px bg-green/40 md:right-[calc((100%_-_4rem)/3_-_1.125rem)] md:block" />
            {steps.map((s, i) => (
              <li key={s.word} className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 md:block">
                {i < steps.length - 1 ? <span aria-hidden className="steps-line absolute top-9 -bottom-7 left-[1.125rem] w-px bg-green/40 md:hidden" /> : null}
                <span style={{ "--i": i } as CSSProperties} className="step-mark relative z-[1] grid size-9 place-items-center rounded-full border border-green bg-card font-mono text-[0.9375rem] font-semibold text-green shadow-[0_0_0_5px_var(--sage)]">
                  {i + 1}
                </span>
                <div className="min-w-0 md:mt-4">
                  <h3 className="text-h3 text-ink">{s.word}</h3>
                  <p className="read mt-1.5 text-[1.0625rem]">{s.text}</p>
                  <p className="mt-3 text-[0.875rem] text-ink-3">
                    Decided by <span className="font-medium text-ink">{s.by}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div data-reveal className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-[var(--r-2)] border-l-[3px] border-green bg-card py-3.5 pr-4 pl-4 shadow-[0_0_0_1px_var(--rule)] sm:pl-5">
            <p className="flex min-w-0 items-start gap-2.5 font-read text-[1.0625rem] leading-snug text-ink">
              <IconInfo size={19} className="mt-[2px] shrink-0 text-green" />
              Living close to a school, or reaching its standard, does not guarantee a place.
            </p>
            <TextLink href="/admissions/qualifying-is-not-an-offer">Why qualifying is not an offer</TextLink>
          </div>
        </Page>
      </section>

      {/* School comparison: grouped measures with bars, filterable by group. */}
      <section aria-labelledby="compare" className={SECTION}>
        <Page>
          <Head
            id="compare"
            title="Compare schools side by side"
            lede="Three real schools, with admissions, results and inspection kept apart so each difference is easy to find. There is no overall score."
            action={
              <ButtonLink href={comparison && compareRows.length ? `/compare?schools=${comparison.schools.map((s) => s.slug).join(",")}` : "/compare"} arrow>
                {comparison && compareRows.length ? "Open the full comparison" : "Compare schools"}
              </ButtonLink>
            }
          />
          {comparison && compareRows.length ? (
            <div data-reveal>
              <ComparePreview schools={comparison.schools.map((s) => ({ slug: s.slug, name: s.name, town: s.town, la: s.la }))} rows={compareRows} />
              <p className="mt-3 text-[0.875rem] text-ink-3">Bars share one scale per row. Application figures describe past demand, not any child&apos;s chance of a place.</p>
            </div>
          ) : (
            <p className="read mt-6 rounded-[var(--r-3)] border border-rule p-5">
              The example comparison is unavailable at the moment.{" "}
              <Link href="/compare" className="a">
                Open the comparison tool
              </Link>{" "}
              to choose up to five schools yourself.
            </p>
          )}
        </Page>
      </section>

      {/* Featured guidance: one lead article and a ruled list of further reading. */}
      <section aria-labelledby="guides" className={clsx(SECTION, "border-t border-rule")}>
        <Page>
          <Head id="guides" title="Guides to grammar school admissions" action={<TextLink href="/admissions">All guidance</TextLink>} />
          <div className="mt-6 grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            {lead ? (
              <article data-reveal className="group/ed relative border-t-2 border-ink pt-5">
                <p className="text-[0.8125rem] font-semibold tracking-[0.04em] text-green uppercase">{READING_PATHS[lead.path].title} · Start here</p>
                <h3 className="mt-2.5 max-w-[34rem] text-[1.5rem] leading-[1.2] font-semibold tracking-[-0.018em] text-ink sm:text-[1.75rem]">
                  <Link href={`/admissions/${lead.slug}`} className="no-underline after:absolute after:inset-0 after:content-[''] hover:text-green-deep">
                    <span className="ed-link">{lead.title}</span>
                  </Link>
                </h3>
                <p className="read mt-3 max-w-[36rem] text-read">{lead.description}</p>
                <p className="mt-5 max-w-[34rem] border-l-2 border-green/50 pl-4 font-read text-[1.125rem] leading-[1.5] text-ink">
                  <span className="mb-1 block font-sans text-[0.8125rem] font-semibold text-ink-3">Short answer</span>
                  Meeting a grammar school&apos;s qualifying standard makes your child eligible to be <em>considered</em>. It does not guarantee a place.
                </p>
                <p className="mt-5 text-[0.875rem] text-ink-3">Updated {formatDate(lead.updated)}</p>
              </article>
            ) : null}
            <ul className="border-t-2 border-ink">
              {more.map((g, i) => (
                <li key={g.slug} data-reveal style={{ "--i": i + 1 } as CSSProperties} className="group/ed relative border-b border-rule py-4 last:border-b-0">
                  <p className="text-[0.8125rem] font-semibold tracking-[0.04em] text-ink-3 uppercase">{READING_PATHS[g.path].title}</p>
                  <h3 className="mt-1.5 text-[1.0625rem] leading-snug font-semibold text-ink">
                    <Link href={`/admissions/${g.slug}`} className="no-underline after:absolute after:inset-0 after:content-[''] hover:text-green-deep">
                      <span className="ed-link">{g.title}</span>
                    </Link>
                  </h3>
                  <p className="mt-1 line-clamp-2 font-read text-[1rem] leading-[1.5] text-ink-2">{g.description}</p>
                </li>
              ))}
              <li className="pt-4">
                <TextLink href="/11-plus">How 11+ tests work</TextLink>
              </li>
            </ul>
          </div>
        </Page>
      </section>

      {/* Admission dates: a compact timeline. Passed, verified and unverified dates each look different. */}
      <section aria-labelledby="dates" className={clsx(SECTION, "border-y border-rule bg-sage")}>
        <Page className="grid gap-x-12 gap-y-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <div data-reveal>
            <h2 id="dates" className="text-h2 text-ink">
              Admission dates
            </h2>
            <p className="read mt-2">Key dates for families applying now, each marked with how far it has been checked.</p>
            <dl className="mt-4 grid gap-2.5 text-[0.875rem]">
              <div>
                <dt>
                  <Status status="officially_verified" quiet />
                </dt>
                <dd className="mt-0.5 text-ink-3">Checked against the official document</dd>
              </div>
              <div>
                <dt>
                  <Status status="awaiting_verification" quiet />
                </dt>
                <dd className="mt-0.5 text-ink-3">Not yet checked: confirm with the school or council</dd>
              </div>
              <div>
                <dt className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-3">
                  <span aria-hidden className="size-2 rounded-full border border-ink-3" /> Passed
                </dt>
                <dd className="mt-0.5 text-ink-3">The date has gone</dd>
              </div>
            </dl>
            <ButtonLink href="/calendar" variant="secondary" arrow className="mt-5">
              Full calendar
            </ButtonLink>
          </div>
          {timeline.length ? (
            <ol data-reveal style={{ "--i": 1 } as CSSProperties} className="relative min-w-0 rounded-[var(--r-3)] border border-rule bg-card px-4 py-2 sm:px-6">
              {timeline.map((e, i) => {
                const until = daysBetween(today, e.starts_on);
                const first = !e.passed && (i === 0 || timeline[i - 1]!.passed);
                const d = new Date(`${e.starts_on}T12:00:00Z`);
                return (
                  <li key={`${e.passed ? "p" : "u"}-${e.id}`} className={clsx("relative grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 py-3.5 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:gap-x-5", !e.passed && "border-b border-rule last:border-b-0", first && i > 0 && "mt-1 border-t-2 border-t-green/60 pt-4")}>
                    {first && i > 0 ? (
                      <span className="absolute -top-[0.75rem] left-0 bg-card pr-2 text-[0.8125rem] font-semibold tracking-[0.04em] text-green uppercase">
                        Today
                      </span>
                    ) : null}
                    <time dateTime={e.starts_on} className={clsx("text-center leading-none", e.passed ? "text-ink-3" : "text-ink")}>
                      <span className="block font-mono text-[1.625rem] font-semibold tracking-[-0.02em]">{d.toLocaleDateString("en-GB", { day: "numeric", timeZone: "Europe/London" })}</span>
                      <span className="mt-1 block text-[0.8125rem] font-medium tracking-[0.04em] uppercase">{d.toLocaleDateString("en-GB", { month: "short", timeZone: "Europe/London" })}</span>
                    </time>
                    <div className="min-w-0">
                      <p className={clsx("leading-snug font-semibold", e.passed ? "text-ink-3" : "text-ink")}>{e.title}</p>
                      <p className="mt-0.5 text-[0.875rem] text-ink-3">
                        {formatWeekdayDate(e.starts_on)} · {e.nation === "northern_ireland" ? "Northern Ireland, Year 8" : "England, Year 7"} entry {e.entry_year}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 sm:hidden">
                        {e.passed ? (
                          <span className="text-[0.8125rem] font-semibold text-ink-3">Passed</span>
                        ) : (
                          <>
                            <Status status={e.verification_status} quiet />
                            <span className="text-[0.8125rem] text-ink-3">{until === 0 ? "Today" : until === 1 ? "Tomorrow" : `In ${until} days`}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="hidden text-right sm:block">
                      {e.passed ? (
                        <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink-3">
                          <span aria-hidden className="size-2 rounded-full border border-ink-3" /> Passed
                        </span>
                      ) : (
                        <>
                          <Status status={e.verification_status} quiet />
                          <span className="mt-1.5 block text-[0.8125rem] text-ink-3">{until === 0 ? "Today" : until === 1 ? "Tomorrow" : `In ${until} days`}</span>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="read">No upcoming dates are held yet.</p>
          )}
        </Page>
      </section>

      {/* Sources and method: compact, factual, and linked to the pages that hold the detail. */}
      <section aria-labelledby="sources" className="pt-[var(--section-y)]">
        <Page className="grid gap-x-12 gap-y-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div data-reveal>
            <h2 id="sources" className="text-[1.375rem] text-ink sm:text-[1.5rem]">
              Sources and method
            </h2>
            <p className="read mt-2 max-w-[36rem]">
              Grammar Atlas is independent. Facts come from the Department for Education, Ofsted, the Department of Education Northern Ireland and each school&apos;s own admission arrangements, and every figure shows its source.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <TextLink href="/data-sources">Data sources</TextLink>
              <TextLink href="/methodology">Methodology</TextLink>
              <TextLink href="/corrections">Report a correction</TextLink>
            </div>
          </div>
          <dl data-reveal style={{ "--i": 1 } as CSSProperties} className="grid content-start border-t border-rule-strong text-[0.9375rem]">
            {(
              [
                ["Fetched", "When we last downloaded a source. It does not mean the figures are new."],
                ["Published", "The year or date the source itself covers, shown next to every figure."],
                ["Verified", "Whether a person has checked an admissions fact against the official document."],
              ] as const
            ).map(([t, d]) => (
              <div key={t} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 border-b border-rule py-3">
                <dt className="font-semibold text-ink">{t}</dt>
                <dd className="font-read text-[1rem] leading-snug text-ink-2">{d}</dd>
              </div>
            ))}
          </dl>
        </Page>
      </section>
    </>
  );
}
