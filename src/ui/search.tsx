"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import { IconArrow, IconBook, IconClose, IconDocument, IconPin, IconRoute, IconSearch, IconTarget } from "./icons";

export interface Suggestion {
  type: "school" | "area" | "postcode" | "test" | "guide" | "tool" | "page";
  label: string;
  sublabel: string;
  href: string;
}

const GROUPS: { type: Suggestion["type"]; title: string; tag: string; Icon: typeof IconPin }[] = [
  { type: "postcode", title: "Near a postcode", tag: "Postcode", Icon: IconPin },
  { type: "school", title: "Schools", tag: "School", Icon: IconBook },
  { type: "area", title: "Areas", tag: "Area", Icon: IconRoute },
  { type: "test", title: "11+ tests", tag: "11+ test", Icon: IconTarget },
  { type: "guide", title: "Guides", tag: "Guide", Icon: IconDocument },
  { type: "tool", title: "Tools", tag: "Tool", Icon: IconTarget },
  { type: "page", title: "Pages", tag: "Page", Icon: IconDocument },
];

const SUGGESTED: Suggestion[] = [
  { type: "page", label: "All grammar schools", sublabel: "Search, filter, map and table", href: "/grammar-schools" },
  { type: "guide", label: "Qualifying is not the same as getting a place", sublabel: "Start here if you're new to the 11+", href: "/admissions/qualifying-is-not-an-offer" },
  { type: "tool", label: "Eligibility checker", sublabel: "How each school's rules apply to your child", href: "/tools/eligibility-checker" },
  { type: "page", label: "Admissions calendar", sublabel: "Verified key dates", href: "/calendar" },
];

type Fetched = { q: string; items: Suggestion[]; error: boolean };

/**
 * Debounced suggestions for the current input. Results are keyed by the query that produced them,
 * so a slow response for an older query can never be shown against newer text.
 */
function useSuggestions(q: string) {
  const [state, setState] = useState<Fetched>({ q: "", items: [], error: false });
  const term = q.trim();
  useEffect(() => {
    if (term.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { suggestions: Suggestion[] };
        if (!ctrl.signal.aborted) setState({ q: term, items: body.suggestions, error: false });
      } catch {
        if (!ctrl.signal.aborted) setState({ q: term, items: [], error: true });
      }
    }, 140);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [term]);
  const current = term.length >= 2 && state.q === term;
  return { items: current ? state.items : [], loading: term.length >= 2 && !current, error: current && state.error, settled: current };
}

