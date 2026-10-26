import Link from "next/link";
import type { ReactNode } from "react";
import { formatDate } from "@/lib/format";
import { absoluteUrl, SITE } from "@/lib/site";
import { Hero } from "../hero";
import { Breadcrumbs, type Crumb } from "../breadcrumbs";
import { IconArrow, IconExternal } from "../icons";
import { JsonLd } from "../json-ld";
import { ReadingProgress, Toc } from "./progress";

/** Section heading with a deep link that appears on hover or focus. */
export function DeepHeading({ id, children, n }: { id: string; children: ReactNode; n?: number }) {
  return (
    <h2 id={id} data-n={n} className="group/dh relative mt-10 mb-4 scroll-mt-[calc(var(--header-h)+1.5rem)] text-h2 font-extrabold text-ink first:mt-0">
      {children}
      <a href={`#${id}`} className="ml-2 inline-block align-middle text-[0.9em] text-ink-3 no-underline opacity-0 transition-opacity duration-[var(--d-1)] group-hover/dh:opacity-100 hover:text-green focus-visible:opacity-100">
        #<span className="sr-only">Link to this section</span>
      </a>
    </h2>
  );
}

export interface RelatedLink {
  href: string;
  title: string;
  text?: string;
  kicker?: string;
}

/**
 * Long-form article: reading progress, a contents rail with scroll-spy, deep-linked
 * sections, numbered sources and related reading. Emits Article structured data.
 */
export function ArticleShell({
  crumbs,
  kicker,
  title,
  lede,
  description,
  updated,
  sources,
  path,
  toc,
  children,
  related = [],
  next,
}: {
  crumbs: Crumb[];
  kicker: ReactNode;
  title: string;
  lede: ReactNode;
  description: string;
  updated: string;
  sources: { title: string; url: string }[];
  path: string;
  toc: { id: string; label: string }[];
  children: ReactNode;
  related?: RelatedLink[];
  next?: RelatedLink | null;
}) {
  return (
    <>
      <ReadingProgress target="article-body" />
      <Hero>
        <div id="top">
          <Breadcrumbs items={crumbs} />
        </div>
        <header className="anim-rise mt-4 max-w-[46rem] sm:mt-5">
          <p className="label eyebrow">{kicker}</p>
          <h1 className="mt-2 text-h1 leading-[1.22] font-extrabold tracking-[-0.005em] text-ink">{title}</h1>
          <p className="mt-3 text-small text-ink-2">
            Last reviewed <span className="font-semibold text-ink">{formatDate(updated)}</span>
            {sources.length ? (
              <>
                {" "}
                ·{" "}
                <a href="#sources" className="font-bold text-green-deep hover:underline">
                  {sources.length} official {sources.length === 1 ? "source" : "sources"}
                </a>
              </>
            ) : null}
          </p>
        </header>
      </Hero>

      <div className="container-page pb-10">
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-x-16 gap-y-6 xl:grid-cols-[minmax(0,720px)_260px]">
          <div className="xl:order-2">
            <div className="xl:sticky xl:top-[calc(var(--header-h)+3rem)]">
              <Toc items={toc} />
            </div>
          </div>
          <article id="article-body" className="min-w-0 xl:order-1">
            <div className="prose-atlas max-w-[var(--measure)]">
              <div className="text-lede leading-[1.65] text-ink [&_strong]:font-extrabold">{lede}</div>
              {children}
            </div>

            {next ? (
              <Link href={next.href} className="group/nx relative mt-12 flex max-w-[var(--measure)] items-center justify-between gap-6 overflow-hidden rounded-[var(--r-3)] bg-green px-6 py-6 text-white no-underline shadow-[0_16px_30px_-16px_rgb(82_95_225/0.9)] transition-[background-color,transform] duration-[var(--d-3)] hover:-translate-y-1 hover:bg-navy">
                <span aria-hidden className="deco deco-dots top-2 right-16 h-12 w-20 text-white/30" />
                <span className="relative">
                  <span className="label block text-[0.8125rem] text-white">{next.kicker ?? "Next"}</span>
                  <span className="mt-1 block font-display text-[1.375rem] leading-snug font-extrabold">{next.title}</span>
                </span>
                <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-white/15 transition-transform duration-[var(--d-3)] group-hover/nx:translate-x-1">
                  <IconArrow size={20} />
                </span>
              </Link>
            ) : null}

            {sources.length ? (
              <section aria-labelledby="sources" className="mt-12 max-w-[var(--measure)] rounded-[var(--r-3)] bg-sage p-5 sm:p-6">
                <h2 id="sources" className="label scroll-mt-[calc(var(--header-h)+1.5rem)] text-ink">
                  Official sources
                </h2>
                <ol className="mt-4 grid gap-3">
                  {sources.map((s, i) => (
                    <li key={s.url} className="grid grid-cols-[2rem_minmax(0,1fr)] text-[1rem]">
                      <span className="font-mono text-[0.85rem] font-bold text-copper-ink">[{i + 1}]</span>
                      <a href={s.url} rel="noopener noreferrer" target="_blank" className="a [overflow-wrap:anywhere]">
                        {s.title}
                        <IconExternal size={13} className="ml-1 inline-block align-[-1px]" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {related.length ? (
              <section aria-labelledby="related" className="mt-10">
                <h2 id="related" className="label text-ink">
                  Read next
                </h2>
                <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((r, i) => (
                    <li key={r.href} data-reveal style={{ "--i": i } as React.CSSProperties}>
                      <Link href={r.href} className="group/rel card card-hover flex h-full flex-col border border-rule p-5 no-underline">
                        {r.kicker ? <span className="label eyebrow text-[0.8125rem]">{r.kicker}</span> : null}
                        <span className="mt-1.5 font-display text-[1.2rem] leading-snug font-extrabold text-ink transition-colors group-hover/rel:text-green">{r.title}</span>
                        {r.text ? <span className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{r.text}</span> : null}
                        <IconArrow size={16} className="mt-auto pt-3 text-ink-3 transition-transform duration-[var(--d-2)] group-hover/rel:translate-x-1 group-hover/rel:text-green" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </article>
        </div>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          dateModified: updated,
          mainEntityOfPage: absoluteUrl(path),
          publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
          citation: sources.map((s) => s.url),
        }}
      />
    </>
  );
}
