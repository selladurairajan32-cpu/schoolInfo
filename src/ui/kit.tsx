import Link from "next/link";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { formatDate } from "@/lib/format";
import type { SourceRef } from "@/server/profile";
import { IconArrow, IconChevron, IconDocument, IconExternal, IconInfo, IconWarning } from "./icons";
import { Status, type Verification } from "./status";

/* ───────────────────────── Layout ───────────────────────── */

export function Page({ children, className, as: As = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" | "article" | "header" }) {
  return <As className={clsx("container-page", className)}>{children}</As>;
}

/** Small uppercase kicker above a heading. */
export function Kicker({ children, className }: { children: ReactNode; className?: string; plain?: boolean }) {
  return <p className={clsx("label eyebrow", className)}>{children}</p>;
}

/** Standard page header for index, tool and data pages: asymmetric, with an optional aside. */
export function PageHead({ kicker, title, lede, meta, aside, className }: { kicker?: ReactNode; title: ReactNode; lede?: ReactNode; meta?: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <header className={clsx("grid gap-x-10 gap-y-6 pt-6 pb-6 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] lg:items-end", className)}>
      <div className="max-w-[46rem]">
        {kicker ? <Kicker>{kicker}</Kicker> : null}
        <h1 className="mt-3 text-h1">{title}</h1>
        {lede ? <p className="mt-4 text-lede leading-[1.65] text-ink-2">{lede}</p> : null}
        {meta ? <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-ink-2">{meta}</div> : null}
      </div>
      {aside ? <div className="min-w-0">{aside}</div> : null}
    </header>
  );
}

/** Section heading: label, title and an optional lede and action. */
export function SectionHead({ id, kicker, title, lede, action, className, size = "h2", align = "start" }: { id?: string; kicker?: ReactNode; title: ReactNode; lede?: ReactNode; action?: ReactNode; className?: string; size?: "h2" | "h3"; align?: "start" | "center" }) {
  const H = size;
  return (
    <div data-reveal className={clsx("flex flex-wrap items-end gap-x-8 gap-y-3", align === "center" ? "justify-center text-center" : "justify-between", className)}>
      <div className={clsx("max-w-[44rem] min-w-0", align === "center" && "mx-auto")}>
        {kicker ? <p className="label eyebrow mb-2.5">{kicker}</p> : null}
        <H id={id} className={size === "h2" ? "text-h2" : "text-h3"}>
          {title}
        </H>
        {lede ? <p className="mt-2 text-[1rem] leading-[1.6] text-ink-2">{lede}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ───────────────────────── Actions ───────────────────────── */

/*
 * Reference "edu-btn" (measured): 5px radius, 700 weight, 0.4s transition.
 * Primary indigo darkens to navy on hover; the orange accent turns indigo.
 */
const BUTTON = {
  primary: "bg-green text-white hover:bg-navy border border-green hover:border-navy",
  accent: "bg-cta text-white hover:bg-green border border-cta hover:border-green",
  secondary: "border border-rule-strong bg-card text-ink hover:border-green hover:bg-green hover:text-white",
  quiet: "border border-transparent text-green hover:bg-green-wash",
} as const;

const buttonBase =
  "group/btn inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--r-2)] px-5 text-[0.9375rem] font-bold no-underline transition-[background-color,border-color,color,transform] duration-[var(--d-3)] ease-[var(--ease-out)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

export function Button({ variant = "primary", className, ...props }: ComponentProps<"button"> & { variant?: keyof typeof BUTTON }) {
  return <button {...props} className={clsx(buttonBase, BUTTON[variant], className)} />;
}

export function ButtonLink({ variant = "primary", className, arrow = false, children, ...props }: ComponentProps<typeof Link> & { variant?: keyof typeof BUTTON; arrow?: boolean }) {
  return (
    <Link {...props} className={clsx(buttonBase, BUTTON[variant], className)}>
      {children}
      {arrow ? <IconArrow size={16} className="transition-transform duration-[var(--d-2)] ease-[var(--ease-out)] group-hover/btn:translate-x-1" /> : null}
    </Link>
  );
}

/** Text link with a travelling arrow — for "read more" style routes. */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={clsx("group/al inline-flex items-center gap-1.5 font-bold text-green-deep no-underline hover:text-green", className)}>
      <span className="underline decoration-current/30 decoration-2 underline-offset-[0.25em] transition-[text-decoration-color] group-hover/al:decoration-current">{children}</span>
      <IconArrow size={16} className="shrink-0 transition-transform duration-[var(--d-2)] ease-[var(--ease-out)] group-hover/al:translate-x-1" />
    </Link>
  );
}

export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={clsx("a", className)}>
      {children}
      <IconExternal size={13} className="ml-1 inline-block align-[-1px]" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/* ───────────────────────── Forms ───────────────────────── */

export const controlClass =
  "w-full min-h-12 rounded-[var(--r-2)] border border-control bg-card px-3.5 text-[1rem] font-medium text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] duration-[var(--d-2)] hover:border-ink focus:border-green focus:outline-none focus-visible:outline-none focus:shadow-[0_0_0_4px_rgb(82_95_225/0.18)]";

export function Field({ id, label, hint, error, children, className }: { id: string; label: ReactNode; hint?: ReactNode; error?: string | null; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-[0.98rem] font-bold text-ink">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="-mt-0.5 text-small text-ink-2">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-small font-semibold text-bad" role="alert">
          <IconWarning size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      ) : null}
    </div>
  );
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <span className="relative block">
      <select {...props} className={clsx(controlClass, "appearance-none pr-10", className)} />
      <IconChevron size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-2" />
    </span>
  );
}

