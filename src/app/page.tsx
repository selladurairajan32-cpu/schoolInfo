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
import { IconArrow, IconBook, IconCalendar, IconCompare, IconInfo, IconLadder, IconMap, IconRoute, IconSeal, IconTable } from "@/ui/icons";
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

/* Section rhythm: 36px on phones rising to 56px on desktop; each section also has its own surface. */
const SECTION = "py-[clamp(2.25rem,1.8rem+1.8vw,3.5rem)]";

type Tone = "find" | "data" | "learn" | "compare" | "date";

/** Section heading: a toned tag naming the kind of content, an H2, an optional lede and an optional action. */
function Head({ id, tag, icon: Icon, title, lede, action, className }: { id: string; tag: string; icon: typeof IconMap; title: ReactNode; lede?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div data-reveal className={clsx("flex flex-wrap items-end justify-between gap-x-8 gap-y-4", className)}>
      <div className="max-w-[42rem] min-w-0">
        <p className="section-tag">
          <Icon aria-hidden />
          {tag}
        </p>
        <h2 id={id} className="mt-3 text-h2 text-ink">
          {title}
        </h2>
        {lede ? <p className="read mt-2">{lede}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Quiet text route in the current tone, with an underline that draws in on hover. */
function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={clsx("group/ed inline-flex min-h-9 items-center gap-1.5 text-[0.9375rem] font-semibold text-tone no-underline hover:text-tone-strong", className)}>
      <span className="ed-link">{children}</span>
      <IconArrow size={14} className="shrink-0 transition-transform duration-[var(--d-2)] ease-[var(--ease-out)] group-hover/ed:translate-x-0.5" />
    </Link>
  );
}

/** Two-letter monogram for a school's row marker: "Aylesbury Grammar School" → "AG". */
function monogram(name: string) {
  const words = name.replace(/[^A-Za-z' ]/g, " ").split(/\s+/).filter((w) => w && w !== "The" && /^[A-Z]/.test(w));
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase();
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

  const journeys: { q: string; a: string; href: string; cta: string; kind: "tool" | "guide"; label: string; tone: Tone; Icon: typeof IconMap }[] = [
    {
      q: "Find schools near me",
      a: "Enter a postcode to see grammar schools by straight-line distance, then filter by test, intake and sixth form.",
      href: "/grammar-schools?view=map",
      cta: "Open the school map",
      kind: "tool",
      label: "Map and directory",
      tone: "find",
      Icon: IconMap,
    },
    {
      q: "Can my child apply?",
      a: "Answer only the questions a school’s published rules need, and see which criteria may apply. It never estimates a chance.",
      href: "/tools/eligibility-checker",
      cta: "Check eligibility",
      kind: "tool",
      label: "Eligibility checker",
      tone: "data",
      Icon: IconLadder,
    },
    {
      q: "Understand admissions",
      a: "Qualifying, ranking and offers are separate steps. Read how oversubscription criteria set the order in which places are offered.",
      href: "/admissions/oversubscription",
      cta: "Read the guide",
      kind: "guide",
      label: "Plain-English guide",
      tone: "learn",
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
  const nextId = events[0]?.id;

  return (
    <>
      {/* Hero: a deep field with one headline, one sentence and one bright finder. Coverage figures sit beside it on frosted tiles. */}
      <section aria-labelledby="hero-title" className="hero-deep">
        <Page className="grid gap-x-14 gap-y-9 pt-10 pb-28 sm:pt-14 sm:pb-32 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-center lg:pt-16 lg:pb-36">
          <div className="min-w-0">
            <p className="anim-rise inline-flex min-h-8 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 text-[0.8125rem] font-medium text-[#c3d1df]">
              <span aria-hidden className="relative grid size-2 place-items-center">
                <span className="absolute size-2 rounded-full bg-[#6fcf97]" />
              </span>
              Official data for England and Northern Ireland
            </p>
            <h1 id="hero-title" className="anim-rise mt-4 max-w-[38rem] text-display text-white [animation-delay:40ms]">
              Find and understand <span className="bg-[linear-gradient(100deg,#a6d4f4_10%,#86d9c9_90%)] bg-clip-text text-transparent">UK grammar schools</span>
            </h1>
            <p className="anim-rise mt-4 max-w-[38rem] font-read text-lede leading-[1.55] text-[#c3d1df] [animation-delay:80ms]">
              Search every state grammar school in England and Northern Ireland, see how each one admits pupils, and compare results and inspections. Every fact comes from an official source.
            </p>
            <div className="anim-rise mt-7 max-w-[44rem] [animation-delay:140ms]">
              <HomeFinder areas={[...popular.map((a) => ({ slug: a.slug, name: a.name })), { slug: "northern-ireland", name: "Northern Ireland" }]} />
            </div>
          </div>

          <aside aria-labelledby="coverage" className="anim-rise min-w-0 [animation-delay:200ms]">
            <h2 id="coverage" className="mb-3 text-[0.8125rem] font-semibold tracking-[0.06em] text-[#9fb3c8] uppercase">
              Coverage
            </h2>
            <dl className="grid grid-cols-3 gap-2.5 lg:grid-cols-1">
              {(
                [
                  [stats.listed, "grammar schools listed"],
                  [stats.england, "fully selective, England"],
                  [stats.ni, "grammar schools, Northern Ireland"],
                  [stats.partial, "partially selective, England"],
                ] as const
              ).map(([n, label], i) => (
                <div key={label} className={clsx("glass flex rounded-[var(--r-3)]", i === 0 ? "col-span-3 flex-col px-4 py-4 lg:col-span-1" : "flex-col px-3 py-3 lg:flex-row lg:items-center lg:gap-3.5 lg:px-4")}>
                  <dt className={clsx("order-2 text-[0.8125rem] leading-snug text-[#9fb3c8]", i === 0 ? "mt-1" : "mt-1 lg:mt-0")}>{label}</dt>
                  <dd className={clsx("order-1 font-display leading-none font-semibold tracking-[-0.035em] num", i === 0 ? "text-[2.75rem] text-white" : "text-[1.625rem] text-[#e4edf5] lg:w-12 lg:shrink-0")}>{n}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[0.8125rem] leading-snug text-[#9fb3c8]">
              DfE school register and Department of Education NI census.
              {fetched ? ` Fetched ${relativeAge(fetched)}.` : null}
            </p>
          </aside>
        </Page>
      </section>

      {/* Start with your question: three raised cards overlapping the hero, each in its own tone with a different kind of next step. */}
      <section aria-labelledby="start" className="relative z-10 -mt-20 sm:-mt-24">
        <Page>
          <h2 id="start" className="sr-only">
            Start with your question
          </h2>
          <ul className="grid gap-4 lg:grid-cols-3">
            {journeys.map((x, i) => (
              <li key={x.href} data-tone={x.tone} data-reveal style={{ "--i": i } as CSSProperties}>
                <Link href={x.href} className="panel panel-hover tone-bar group/j flex h-full flex-col p-5 no-underline sm:p-6">
                  <span className="flex items-center justify-between gap-3">
                    <span className="tone-tile size-11">
                      <x.Icon size={21} />
                    </span>
                    <span className="text-[0.8125rem] font-semibold tracking-[0.02em] text-tone">{x.label}</span>
                  </span>
                  <h3 className="mt-4 text-h3 text-ink">{x.q}</h3>
                  <span className="read mt-2 block flex-1 text-[1.0625rem]">{x.a}</span>
                  {x.kind === "tool" ? (
                    <span className="mt-5 inline-flex min-h-11 items-center justify-between gap-2 rounded-[var(--r-2)] bg-tone px-4 text-[0.9375rem] font-semibold text-white shadow-[0_6px_16px_-8px_var(--tone)] transition-[background-color] duration-[var(--d-2)] group-hover/j:bg-tone-strong">
                      {x.cta}
                      <IconArrow size={16} className="transition-transform duration-[var(--d-2)] ease-[var(--ease-out)] group-hover/j:translate-x-1" />
                    </span>
                  ) : (
                    <span className="mt-5 inline-flex min-h-11 items-center justify-between gap-2 rounded-[var(--r-2)] border border-tone-line bg-tone-wash px-4 text-[0.9375rem] font-semibold text-tone-strong transition-[border-color] duration-[var(--d-2)] group-hover/j:border-tone">
                      <span className="ed-link">{x.cta}</span>
                      <IconArrow size={16} className="transition-transform duration-[var(--d-2)] ease-[var(--ease-out)] group-hover/j:translate-x-1" />
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Page>
      </section>

      {/* School records: a data panel of real records, with labelled fields and meters, beside an index of areas. */}
      <section aria-labelledby="schools" data-tone="data" className={clsx(SECTION, "mt-[clamp(2.25rem,1.8rem+1.8vw,3.5rem)] surface-tint border-y border-rule")}>
        <Page>
          <Head
            id="schools"
            tag="School data"
            icon={IconTable}
            title="School records at a glance"
            lede="Each profile brings together the entrance test, admissions policy, results, inspections and past demand, with the source and year of every figure."
            action={<TextLink href="/grammar-schools">Browse all {stats.listed} schools</TextLink>}
          />
          <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18.5rem] lg:items-start">
            <div data-reveal className="panel min-w-0 overflow-hidden">
              <div aria-hidden className="hidden grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,0.9fr)] gap-x-6 border-b border-tone-line bg-tone-wash px-5 py-2.5 text-[0.8125rem] font-semibold tracking-[0.04em] text-tone-strong uppercase md:grid">
                <span className="pl-[3.75rem]">School</span>
                <span>Admissions</span>
                <span>Results</span>
              </div>
              <ul>
                {featured.map((f) => (
                  <li key={f.slug} className="group/r relative border-b border-rule transition-colors duration-[var(--d-2)] last:border-b-0 hover:bg-tone-wash/40">
                    <div className="grid gap-x-6 gap-y-3 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,0.9fr)] md:items-center">
                      <div className="flex min-w-0 items-start gap-4">
                        <span aria-hidden className="tone-tile size-11 shrink-0 font-display text-[0.9375rem] font-semibold tracking-[0.02em] transition-[background-color,color] duration-[var(--d-2)] group-hover/r:bg-tone group-hover/r:text-white">
                          {monogram(f.name)}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-[1.125rem] leading-snug font-semibold tracking-[-0.01em]">
                            <Link href={`/schools/${f.slug}`} className="text-ink no-underline transition-colors after:absolute after:inset-0 after:content-[''] group-hover/r:text-tone-strong">
                              {f.name}
                            </Link>
                          </h3>
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.875rem] text-ink-3">
                            <span>{[f.town, f.la].filter(Boolean).join(", ")}</span>
                            {f.gender in GENDER_LABEL ? <span className="rounded-full border border-rule-strong bg-card px-2 py-px text-[0.8125rem] font-medium text-ink-2">{GENDER_LABEL[f.gender as keyof typeof GENDER_LABEL]}</span> : null}
                          </p>
                        </div>
                      </div>
                      <dl className="min-w-0 pl-[3.75rem] text-[0.9375rem] md:pl-0">
                        <dt className="sr-only">Entrance test</dt>
                        <dd>{f.test ? <span className="inline-block rounded-[var(--r-2)] bg-tone-wash px-2 py-0.5 text-[0.875rem] leading-snug font-medium text-tone-strong shadow-[inset_0_0_0_1px_var(--tone-line)]">{f.test}</span> : <span className="text-ink-3">Test not yet recorded</span>}</dd>
                        {f.policy_status ? (
                          <>
                            <dt className="sr-only">Admissions policy</dt>
                            <dd className="mt-2 flex items-center gap-1.5 text-[0.8125rem] text-ink-3">
                              Policy <Status status={f.policy_status} quiet />
                            </dd>
                          </>
                        ) : f.first_prefs != null && f.offers != null ? (
                          <>
                            <dt className="sr-only">Applications and offers, {f.entry_year}</dt>
                            <dd className="mt-2 text-[0.875rem] text-ink-3">
                              <b className="font-mono font-semibold text-ink">{f.first_prefs}</b> first choices · <b className="font-mono font-semibold text-ink">{f.offers}</b> offers <span className="whitespace-nowrap">({f.entry_year})</span>
                            </dd>
                          </>
                        ) : null}
                      </dl>
                      <dl className="flex min-w-0 items-center gap-4 pl-[3.75rem] md:pl-0">
                        <div className="min-w-0 flex-1">
                          <dt className="text-[0.8125rem] text-ink-3">Attainment 8 {f.a8_year ? <span className="text-ink-3">· {f.a8_year}</span> : null}</dt>
                          <dd className="mt-0.5">
                            {f.a8 !== null ? (
                              <>
                                <span className="font-mono text-[1.25rem] leading-none font-semibold tracking-[-0.02em] text-ink">{Number(f.a8).toFixed(1)}</span>
                                <span aria-hidden className="mt-1.5 block h-1.5 max-w-[8rem] overflow-hidden rounded-full bg-sage-deep">
                                  <span className="block h-full rounded-full bg-[linear-gradient(90deg,var(--tone),color-mix(in_srgb,var(--tone)_55%,#fff))]" style={{ width: `${Math.min(100, (Number(f.a8) / 90) * 100)}%` }} />
                                </span>
                              </>
                            ) : (
                              <span className="text-[0.9375rem] text-ink-3">Not published</span>
                            )}
                          </dd>
                        </div>
                        {f.aps_grade ? (
                          <div className="text-center">
                            <dt className="text-[0.8125rem] text-ink-3">A level</dt>
                            <dd className="mx-auto mt-0.5 grid size-9 place-items-center rounded-full border-2 border-tone-line bg-card font-display text-[1rem] font-semibold text-tone-strong">{f.aps_grade}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="border-t border-rule bg-sage/60 px-5 py-3 text-[0.8125rem] leading-relaxed text-ink-3">
                Attainment 8 bars are out of 90. Progress 8 was not published for 2024/25 or 2025/26, and Ofsted report cards from November 2025 are kept separate from older single grades.{" "}
                <Link href="/methodology#results" className="a font-medium">
                  How we handle results
                </Link>
              </p>
            </div>

            <aside data-reveal style={{ "--i": 1 } as CSSProperties} aria-labelledby="by-area" className="panel min-w-0 p-5 md:max-lg:grid md:max-lg:grid-cols-2 md:max-lg:gap-x-10">
              <div>
                <h3 id="by-area" className="flex items-center gap-2 text-[1rem] font-semibold text-ink">
                  <IconRoute size={17} className="text-tone" /> Browse by area
                </h3>
                <ul className="mt-3 grid gap-px">
                  {regions.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/grammar-schools/${r.slug}`} className="group/a -mx-2 grid min-h-9 grid-cols-[minmax(0,1fr)_3.5rem_1.75rem] items-center gap-3 rounded-[var(--r-2)] px-2 text-[0.9375rem] text-ink-2 no-underline transition-colors duration-[var(--d-1)] hover:bg-tone-wash hover:text-ink">
                        <span className="truncate">{r.name}</span>
                        <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-sage-deep">
                          <span className="block h-full rounded-full bg-tone/60 transition-colors group-hover/a:bg-tone" style={{ width: `${(r.n / regionMax) * 100}%` }} />
                        </span>
                        <span className="text-right font-mono text-[0.875rem] font-medium text-ink-2">{r.n}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mt-6 text-[1rem] font-semibold text-ink md:max-lg:mt-0">By type</h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
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
                      <Link href={href} className="inline-flex min-h-9 items-center rounded-full border border-rule-strong bg-card px-3 text-[0.875rem] font-medium text-ink-2 no-underline transition-[border-color,color,background-color] duration-[var(--d-2)] hover:border-tone hover:bg-tone-wash hover:text-tone-strong">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <TextLink href="/grammar-schools#by-area" className="mt-4">
                  Every council area
                </TextLink>
              </div>
            </aside>
          </div>
        </Page>
      </section>

      {/* How admissions work: three numbered stage cards joined by connectors; the rule draws in as it enters view. */}
      <section aria-labelledby="how" data-tone="find" className={SECTION}>
        <Page>
          <Head id="how" tag="How it works" icon={IconRoute} title="How admissions work" lede="Passing the test makes a child eligible to be considered. Whether a place is offered is decided in two further steps." />
          <ol data-reveal className="relative mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
            <span aria-hidden className="steps-line absolute top-[2.75rem] right-[16%] left-[16%] hidden h-[2px] bg-[linear-gradient(90deg,var(--tone-line),var(--tone),var(--tone-line))] md:block" />
            {steps.map((s, i) => (
              <li key={s.word} className="panel relative flex flex-col overflow-hidden">
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-center gap-3.5">
                    <span
                      style={{ "--i": i } as CSSProperties}
                      className="step-mark relative z-[1] grid size-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,var(--tone),var(--tone-strong))] font-display text-[1.125rem] font-semibold text-white shadow-[0_0_0_5px_var(--tone-wash),0_8px_18px_-8px_var(--tone)]"
                    >
                      {i + 1}
                    </span>
                    <span>
                      <span className="block text-[0.8125rem] font-medium text-ink-3">Step {i + 1} of 3</span>
                      <h3 className="text-h3 leading-tight text-ink">{s.word}</h3>
                    </span>
                  </div>
                  <p className="read mt-3.5 text-[1.0625rem]">{s.text}</p>
                </div>
                <p className="border-t border-tone-line bg-tone-wash px-5 py-3 text-[0.875rem] text-ink-2 sm:px-6">
                  Decided by <span className="font-semibold text-tone-strong">{s.by}</span>
                </p>
              </li>
            ))}
          </ol>
          <div data-reveal data-tone="learn" className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-[var(--r-3)] border border-tone-line border-l-4 border-l-tone bg-tone-wash py-3.5 pr-4 pl-4 sm:pl-5">
            <p className="flex min-w-0 items-start gap-3 font-read text-[1.0625rem] leading-snug text-ink">
              <IconInfo size={20} className="mt-[1px] shrink-0 text-tone" />
              <span>
                <b className="font-sans text-[0.9375rem] font-semibold text-tone-strong">Important: </b>
                living close to a school, or reaching its standard, does not guarantee a place.
              </span>
            </p>
            <TextLink href="/admissions/qualifying-is-not-an-offer">Why qualifying is not an offer</TextLink>
          </div>
        </Page>
      </section>

      {/* Comparison: a data console with grouped, colour-keyed measures. */}
      <section aria-labelledby="compare" data-tone="compare" className={clsx(SECTION, "surface-tint border-y border-rule")}>
        <Page>
          <Head
            id="compare"
            tag="Compare"
            icon={IconCompare}
            title="Compare schools side by side"
            lede="Three real schools, with admissions, results and inspection kept apart so each difference is easy to find. There is no overall score."
            action={
              <ButtonLink href={comparison && compareRows.length ? `/compare?schools=${comparison.schools.map((s) => s.slug).join(",")}` : "/compare"} arrow className="bg-tone border-tone hover:bg-tone-strong hover:border-tone-strong">
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
            <p className="read panel mt-6 p-5">
              The example comparison is unavailable at the moment.{" "}
              <Link href="/compare" className="a">
                Open the comparison tool
              </Link>{" "}
              to choose up to five schools yourself.
            </p>
          )}
        </Page>
      </section>

      {/* Guidance: warm paper, one lead article and a numbered reading list. */}
      <section aria-labelledby="guides" data-tone="learn" className={clsx(SECTION, "surface-paper")}>
        <Page>
          <Head id="guides" tag="Guidance" icon={IconBook} title="Guides to grammar school admissions" action={<TextLink href="/admissions">All guidance</TextLink>} />
          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-10">
            {lead ? (
              <article data-reveal className="panel panel-hover tone-bar group/ed relative flex flex-col p-6 sm:p-8">
                <p className="flex flex-wrap items-center gap-2 text-[0.8125rem] font-semibold">
                  <span className="rounded-full bg-tone px-2.5 py-0.5 text-white">Start here</span>
                  <span className="tracking-[0.04em] text-tone uppercase">{READING_PATHS[lead.path].title}</span>
                </p>
                <h3 className="mt-4 max-w-[32rem] text-[1.625rem] leading-[1.18] font-semibold tracking-[-0.02em] text-ink sm:text-[1.875rem]">
                  <Link href={`/admissions/${lead.slug}`} className="no-underline after:absolute after:inset-0 after:content-[''] hover:text-tone-strong">
                    <span className="ed-link">{lead.title}</span>
                  </Link>
                </h3>
                <p className="read mt-3 max-w-[36rem]">{lead.description}</p>
                <div className="relative mt-6 max-w-[34rem] rounded-[var(--r-3)] bg-tone-wash p-5 pl-12 shadow-[inset_0_0_0_1px_var(--tone-line)]">
                  <span aria-hidden className="absolute top-2 left-4 font-read text-[3rem] leading-none text-tone/50">
                    &ldquo;
                  </span>
                  <p className="text-[0.8125rem] font-semibold text-tone-strong">Short answer</p>
                  <p className="mt-1 font-read text-[1.125rem] leading-[1.5] text-ink">
                    Meeting a grammar school&apos;s qualifying standard makes your child eligible to be <em>considered</em>. It does not guarantee a place.
                  </p>
                </div>
                <p className="mt-auto pt-6 text-[0.875rem] text-ink-3">Updated {formatDate(lead.updated)}</p>
              </article>
            ) : null}
            <ol className="grid content-start">
              {more.map((g, i) => (
                <li key={g.slug} data-reveal style={{ "--i": i + 1 } as CSSProperties} className="group/ed relative grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 border-b border-tone-line py-5 first:pt-1">
                  <span aria-hidden className="numeral pt-0.5 text-[2.75rem]">
                    {String(i + 2).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.8125rem] font-semibold tracking-[0.04em] text-tone uppercase">{READING_PATHS[g.path].title}</p>
                    <h3 className="mt-1 text-[1.125rem] leading-snug font-semibold text-ink">
                      <Link href={`/admissions/${g.slug}`} className="no-underline after:absolute after:inset-0 after:content-[''] hover:text-tone-strong">
                        <span className="ed-link">{g.title}</span>
                      </Link>
                    </h3>
                    <p className="mt-1 line-clamp-2 font-read text-[1rem] leading-[1.5] text-ink-2">{g.description}</p>
                  </div>
                </li>
              ))}
              <li className="pt-4">
                <TextLink href="/11-plus">How 11+ tests work</TextLink>
              </li>
            </ol>
          </div>
        </Page>
      </section>

      {/* Admission dates: calendar cards. Verified, unverified and passed dates each have their own treatment, in words as well as style. */}
      <section aria-labelledby="dates" data-tone="date" className={SECTION}>
        <Page>
          <Head
            id="dates"
            tag="Key dates"
            icon={IconCalendar}
            title="Admission dates"
            lede="Key dates for families applying now, each marked with how far it has been checked."
            action={
              <ButtonLink href="/calendar" variant="secondary" arrow>
                Full calendar
              </ButtonLink>
            }
          />
          <ul data-reveal className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.875rem] text-ink-2">
            <li className="flex items-center gap-2">
              <span aria-hidden className="h-2.5 w-5 rounded-full bg-ok" /> Official source: checked against the document
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="h-2.5 w-5 rounded-full border-2 border-dashed border-pend bg-pend-wash" /> Awaiting verification: confirm with the school or council
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden className="hatched h-2.5 w-5 rounded-full border border-rule-strong" /> Passed
            </li>
          </ul>
          {timeline.length ? (
            <ol data-reveal style={{ "--i": 1 } as CSSProperties} className="snap-rail -mx-4 mt-5 flex scroll-px-4 gap-3 overflow-x-auto px-4 pt-3 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-5">
              {timeline.map((e) => {
                const until = daysBetween(today, e.starts_on);
                const d = new Date(`${e.starts_on}T12:00:00Z`);
                const verified = e.verification_status === "officially_verified";
                const next = !e.passed && e.id === nextId;
                return (
                  <li
                    key={`${e.passed ? "p" : "u"}-${e.id}`}
                    className={clsx(
                      "relative flex w-[15.5rem] shrink-0 flex-col rounded-[var(--r-4)] md:w-auto",
                      // On phones the rail opens on the next deadline; the passed date sits at the end.
                      e.passed && "order-last md:order-none",
                      e.passed ? "hatched border border-rule-strong bg-sage" : verified ? "panel" : "border-2 border-dashed border-pend/45 bg-card",
                      next && "shadow-[0_0_0_2px_var(--tone),0_18px_36px_-18px_var(--tone)]",
                    )}
                  >
                    {next ? <span className="absolute -top-3 left-4 rounded-full bg-tone px-2.5 py-0.5 text-[0.8125rem] font-semibold text-white">Next deadline</span> : null}
                    <div className="flex items-center gap-3 px-4 pt-5 pb-3">
                      <time dateTime={e.starts_on} className={clsx("grid w-14 shrink-0 overflow-hidden rounded-[var(--r-2)] text-center leading-none", e.passed ? "bg-card text-ink-3 shadow-[inset_0_0_0_1px_var(--rule-strong)]" : "bg-card shadow-[0_0_0_1px_var(--rule-strong),0_4px_10px_-6px_rgb(24_37_53/0.3)]")}>
                        <span className={clsx("block py-1 text-[0.8125rem] font-semibold tracking-[0.06em] uppercase", e.passed ? "bg-ink-3 text-white" : verified ? "bg-ok text-white" : "bg-pend-wash text-pend")}>
                          {d.toLocaleDateString("en-GB", { month: "short", timeZone: "Europe/London" })}
                        </span>
                        <span className={clsx("block py-1.5 font-display text-[1.625rem] font-semibold tracking-[-0.03em]", e.passed ? "text-ink-3" : "text-ink")}>{d.toLocaleDateString("en-GB", { day: "numeric", timeZone: "Europe/London" })}</span>
                      </time>
                      <div className="min-w-0 text-[0.8125rem] leading-snug">
                        {e.passed ? (
                          <span className="font-semibold text-ink-3">Passed</span>
                        ) : (
                          <>
                            <span className="inline-flex rounded-full bg-tone-wash px-2 py-0.5 font-semibold text-tone-strong">{until === 0 ? "Today" : until === 1 ? "Tomorrow" : `In ${until} days`}</span>
                          </>
                        )}
                        <span className="mt-1 block text-ink-3">{d.toLocaleDateString("en-GB", { weekday: "long", timeZone: "Europe/London" })}</span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col px-4 pb-4">
                      <p className={clsx("leading-snug font-semibold", e.passed ? "text-ink-3" : "text-ink")}>{e.title}</p>
                      <p className="mt-1 text-[0.8125rem] text-ink-3">
                        {e.nation === "northern_ireland" ? "Northern Ireland, Year 8" : "England, Year 7"} · entry {e.entry_year}
                      </p>
                      <div className="mt-auto pt-3">{e.passed ? <span className="sr-only">This date has passed.</span> : <Status status={e.verification_status} quiet />}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="read mt-5">No upcoming dates are held yet.</p>
          )}
        </Page>
      </section>

      {/* Sources and method: compact and factual, linked to the pages that hold the detail. */}
      <section aria-labelledby="sources" data-tone="find" className={clsx(SECTION, "border-t border-rule pb-0")}>
        <Page className="grid gap-x-12 gap-y-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div data-reveal>
            <p className="section-tag">
              <IconSeal aria-hidden />
              Trust
            </p>
            <h2 id="sources" className="mt-3 text-[1.5rem] text-ink">
              Sources and method
            </h2>
            <p className="read mt-2 max-w-[36rem]">
              Grammar Atlas is independent. Facts come from the Department for Education, Ofsted, the Department of Education Northern Ireland and each school&apos;s own admission arrangements, and every figure shows its source.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6">
              <TextLink href="/data-sources">Data sources</TextLink>
              <TextLink href="/methodology">Methodology</TextLink>
              <TextLink href="/corrections">Report a correction</TextLink>
            </div>
          </div>
          <dl data-reveal style={{ "--i": 1 } as CSSProperties} className="panel grid content-start divide-y divide-rule px-5 text-[0.9375rem]">
            {(
              [
                ["Fetched", "When we last downloaded a source. It does not mean the figures are new."],
                ["Published", "The year or date the source itself covers, shown next to every figure."],
                ["Verified", "Whether a person has checked an admissions fact against the official document."],
              ] as const
            ).map(([t, d]) => (
              <div key={t} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-3.5">
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
