"use client";

import { useId, useState } from "react";
import { clsx } from "clsx";
import { IconChevron } from "../icons";

/**
 * A listing row's "More detail" control. The panel is rendered on the server and only shown or hidden here,
 * so the row's own links and the compare box stay outside the button.
 */
export function RowDisclosure({ name, before, after, children, className, panelClassName }: { name: string; before: React.ReactNode; after: React.ReactNode; children: React.ReactNode; className?: string; panelClassName?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <div className={clsx("flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-ink-3", className)}>
        {before}
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className="inline-flex min-h-9 items-center gap-1 font-semibold text-green-deep hover:text-green">
          {open ? "Less" : "Details"}<span className="hidden sm:inline">{open ? " detail" : ""}</span>
          <span className="sr-only">: {name}</span>
          <IconChevron size={13} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
        <span className="ml-auto">{after}</span>
      </div>
      <div id={id} hidden={!open} className={panelClassName}>
        {children}
      </div>
    </>
  );
}
