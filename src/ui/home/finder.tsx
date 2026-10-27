"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { clsx } from "clsx";
import { IconPin, IconSearch } from "../icons";
import { SearchField } from "../search";

const TABS = [
  { key: "name", label: "School or town", Icon: IconSearch },
  { key: "postcode", label: "Near a postcode", Icon: IconPin },
] as const;

/**
 * The homepage's one starting point: search by name or town, or list schools near a postcode.
 * The two modes are tabs; the indicator slides between them and the panel cross-fades.
 */
export function HomeFinder({ areas = [] }: { areas?: { slug: string; name: string }[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("name");
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = TABS.findIndex((t) => t.key === tab);
  return (
    <div className="finder-card rounded-[var(--r-4)] bg-card p-3 text-ink sm:p-4">
      <div role="tablist" aria-label="Ways to search" className="relative grid grid-cols-2 rounded-[var(--r-2)] bg-sage p-1 sm:inline-grid sm:w-[22rem]">
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-[5px] bg-card shadow-[0_0_0_1px_var(--rule),0_1px_3px_rgb(24_37_53/0.08)] transition-transform duration-[var(--d-3)] ease-[var(--ease-out)]"
          style={{ transform: `translateX(${index * 100}%)` }}
        />
        {TABS.map((t, i) => (
          <button
            key={t.key}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`${id}-panel`}
            tabIndex={tab === t.key ? 0 : -1}
            onClick={() => setTab(t.key)}
            onKeyDown={(e) => {
              // Tabs pattern: arrows (and Home/End) move between tabs and select them.
              const keys: Record<string, number> = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 };
              if (!(e.key in keys)) return;
              e.preventDefault();
              const n = (keys[e.key]! + TABS.length) % TABS.length;
              setTab(TABS[n]!.key);
              tabRefs.current[n]?.focus();
            }}
            className={clsx(
              "relative z-[1] inline-flex min-h-10 items-center justify-center gap-2 rounded-[5px] px-2 text-[0.9375rem] font-medium whitespace-nowrap sm:px-3 transition-colors duration-[var(--d-2)]",
              tab === t.key ? "text-ink" : "text-ink-3 hover:text-ink",
            )}
          >
            <t.Icon size={16} className={clsx("hidden shrink-0 transition-colors duration-[var(--d-2)] sm:block", tab === t.key ? "text-green" : "text-current")} />
            {t.label}
          </button>
        ))}
      </div>
      <div key={tab} id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`} className="anim-rise pt-3 sm:pt-4">
        {tab === "name" ? (
          <>
            <SearchField size="lg" placeholder="School, town or area" />
            {areas.length ? (
              <p className="mt-2 flex flex-wrap items-center gap-x-3 text-[0.875rem] text-ink-3">
                <span>Try</span>
                {areas.map((a) => (
                  <Link key={a.slug} href={`/grammar-schools/${a.slug}`} className="group/ed inline-flex min-h-8 items-center font-medium text-ink-2 no-underline hover:text-green">
                    <span className="ed-link">{a.name}</span>
                  </Link>
                ))}
              </p>
            ) : null}
          </>
        ) : (
          <form action="/grammar-schools" method="get" className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_9rem_auto]">
            <input type="hidden" name="sort" value="distance" />
            <label className="grid gap-1.5">
              <span className="text-[0.875rem] font-medium text-ink-2">Postcode</span>
              <span className="relative">
                <IconPin size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3" />
                <input
                  name="postcode"
                  required
                  autoComplete="postal-code"
                  placeholder="e.g. HP21 7RP"
                  className="min-h-13 w-full rounded-[var(--r-2)] border border-rule-strong bg-card pr-3 pl-11 text-[1.0625rem] uppercase transition-[border-color,box-shadow] duration-[var(--d-2)] placeholder:text-ink-3 placeholder:normal-case hover:border-control focus:border-green focus:shadow-[0_0_0_4px_rgb(36_93_135/0.12)] focus:outline-none"
                />
              </span>
            </label>
            <label className="grid gap-1.5">
              <span className="text-[0.875rem] font-medium text-ink-2">Within</span>
              <select name="radius" defaultValue="15" className="min-h-13 rounded-[var(--r-2)] border border-rule-strong bg-card px-3 text-[1rem] transition-[border-color,box-shadow] duration-[var(--d-2)] hover:border-control focus:border-green focus:shadow-[0_0_0_4px_rgb(36_93_135/0.12)] focus:outline-none">
                {[5, 10, 15, 25, 40].map((r) => (
                  <option key={r} value={r}>
                    {r} miles
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="min-h-13 self-end rounded-[var(--r-2)] bg-green px-6 text-[1rem] font-semibold text-white transition-[background-color,transform] duration-[var(--d-2)] hover:bg-green-deep active:scale-[0.98]">
              Find schools
            </button>
            <p className="text-[0.875rem] leading-relaxed text-ink-3 sm:col-span-3">Straight-line distance from the postcode&apos;s centre. Schools measure from your home address, by their own method.</p>
          </form>
        )}
      </div>
    </div>
  );
}
