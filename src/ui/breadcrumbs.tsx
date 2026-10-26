import Link from "next/link";
import { clsx } from "clsx";
import { absoluteUrl } from "@/lib/site";
import { JsonLd } from "./json-ld";

export interface Crumb {
  href: string;
  label: string;
}

/** Reference breadcrumb: "Home » Page", primary-coloured links, current page in ink. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const all = [{ href: "/", label: "Home" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={clsx("text-[0.9375rem] font-semibold text-ink-2", className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((c, i) => (
            // On phones the trail shows only the parent levels: "Home" repeats the logo and the
            // current page repeats the title, and dropping them saves a wrapped line.
            <li key={c.href} className={clsx("flex min-w-0 items-center gap-2", all.length > 2 && (i === 0 || i === all.length - 1) && "max-sm:hidden")}>
              {i > 0 ? (
                <span aria-hidden className={clsx("text-ink-3", all.length > 2 && i === 1 && "max-sm:hidden")}>
                  »
                </span>
              ) : null}
              {i === all.length - 1 ? (
                <span aria-current="page" className="truncate text-ink">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="truncate text-green-deep underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current">
                  {c.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [{ href: "/", label: "Home" }, ...items].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: absoluteUrl(c.href) })),
        }}
      />
    </>
  );
}
