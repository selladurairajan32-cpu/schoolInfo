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

/* Each group carries the site's content tone for that kind of fact, so bars and labels are colour-keyed by group. */
const GROUPS: { key: PreviewGroup; label: string; tone: string }[] = [
  { key: "admissions", label: "Admissions", tone: "find" },
  { key: "results", label: "Academic results", tone: "data" },
  { key: "inspection", label: "Inspection", tone: "compare" },
  { key: "demand", label: "Applications and offers", tone: "learn" },
];

const KEYS = ["A", "B", "C", "D", "E"];

/** "74.2 · 2025/26" → value "74.2", period "2025/26". */
function split(v: string) {
  const [value, ...rest] = v.split(" · ");
  return { value: value!, period: rest.join(" · ") || null };
}

function Key({ i, className, dark = false }: { i: number; className?: string; dark?: boolean }) {
  return (
    <span
      aria-hidden
      className={clsx(
        "inline-grid size-6 shrink-0 place-items-center rounded-[6px] font-mono text-[0.8125rem] leading-none font-semibold",
        dark ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.22)]" : "bg-deep text-white",
        className,
      )}
    >
      {KEYS[i]}
    </span>
  );
}

function Bar({ value, max, delay, animate, className }: { value: number | null | undefined; max: number; delay: number; animate: boolean; className?: string }) {
  if (value == null || !max) return null;
  const pct = Math.max(2, Math.min(100, (value / max) * 100));
  return (
    <span aria-hidden className={clsx("block h-1.5 w-full overflow-hidden rounded-full bg-sage-deep", className ?? "mt-2 max-w-[10rem]")}>
      <span className={clsx("block h-full rounded-full bg-[linear-gradient(90deg,var(--tone),color-mix(in_srgb,var(--tone)_55%,#fff))]", animate && "bar-grow")} style={{ width: `${pct}%`, animationDelay: `${delay}ms` }} />
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
    <div className="panel mt-7 overflow-hidden">
      {/* Group filter on the console's dark header */}
      <div className="border-b border-white/10 bg-deep px-4 py-3 sm:px-5">
        <div role="group" aria-label="Show measures" className="-mx-1 flex gap-1 overflow-x-auto [scrollbar-width:none] md:flex-wrap md:overflow-visible">
          {[{ key: "all" as const, label: "All measures" }, ...present].map((g) => (
            <button
              key={g.key}
              type="button"
              data-tone={"tone" in g ? g.tone : undefined}
              aria-pressed={filter === g.key}
              onClick={() => {
                setFilter(g.key);
                setTouched(true);
              }}
              className={clsx(
                "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-[0.875rem] font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-[var(--d-2)] ease-[var(--ease-out)]",
                filter === g.key ? "bg-white text-ink shadow-[0_4px_12px_-6px_rgb(0_0_0/0.5)]" : "text-[#c3d1df] hover:bg-white/10 hover:text-white",
              )}
            >
              {"tone" in g ? <span aria-hidden className={clsx("size-2 rounded-full", filter === g.key ? "bg-tone" : "bg-[color-mix(in_srgb,var(--tone)_45%,#fff)]")} /> : null}
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
                <Link href={`/schools/${s.slug}`} className="font-semibold text-ink no-underline hover:text-tone">
                  {s.name}
                </Link>
                <span className="block text-[0.8125rem] text-ink-3">{[s.town, s.la].filter(Boolean).join(", ")}</span>
              </span>
            </li>
          ))}
        </ol>
        <div key={filter} className={touched ? "anim-rise" : undefined}>
          {shown.map((g) => (
            <section key={g.key} data-tone={g.tone} aria-label={g.label} className="border-b border-rule border-l-[3px] border-l-tone px-4 py-3 last:border-b-0">
              <h3 className="inline-flex items-center gap-2 text-[0.8125rem] font-semibold tracking-[0.04em] text-tone uppercase">
                <span aria-hidden className="size-2 rounded-full bg-tone" />
                {g.label}
              </h3>
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
      <table className="cmp-table hidden w-full table-fixed border-collapse text-left text-table md:table">
        <caption className="sr-only">Example comparison of {n} grammar schools</caption>
        <colgroup>
          <col className="w-[13.5rem] lg:w-[15rem]" />
          {schools.map((s) => (
            <col key={s.slug} />
          ))}
        </colgroup>
        <thead>
          <tr className="bg-deep-2">
            <td className="border-l-[3px] border-l-deep-2 px-5 py-4 align-bottom text-[0.8125rem] text-[#9fb3c8]">Measure</td>
            {schools.map((s, i) => (
              <th key={s.slug} scope="col" className="cursor-default px-4 py-4 align-bottom font-normal transition-colors duration-[var(--d-1)] hover:bg-white/[0.05]">
                <span className="flex items-start gap-2.5">
                  <Key i={i} dark className="mt-0.5" />
                  <span className="min-w-0">
                    <Link href={`/schools/${s.slug}`} className="ed-link text-[1rem] leading-snug font-semibold text-white hover:text-[#a6d4f4]">
                      {s.name}
                    </Link>
                    <span className="mt-0.5 block text-[0.8125rem] text-[#9fb3c8]">{[s.town, s.la].filter(Boolean).join(", ")}</span>
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
                <tr data-tone={g.tone}>
                  <th scope="rowgroup" colSpan={n + 1} className="border-y border-tone-line border-l-[3px] border-l-tone bg-tone-wash px-5 py-2 text-left text-[0.8125rem] font-semibold tracking-[0.04em] text-tone-strong uppercase">
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden className="size-2 rounded-full bg-tone" />
                      {g.label}
                    </span>
                  </th>
                </tr>
                {groupRows.map((r) => (
                  <tr key={r.label} data-tone={g.tone} className="border-b border-rule transition-colors duration-[var(--d-1)] hover:bg-tone-wash/35">
                    <th scope="row" className="border-l-[3px] border-l-tone-line px-5 py-3.5 align-top text-[0.9375rem] font-normal text-ink-2">
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
                    <td colSpan={n + 1} className="border-b border-rule border-l-[3px] border-l-tone-line px-5 py-2.5" data-tone={g.tone}>
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
