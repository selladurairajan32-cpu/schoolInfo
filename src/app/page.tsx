import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { clsx } from "clsx";
import { ADMISSIONS_GUIDES, READING_PATHS } from "@/content/guides";
import { defaultEntryYear } from "@/lib/academic-year";
import { formatDate, formatWeekdayDate, relativeAge } from "@/lib/format";
import { SITE } from "@/lib/site";
import { cycleEvents, dataFreshness, featuredSchools, topCouncilAreas, upcomingEvents } from "@/server/insights";
import { allSchoolPoints, siteStats } from "@/server/schools";
import { HeroDecor } from "@/ui/hero";
import { HeroMap } from "@/ui/home/hero-map";
import { HomeFinder } from "@/ui/home/finder";
import { IconArrow, IconBook, IconCalendar, IconCheck, IconDocument, IconInfo, IconLadder, IconMap, IconPin, IconRoute, IconSeal, IconTarget } from "@/ui/icons";
import { ButtonLink, Kicker, Page } from "@/ui/kit";
import { CountUp } from "@/ui/motion";
import { Status } from "@/ui/status";
import { GlyphAfterPassing, GlyphCatchment, GlyphCompare, GlyphCriteria, GlyphExam, GlyphNearMe, GlyphWhen } from "@/ui/viz/glyphs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — find a grammar school and understand how it admits` },
  description: "Official information on every grammar school in England and Northern Ireland: entrance tests, admission rules, catchment, results, inspections and past demand — each rule explained, each fact sourced.",
  alternates: { canonical: "/" },
};

/** Centred section title — the reference's eyebrow + 800-weight heading. */
function Head({ id, kicker, title, lede, align = "center" }: { id: string; kicker: string; title: ReactNode; lede?: ReactNode; align?: "center" | "start" }) {
  return (
    <div data-reveal className={clsx("max-w-[44rem]", align === "center" && "mx-auto text-center")}>
      <Kicker>{kicker}</Kicker>
      <h2 id={id} className="mt-2.5 text-h2 text-ink">
        {title}
      </h2>
      {lede ? <p className="mt-3.5 text-[1.0625rem] leading-[1.7] text-ink-2">{lede}</p> : null}
    </div>
  );
}

/** Small icon + label pair used in card meta rows (reference: grade · sessions · projects). */
function Meta({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink-2">
      <span aria-hidden className="text-copper [&_svg]:size-[15px]">
        {icon}
      </span>
      {children}
    </span>
  );
}

