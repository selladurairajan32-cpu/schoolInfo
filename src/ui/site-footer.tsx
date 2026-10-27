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
    <footer data-site-footer className="on-dark relative mt-12 bg-navy sm:mt-14">
      <div className="relative container-page grid gap-8 pt-10 pb-8 sm:pt-12 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-12">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-white no-underline" aria-label="Grammar Atlas — home">
            <AtlasMark size={32} />
            <span className="font-display text-[1.3125rem] font-semibold tracking-[-0.02em]">
              Grammar <span className="text-green">Atlas</span>
            </span>
          </Link>
          <p className="mt-4 font-read text-[1.0625rem] leading-[1.6] text-ink-2">Every fact here carries its source. If one is wrong, we want to know.</p>
          <div className="mt-6 flex flex-col items-start gap-2.5">
            <ArrowLink href="/corrections">Report a correction</ArrowLink>
            <ArrowLink href="/methodology">How we verify information</ArrowLink>
          </div>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 xl:grid-cols-5">
          {COLUMNS.map(([title, links]) => (
            <div key={title}>
              <p className="mb-3 text-[0.9375rem] font-semibold text-white">{title}</p>
              <ul className="grid gap-2">
                {links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="ed-link text-[0.9375rem] text-ink-2 transition-colors duration-[var(--d-2)] hover:text-white">
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
            <p className="text-[0.875rem] font-medium">© {new Date().getFullYear()} Grammar Atlas</p>
            <a href="#main" className="grid size-11 place-items-center rounded-[var(--r-2)] border border-rule-strong text-white no-underline transition-[background-color,transform] duration-[var(--d-2)] hover:-translate-y-0.5 hover:bg-white/10" aria-label="Back to top">
              <span aria-hidden className="text-lg leading-none">↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