/** Shared combobox: input + grouped listbox with full keyboard support. */
function Combobox({ size = "md", autoFocus = false, onNavigate, placeholder, showSuggested = false, label }: { size?: "md" | "lg"; autoFocus?: boolean; onNavigate?: () => void; placeholder: string; showSuggested?: boolean; label: string }) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { items, loading, error, settled } = useSuggestions(value);
  const short = value.trim().length < 2;
  const grouped = useMemo(() => {
    const shown = short ? (showSuggested ? SUGGESTED : []) : items;
    return GROUPS.map((g) => ({ ...g, items: shown.filter((s) => s.type === g.type) })).filter((g) => g.items.length);
  }, [short, showSuggested, items]);
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);
  const expanded = (open || showSuggested) && flat.length > 0;
  /* A finished lookup with nothing to show: say so, rather than leaving the box silent. */
  const empty = open && !short && settled && flat.length === 0;
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(s: Suggestion) {
    setOpen(false);
    onNavigate?.();
    router.push(s.href);
  }

  function submit() {
    const q = value.trim();
    if (!q) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/grammar-schools?q=${encodeURIComponent(q)}`);
  }

  return (
    <div ref={wrapRef} className="relative">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (expanded && active >= 0 && flat[active]) go(flat[active]!);
          else submit();
        }}
        className={clsx(
          "group/s relative flex items-center rounded-[var(--r-2)] border bg-card transition-[border-color,box-shadow] duration-[var(--d-2)] ease-[var(--ease-out)] focus-within:border-green focus-within:shadow-[0_0_0_4px_rgb(36_93_135/0.12)]",
          size === "lg" ? "border-rule-strong hover:border-control" : "border-control",
        )}
      >
        <label htmlFor={`${id}-input`} className="sr-only">
          {label}
        </label>
        <IconSearch size={size === "lg" ? 22 : 18} className={clsx("pointer-events-none absolute text-ink-2", size === "lg" ? "left-3 sm:left-4" : "left-3")} />
        <input
          id={`${id}-input`}
          type="search"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={expanded ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={expanded && active >= 0 ? `${id}-opt-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && flat.length) {
              e.preventDefault();
              setOpen(true);
              setActive((a) => (a + 1) % flat.length);
            } else if (e.key === "ArrowUp" && flat.length) {
              e.preventDefault();
              setActive((a) => (a <= 0 ? flat.length - 1 : a - 1));
            } else if (e.key === "Escape" && !showSuggested) {
              if (!expanded && !empty && value) setValue("");
              setOpen(false);
              setActive(-1);
            }
          }}
          className={clsx(
            "w-full min-w-0 bg-transparent text-ink outline-none placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden",
            size === "lg" ? "h-[3.5rem] pr-14 pl-11 text-[1.0625rem] sm:h-[3.75rem] sm:pr-36 sm:pl-13 sm:text-[1.15rem]" : "h-12 pr-24 pl-10 text-[1.02rem]",
          )}
        />
        <button
          type="submit"
          className={clsx(
            "absolute inline-flex items-center gap-1.5 rounded-[var(--r-2)] bg-green font-semibold text-white transition-[background-color,transform] duration-[var(--d-2)] hover:bg-green-deep active:scale-[0.97]",
            size === "lg" ? "right-1.5 h-11 w-11 justify-center text-[1rem] sm:right-2 sm:w-auto sm:px-4" : "right-1.5 h-9 px-3 text-[0.95rem]",
          )}
        >
          <span className={size === "lg" ? "sr-only sm:not-sr-only" : undefined}>Search</span>
          <IconArrow size={size === "lg" ? 18 : 16} />
        </button>
        <span aria-hidden className={clsx("absolute right-0 bottom-0 left-0 h-[2px] origin-left bg-green-bright transition-transform duration-[var(--d-3)] ease-[var(--ease-out)]", loading ? "scale-x-100 animate-pulse" : "scale-x-0")} />
      </form>

      {expanded ? (
        <div
          id={listId}
          role="listbox"
          aria-label="Suggestions"
          className={clsx("anim-rise z-50 overflow-auto rounded-[6px] border border-rule bg-card", showSuggested ? "mt-3 max-h-[min(60vh,32rem)]" : "absolute mt-2 max-h-[26rem] w-full shadow-lift")}
        >
          {value.trim().length < 2 && showSuggested ? <p className="label px-4 pt-3 pb-1">Suggested starting points</p> : null}
          {grouped.map((g) => (
            <div key={g.type} role="group" aria-labelledby={`${id}-g-${g.type}`} className="border-b border-rule py-1.5 last:border-0">
              {value.trim().length >= 2 ? (
                <p id={`${id}-g-${g.type}`} className="label px-4 pt-1.5 pb-1">
                  {g.title}
                </p>
              ) : (
                <span id={`${id}-g-${g.type}`} className="sr-only">
                  {g.title}
                </span>
              )}
              {g.items.map((s) => {
                const i = flat.indexOf(s);
                return (
                  <div
                    key={s.href + s.label}
                    id={`${id}-opt-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(s)}
                    className={clsx("mx-1.5 flex cursor-pointer items-start gap-3 rounded-[4px] px-2.5 py-2 transition-colors duration-[var(--d-1)]", i === active ? "bg-green-wash" : "hover:bg-paper")}
                  >
                    <g.Icon size={17} className={clsx("mt-[3px] shrink-0", i === active ? "text-green" : "text-ink-3")} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">{s.label}</span>
                      <span className="block truncate text-small text-ink-2">{s.sublabel}</span>
                    </span>
                    <span className="mt-0.5 shrink-0 rounded-[3px] border border-rule px-1.5 py-0.5 text-[0.8125rem] font-medium text-ink-3">{g.tag}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
      {empty ? (
        <div className={clsx("anim-rise z-50 rounded-[6px] border border-rule bg-card px-4 py-3 text-[0.9375rem] text-ink-2", showSuggested ? "mt-3" : "absolute mt-2 w-full shadow-lift")}>
          <p>{error ? "Suggestions are unavailable right now." : <>No quick matches for &ldquo;{value.trim()}&rdquo;.</>}</p>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={submit} className="mt-1 inline-flex min-h-10 items-center gap-1 font-semibold text-green hover:text-green-deep">
            Search all schools for &ldquo;{value.trim()}&rdquo; <IconArrow size={14} />
          </button>
        </div>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {short || loading ? "" : error ? "Suggestions unavailable. Press Enter to search." : `${flat.length} suggestions`}
      </p>
    </div>
  );
}

/** Inline search (homepage hero, 404). */
export function SearchField({ size = "md", placeholder = "School, town or postcode" }: { size?: "md" | "lg"; placeholder?: string }) {
  return <Combobox size={size} placeholder={placeholder} label="Search schools, towns, postcodes and guides" />;
}

/** Header trigger + command palette. Opens with "/" or Ctrl/⌘+K. */
export function SearchDialogTrigger() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.isContentEditable);
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>("input, button, [href], [tabindex]:not([tabindex='-1'])");
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
    const trigger = triggerRef.current;
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      {/* A field-shaped button from tablet width up, so search is visible without being a full form in the bar. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-keyshortcuts="/ Control+K Meta+K"
        title="Search (press /)"
        className={clsx(
          "group/st grid size-11 place-items-center rounded-[var(--r-2)] text-ink transition-[background-color,border-color,color,box-shadow] duration-[var(--d-2)] ease-[var(--ease-out)] hover:bg-sage",
          // Field shape where the bar has room: tablets (no inline navigation) and wide desktops.
          "md:max-lg:flex md:max-lg:h-10 md:max-lg:w-[16rem] md:max-lg:gap-2.5 md:max-lg:border md:max-lg:border-rule-strong md:max-lg:bg-card md:max-lg:px-3 md:max-lg:hover:border-green md:max-lg:hover:bg-card",
          "xl:flex xl:h-10 xl:w-[17rem] xl:gap-2.5 xl:border xl:border-rule-strong xl:bg-card xl:px-3 xl:hover:border-green xl:hover:bg-card xl:hover:shadow-[0_0_0_3px_rgb(36_93_135/0.1)]",
        )}
      >
        <IconSearch size={19} className="shrink-0 text-ink-2 transition-colors group-hover/st:text-green" />
        <span className="sr-only md:max-lg:not-sr-only md:max-lg:flex-1 md:max-lg:truncate md:max-lg:text-left md:max-lg:text-[0.9375rem] md:max-lg:text-ink-3 xl:not-sr-only xl:flex-1 xl:truncate xl:text-left xl:text-[0.9375rem] xl:text-ink-3">
          Search<span className="hidden md:max-lg:inline xl:inline"> schools and towns</span>
        </span>
        <kbd aria-hidden className="hidden text-ink-3 md:max-lg:inline xl:inline">
          /
        </kbd>
      </button>
      {open ? (
        <div className="on-light fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[9vh] sm:px-6" role="presentation">
          <div className="anim-fade absolute inset-0 bg-ink/35 backdrop-blur-[2px]" onClick={() => setOpen(false)} aria-hidden />
          <div ref={panelRef} role="dialog" aria-modal="true" aria-label="Search Grammar Atlas" className="anim-rise relative w-full max-w-[42rem] rounded-[8px] border border-rule bg-paper p-4 shadow-lift sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="label">Search the atlas</p>
              <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-[4px] text-ink-2 hover:bg-sage hover:text-ink" aria-label="Close search">
                <IconClose size={18} />
              </button>
            </div>
            <Combobox autoFocus showSuggested onNavigate={() => setOpen(false)} placeholder="School, town, postcode, test or topic" label="Search schools, towns, postcodes, tests and guides" />
            <p className="mt-3 text-small text-ink-2">
              <kbd>↑</kbd> <kbd>↓</kbd> to move, <kbd>Enter</kbd> to open, <kbd>Esc</kbd> to close. Postcodes search by straight-line distance.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
