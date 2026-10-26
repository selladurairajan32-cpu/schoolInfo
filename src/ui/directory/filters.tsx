import Link from "next/link";
import { clsx } from "clsx";
import { db, schema } from "@/db";
import type { DirectoryParams } from "@/server/search-params";
import { AutoApply } from "./auto-apply";
import { IconChevron, IconPin } from "../icons";
import { Check, controlClass, Select } from "../kit";

export async function testOptions() {
  return db().select({ slug: schema.entranceTests.slug, name: schema.entranceTests.name }).from(schema.entranceTests).orderBy(schema.entranceTests.name);
}

/** A filter group as an accordion row, open by default or whenever it holds an active filter. */
function Group({ legend, hint, open = true, children }: { legend: string; hint?: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group/g -mx-4 border-t border-rule px-4 first-of-type:border-t-0">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-2 text-[1rem] font-semibold text-ink transition-colors hover:text-green [&::-webkit-details-marker]:hidden">
        {legend}
        <IconChevron size={16} className="shrink-0 text-ink-2 transition-transform duration-[var(--d-2)] group-open/g:rotate-180" />
      </summary>
      <fieldset className="pb-4">
        <legend className="sr-only">{legend}</legend>
        {hint ? <p className="mb-2 text-small text-ink-2">{hint}</p> : null}
        {children}
      </fieldset>
    </details>
  );
}

/** Toggle chip: a checkbox drawn as a rectangular key. */
function Chip({ name, value, checked, label }: { name: string; value: string; checked: boolean; label: string }) {
  return (
    <label className="cursor-pointer">
      <input type="checkbox" name={name} value={value} defaultChecked={checked} className="peer sr-only" />
      <span className="inline-flex min-h-10 items-center rounded-[var(--r-2)] border border-transparent bg-sage px-3.5 text-[0.95rem] font-semibold text-ink transition-colors duration-[var(--d-3)] hover:text-green peer-checked:border-green peer-checked:bg-green peer-checked:font-bold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green hover:border-ink">
        {label}
      </span>
    </label>
  );
}