/** A checkbox with a drawn tick. */
export function Check({ name, value, defaultChecked, checked, onChange, label, hint }: { name: string; value?: string; defaultChecked?: boolean; checked?: boolean; onChange?: (v: boolean) => void; label: ReactNode; hint?: ReactNode }) {
  return (
    <label className="group/ck flex cursor-pointer items-start gap-3 py-1.5 text-[0.98rem] text-ink">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="mt-[3px] grid size-[18px] shrink-0 place-items-center rounded-[4px] border border-control bg-card transition-colors duration-[var(--d-1)] peer-checked:border-green peer-checked:bg-green peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
      >
        <svg viewBox="0 0 12 12" width="12" height="12" className="text-paper transition-opacity duration-[var(--d-1)]">
          <path d="m2.5 6.2 2.3 2.3 4.7-4.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </span>
      <span>
        {label}
        {hint ? <span className="block text-small text-ink-2">{hint}</span> : null}
      </span>
    </label>
  );
}

/* ───────────────────────── Evidence ───────────────────────── */

/** Inline citation: what the fact rests on, and when we last looked. */
export function Source({ source, locator, status, checkedAt, className, label = "Source" }: { source?: SourceRef | null; locator?: string | null; status?: Verification | string | null; checkedAt?: Date | string | null; className?: string; label?: string }) {
  if (!source) {
    return (
      <p className={clsx("mt-3 flex flex-wrap items-center gap-2 text-small text-ink-2", className)}>
        <Status status="unavailable" /> No official source is recorded for this item.
      </p>
    );
  }
  const external = /^https?:/.test(source.url);
  return (
    <div className={clsx("mt-4 flex flex-wrap items-start gap-x-3 gap-y-2 border-t border-dashed border-rule pt-3 text-small leading-snug text-ink-2", className)}>
      {status ? <Status status={status} /> : null}
      <p className="flex min-w-0 flex-1 items-start gap-2">
        <IconDocument size={16} className="mt-0.5 shrink-0 text-ink-3" />
        <span className="min-w-0 [overflow-wrap:anywhere]">
          <span className="label mr-1.5 tracking-normal normal-case">{label}</span>
          {external ? <ExternalLink href={source.url}>{source.title}</ExternalLink> : source.title}
          {source.publisher ? <span>, {source.publisher}</span> : null}
          {locator ? <span> — {locator}</span> : null}. Retrieved {formatDate(source.retrievedAt)}
          {checkedAt ? `; checked ${formatDate(checkedAt instanceof Date ? checkedAt.toISOString() : checkedAt)}` : ""}.
        </span>
      </p>
    </div>
  );
}

