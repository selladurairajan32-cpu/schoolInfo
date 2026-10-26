"use client";

import { useEffect, useRef } from "react";

/**
 * Applies the desktop filter rail as soon as a chip, checkbox or select changes, so the
 * results follow the filters without hunting for a button. Text fields (the postcode) still
 * apply on Enter or with the button. The rail tells people this up front (WCAG 3.2.2).
 */
export function AutoApply() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const form = ref.current?.closest("form");
    if (!form) return;
    const onChange = (e: Event) => {
      const t = e.target as HTMLInputElement | HTMLSelectElement;
      if (t instanceof HTMLSelectElement || (t instanceof HTMLInputElement && (t.type === "checkbox" || t.type === "radio"))) form.requestSubmit();
    };
    form.addEventListener("change", onChange);
    return () => form.removeEventListener("change", onChange);
  }, []);
  return <span ref={ref} hidden />;
}