/** The filter rail. Rendered twice (mobile sheet and desktop rail), so ids take a per-copy prefix. */
export async function Filters({ p, basePath, lockArea, idPrefix }: { p: DirectoryParams; basePath: string; lockArea: boolean; idPrefix: string }) {
  const fid = (name: string) => `${idPrefix}-${name}`;
  const tests = await testOptions();
  return (
    <form method="get" action={basePath} className="grid">
      {/* Desktop rail: results follow each change. The mobile sheet keeps an explicit Apply. */}
      {idPrefix === "fd" ? (
        <>
          <AutoApply />
          <p className="pt-3 pb-1 text-[0.875rem] text-ink-3">Choices apply straight away. After typing a postcode, press Enter or Apply.</p>
        </>
      ) : null}
      {p.q ? <input type="hidden" name="q" value={p.q} /> : null}
      {p.view ? <input type="hidden" name="view" value={p.view} /> : null}
      {p.sort ? <input type="hidden" name="sort" value={p.sort} /> : null}

      <Group legend="Near a postcode">
        <div className="grid grid-cols-[minmax(0,1fr)_6.25rem] gap-2">
          <label htmlFor={fid("postcode")} className="sr-only">
            Postcode
          </label>
          <span className="relative block">
            <IconPin size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
            <input id={fid("postcode")} name="postcode" defaultValue={p.postcode ?? ""} placeholder="e.g. HP21 7RP" autoComplete="postal-code" className={clsx(controlClass, "pl-9 uppercase placeholder:normal-case")} />
          </span>
          <label htmlFor={fid("radius")} className="sr-only">
            Radius
          </label>
          <Select id={fid("radius")} name="radius" defaultValue={String(p.radius ?? 30)} className="px-2.5">
            {[5, 10, 20, 30, 50, 100].map((r) => (
              <option key={r} value={r}>
                {r} mi
              </option>
            ))}
          </Select>
        </div>
        <p className="mt-2 text-small leading-snug text-ink-2">
          {p.postcode ? "Straight-line distance from the postcode's centre. Schools use their own method to rank applications." : "The distance applies once you enter a postcode. It is a straight line, not a catchment area."}
        </p>
      </Group>

      {!lockArea ? (
        <Group legend="Nation">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              ["", "All"],
              ["england", "England"],
              ["northern_ireland", "N. Ireland"],
            ].map(([v, l]) => (
              <label key={v} className="cursor-pointer">
                <input type="radio" name="nation" value={v} defaultChecked={(p.nation ?? "") === v} className="peer sr-only" />
                <span className="flex min-h-10 items-center justify-center rounded-[var(--r-2)] bg-sage px-1 text-[0.92rem] font-semibold text-ink transition-colors duration-[var(--d-3)] hover:text-green peer-checked:bg-green peer-checked:font-bold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-4 peer-focus-visible:outline-paper">
                  {l}
                </span>
              </label>
            ))}
          </div>
        </Group>
      ) : null}

      <Group legend="Pupils admitted">
        <div className="flex flex-wrap gap-1.5">
          <Chip name="gender" value="boys" checked={p.gender.includes("boys")} label="Boys" />
          <Chip name="gender" value="girls" checked={p.gender.includes("girls")} label="Girls" />
          <Chip name="gender" value="mixed" checked={p.gender.includes("mixed")} label="Co-educational" />
        </div>
      </Group>

      <Group legend="School">
        <Check name="selectivity" value="fully_selective" defaultChecked={p.selectivity.includes("fully_selective")} label="Grammar (fully selective)" />
        <Check name="selectivity" value="partially_selective" defaultChecked={p.selectivity.includes("partially_selective")} label="Partially selective" />
        <Check name="sixthForm" value="1" defaultChecked={!!p.sixthForm} label="Has a sixth form" />
        <Check name="boarding" value="1" defaultChecked={!!p.boarding} label="Offers boarding" />
      </Group>

      <Group legend="Entrance test">
        <label htmlFor={fid("test")} className="sr-only">
          Entrance test
        </label>
        <Select id={fid("test")} name="test" defaultValue={p.test ?? ""}>
          <option value="">Any test</option>
          {tests.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </Select>
      </Group>

      <Group legend="Admissions rules" hint="Only schools whose policy we hold for the selected year can match." open={!!(p.outOfArea || p.scoreRoute || p.siblingPriority || p.history)}>
        <Check name="outOfArea" value="1" defaultChecked={!!p.outOfArea} label="Admits out-of-area applicants" />
        <Check name="scoreRoute" value="1" defaultChecked={!!p.scoreRoute} label="Published score threshold" />
        <Check name="siblingPriority" value="1" defaultChecked={!!p.siblingPriority} label="Sibling priority" />
        <Check name="history" value="1" defaultChecked={!!p.history} label="Has historical offer data" />
      </Group>


      {/* Pinned in the mobile sheet (with a shadow so it reads as a footer); in normal flow on desktop,
          where it no longer floats over the filters. */}
      <div className={clsx("-mx-1 flex gap-2 border-t border-rule bg-[var(--rail-bg,var(--paper))] px-1 pt-3 pb-1", idPrefix === "fd" ? "" : "sticky bottom-0 shadow-[0_-10px_20px_-14px_rgb(35_31_64/0.35)]")}>
        <button type="submit" className="inline-flex min-h-11 flex-1 items-center justify-center rounded-[5px] bg-green px-4 font-bold text-white transition-colors hover:bg-navy active:scale-[0.98]">
          Apply filters
        </button>
        <Link href={basePath} className="inline-flex min-h-11 items-center rounded-[5px] border border-control bg-card px-3.5 font-semibold text-ink no-underline hover:border-ink">
          Reset
        </Link>
      </div>
    </form>
  );
}
