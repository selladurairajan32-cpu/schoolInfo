import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

/**
 * The top band of a page: a flat tint behind the breadcrumb, title, summary
 * and key figures.
 */
export function Hero({ children, className, edge = true, wide = false }: { children: ReactNode; className?: string; edge?: boolean; wide?: boolean }) {
  return (
    <section data-hero className="relative overflow-hidden">
      <div className={clsx("relative z-[1] pt-[var(--banner-top)]", wide ? "container-wide" : "container-page", edge ? "pb-[var(--banner-bottom)]" : "pb-7 sm:pb-9", className)}>{children}</div>
    </section>
  );
}

/** The heading block inside a Hero: label, title, one-sentence summary, and an optional column of key figures. */
export function HeroHead({ kicker, title, lede, meta, aside, children }: { kicker?: ReactNode; title: ReactNode; lede?: ReactNode; meta?: ReactNode; aside?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mt-4 grid gap-x-10 gap-y-5 sm:mt-5 sm:gap-y-6 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,19rem)] lg:items-end">
      <div className="anim-rise max-w-[46rem] min-w-0">
        {kicker ? <p className="label eyebrow">{kicker}</p> : null}
        <h1 className="mt-2 text-h1 text-ink">{title}</h1>
        {lede ? <p className="mt-2.5 max-w-[42rem] font-read text-lede leading-[1.6] text-ink-2 sm:mt-3">{lede}</p> : null}
        {meta ? <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-ink-2">{meta}</div> : null}
        {children}
      </div>
      {aside ? <div className="anim-rise min-w-0 [animation-delay:120ms]">{aside}</div> : null}
    </div>
  );
}

/** Key figures beside a HeroHead: a white summary card of figures with quiet descriptions. */
export function HeroFigures({ items, footer }: { items: [ReactNode, ReactNode][]; footer?: ReactNode }) {
  return (
    <div className="card px-4 py-3.5 sm:p-5">
      <dl className={clsx("grid gap-3 lg:grid-cols-1 lg:gap-0", items.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
        {items.map(([v, l], i) => (
          <div key={i} className="flex min-w-0 flex-col lg:border-b lg:border-dashed lg:border-rule lg:py-2.5 lg:first:pt-0 lg:last:border-b-0 lg:last:pb-0">
            <dt className="order-2 text-[0.8125rem] leading-snug font-semibold text-ink-3">{l}</dt>
            <dd className="order-1 font-display text-[1.375rem] leading-tight font-semibold tracking-[-0.02em] text-ink num sm:text-[1.625rem]">{v}</dd>
          </div>
        ))}
      </dl>
      {footer ? <div className="mt-2.5 border-t border-rule pt-2.5 text-[0.8125rem] leading-snug text-ink-2">{footer}</div> : null}
    </div>
  );
}

/** The standard page top: breadcrumbs and heading on the banner. */
export function PageHero({ crumbs, kicker, title, lede, meta, aside, children }: { crumbs: Crumb[]; kicker?: ReactNode; title: ReactNode; lede?: ReactNode; meta?: ReactNode; aside?: ReactNode; children?: ReactNode }) {
  return (
    <Hero>
      <Breadcrumbs items={crumbs} />
      <HeroHead kicker={kicker} title={title} lede={lede} meta={meta} aside={aside}>
        {children}
      </HeroHead>
    </Hero>
  );
}
