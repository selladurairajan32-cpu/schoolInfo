import Link from "next/link";
import { navData } from "@/server/nav";
import { Wordmark } from "./brand";
import { IconArrow } from "./icons";
import { MainNav, MobileNav } from "./main-nav";
import { SearchDialogTrigger } from "./search";
import { ShortlistCount } from "./shortlist";

export async function SiteHeader() {
  const data = await navData();
  return (
    <header data-site-header className="site-header sticky top-0 z-40">
      <div className="site-header-bar container-page flex items-center gap-4 lg:gap-6">
        <Wordmark />
        <MainNav data={data} />
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <SearchDialogTrigger />
          <ShortlistCount />
          {/* Reference: an orange call to action closes the bar ("Register Demo"). */}
          <Link
            href="/tools/eligibility-checker"
            className="group/cta ml-1 hidden min-h-11 items-center gap-2 rounded-[5px] bg-cta px-4 text-[0.9375rem] font-bold text-white no-underline transition-[background-color,transform] duration-[var(--d-3)] ease-[var(--ease-out)] hover:bg-green active:scale-[0.98] xl:inline-flex"
          >
            Check eligibility
            <IconArrow size={15} className="transition-transform duration-[var(--d-2)] group-hover/cta:translate-x-0.5" />
          </Link>
          <MobileNav data={data} />
        </div>
      </div>
    </header>
  );
}
