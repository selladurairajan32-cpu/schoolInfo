import type { ReactNode } from "react";
import { clsx } from "clsx";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

/** Decorative shapes from the reference banners: a dot grid, a ring and a small disc. Hidden from assistive technology. */
export function HeroDecor({ variant = "page" }: { variant?: "page" | "home" }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="deco deco-dots float-x top-6 right-[6%] h-16 w-24 text-copper sm:h-20 sm:w-32" />
      <span className="deco deco-ring float-y top-[38%] left-[2%] hidden size-7 text-green/50 sm:block" />
      <span className={clsx("deco float-y bottom-6 hidden size-3 rounded-full bg-amber sm:block", variant === "home" ? "left-[46%]" : "right-[22%]")} style={{ animationDelay: "-2s" }} />
      <svg className="deco spin-slow -right-24 -bottom-28 hidden h-72 w-72 text-green/15 md:block" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 10" />
      </svg>
    </div>
  );
}

/**
 * The top band of a page: the reference's peach-into-lavender banner behind
 * the breadcrumb, title, summary and key figures.
 */
export function Hero({ children, className, edge = true }: { children: ReactNode; className?: string; edge?: boolean }) {
  return (
    <section data-hero className="relative overflow-hidden">
      <HeroDecor />
      <div className={clsx("relative z-[1] container-page pt-7 sm:pt-9", edge ? "pb-10 sm:pb-16" : "pb-8 sm:pb-11", className)}>{children}</div>
    </section>
  );
}

/** The heading block inside a Hero: label, title, one-sentence summary, and an optional column of key figures. */
export function HeroHead({ kicker, title, lede, meta, aside, children }: { kicker?: ReactNode; title: ReactNode; lede?: ReactNode; meta?: ReactNode; aside?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mt-5 grid gap-x-12 gap-y-7 sm:mt-7 sm:gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,20rem)] lg:items-end">
      <div className="anim-rise max-w-[46rem] min-w-0">
        {kicker ? <p className="label eyebrow">{kicker}</p> : null}
        <h1 className="mt-3 text-[clamp(1.75rem,1.35rem+1.7vw,2.5rem)] leading-[1.35] font-extrabold tracking-[-0.005em] text-ink">{title}</h1>
        {lede ? <p className="mt-3 text-[1.0625rem] leading-[1.65] text-ink-2 sm:mt-4 sm:text-[1.1875rem]">{lede}</p> : null}
        {meta ? <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-ink-2">{meta}</div> : null}
        {children}
      </div>
      {aside ? <div className="anim-rise min-w-0 [animation-delay:120ms]">{aside}</div> : null}
    </div>
  );
}

/** Key figures beside a HeroHead: a white summary card, like the reference's course sidebar. */
export function HeroFigures({ items, footer }: { items: [ReactNode, ReactNode][]; footer?: ReactNode }) {
  return (
    <div className="card p-5 sm:p-6">
      <dl className={clsx("grid gap-4 lg:grid-cols-1 lg:gap-0", items.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
        {items.map(([v, l], i) => (
          <div key={i} className="flex flex-col lg:border-b lg:border-dashed lg:border-rule lg:py-3 lg:first:pt-0 lg:last:border-b-0 lg:last:pb-0">
            <dt className="order-2 text-[0.8125rem] leading-snug font-semibold text-ink-3 sm:text-[0.875rem]">{l}</dt>
            <dd className="order-1 font-display text-[1.625rem] leading-tight font-extrabold text-ink num sm:text-[2rem]">{v}</dd>
          </div>
        ))}
      </dl>
      {footer ? <div className="mt-3 border-t border-rule pt-3 text-[0.8125rem] text-ink-2 sm:text-[0.875rem]">{footer}</div> : null}
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
