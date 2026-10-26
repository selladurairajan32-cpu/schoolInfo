import Link from "next/link";
import { AtlasMark } from "./brand";
import { ArrowLink } from "./kit";

const COLUMNS: [string, [string, string][]][] = [
  ["Discover", [["/grammar-schools", "All grammar schools"], ["/grammar-schools?view=map", "Schools near a postcode"], ["/grammar-schools/northern-ireland", "Northern Ireland"], ["/compare", "Compare schools"]]],
  ["Understand", [["/admissions", "How admissions work"], ["/admissions/qualifying-is-not-an-offer", "Qualifying isn't an offer"], ["/admissions/oversubscription", "Oversubscription criteria"], ["/admissions/appeals", "Appeals"]]],
  ["11+ exams", [["/11-plus", "The 11+ explained"], ["/11-plus/exam-providers", "Tests and providers"], ["/11-plus/preparation", "Practice questions"]]],
  ["Tools", [["/tools/eligibility-checker", "Eligibility checker"], ["/tools/catchment-checker", "Catchment checker"], ["/tools/planner", "Admissions planner"], ["/assistant", "Research assistant"], ["/calendar", "Admissions calendar"]]],
  ["The atlas", [["/about", "About"], ["/methodology", "Methodology"], ["/data-sources", "Data sources"], ["/privacy", "Privacy"], ["/accessibility", "Accessibility"], ["/terms", "Terms"], ["/account", "Your account"]]],
];

export function SiteFooter() {
  return (
    <footer data-site-footer className="on-dark relative mt-12 overflow-hidden bg-navy sm:mt-16">
      <span aria-hidden className="deco deco-dots top-10 -left-6 h-28 w-14 text-white/30" />
      <svg aria-hidden className="deco spin-slow -right-20 -bottom-24 h-64 w-64 text-white/10" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 9" />
      </svg>
      <div className="relative container-page grid gap-8 pt-10 pb-8 sm:pt-12 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-white no-underline" aria-label="Grammar Atlas — home">
            <AtlasMark size={40} />
            <span className="font-display text-[1.5rem] font-extrabold">
              Grammar <span className="text-green">Atlas</span>
            </span>
          </Link>
          <p className="mt-5 text-[1rem] leading-[1.7] text-ink-2">Every fact here carries its source. If one is wrong, we want to know.</p>
          <div className="mt-6 flex flex-col items-start gap-2.5">
            <ArrowLink href="/corrections">Report a correction</ArrowLink>
            <ArrowLink href="/methodology">How we verify information</ArrowLink>
          </div>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 xl:grid-cols-5">
          {COLUMNS.map(([title, links]) => (
            <div key={title}>
              <p className="mb-3 font-display text-[1.0625rem] font-extrabold text-white">{title}</p>
              <ul className="grid gap-2">
                {links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="group/fl inline-flex items-start gap-2 text-[0.96rem] font-medium text-ink-2 no-underline transition-colors duration-[var(--d-2)] hover:text-white">
                      <span aria-hidden className="mt-[0.05em] text-[0.9em] text-copper transition-transform duration-[var(--d-2)] ease-[var(--ease-out)] group-hover/fl:translate-x-1">
                        »
                      </span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="relative border-t border-rule">
        <div className="container-page grid gap-4 py-5 text-[0.875rem] leading-relaxed text-ink-2 md:grid-cols-[1fr_auto] md:items-center">
          <p className="max-w-[80ch]">
            Grammar Atlas is independent: not a school, council or exam board. We can&apos;t submit applications or guarantee places: each school&apos;s admission authority decides. Contains public sector information licensed under the Open
            Government Licence v3.0 (Department for Education, Ofsted, Department of Education Northern Ireland, Office for National Statistics). Postcode data © Royal Mail and Crown copyright.
          </p>
          <div className="flex items-center gap-4 md:justify-end">
            <p className="text-[0.875rem] font-semibold">© {new Date().getFullYear()} Grammar Atlas</p>
            <a href="#main" className="grid size-11 place-items-center rounded-[var(--r-2)] bg-white/10 text-white no-underline transition-[background-color,transform] duration-[var(--d-3)] hover:-translate-y-1 hover:bg-green" aria-label="Back to top">
              <span aria-hidden className="text-lg leading-none">↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
