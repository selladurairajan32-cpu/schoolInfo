import type { Metadata } from "next";
import Link from "next/link";
import { defaultEntryYear } from "@/lib/academic-year";
import { areaIndex, selectiveA8 } from "@/server/insights";
import { searchSchools, siteStats } from "@/server/schools";
import { parseDirectoryParams } from "@/server/search-params";
import { Breadcrumbs } from "@/ui/breadcrumbs";
import { DirectoryDesk } from "@/ui/directory/directory";
import { IconSearch } from "@/ui/icons";
import { Hero, HeroHead } from "@/ui/hero";
import { Page, SectionHead } from "@/ui/kit";

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.keys(sp).length > 0;
  return {
    title: "Explore UK grammar schools: find, understand and compare",
    description: "Search every state grammar school in England and Northern Ireland by name, town or postcode. Filter by entrance test, gender, sixth form and admissions rules.",
    alternates: { canonical: "/grammar-schools" },
    // Filter permutations are useful for people, not for search engines.
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = parseDirectoryParams(await searchParams);
  const entryYear = defaultEntryYear();
  // The map shows every match at once, so it asks for them all rather than one page.
  const map = p.view === "map";
  const [result, index, stats, bench] = await Promise.all([searchSchools(map ? { ...p, page: 1 } : p, { entryYear, pageSize: map ? 500 : undefined }), areaIndex(), siteStats(), selectiveA8()]);

  return (
    <>
      <Hero edge={false}>
        <Breadcrumbs items={[{ href: "/grammar-schools", label: "Grammar schools" }]} />
        <HeroHead title="Explore UK grammar schools" lede="Find grammar schools by location, understand admissions and compare academic results using official school information.">
          <form method="get" action="/grammar-schools" role="search" className="on-light mt-5 flex max-w-[42rem] gap-2 rounded-[var(--r-3)] bg-card p-1.5 shadow-[0_0_0_1px_var(--rule),0_14px_30px_-20px_rgb(0_0_0/0.45)] sm:p-2">
            {p.view ? <input type="hidden" name="view" value={p.view} /> : null}
            <label htmlFor="dir-q" className="sr-only">
              Enter a school, town or postcode
            </label>
            <span className="relative block min-w-0 flex-1">
              <IconSearch size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
              <input id="dir-q" name="q" type="search" defaultValue={p.q} placeholder="Enter a school, town or postcode" className="min-h-12 w-full rounded-[10px] bg-transparent pr-2 pl-10 text-[1.0625rem] text-ink placeholder:text-ink-3 focus:outline-2 focus:outline-green" />
            </span>
            <button type="submit" className="inline-flex min-h-12 shrink-0 items-center rounded-[10px] bg-green px-4 font-semibold text-white hover:bg-navy sm:px-5">
              Search
            </button>
          </form>
          <nav aria-label="Ways to explore" className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 text-[0.9375rem] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {(
              [
                ["Find schools near me", "/grammar-schools#find-near", false],
                [`Browse England (${stats.england + stats.partial})`, "/grammar-schools?nation=england", p.nation === "england"],
                [`Browse Northern Ireland (${stats.ni})`, "/grammar-schools?nation=northern_ireland", p.nation === "northern_ireland"],
                ["Explore by region", "#by-area", false],
              ] as const
            ).map(([label, href, on]) => (
              <Link key={href} href={href} aria-current={on ? "true" : undefined} className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-rule bg-card px-3.5 font-semibold whitespace-nowrap text-ink no-underline transition-colors hover:border-green hover:text-green aria-[current]:border-green aria-[current]:bg-green-wash aria-[current]:text-green-deep">
                {label}
              </Link>
            ))}
          </nav>
        </HeroHead>
      </Hero>

      <Page className="pt-5 pb-4 sm:pt-7">
        <DirectoryDesk p={p} result={result} basePath="/grammar-schools" entryYear={entryYear} bench={bench} heading="All grammar schools" listed={stats.listed} regions={index.map((g) => ({ slug: g.slug, name: g.name, n: g.n }))} />
      </Page>

      <Page as="section" className="pt-12 pb-6">
        <SectionHead id="by-area" kicker="Browse" title="Grammar schools by area" lede="Every council area with at least one grammar school, grouped by region. Numbers are schools listed." />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {index.map((g) => (
            <section key={g.slug} aria-labelledby={`ix-${g.slug}`} className="rounded-[var(--r-3)] bg-card p-4 shadow-[0_0_0_1px_var(--rule),var(--shadow-card)]">
              <h3 id={`ix-${g.slug}`} className="flex items-baseline justify-between gap-3 text-[1.0625rem] font-bold">
                <Link href={`/grammar-schools/${g.slug}`} className="text-ink no-underline hover:text-green">
                  {g.name}
                </Link>
                <span className="font-mono text-[0.8125rem] font-normal text-ink-2">{g.n} schools</span>
              </h3>
              {g.slug !== "northern-ireland" ? (
                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.9375rem]">
                  {g.las.map((a) => (
                    <li key={a.slug}>
                      <Link href={`/grammar-schools/${a.slug}`} className="text-ink-2 hover:text-green">
                        {a.name}
                      </Link>{" "}
                      <span className="font-mono text-[0.8125rem] text-ink-3">{a.n}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[0.9375rem] text-ink-2">One Education Authority covers every school; entry is at Year 8.</p>
              )}
            </section>
          ))}
        </div>
      </Page>
    </>
  );
}
