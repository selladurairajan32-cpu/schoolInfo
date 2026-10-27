"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { formatDate } from "@/lib/format";
import type { NavData } from "@/server/nav";
import { IconArrow, IconChevron, IconClose, IconMenu } from "./icons";
import { Status } from "./status";

type Group = {
  key: string;
  label: string;
  short: string;
  intro: string;
  match: (path: string) => boolean;
  links: { href: string; title: string; text: string }[];
};

const GROUPS: Group[] = [
  {
    key: "discover",
    label: "Discover schools",
    short: "Schools",
    intro: "Every state grammar school in England and Northern Ireland, from official registers. Search by name, place or postcode.",
    match: (p) => p.startsWith("/grammar-schools") || p.startsWith("/schools"),
    links: [
      { href: "/grammar-schools", title: "All grammar schools", text: "Search, filter, and switch between list, table and map" },
      { href: "/grammar-schools?view=map", title: "Schools near a postcode", text: "Straight-line distances, clearly labelled" },
      { href: "/grammar-schools/northern-ireland", title: "Northern Ireland", text: "Year 8 transfer and the SEAG assessment" },
      { href: "/compare", title: "Compare schools", text: "Up to five side by side, differences highlighted" },
    ],
  },
  {
    key: "admissions",
    label: "Understand admissions",
    short: "Admissions",
    intro: "Admission happens in three steps. Most confusion comes from treating the first step as the last.",
    match: (p) => p.startsWith("/admissions"),
    links: [
      { href: "/admissions", title: "How admissions work", text: "The whole process on one page" },
      { href: "/admissions/qualifying-is-not-an-offer", title: "Qualifying isn't an offer", text: "What passing the test does and doesn't mean" },
      { href: "/admissions/oversubscription", title: "Oversubscription criteria", text: "The order places are offered in" },
      { href: "/admissions/out-of-catchment", title: "Catchment and distance", text: "Applying from outside the area" },
      { href: "/admissions/home-address", title: "Home address rules", text: "Which address counts, and from when" },
      { href: "/admissions/appeals", title: "Appeals", text: "Deadlines, hearings and reviews" },
      { href: "/admissions/northern-ireland", title: "Northern Ireland transfer", text: "SEAG and Year 8 entry" },
    ],
  },
  {
    key: "exams",
    label: "Explore 11+ exams",
    short: "11+ exams",
    intro: "There is no single 11+. Each area sets its own test, timetable and scoring, and a score only means something for the test it came from.",
    match: (p) => p.startsWith("/11-plus"),
    links: [
      { href: "/11-plus", title: "The 11+ explained", text: "Subjects, standardisation and qualifying scores" },
      { href: "/11-plus/exam-providers", title: "Tests and providers", text: "Who sets each test, and where" },
      { href: "/11-plus/preparation", title: "Preparation and practice", text: "Original timed questions with feedback" },
    ],
  },
  {
    key: "tools",
    label: "Research tools",
    short: "Tools",
    intro: "Tools built on each school's published rules. None of them asks for your child's name, and none estimates a probability.",
    match: (p) => p.startsWith("/tools") || p.startsWith("/assistant"),
    links: [
      { href: "/tools/eligibility-checker", title: "Eligibility checker", text: "Which criteria your child could meet" },
      { href: "/tools/catchment-checker", title: "Catchment checker", text: "Verified boundaries only, never a circle" },
      { href: "/compare", title: "Compare schools", text: "Tests, rules, results and demand" },
      { href: "/tools/planner", title: "Admissions planner", text: "Your timeline, with reminders" },
      { href: "/assistant", title: "Research assistant", text: "Answers with numbered sources" },
    ],
  },
  {
    key: "data",
    label: "Dates & data",
    short: "Dates & data",
    intro: "Deadlines and figures straight from official publications, with how fresh each one is.",
    match: (p) => p.startsWith("/calendar") || p.startsWith("/data-sources") || p.startsWith("/methodology"),
    links: [
      { href: "/calendar", title: "Admissions calendar", text: "Verified dates, by month" },
      { href: "/data-sources", title: "Data sources and freshness", text: "Every source and its last refresh" },
      { href: "/methodology", title: "Methodology", text: "How facts are collected and verified" },
      { href: "/corrections", title: "Report a correction", text: "Help keep the atlas accurate" },
    ],
  },
];