export default async function HomePage() {
  const entryYear = defaultEntryYear();
  const [stats, events, freshness, england, featured, councils, points] = await Promise.all([siteStats(), upcomingEvents(3), dataFreshness(), cycleEvents("england", entryYear), featuredSchools(3), topCouncilAreas(5), allSchoolPoints()]);
  const closing = england.find((e) => e.event_type === "application_deadline" && e.scope === "nation");
  const offerDay = england.find((e) => e.event_type === "national_offer_day" && e.scope === "nation");
  const refreshed = freshness
    .map((f) => f.last_success)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);

  const tools = [
    { title: "School directory", text: "Search by name, town or postcode, then filter by test, gender, sixth form and admission route.", href: "/grammar-schools", cta: "Search schools", Glyph: GlyphNearMe, meta: [[<IconPin key="i" />, `${stats.listed} schools`], [<IconMap key="i" />, "List, table & map"]] },
    { title: "Eligibility checker", text: "Asks only the questions each school's rules need, then shows the outcome criterion by criterion.", href: "/tools/eligibility-checker", cta: "Check eligibility", Glyph: GlyphCriteria, meta: [[<IconLadder key="i" />, "Per criterion"], [<IconInfo key="i" />, "Never a probability"]] },
    { title: "Catchment checker", text: "Checks a postcode against verified catchment boundaries only. Straight-line distance is labelled as such.", href: "/tools/catchment-checker", cta: "Check catchment", Glyph: GlyphCatchment, meta: [[<IconSeal key="i" />, "Verified boundaries"], [<IconTarget key="i" />, "Never a circle"]] },
    { title: "Compare schools", text: "Put two to five schools side by side — tests, rules, results and demand, with differences highlighted.", href: "/compare", cta: "Compare schools", Glyph: GlyphCompare, meta: [[<IconCheck key="i" />, "Up to 5 schools"], [<IconRoute key="i" />, "Shareable link"]] },
    { title: "Admissions planner", text: closing ? `Your own timeline of tests and deadlines. Applications close ${formatWeekdayDate(closing.starts_on)}.` : "Your own timeline of tests, deadlines and next steps.", href: "/tools/planner", cta: "Open planner", Glyph: GlyphWhen, meta: [[<IconCalendar key="i" />, "Your timeline"], [<IconCheck key="i" />, "With reminders"]] },
    { title: "Admissions calendar", text: "Registration windows, test days, deadlines and offer days, straight from official publications.", href: "/calendar", cta: "See dates", Glyph: GlyphAfterPassing, meta: [[<IconSeal key="i" />, "Verified dates"], [<IconCalendar key="i" />, "By month"]] },
    { title: "11+ practice", text: "Original timed questions illustrating common 11+ question types, with feedback on every answer.", href: "/11-plus/preparation", cta: "Start practising", Glyph: GlyphExam, meta: [[<IconTarget key="i" />, "Timed questions"], [<IconBook key="i" />, "With feedback"]] },
    { title: "Research assistant", text: "Ask in plain English. Answers are built only from verified school data and official passages, with numbered sources.", href: "/assistant", cta: "Ask a question", Glyph: GlyphCriteria, meta: [[<IconDocument key="i" />, "Numbered sources"], [<IconSeal key="i" />, "Verified data only"]] },
  ] as const;

  const steps = [
    { n: "01", title: "Meet the standard", text: "A child takes the entrance test and must meet the school's qualifying standard to be considered.", href: "/11-plus", link: "How 11+ tests work" },
    { n: "02", title: "Check the priority order", text: "The published oversubscription rules rank eligible applicants when places are limited.", href: "/admissions/oversubscription", link: "Explore the criteria" },
    {
      n: "03",
      title: "Receive an offer",
      text: offerDay ? `Places are offered in the published order, through your home council, on ${formatWeekdayDate(offerDay.starts_on)}.` : "Places are offered in the published order, through your home council's coordinated process.",
      href: "/admissions/qualifying-is-not-an-offer",
      link: "What a pass means",
    },
  ];

  const principles = [
    { Icon: IconSeal, title: "Official data first", text: "Facts come from DfE, Ofsted, DE NI and each school's own admissions arrangements — with source, licence and date checked." },
    { Icon: IconInfo, title: "Uncertainty is visible", text: "Every admissions fact carries a status, from officially verified to awaiting verification. Nothing unverified is shown as certain." },
    { Icon: IconLadder, title: "Qualifying is not an offer", text: "We keep the test standard, the priority order and the offer apart — and never turn them into a probability." },
  ];

  const guides = ADMISSIONS_GUIDES.slice(0, 3);
  const tile = ["bg-green-wash text-green", "bg-copper-wash text-copper-ink", "bg-lilac-wash text-violet"];

  return (
    <>
      {/* 1 — Hero: split composition on the warm wash (reference home banner) */}
      <section data-hero aria-labelledby="hero-title" className="relative overflow-hidden">
        <HeroDecor variant="home" />
        <Page className="relative z-[1] grid items-center gap-x-10 gap-y-12 pt-10 pb-24 sm:pt-14 sm:pb-28 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pt-16 lg:pb-32">
          <div className="anim-rise max-w-[36rem]">
            <Kicker>The UK grammar school research atlas</Kicker>
            <h1 id="hero-title" className="mt-4 text-[clamp(2.125rem,1.6rem+2.2vw,3.125rem)] leading-[1.2] font-extrabold tracking-[-0.015em] text-ink">
              A clearer way to <span className="swash">choose</span> a grammar school.
            </h1>
            <p className="mt-5 text-[1.0625rem] leading-[1.7] text-ink-2 sm:text-[1.25rem] sm:leading-[1.6]">Explore schools, understand the rules, compare your options and plan the next step — all in one research workspace built on official records.</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <ButtonLink href="/grammar-schools" arrow>
                Find a grammar school
              </ButtonLink>
              <Link href="/admissions" className="group/hl inline-flex items-center gap-2 font-bold text-ink no-underline hover:text-green">
                <span className="grid size-11 place-items-center rounded-full bg-card text-green shadow-card transition-transform duration-[var(--d-3)] group-hover/hl:scale-110">
                  <IconBook size={18} />
                </span>
                Understand admissions
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-rule pt-5 text-[0.9375rem] text-ink-2">
              <span className="font-bold text-ink">Built on official data</span>
              <span>DfE · Ofsted · DE NI</span>
              <Link href="/data-sources" className="inline-flex items-center gap-1 font-bold text-green-deep no-underline hover:underline">
                Sources <IconArrow size={14} />
              </Link>
              {refreshed ? <span className="text-ink-3">Records refreshed {relativeAge(refreshed)}</span> : null}
            </div>
          </div>
          <div className="anim-rise px-4 [animation-delay:150ms] sm:px-10 lg:px-0">
            <HeroMap points={points} ni={stats.ni} />
          </div>
        </Page>
      </section>

      {/* 2 — One place to start, overlapping the banner */}
      <section aria-label="Find a school" className="relative z-[2] -mt-16 sm:-mt-20">
        <Page>
          <HomeFinder />
          <nav aria-label="Explore by region" className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6">
            <span className="mr-2 label text-ink">Explore by region</span>
            {[...councils.map((c) => ({ slug: c.slug, name: c.name })), { slug: "northern-ireland", name: "Northern Ireland" }].map((c) => (
              <Link key={c.slug} href={`/grammar-schools/${c.slug}`} className="inline-flex min-h-10 items-center rounded-full bg-card px-4 text-[0.9375rem] font-semibold text-ink no-underline shadow-[0_0_0_1px_var(--rule),var(--shadow-card)] transition-[color,box-shadow,transform] duration-[var(--d-3)] hover:-translate-y-0.5 hover:text-green hover:shadow-[0_0_0_1px_var(--green),var(--shadow-card)]">
                {c.name}
              </Link>
            ))}
            <Link href="/grammar-schools#by-area" className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-green-wash px-4 text-[0.9375rem] font-bold text-green-deep no-underline transition-colors hover:bg-green hover:text-white">
              All areas <IconArrow size={14} />
            </Link>
          </nav>
        </Page>
      </section>

      {/* 3 — Coverage band (reference statistics band, counting up) */}
      <section aria-label="What the atlas holds" className="mt-14 sm:mt-20">
        <Page>
          <div data-reveal className="relative overflow-hidden rounded-[var(--r-3)] bg-green px-6 py-10 text-white sm:px-10 sm:py-12">
            <span aria-hidden className="deco deco-dots -top-2 right-6 h-20 w-28 text-white/25" />
            <dl className="relative grid grid-cols-2 gap-y-9 lg:grid-cols-4">
              {[
                [IconPin, stats.listed, "Schools in the directory"],
                [IconMap, stats.las, "Council areas covered"],
                [IconTarget, stats.results, "Published results figures"],
                [IconSeal, stats.inspections, "Inspection records"],
              ].map(([Icon, v, l], i) => {
                const I = Icon as typeof IconPin;
                return (
                  <div key={l as string} className={clsx("flex flex-col items-center px-2 text-center", i % 2 === 1 && "border-l border-white/20", i === 2 && "lg:border-l lg:border-white/20")}>
                    <I size={26} className="text-white/85" />
                    <dd className="mt-3 font-display text-[clamp(2rem,1.6rem+1.6vw,2.75rem)] leading-none font-extrabold num">
                      <CountUp value={v as number} />
                    </dd>
                    <dt className="mt-2 text-[0.8125rem] font-bold tracking-[0.06em] uppercase">{l as string}</dt>
                  </div>
                );
              })}
            </dl>
          </div>
        </Page>
      </section>

      {/* 4 — The two systems (reference "live classes" pair of large cards) */}
      <section aria-labelledby="routes" className="py-[var(--section-y)]">
        <Page>
          <Head id="routes" kicker="Two systems, one atlas" title="Grammar schools in England and Northern Ireland" lede="Selection works differently on each side of the Irish Sea. Start with the system your child will apply through." />
          <div className="mt-10 grid gap-6 md:grid-cols-2 sm:mt-12">
            {[
              {
                title: "England: the 11+",
                count: stats.england,
                unit: "fully selective in England",
                bullets: [`Across ${stats.las} council areas, plus ${stats.partial} partially selective schools`, "Each area sets its own test, timetable and scoring", closing ? `Apply through your home council by ${formatDate(closing.starts_on)}` : "Apply through your home council's coordinated process", "A qualifying score is not a guaranteed place"],
                href: "/11-plus",
                cta: "Explore the 11+",
                tone: "green" as const,
              },
              {
                title: "Northern Ireland: Year 8 transfer",
                count: stats.ni,
                unit: "grammar schools",
                bullets: ["Entry to Year 8 rather than Year 7", "Schools that select academically use the SEAG Entrance Assessment, sat in P7", "Each school publishes its own admissions criteria", "Applications go through the Education Authority's transfer process"],
                href: "/admissions/northern-ireland",
                cta: "Explore NI transfer",
                tone: "copper" as const,
              },
            ].map((r, i) => (
              <article key={r.title} data-reveal style={{ "--i": i } as React.CSSProperties} className="group/card card card-hover relative flex flex-col overflow-hidden border border-rule p-6 sm:p-8">
                <span aria-hidden className={clsx("absolute -top-16 -right-16 size-44 rounded-full opacity-70 transition-transform duration-700 group-hover/card:scale-110", r.tone === "green" ? "bg-green-wash" : "bg-copper-wash")} />
                <p className="relative flex items-baseline gap-2">
                  <span className={clsx("font-display text-[3rem] leading-none font-extrabold num", r.tone === "green" ? "text-green" : "text-copper-ink")}>{r.count}</span>
                  <span className="font-bold text-ink-2">{r.unit}</span>
                </p>
                <h3 className="relative mt-4 text-[1.625rem] leading-tight text-ink sm:text-[1.875rem]">{r.title}</h3>
                <ul className="relative mt-4 grid flex-1 gap-2.5">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-[1rem] leading-relaxed text-ink-2">
                      <span aria-hidden className={clsx("mt-[0.55em] size-1.5 shrink-0 rounded-full", r.tone === "green" ? "bg-green" : "bg-copper")} />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="relative mt-7">
                  <ButtonLink href={r.href} arrow variant={r.tone === "green" ? "primary" : "accent"}>
                    {r.cta}
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>
        </Page>
      </section>

      {/* 5 — The research tools (reference course-card grid on the warm wash) */}
      <section aria-labelledby="tools" className="relative overflow-hidden bg-[image:var(--wash-strong)] py-[var(--section-y)]">
        <span aria-hidden className="deco deco-dots top-10 left-4 h-24 w-20 text-copper" />
        <span aria-hidden className="deco deco-ring float-y top-16 right-[8%] size-10 text-green/40" />
        <span aria-hidden className="deco deco-dots right-6 bottom-12 h-28 w-20 text-green/50" />
        <Page className="relative">
          <Head id="tools" kicker="Your research, organised" title="Everything you need to make sense of your choices" lede="Start with a school, an admissions question or a postcode — then move from finding options to an informed decision." />
          <ul className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {tools.map((t, i) => (
              <li key={t.href} data-reveal style={{ "--i": i % 4 } as React.CSSProperties}>
                <Link href={t.href} className="group/card card card-hover grid h-full grid-cols-[3.5rem_minmax(0,1fr)_1rem] items-start gap-x-4 p-4 no-underline sm:flex sm:flex-col sm:p-6 sm:text-center">
                  <span className="row-span-2 grid size-14 place-items-center rounded-full bg-copper-wash transition-transform duration-500 ease-[var(--ease-out)] group-hover/card:-translate-y-1 group-hover/card:rotate-[-6deg] sm:mx-auto sm:size-[4.5rem] [&_svg]:size-8 sm:[&_svg]:size-10">
                    <t.Glyph />
                  </span>
                  <span className="font-display text-[1.125rem] leading-snug font-extrabold text-ink transition-colors group-hover/card:text-green sm:mt-4 sm:text-[1.25rem]">{t.title}</span>
                  <IconArrow size={16} className="col-start-3 row-start-1 mt-1 text-ink-3 sm:hidden" />
                  <span className="col-start-2 mt-1 flex-1 text-[0.9375rem] leading-[1.6] text-ink-2 sm:mt-2 sm:leading-[1.65]">{t.text}</span>
                  <span className="mt-4 hidden flex-wrap justify-center gap-x-4 gap-y-1.5 border-t border-dashed border-rule pt-4 sm:flex">
                    {t.meta.map(([icon, label]) => (
                      <Meta key={label} icon={icon}>
                        {label}
                      </Meta>
                    ))}
                  </span>
                  <span className="mx-auto mt-5 hidden min-h-10 items-center gap-1.5 rounded-[var(--r-2)] bg-cta sm:inline-flex px-4 text-[0.875rem] font-bold text-white transition-colors group-hover/card:bg-green">
                    {t.cta} <IconArrow size={14} className="transition-transform group-hover/card:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Page>
      </section>

      {/* 6 — Why the atlas: real records on the left, principles on the right (reference "why us" split) */}
      <section aria-labelledby="why" className="py-[var(--section-y)]">
        <Page className="grid items-center gap-x-16 gap-y-12 lg:grid-cols-2">
          <div data-reveal className="relative order-2 lg:order-1">
            <span aria-hidden className="deco deco-dots -top-6 -left-4 h-24 w-24 text-copper" />
            <div className="relative overflow-hidden rounded-[var(--r-3)] border border-rule bg-card shadow-lift">
              <p className="flex items-center justify-between border-b border-rule bg-sage px-5 py-3 label text-ink">
                Example records <span className="tracking-normal text-ink-3 normal-case">From the directory</span>
              </p>
              <ul>
                {featured.map((f, i) => (
                  <li key={f.slug} className="border-b border-rule last:border-b-0">
                    <Link href={`/schools/${f.slug}`} className="group/r grid grid-cols-[2.5rem_minmax(0,1fr)_1rem] items-start gap-x-3 px-5 py-4 no-underline transition-colors hover:bg-green-wash/60">
                      <span className="grid size-9 place-items-center rounded-full bg-copper-wash font-display text-[0.875rem] font-extrabold text-copper-ink">{String(i + 1).padStart(2, "0")}</span>
                      <span className="min-w-0">
                        <span className="block text-[1.0625rem] leading-snug font-bold text-ink group-hover/r:text-green">{f.name}</span>
                        <span className="block text-small text-ink-2">{[f.town, f.la].filter(Boolean).join(" · ")}</span>
                        <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          <Meta icon={<IconTarget />}>{f.test ?? "See school profile"}</Meta>
                          {f.a8 !== null ? <Meta icon={<IconLadder />}>Attainment 8: {Number(f.a8).toFixed(1)}</Meta> : null}
                        </span>
                      </span>
                      <IconArrow size={16} className="mt-1 text-ink-3 transition-transform group-hover/r:translate-x-1 group-hover/r:text-green" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="float-y absolute -right-3 -bottom-8 hidden max-w-[15rem] rounded-[var(--r-3)] bg-card p-4 shadow-lift sm:block">
              <p className="flex items-start gap-2.5 text-[0.875rem] leading-snug font-semibold text-ink">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-amber text-navy">
                  <IconInfo size={16} />
                </span>
                A qualifying 11+ result is not a guaranteed place.
              </p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <Head id="why" kicker="A research tool, not just a directory" title="Go beyond the school name" align="start" lede="Each school has its own entrance test, admissions policy and evidence. Grammar Atlas shows the original records and how they fit together." />
            <ul className="mt-8 grid gap-6">
              {principles.map((p, i) => (
                <li key={p.title} data-reveal style={{ "--i": i } as React.CSSProperties} className="flex items-start gap-4">
                  <span className="icon-tile size-14 shrink-0">
                    <p.Icon size={24} />
                  </span>
                  <span>
                    <span className="block font-display text-[1.1875rem] font-extrabold text-ink">{p.title}</span>
                    <span className="mt-1 block text-[0.98rem] leading-[1.65] text-ink-2">{p.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div data-reveal className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/grammar-schools" arrow>
                Browse every school
              </ButtonLink>
              <ButtonLink href="/methodology" variant="secondary">
                Our methodology
              </ButtonLink>
            </div>
          </div>
        </Page>
      </section>

      {/* 7 — From a test result to an offer */}
      <section id="how-admission-works" aria-labelledby="process" className="pb-[var(--section-y)]">
        <Page>
          <Head id="process" kicker="Understand the process" title="From a test result to an offer" lede="Grammar-school admission is several distinct decisions. Understand each step before comparing schools." />
          <ol className="mt-10 grid gap-6 sm:mt-12 lg:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.n} data-reveal style={{ "--i": i } as React.CSSProperties} className="group/card card card-hover relative flex flex-col border border-rule p-6 sm:p-7">
                {/* Decorative watermark numeral (generated content, so it is not read or contrast-checked as text) */}
                <span aria-hidden data-n={s.n} className="absolute top-5 right-6 font-display text-[3.5rem] leading-none font-extrabold text-green/10 transition-colors group-hover/card:text-green/20 before:content-[attr(data-n)]" />
                <span className="grid size-12 place-items-center rounded-full bg-green font-display text-[1rem] font-extrabold text-white shadow-[0_10px_20px_-8px_rgb(82_95_225/0.7)]">{i + 1}</span>
                <h3 className="mt-5 text-[1.375rem] text-ink">{s.title}</h3>
                <p className="mt-2 flex-1 text-[0.98rem] leading-[1.65] text-ink-2">{s.text}</p>
                <Link href={s.href} className="group/sl mt-5 inline-flex items-center gap-1.5 font-bold text-green-deep no-underline hover:text-green">
                  {s.link} <IconArrow size={15} className="transition-transform group-hover/sl:translate-x-1" />
                </Link>
              </li>
            ))}
          </ol>
        </Page>
      </section>

      {/* 8 — Dates, on the testimonial-style wash band */}
      <section aria-labelledby="dates" className="relative overflow-hidden bg-[image:var(--wash)] py-[var(--section-y)]">
        <svg aria-hidden viewBox="0 0 200 200" className="deco spin-slow -top-24 -left-24 h-80 w-80 text-copper/40">
          <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span aria-hidden className="deco deco-dots right-6 bottom-10 h-24 w-24 text-copper" />
        <Page className="relative grid items-center gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div data-reveal>
            <Kicker>Keep moving forward</Kicker>
            <h2 id="dates" className="mt-2.5 text-h2 text-ink">
              A plan that&apos;s easier to follow
            </h2>
            <p className="mt-4 max-w-[30rem] text-[1.0625rem] leading-[1.7] text-ink-2">Important dates, admissions policies and school research — connected instead of scattered across bookmarks.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/calendar" arrow>
                Explore admissions dates
              </ButtonLink>
              <ButtonLink href="/tools/planner" variant="secondary">
                Open your planner
              </ButtonLink>
            </div>
          </div>
          <div data-reveal style={{ "--i": 1 } as React.CSSProperties} className="overflow-hidden rounded-[var(--r-3)] bg-card shadow-lift">
            <p className="flex items-center justify-between border-b border-rule px-5 py-3.5 label text-ink">
              Admissions calendar
              <Link href="/calendar" className="inline-flex min-h-8 items-center gap-1 text-[0.875rem] tracking-normal text-green-deep normal-case no-underline hover:underline">
                Full calendar <IconArrow size={14} />
              </Link>
            </p>
            {events.length ? (
              <ul>
                {events.map((e) => {
                  const d = new Date(`${e.starts_on}T12:00:00Z`);
                  return (
                    <li key={e.id} className="grid grid-cols-[4.25rem_minmax(0,1fr)] gap-4 border-b border-rule px-5 py-4 last:border-b-0">
                      <p className="overflow-hidden rounded-[var(--r-2)] text-center shadow-card">
                        <span className="block bg-copper py-0.5 text-[0.6875rem] font-extrabold tracking-[0.08em] text-navy uppercase">{d.toLocaleDateString("en-GB", { month: "short", timeZone: "Europe/London" })}</span>
                        <span className="block bg-card pt-1 font-display text-[1.5rem] leading-none font-extrabold text-ink">{d.toLocaleDateString("en-GB", { day: "numeric", timeZone: "Europe/London" })}</span>
                        <span className="block bg-card pb-1 text-[0.6875rem] font-bold text-ink-2">{d.toLocaleDateString("en-GB", { year: "numeric", timeZone: "Europe/London" })}</span>
                      </p>
                      <div className="min-w-0">
                        <p className="font-bold text-ink">{e.title}</p>
                        <p className="text-small text-ink-2">
                          {d.toLocaleDateString("en-GB", { weekday: "long", timeZone: "Europe/London" })} · {e.nation === "northern_ireland" ? "Northern Ireland" : "England"} · September {e.entry_year} entry{e.test_name ? ` · ${e.test_name}` : ""}
                        </p>
                        <Status status={e.verification_status} className="mt-2" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-5 py-6 text-ink-2">No upcoming dates are held yet.</p>
            )}
          </div>
        </Page>
      </section>

      {/* 9 — Parent guides (reference blog cards) */}
      <section aria-labelledby="guides" className="py-[var(--section-y)]">
        <Page>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Head id="guides" kicker="Parent guides" title="Admissions, explained in plain English" align="start" />
            <ButtonLink href="/admissions" variant="secondary" arrow>
              All guides
            </ButtonLink>
          </div>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {guides.map((g, i) => (
              <li key={g.slug} data-reveal style={{ "--i": i } as React.CSSProperties}>
                <Link href={`/admissions/${g.slug}`} className="group/card card-hover flex h-full flex-col overflow-hidden rounded-[var(--r-3)] bg-sage no-underline transition-[transform,box-shadow] duration-[var(--d-3)]">
                  <span className={clsx("relative grid h-36 place-items-center overflow-hidden", tile[i % 3])}>
                    <span aria-hidden className="deco deco-dots top-3 right-4 h-12 w-16 text-current opacity-40" />
                    <span className="zoom-on-hover grid size-16 place-items-center rounded-full bg-card shadow-card">
                      <IconBook size={28} />
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col p-5 sm:p-6">
                    <span className="inline-flex items-center gap-1.5 text-[0.875rem] font-bold text-ink-2">
                      <IconRoute size={15} className="text-copper" /> {READING_PATHS[g.path].title}
                    </span>
                    <span className="mt-2 flex-1 font-display text-[1.25rem] leading-snug font-extrabold text-ink transition-colors group-hover/card:text-green">{g.title}</span>
                    <span className="mt-4 flex items-center justify-between gap-3 text-[0.875rem]">
                      <span className="inline-flex items-center gap-1.5 text-ink-2">
                        <IconCalendar size={15} /> Updated {formatDate(g.updated)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-green-deep">
                        Read more <IconArrow size={14} className="transition-transform group-hover/card:translate-x-1" />
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Page>
      </section>

      {/* 10 — Our promise */}
      <section aria-labelledby="promise">
        <Page>
          <div data-reveal className="grid gap-4 rounded-[var(--r-3)] border border-rule bg-card p-6 shadow-card md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-6 sm:p-7">
            <span className="icon-tile size-14">
              <IconSeal size={24} />
            </span>
            <div>
              <h2 id="promise" className="text-[1.25rem] text-ink">
                Our promise
              </h2>
              <p className="mt-1 max-w-[52rem] text-[1rem] leading-relaxed text-ink-2">
                Grammar Atlas is independent. We distinguish published facts, missing records and information awaiting verification, so you can research confidently without mistaking an estimate for an admission decision.
              </p>
            </div>
            <ButtonLink href="/methodology" variant="secondary" arrow>
              Our methodology
            </ButtonLink>
          </div>
        </Page>
      </section>
    </>
  );
}