const NOTE = {
  note: { box: "border-l-info bg-info-wash", icon: IconInfo, iconTone: "text-info" },
  caution: { box: "border-l-[var(--warn-edge)] bg-pend-wash", icon: IconWarning, iconTone: "text-pend" },
  warning: { box: "border-l-bad bg-bad-wash", icon: IconWarning, iconTone: "text-bad" },
  plain: { box: "border-l-rule-strong bg-sage/60", icon: IconInfo, iconTone: "text-ink-2" },
} as const;

/** Explanatory callout. Tone carries meaning; the title states it in words. */
export function Note({ tone = "note", title, children, className, icon = true }: { tone?: keyof typeof NOTE; title?: ReactNode; children: ReactNode; className?: string; icon?: boolean }) {
  const t = NOTE[tone];
  const Icon = t.icon;
  return (
    <aside className={clsx("relative rounded-r-[var(--r-3)] border-l-[4px] py-5 pr-5 pl-[21px] text-[1.0625rem] leading-[1.65] text-ink sm:py-6 sm:pr-8 sm:pl-[29px] [.prose-atlas_&]:max-sm:-mx-4 [.prose-atlas_&]:max-sm:rounded-none [.prose-atlas_&]:max-sm:pl-[13px] [.prose-atlas_&]:lg:-mx-8", icon && "mt-4", t.box, className)}>
      {icon ? (
        <span aria-hidden className={clsx("absolute -top-4 left-2 grid size-8 place-items-center rounded-full bg-card shadow-card sm:-left-[18px]", t.iconTone)}>
          <Icon size={22} />
        </span>
      ) : null}
      <div className="min-w-0 [&_a]:font-bold [&_a]:text-green-deep [&_a]:underline [&_a]:underline-offset-2">
        {title ? <p className="font-extrabold text-ink">{title}</p> : null}
        <div className={title ? "mt-1 text-ink" : "text-ink"}>{children}</div>
      </div>
    </aside>
  );
}

/** Missing data, drawn as a hatched band so a gap never looks like a zero. */
export function Gap({ title, children, className }: { title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={clsx("flex overflow-hidden rounded-[var(--r-3)] border border-rule bg-card", className)}>
      <span aria-hidden className="w-3 shrink-0 bg-[repeating-linear-gradient(-45deg,var(--rule-strong)_0_1px,transparent_1px_6px)]" />
      <div className="px-4 py-3.5">
        <p className="font-bold text-ink">{title}</p>
        {children ? <div className="mt-1 text-[0.98rem] leading-relaxed text-ink-2 [&_a]:font-semibold [&_a]:text-green-deep [&_a]:underline">{children}</div> : null}
      </div>
    </div>
  );
}

/* ───────────────────────── Data display ───────────────────────── */