function Feature({ group, data, onNavigate }: { group: string; data: NavData; onNavigate: () => void }) {
  if (group === "discover") {
    const max = Math.max(1, ...data.regions.map((r) => r.n), data.ni);
    const rows = [...data.regions.slice(0, 7), ...(data.ni ? [{ slug: "northern-ireland", name: "Northern Ireland", n: data.ni }] : [])];
    return (
      <div>
        <p className="label mb-2">Schools by region</p>
        <ul className="grid gap-0.5">
          {rows.map((r) => (
            <li key={r.slug}>
              <Link href={`/grammar-schools/${r.slug}`} onClick={onNavigate} className="group/r grid grid-cols-[minmax(0,8.5rem)_1fr_2rem] items-center gap-3 rounded-[var(--r-2)] px-1.5 py-1 text-[0.95rem] text-ink no-underline hover:bg-card">
                <span className="truncate">{r.name}</span>
                <span aria-hidden className="h-1.5 rounded-full bg-card">
                  <span className="block h-full rounded-full bg-green-bright transition-[width] duration-[var(--d-4)] ease-[var(--ease-out)]" style={{ width: `${(r.n / max) * 100}%` }} />
                </span>
                <span className="text-right font-mono text-[0.8125rem] text-ink-2">{r.n}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (group === "admissions") {
    return (
      <div>
        <p className="label mb-3">The three steps</p>
        <ol className="grid gap-2.5">
          {[
            ["Qualify", "Reach the test standard"],
            ["Be ranked", "By the published criteria"],
            ["Receive an offer", "If places remain"],
          ].map(([t, d], i) => (
            <li key={t} className="flex items-center gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-green/40 bg-card font-mono text-[0.8125rem] font-semibold text-green">{i + 1}</span>
              <span>
                <span className="block font-semibold text-ink">{t}</span>
                <span className="block text-small text-ink-2">{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (group === "exams") {
    return (
      <div>
        <p className="label mb-2">Tests we hold</p>
        <ul className="grid gap-1">
          {data.tests.map((t) => (
            <li key={t.slug}>
              <Link href={`/11-plus/${t.slug}`} onClick={onNavigate} className="block rounded-[var(--r-2)] px-1.5 py-1.5 no-underline hover:bg-card">
                <span className="block font-semibold text-ink">{t.name}</span>
                <span className="block text-small text-ink-2">
                  {t.nation === "northern_ireland" ? "Northern Ireland" : "England"} · {t.schools} {t.schools === 1 ? "school" : "schools"} linked
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (group === "data") {
    return (
      <div>
        <p className="label mb-2">Coming up</p>
        <ul className="grid gap-2">
          {data.dates.map((d) => (
            <li key={d.id} className="border-l-2 border-green/50 pl-3">
              <p className="font-mono text-[0.8125rem] font-medium text-green">{formatDate(d.startsOn)}</p>
              <p className="text-[0.95rem] leading-snug font-semibold text-ink">{d.title}</p>
              <Status status={d.status} quiet className="mt-1" />
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="text-[0.95rem] leading-relaxed text-ink-2">
      <p className="label mb-2">What we never do</p>
      <ul className="grid gap-1.5">
        <li>Ask for your child&apos;s name or date of birth</li>
        <li>Estimate the chance of a place</li>
        <li>Treat a past cut-off as a catchment boundary</li>
      </ul>
    </div>
  );
}

/** Desktop navigation with mega panels. */
export function MainNav({ data }: { data: NavData }) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const listRef = useRef<HTMLUListElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeKey = GROUPS.find((g) => g.match(pathname))?.key ?? null;
  const indicated = open ?? hover ?? activeKey;

  // The copper indicator slides between triggers; it is positioned directly on the DOM node.
  useLayoutEffect(() => {
    const bar = barRef.current;
    const el = indicated ? triggers.current[indicated] : null;
    const list = listRef.current;
    if (!bar) return;
    if (!el || !list) {
      bar.style.opacity = "0";
      return;
    }
    const lr = list.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    bar.style.transform = `translateX(${r.left - lr.left + 12}px)`;
    bar.style.width = `${r.width - 24}px`;
    bar.style.opacity = "1";
  }, [indicated]);

  const close = useCallback((focusTrigger = false) => {
    setOpen((cur) => {
      if (focusTrigger && cur) triggers.current[cur]?.focus();
      return null;
    });
  }, []);

  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(null);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-nav-root]")) close();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, close]);

  const schedule = (fn: () => void, ms: number, which: "open" | "close") => {
    const ref = which === "open" ? openTimer : closeTimer;
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(fn, ms);
  };
  const cancel = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openTimer.current) clearTimeout(openTimer.current);
  };

  const group = GROUPS.find((g) => g.key === open);

  return (
    <div data-nav-root className="hidden lg:block" onPointerLeave={(e) => e.pointerType === "mouse" && open && schedule(() => setOpen(null), 220, "close")} onPointerEnter={cancel}>
      <nav aria-label="Main">
        <ul ref={listRef} className="relative flex items-center">
          {GROUPS.map((g, i) => (
            <li key={g.key}>
              <button
                ref={(el) => {
                  triggers.current[g.key] = el;
                }}
                type="button"
                aria-expanded={open === g.key}
                aria-controls={`mega-${g.key}`}
                onClick={() => setOpen((o) => (o === g.key ? null : g.key))}
                onPointerEnter={(e) => {
                  if (e.pointerType !== "mouse") return;
                  setHover(g.key);
                  if (open) setOpen(g.key);
                  else schedule(() => setOpen(g.key), 110, "open");
                }}
                onPointerLeave={() => {
                  setHover(null);
                  if (openTimer.current) clearTimeout(openTimer.current);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const next = GROUPS[(i + (e.key === "ArrowRight" ? 1 : GROUPS.length - 1)) % GROUPS.length]!;
                    triggers.current[next.key]?.focus();
                    if (open) setOpen(next.key);
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setOpen(g.key);
                    requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>(`#mega-${g.key} a`)?.focus());
                  }
                }}
                className={clsx(
                  "group/nt inline-flex h-[var(--header-h)] items-center gap-1 px-3 text-nav font-medium whitespace-nowrap transition-[color,height] duration-[var(--d-2)] ease-[var(--ease-out)] hover:text-ink",
                  open === g.key || activeKey === g.key ? "text-ink" : "text-ink-2",
                )}
              >
                {/* The short label at every width: the long ones wrapped inside the 1200px bar on wide screens. */}
                <span>{g.short}</span>
                <IconChevron size={14} className={clsx("text-ink-3 transition-transform duration-[var(--d-2)] ease-[var(--ease-out)]", open === g.key && "rotate-180 text-green")} />
              </button>
            </li>
          ))}
          {/* Compare is a destination in its own right, so it is a direct link rather than a menu. */}
          <li>
            <Link
              href="/compare"
              aria-current={pathname.startsWith("/compare") ? "page" : undefined}
              onPointerEnter={(e) => e.pointerType === "mouse" && open && setOpen(null)}
              onFocus={() => open && setOpen(null)}
              className={clsx("inline-flex h-[var(--header-h)] items-center px-3 text-nav font-medium whitespace-nowrap no-underline transition-colors duration-[var(--d-2)] hover:text-ink", pathname.startsWith("/compare") ? "text-ink shadow-[inset_0_-2px_0_var(--green)]" : "text-ink-2")}
            >
              Compare
            </Link>
          </li>
          <span ref={barRef} aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-green opacity-0 transition-[transform,width,opacity] duration-[var(--d-3)] ease-[var(--ease-out)]" />
        </ul>
      </nav>

      {group ? (
        <div
          id={`mega-${group.key}`}
          key={group.key}
          data-nav-panel
          className="on-light menu-in absolute inset-x-0 top-full px-4"
          onPointerEnter={cancel}
        >
          <div className="mx-auto grid max-w-[var(--page)] grid-cols-[minmax(0,16rem)_minmax(0,1fr)_minmax(0,18rem)] gap-8 overflow-hidden rounded-b-[var(--r-3)] border border-t-0 border-rule bg-card p-7 shadow-menu">
            <div className="relative">
              <p className="font-display text-[1.25rem] leading-tight font-semibold text-ink">{group.label}</p>
              <p className="mt-2.5 font-read text-[1.0625rem] leading-[1.55] text-ink-2">{group.intro}</p>
            </div>
            <ul className={clsx("grid content-start gap-x-6 gap-y-1", group.links.length > 4 && "grid-cols-2")}>
              {group.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setOpen(null)} className="group/m -mx-3 block rounded-[var(--r-2)] px-3 py-2 no-underline transition-colors duration-[var(--d-2)] ease-[var(--ease-out)] hover:bg-sage focus-visible:bg-sage">
                    <span className="flex items-center gap-1.5 font-semibold text-ink group-hover/m:text-green">
                      {l.title}
                      <IconArrow size={14} className="-translate-x-1 opacity-0 transition-[transform,opacity] duration-[var(--d-2)] ease-[var(--ease-out)] group-hover/m:translate-x-0 group-hover/m:opacity-100 group-focus-visible/m:translate-x-0 group-focus-visible/m:opacity-100" />
                    </span>
                    <span className="mt-0.5 block text-small text-ink-2">{l.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="rounded-[var(--r-2)] bg-sage p-5">
              <Feature group={group.key} data={data} onNavigate={() => setOpen(null)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Mobile navigation sheet: slides in from the right; on close it slides back out before unmounting. */
export function MobileNav({ data }: { data: NavData }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const pathname = usePathname();
  const btnRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
    setClosing(false);
  }

  const close = useCallback(() => {
    const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (quick) {
      setOpen(false);
      return;
    }
    setClosing(true);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
  }, []);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && sheetRef.current) {
        const f = sheetRef.current.querySelectorAll<HTMLElement>("a, button, summary");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    const btn = btnRef.current;
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      btn?.focus();
    };
  }, [open, close]);

  return (
    <div className="lg:hidden">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="grid size-11 place-items-center rounded-[var(--r-2)] border border-rule-strong text-ink transition-colors duration-[var(--d-2)] hover:border-green hover:text-green"
      >
        <IconMenu size={21} /> <span className="sr-only">Menu</span>
      </button>
      {open ? (
        <div className="on-light fixed inset-0 z-[70]" role="presentation">
          <div className={clsx("absolute inset-0 bg-ink/30", closing ? "fade-out" : "anim-fade")} onClick={close} aria-hidden />
          <div ref={sheetRef} data-nav-panel role="dialog" aria-modal="true" aria-label="Menu" className={clsx("absolute inset-y-0 right-0 flex w-full max-w-[24rem] flex-col overflow-y-auto bg-paper shadow-menu", closing ? "sheet-out" : "sheet-in")}>
            <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-rule px-5">
              <p className="text-[0.9375rem] font-semibold text-ink">Menu</p>
              <button type="button" onClick={close} className="grid size-11 place-items-center rounded-[var(--r-2)] text-ink-2 transition-colors hover:bg-sage hover:text-ink" aria-label="Close menu">
                <IconClose size={20} />
              </button>
            </div>
            <nav aria-label="Main" className="px-5 pb-8">
              {GROUPS.map((g) => (
                <details key={g.key} className="acc group/mg border-b border-rule" open={g.match(pathname)}>
                  <summary className="flex min-h-14 list-none items-center justify-between text-[1.0625rem] font-semibold text-ink">
                    {g.label}
                    <IconChevron size={18} className="text-ink-3 transition-transform duration-[var(--d-2)] ease-[var(--ease-out)] group-open/mg:rotate-180" />
                  </summary>
                  <ul className="grid gap-0.5 pb-4">
                    {g.links.map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="block rounded-[var(--r-2)] px-3 py-2.5 no-underline transition-colors hover:bg-sage">
                          <span className="block font-medium text-ink">{l.title}</span>
                          <span className="block text-[0.875rem] text-ink-3">{l.text}</span>
                        </Link>
                      </li>
                    ))}
                    {g.key === "exams"
                      ? data.tests.map((t) => (
                          <li key={t.slug}>
                            <Link href={`/11-plus/${t.slug}`} className="block rounded-[var(--r-2)] px-3 py-2 text-ink-2 no-underline hover:bg-sage">
                              {t.name}
                            </Link>
                          </li>
                        ))
                      : null}
                  </ul>
                </details>
              ))}
              <Link href="/tools/eligibility-checker" className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-[var(--r-2)] bg-green px-5 font-semibold text-white no-underline transition-colors hover:bg-green-deep">
                Check eligibility <IconArrow size={16} />
              </Link>
              <p className="mt-5 text-[0.9375rem] text-ink-2">
                <Link href="/account" className="a">
                  Your account
                </Link>{" "}
                ·{" "}
                <Link href="/about" className="a">
                  About
                </Link>
              </p>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
