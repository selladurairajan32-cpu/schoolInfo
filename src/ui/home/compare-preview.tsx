"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { clsx } from "clsx";
import { IconInfo } from "../icons";

export type PreviewGroup = "admissions" | "results" | "inspection" | "demand";

export interface PreviewRow {
  group: PreviewGroup;
  label: string;
  values: string[];
  differs: boolean;
  note?: string;
  nums?: (number | null)[];
  scaleMax?: number;
}

export interface PreviewSchool {
  slug: string;
  name: string;
  town: string | null;
  la: string | null;
}

const GROUPS: { key: PreviewGroup; label: string }[] = [
  { key: "admissions", label: "Admissions" },
  { key: "results", label: "Academic results" },
  { key: "inspection", label: "Inspection" },
  { key: "demand", label: "Applications and offers" },
];

const KEYS = ["A", "B", "C", "D", "E"];

/** "74.2 · 2025/26" → value "74.2", period "2025/26". */
function split(v: string) {
  const [value, ...rest] = v.split(" · ");
  return { value: value!, period: rest.join(" · ") || null };
}

function Key({ i, className }: { i: number; className?: string }) {
  return (
    <span aria-hidden className={clsx("inline-grid size-[1.375rem] shrink-0 place-items-center rounded-[4px] border border-green/35 bg-green-wash font-mono text-[0.8125rem] leading-none font-semibold text-green", className)}>
      {KEYS[i]}
    </span>
  );
}

function Bar({ value, max, delay, animate, className }: { value: number | null | undefined; max: number; delay: number; animate: boolean; className?: string }) {
  if (value == null || !max) return null;
  const pct = Math.max(2, Math.min(100, (value / max) * 100));
  return (
    <span aria-hidden className={clsx("block h-1 w-full overflow-hidden rounded-full bg-sage-deep", className ?? "mt-1.5 max-w-[9rem]")}>
      <span className={clsx("block h-full rounded-full bg-green", animate && "bar-grow")} style={{ width: `${pct}%`, animationDelay: `${delay}ms` }} />
    </span>
  );
}

/** One cell's content: the value, its period in quiet type, and a bar when the row is numeric. */
function Value({ row, i, delay, animate, inline = false }: { row: PreviewRow; i: number; delay: number; animate: boolean; inline?: boolean }) {
  const { value, period } = split(row.values[i] ?? "—");
  const missing = value === "—" || value.startsWith("Not ");
  const max = row.nums ? (row.scaleMax ?? Math.max(...row.nums.filter((n): n is number => n !== null))) : 0;
  return (
    <>
      <span className={clsx("[overflow-wrap:anywhere]", missing ? "text-ink-3" : row.nums ? "font-mono text-[1rem] font-semibold text-ink" : row.differs ? "font-medium text-ink" : "text-ink-2")}>{value}</span>
      {period ? <span className="ml-1.5 text-[0.8125rem] text-ink-3">{period}</span> : null}
      {row.nums ? <Bar value={row.nums[i]} max={max} delay={delay} animate={animate} className={inline ? "ml-auto max-w-[7rem] self-center" : undefined} /> : null}
    </>
  );
}

/**
 * The homepage comparison: three real schools, grouped so admissions, results and inspection
 * read as separate questions. Numeric rows carry bars on a fixed scale; rows where every school
 * is the same collapse to one line. On phones each measure stacks, keyed A, B, C.
 */