/** Key–value facts on hairlines. */
export function Facts({ items, className, dense = false }: { items: [ReactNode, ReactNode, ReactNode?][]; className?: string; dense?: boolean }) {
  return (
    <dl className={clsx("divide-y divide-rule", className)}>
      {items.map(([k, v, meta], i) => (
        <div key={i} className={clsx("grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-x-4", dense ? "py-2" : "py-2.5")}>
          <dt className="text-[0.95rem] font-medium text-ink-2">{k}</dt>
          <dd className="text-[0.98rem] font-bold text-ink num">
            {v}
            {meta ? <span className="block text-small font-normal text-ink-2">{meta}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** A headline figure with its period and benchmark. */
export function Stat({ label, value, unit, period, benchmark, className, size = "lg" }: { label: ReactNode; value: ReactNode; unit?: ReactNode; period?: ReactNode; benchmark?: ReactNode; className?: string; size?: "lg" | "md" }) {
  return (
    <div className={clsx("min-w-0", className)}>
      <p className="label">{label}</p>
      <p className={clsx("mt-1.5 font-display leading-none font-extrabold text-ink num", size === "lg" ? "text-[2.6rem]" : "text-[2rem]")}>
        {value}
        {unit ? <span className="ml-1.5 font-sans text-[1rem] font-semibold text-ink-2">{unit}</span> : null}
      </p>
      {period ? <p className="mt-2 text-small text-ink-2">{period}</p> : null}
      {benchmark ? <p className="mt-0.5 text-small text-ink-2">{benchmark}</p> : null}
    </div>
  );
}

/** Small factual tag — the reference's soft-washed category chip. */
export function Tag({ children, tone = "plain", className }: { children: ReactNode; tone?: "plain" | "green" | "copper" | "bad"; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-[var(--r-2)] border px-2.5 py-1 text-[0.8125rem] leading-tight font-bold whitespace-nowrap",
        tone === "plain" && "border-transparent bg-sage text-ink-2",
        tone === "green" && "border-transparent bg-green-wash text-green-deep",
        tone === "copper" && "border-transparent bg-copper-wash text-copper-ink",
        tone === "bad" && "border-transparent bg-bad-wash text-bad",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Numbered figure with title, caption, period and source — every chart and diagram sits in one. */
export function Figure({ n, title, caption, period, source, children, className, id, stage = false }: { n?: string | number; title: ReactNode; caption?: ReactNode; period?: ReactNode; source?: ReactNode; children: ReactNode; className?: string; id?: string; stage?: boolean }) {
  return (
    <figure id={id} className={clsx("not-prose min-w-0", className)}>
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {n !== undefined ? <span className="label text-copper-ink">Fig. {n}</span> : null}
        <p className="font-display text-[1.25rem] leading-snug font-extrabold text-ink">{title}</p>
        {period ? <span className="text-small text-ink-2">· {period}</span> : null}
      </div>
      {stage ? <div className="playground p-4 sm:p-6 lg:-mx-8">{children}</div> : children}
      {caption || source ? (
        <figcaption className="mt-3 max-w-[64ch] text-small leading-relaxed text-ink-2">
          {caption}
          {source ? <span className="mt-1 block">{source}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** Expandable panel — the reference FAQ accordion: shade bar, +/− marker, animated height. Works without JavaScript. */
export function Disclosure({ summary, children, open, className }: { summary: ReactNode; children: ReactNode; open?: boolean; className?: string }) {
  return (
    <details className={clsx("acc group/d mt-2 overflow-hidden rounded-[var(--r-2)] bg-sage transition-colors open:bg-card open:shadow-card first:mt-0", className)} open={open}>
      <summary className="flex min-h-13 list-none items-center gap-3.5 px-4 py-3 text-left font-bold text-ink transition-colors hover:text-green sm:px-5">
        <span aria-hidden className="relative grid size-6 shrink-0 place-items-center rounded-full bg-card text-green shadow-card group-open/d:bg-green group-open/d:text-white">
          <span className="absolute h-0.5 w-2.5 rounded bg-current" />
          <span className="absolute h-2.5 w-0.5 rounded bg-current transition-transform duration-[var(--d-2)] ease-[var(--ease-out)] group-open/d:scale-y-0" />
        </span>
        <span className="min-w-0 flex-1">{summary}</span>
        <IconChevron size={18} className="sr-only" />
      </summary>
      <div className="px-4 pb-5 text-[1.0625rem] leading-[1.7] text-ink-2 sm:px-5 sm:pl-[3.875rem] [&_a]:font-semibold [&_a]:text-green-deep [&_a]:underline">{children}</div>
    </details>
  );
}

/** Scrollable data table frame with a caption. */
export function TableFrame({ caption, children, className, minWidth = 640 }: { caption: string; children: ReactNode; className?: string; minWidth?: number }) {
  return (
    <div className={clsx("overflow-x-auto rounded-[var(--r-3)] border border-rule bg-card shadow-card", className)} role="region" aria-label={caption} tabIndex={0}>
      <table className="w-full border-collapse text-left text-table" style={{ minWidth }}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export const th = "border-b border-rule bg-sage px-4 py-2.5 align-bottom text-[0.8125rem] font-extrabold tracking-[0.04em] text-ink uppercase";
export const td = "border-b border-rule px-4 py-3 align-top text-table";
