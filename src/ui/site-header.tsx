import { navData } from "@/server/nav";
import { Wordmark } from "./brand";
import { MainNav, MobileNav } from "./main-nav";
import { SearchDialogTrigger } from "./search";
import { ShortlistCount } from "./shortlist";

/**
 * Site header: wordmark, the five navigation groups, and a search field that is
 * always visible. Tools such as the eligibility checker live in the navigation
 * rather than competing with each page's own call to action.
 */
export async function SiteHeader() {
  const data = await navData();
  return (
    <header data-site-header className="site-header sticky top-0 z-40">
      <div className="site-header-bar container-page flex items-center gap-3 lg:gap-5">
        <Wordmark />
        <MainNav data={data} />
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <SearchDialogTrigger />
          <ShortlistCount />
          <MobileNav data={data} />
        </div>
      </div>
    </header>
  );
}
