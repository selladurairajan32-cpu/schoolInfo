"use client";

import { useEffect, useRef, useState } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Arms scroll reveals for every `[data-reveal]` element (see globals.css).
 * Elements already on screen are marked revealed before the hiding class is
 * added, so nothing above the fold flickers; later content slides up as it
 * enters the viewport, the way the reference's sections do.
 */
export function RevealRoot() {
  useEffect(() => {
    if (reduced() || !("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.revealed = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const arm = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!root.classList.contains("js-reveal") && r.top < window.innerHeight && r.bottom > 0) el.dataset.revealed = "";
        else io.observe(el);
      });
    };
    arm(document);
    root.classList.add("js-reveal");
    // Client-rendered islands (results, tabs) add content after load.
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof HTMLElement && (n.matches("[data-reveal]") ? arm(n.parentElement ?? document) : arm(n)));
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("js-reveal");
    };
  }, []);
  return null;
}

/**
 * A figure that counts up from zero when it scrolls into view — the
 * reference's statistics band. Server-rendered with its final value, so the
 * number is right without JavaScript and for assistive technology.
 */
export function CountUp({ value, duration = 1400, className }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || value <= 0) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        setShown(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);
  return (
    <span ref={ref} className={className}>
      <span aria-hidden>{shown.toLocaleString("en-GB")}</span>
      <span className="sr-only">{value.toLocaleString("en-GB")}</span>
    </span>
  );
}
