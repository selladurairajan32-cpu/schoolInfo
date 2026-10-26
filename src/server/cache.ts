/**
 * Cached reads of slow-changing site data (counts, area lists, featured records, dates).
 * Everything cached carries SITE_DATA_TAG and also expires on its own after SITE_DATA_TTL,
 * so a change made outside Next.js (a CLI import) shows within that window at most.
 */
export const SITE_DATA_TAG = "site-data";
export const SITE_DATA_TTL = 900;

/**
 * Drop the cached site data after an import or an admin edit. The next request recomputes it
 * rather than being served the old copy, so a changed admissions fact is never shown stale.
 * Outside a Next.js request (CLI imports) there is no cache to clear, so this does nothing.
 */
export async function invalidateSiteData() {
  try {
    const { revalidateTag } = await import("next/cache");
    revalidateTag(SITE_DATA_TAG, { expire: 0 });
  } catch {
    /* not running inside Next.js: the time limit applies instead */
  }
}