export function ComparePreview({ schools, rows }: { schools: PreviewSchool[]; rows: PreviewRow[] }) {
  const present = GROUPS.filter((g) => rows.some((r) => r.group === g.key));
  const [filter, setFilter] = useState<PreviewGroup | "all">("all");
  // Rows and bars animate when the reader changes the filter, not on first render.
  const [touched, setTouched] = useState(false);
  const shown = present.filter((g) => filter === "all" || g.key === filter);
  const n = schools.length;
  const same = (r: PreviewRow) => !r.differs && !r.nums && new Set(r.values).size === 1;

  return (
    <div className="mt-6 overflow-hidden rounded-[var(--r-3)] border border-rule bg-card">
      {/* Group filter */}
      <div className="border-b border-rule bg-sage/60 px-4 py-2.5 sm:px-5">
        <div role="group" aria-label="Show measures" className="-mx-1 flex gap-1 overflow-x-auto [scrollbar-width:none] md:flex-wrap md:overflow-visible">
          {[{ key: "all" as const, label: "All measures" }, ...present].map((g) => (
            <button
              key={g.key}
              type="button"
              aria-pressed={filter === g.key}
              onClick={() => {
                setFilter(g.key);
                setTouched(true);
              }}
              className={clsx(
                "min-h-9 shrink-0 rounded-full px-3 text-[0.875rem] font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-[var(--d-2)] ease-[var(--ease-out)]",
                filter === g.key ? "bg-card text-ink shadow-[0_0_0_1px_var(--rule-strong)]" : "text-ink-2 hover:bg-card/70 hover:text-ink",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phones: school key, then each measure stacked */}
      <div className="md:hidden">
        <ol className="grid gap-2 border-b border-rule px-4 py-3">
          {schools.map((s, i) => (
            <li key={s.slug} className="flex items-start gap-2.5">
              <Key i={i} className="mt-0.5" />
              <span className="min-w-0">
                <Link href={`/schools/${s.slug}`} className="font-semibold text-ink no-underline hover:text-green">
                  {s.name}
                </Link>
                <span className="block text-[0.8125rem] text-ink-3">{[s.town, s.la].filter(Boolean).join(", ")}</span>
              </span>
            </li>
          ))}
        </ol>
        <div key={filter} className={touched ? "anim-rise" : undefined}>
          {shown.map((g) => (
            <section key={g.key} aria-label={g.label} className="border-b border-rule px-4 py-3 last:border-b-0">
              <h3 className="text-[0.8125rem] font-semibold tracking-[0.04em] text-green uppercase">{g.label}</h3>
              <dl className="mt-1 divide-y divide-rule">
                {rows
                  .filter((r) => r.group === g.key)
                  .map((r) => (
                    <div key={r.label} className="py-2.5">
                      <dt className="text-[0.875rem] text-ink-2">{r.label}</dt>
                      {same(r) ? (
                        <dd className="mt-1 text-[0.9375rem] text-ink-2">
                          <span className="text-ink-3">All {n}: </span>
                          {r.values[0]}
                        </dd>
                      ) : (
                        schools.map((s, i) => (
                          <dd key={s.slug} className="mt-1.5 grid grid-cols-[1.375rem_minmax(0,1fr)] items-start gap-2.5 text-[0.9375rem]">
                            <Key i={i} />
                            <span className={clsx("min-w-0", r.nums && "flex items-baseline gap-3")}>
                              <span className="sr-only">{s.name}: </span>
                              <Value row={r} i={i} delay={i * 60} animate={touched} inline />
                            </span>
                          </dd>
                        ))
                      )}
                    </div>
                  ))}
              </dl>
              {rows
                .filter((r) => r.group === g.key && r.note)
                .slice(0, 1)
                .map((r) => (
                  <p key={r.label} className="mt-1 flex items-start gap-1.5 text-[0.8125rem] leading-snug text-ink-3">
                    <IconInfo size={14} className="mt-[2px] shrink-0" /> {r.note}
                  </p>
                ))}
            </section>
          ))}
        </div>
      </div>

      {/* Tablet and up: an aligned table */}
      <table className="hidden w-full table-fixed border-collapse text-left text-table md:table">
        <caption className="sr-only">Example comparison of {n} grammar schools</caption>
        <colgroup>
          <col className="w-[13.5rem] lg:w-[15rem]" />
          {schools.map((s) => (
            <col key={s.slug} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-rule-strong">
            <td className="px-5 py-3.5 align-bottom text-[0.8125rem] text-ink-3">Measure</td>
            {schools.map((s, i) => (
              <th key={s.slug} scope="col" className="px-4 py-3.5 align-bottom font-normal">
                <span className="flex items-start gap-2.5">
                  <Key i={i} className="mt-0.5" />
                  <span className="min-w-0">
                    <Link href={`/schools/${s.slug}`} className="ed-link text-[1rem] leading-snug font-semibold text-ink hover:text-green">
                      {s.name}
                    </Link>
                    <span className="mt-0.5 block text-[0.8125rem] text-ink-3">{[s.town, s.la].filter(Boolean).join(", ")}</span>
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody key={filter} className={touched ? "anim-rise" : undefined}>
          {shown.map((g) => {
            const groupRows = rows.filter((r) => r.group === g.key);
            const note = groupRows.find((r) => r.note)?.note;
            return (
              <Fragment key={g.key}>
                <tr>
                  <th scope="rowgroup" colSpan={n + 1} className="px-5 pt-5 pb-1.5 text-left text-[0.8125rem] font-semibold tracking-[0.04em] text-green uppercase">
                    {g.label}
                  </th>
                </tr>
                {groupRows.map((r) => (
                  <tr key={r.label} className="border-b border-rule transition-colors duration-[var(--d-1)] last:border-b-0 hover:bg-sage/50">
                    <th scope="row" className="px-5 py-3 align-top text-[0.9375rem] font-normal text-ink-2">
                      {r.label}
                    </th>
                    {same(r) ? (
                      <td colSpan={n} className="px-4 py-3 align-top text-ink-2">
                        <span className="text-[0.8125rem] text-ink-3">Same for all {n}: </span>
                        {r.values[0]}
                      </td>
                    ) : (
                      schools.map((s, i) => (
                        <td key={s.slug} className="px-4 py-3 align-top">
                          <Value row={r} i={i} delay={i * 60} animate={touched} />
                        </td>
                      ))
                    )}
                  </tr>
                ))}
                {note ? (
                  <tr>
                    <td colSpan={n + 1} className="px-5 pt-1 pb-3">
                      <p className="flex items-start gap-1.5 text-[0.8125rem] leading-snug text-ink-3">
                        <IconInfo size={14} className="mt-[2px] shrink-0" /> {note}
                      </p>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
