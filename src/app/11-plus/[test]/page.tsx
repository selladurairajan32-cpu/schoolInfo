import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GENDER_LABEL, NATION_LABEL } from "@/domain/labels";
import { loadSources } from "@/server/profile";
import { getTest } from "@/server/tests";
import { Breadcrumbs } from "@/ui/breadcrumbs";
import { formatDate } from "@/lib/format";
import { Hero, HeroFigures, HeroHead } from "@/ui/hero";
import { IconArrow } from "@/ui/icons";
import { ExternalLink, Gap, Note, Page, SectionHead, Source } from "@/ui/kit";
import { Status } from "@/ui/status";
import { DateLine } from "@/ui/viz/admissions-viz";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ test: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getTest((await params).test);
  if (!data) return { title: "Test not found" };
  return {
    title: `${data.test.name}: format, dates and schools`,
    description: `${data.test.name} — what it tests, how scores work, official registration and test dates, and the schools that use it.`,
    alternates: { canonical: `/11-plus/${data.test.slug}` },
  };
}

/** "14 Nov 2026": short enough for the key-figures card on a 320px phone. */
const shortDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });

export default async function TestPage({ params }: Props) {
  const data = await getTest((await params).test);
  if (!data) notFound();
  const { test, provider, schools, events } = data;
  const sources = await loadSources([test.sourceDocumentId, ...events.map((e) => e.e.sourceDocumentId)]);
  const today = new Date().toISOString().slice(0, 10);
  const rows = events.map(({ e, c }) => {
    const doc = e.sourceDocumentId ? sources.get(e.sourceDocumentId) : null;
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      event_type: e.eventType,
      starts_on: e.startsOn,
      ends_on: e.endsOn,
      url: e.url ?? doc?.url ?? null,
      verification_status: e.verificationStatus,
      // Entry year and source title; the quoted locator is kept as a tooltip so the date and title lead.
      context: (
        <span title={e.sourceLocator ?? undefined}>
          {c.label}
          {doc ? ` · Source: ${doc.title}` : ""}
        </span>
      ),
    };
  });

  const next = rows.find((r) => (r.ends_on ?? r.starts_on) >= today) ?? null;
  const last = rows.at(-1) ?? null;

  return (
    <>
      <Hero>
        <Breadcrumbs items={[{ href: "/11-plus", label: "11+ exams" }, { href: `/11-plus/${test.slug}`, label: test.name }]} />
        <HeroHead
          kicker={`Entrance test · ${NATION_LABEL[test.nation]}`}
          title={test.name}
          lede={test.areaDescription ?? undefined}
          meta={
            <>
              <Status status={test.verificationStatus} />
              {provider ? <span>Set by {provider.name}</span> : null}
            </>
          }
          aside={
            <HeroFigures
              items={[
                [schools.length, schools.length === 1 ? "school linked to this test" : "schools linked to this test"],
                next ? [shortDate(next.starts_on), `${new Date(`${next.starts_on}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", timeZone: "Europe/London" })}: ${next.title}`] : ["None", last ? `upcoming dates held; the last was ${formatDate(last.starts_on)}` : "official dates held yet"],
              ]}
            />
          }
        />
      </Hero>

      <Page className="grid grid-cols-[minmax(0,1fr)] gap-y-9 pt-6 pb-12">
        <div className="grid max-w-[52rem] min-w-0 content-start gap-10">
          {test.verificationStatus === "unavailable" ? (
            <Note tone="caution" title="Details not yet verified">
              We could not retrieve this test&apos;s current arrangements from the official source automatically. Please use the{" "}
              <a href={test.website ?? "#"} rel="noopener noreferrer" target="_blank">
                official page
              </a>{" "}
              until an editor has checked them.
            </Note>
          ) : null}

          {test.summary || test.administeredBy || test.website ? (
            <section aria-labelledby="about">
              <SectionHead id="about" kicker="Overview" title="How the test works" />
              {test.summary ? <p className="mt-4 text-[1.0625rem] leading-[1.7] text-ink">{test.summary}</p> : null}
              <dl className="mt-5 grid gap-x-8 border-t border-rule sm:grid-cols-2">
                {[
                  ["Set by", provider?.name],
                  ["Administered by", test.administeredBy],
                  ["Used by", test.areaDescription],
                ]
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 border-b border-rule py-2.5 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
                      <dt className="text-[0.9375rem] text-ink-2">{k}</dt>
                      <dd className="min-w-0 text-[0.9375rem] font-semibold [overflow-wrap:anywhere] text-ink">{v}</dd>
                    </div>
                  ))}
                {test.website ? (
                  <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 border-b border-rule py-2.5 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
                    <dt className="text-[0.9375rem] text-ink-2">Official page</dt>
                    <dd className="min-w-0 text-[0.9375rem] font-semibold [overflow-wrap:anywhere]">
                      <ExternalLink href={test.website}>{new URL(test.website).hostname.replace(/^www\./, "")}</ExternalLink>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          <section aria-labelledby="dates">
            <SectionHead id="dates" kicker="Timetable" title="Key dates" lede="Only dates published by the test administrator or schools are shown." />
            <div className="mt-6">{rows.length ? <DateLine events={rows} today={today} /> : <Gap title="No official dates are held yet for this test." />}</div>
          </section>

          <section aria-labelledby="format">
            <SectionHead id="format" kicker="The paper" title="Format" />
            <dl className="mt-6 grid gap-px overflow-hidden rounded-[8px] border border-rule bg-rule sm:grid-cols-2">
              {[
                ["Papers", test.format],
                ["How results are reported", test.scoreScale],
              ].map(([k, v]) => (
                <div key={k} className="bg-card px-5 py-4">
                  <dt className="label text-[0.8125rem]">{k}</dt>
                  <dd className="mt-1.5 text-[1.02rem] text-ink">{v ?? "Not recorded"}</dd>
                </div>
              ))}
            </dl>
            {test.components?.length ? (
              <ol className="mt-6 grid gap-4 sm:grid-cols-2">
                {test.components.map((c, i) => (
                  <li key={c.subject} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-2 border-t border-rule pt-3">
                    <span className="font-mono text-[0.85rem] text-copper-ink">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-semibold text-ink">{c.subject}</span>
                      {c.detail ? <span className="mt-0.5 block text-[0.98rem] text-ink-2">{c.detail}</span> : null}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
            {test.standardisation ? (
              <div className="mt-6 border-l-2 border-copper pl-4">
                <p className="label">Standardisation</p>
                <p className="mt-1 max-w-[68ch] text-[1.02rem] leading-relaxed text-ink">{test.standardisation}</p>
              </div>
            ) : null}
            <Source source={test.sourceDocumentId ? sources.get(test.sourceDocumentId) : null} locator={test.sourceLocator} status={test.verificationStatus} />
          </section>

        </div>

        <section aria-labelledby="schools" className="min-w-0">
          <SectionHead id="schools" kicker="Where it is used" title={`Schools linked to this test (${schools.length})`} lede="Links are awaiting editor verification unless marked otherwise on each school's profile." />
          {schools.length ? (
            <ul className="mt-5 grid gap-x-8 border-t border-rule sm:grid-cols-2 xl:grid-cols-3">
              {schools.map((s) => (
                <li key={s.slug} className="border-b border-rule">
                  <Link href={`/schools/${s.slug}`} className="group/sl flex items-center justify-between gap-3 py-3 no-underline">
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink group-hover/sl:text-green">{s.name}</span>
                      <span className="text-[0.9375rem] text-ink-2">
                        {s.town}
                        {s.gender !== "unknown" ? ` · ${GENDER_LABEL[s.gender]}` : ""}
                      </span>
                    </span>
                    <IconArrow size={16} className="shrink-0 text-ink-3 transition-transform group-hover/sl:translate-x-1 group-hover/sl:text-green" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Gap className="mt-5" title="No school links have been verified yet.">
              Each school&apos;s published admissions criteria say whether it uses this test.
            </Gap>
          )}
        </section>
      </Page>
    </>
  );
}
