#!/usr/bin/env node
/**
 * Route coverage check for the redesign.
 *
 * Builds the full route list from docs/qa/routes.json (filesystem, hrefs,
 * local and live sitemaps) plus every database-enumerable URL the sitemaps
 * leave out (thin noindex school tabs, query states, a saved comparison),
 * then visits each one at desktop and mobile widths with bounded parallelism.
 *
 * For every visit it records: HTTP status, runtime errors, presence of an h1
 * and main content, broken images, horizontal overflow, and internal links
 * that are not in the inventory. Results go to docs/qa/coverage.json.
 *
 * Usage: BASE=http://localhost:3100 node scripts/qa/route-coverage.mjs [--concurrency 4] [--only <substring>]
 * Env: OUT=<file> to write elsewhere; SKIP_API=1 to skip creating a saved comparison (use against production).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";
import postgres from "postgres";

const BASE = process.env.BASE ?? "http://localhost:3000";
const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i > -1 ? process.argv[i + 1] : d;
};
const CONCURRENCY = Number(arg("--concurrency", 4));
const ONLY = arg("--only", null);
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const inv = JSON.parse(readFileSync("docs/qa/routes.json", "utf8"));
const routes = new Map();
const add = (path, source, template) => {
  if (!routes.has(path)) routes.set(path, { path, sources: new Set(), template });
  routes.get(path).sources.add(source);
};

/* Template classification from the filesystem pattern (or path for query states) */
const TEMPLATE = [
  [/^\/$/, "Homepage"],
  [/^\/grammar-schools\?view=table/, "Directory — table view"],
  [/^\/grammar-schools\?view=map/, "Directory — map view"],
  [/^\/grammar-schools$/, "Directory — ledger + area index"],
  [/^\/grammar-schools\/\[area\]$/, "Area listing"],
  [/^\/schools\/\[slug\]$/, "School profile — overview"],
  [/^\/schools\/\[slug\]\/(admissions|11-plus|catchment|results|inspection|historical-admissions)$/, "School profile — chapter"],
  [/^\/admissions$/, "Admissions hub"],
  [/^\/admissions\/\[guide\]$/, "Guide article"],
  [/^\/11-plus$/, "11+ explainer article"],
  [/^\/11-plus\/exam-providers$/, "Test providers index"],
  [/^\/11-plus\/preparation$/, "Practice tool"],
  [/^\/11-plus\/\[test\]$/, "Entrance test detail"],
  [/^\/compare(\?.*)?$/, "Compare tool"],
  [/^\/compare\/\[slug\]$/, "Saved comparison"],
  [/^\/tools\/eligibility-checker/, "Eligibility checker"],
  [/^\/tools\/catchment-checker/, "Catchment checker"],
  [/^\/tools\/planner$/, "Admissions planner"],
  [/^\/assistant$/, "Research assistant"],
  [/^\/calendar$/, "Admissions calendar"],
  [/^\/(about|methodology|privacy|terms|accessibility)$/, "Content article"],
  [/^\/data-sources$/, "Data sources status"],
  [/^\/corrections$/, "Corrections form"],
  [/^\/account$/, "Account / sign-in"],
  [/^\/admin/, "Admin console (internal)"],
  [/^__404$/, "Not found"],
];
const templateOf = (pattern, path) => TEMPLATE.find(([re]) => re.test(path.includes("?") ? path : pattern ?? path))?.[1] ?? "Unclassified";

for (const r of inv.routes) {
  if (["/catchment", "/historical-admissions", "/inspection", "/results"].includes(r.path)) continue; // relative tab suffixes, not routes
  for (const s of r.sources) add(r.path, s, templateOf(r.pattern, r.path));
}

/* Database enumeration: every school's seven views, including noindex thin tabs */
const sql = postgres(process.env.DATABASE_URL ?? "postgres://gsi:gsi@localhost:5432/gsi", { max: 2 });
const schools = await sql`SELECT slug FROM schools WHERE is_open AND selectivity <> 'non_selective' ORDER BY slug`;
for (const { slug } of schools) {
  add(`/schools/${slug}`, "database", "School profile — overview");
  for (const tab of ["admissions", "11-plus", "catchment", "results", "inspection", "historical-admissions"]) add(`/schools/${slug}/${tab}`, "database", "School profile — chapter");
}
const tests = await sql`SELECT slug FROM entrance_tests ORDER BY slug`;
for (const { slug } of tests) add(`/11-plus/${slug}`, "database", "Entrance test detail");
await sql.end();

/* Query states with distinct interfaces */
for (const p of ["/grammar-schools?view=table", "/grammar-schools?view=map", "/grammar-schools?q=kent", "/grammar-schools?gender=girls&sixth_form=1", "/compare?schools=aylesbury-grammar-school,aylesbury-high-school", "/tools/eligibility-checker?schools=aylesbury-grammar-school", "/tools/catchment-checker?schools=aylesbury-grammar-school"])
  add(p, "query-state", templateOf(null, p.split("?")[0] === "/grammar-schools" && !p.includes("view=") ? "/grammar-schools" : p));

/* A saved comparison, created through the public API (SKIP_API=1 avoids writing to the target, e.g. production) */
if (!process.env.SKIP_API) try {
  const res = await fetch(`${BASE}/api/comparisons`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ schools: ["aylesbury-grammar-school", "tiffin-school"], entryYear: 2027 }) });
  const { slug } = await res.json();
  if (slug) add(`/compare/${slug}`, "api-created", "Saved comparison");
} catch (e) {
  console.warn("could not create a saved comparison", e);
}
/* Admin entry points (auth-gated: expect redirects) and a 404 probe */
for (const p of ["/admin/login", "/admin"]) add(p, "filesystem", "Admin console (internal)");
add("/this-page-does-not-exist", "probe", "Not found");

let list = [...routes.values()].map((r) => ({ ...r, sources: [...r.sources].sort() }));
const known = new Set(list.map((r) => r.path.split("?")[0]));
if (ONLY) list = list.filter((r) => r.path.includes(ONLY));
console.log(`checking ${list.length} routes × ${VIEWPORTS.length} viewports at ${BASE}`);

const browser = await chromium.launch();
const results = [];
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce" });
  // Third-party map tiles are not part of the redesign; block them to keep runs deterministic.
  await ctx.route(/tiles\.openfreemap\.org|api\.postcodes\.io/, (r) => r.abort());
  let next = 0;
  const worker = async () => {
    const page = await ctx.newPage();
    while (next < list.length) {
      const r = list[next++];
      const errors = [];
      const onErr = (e) => errors.push(String(e.message ?? e).slice(0, 300));
      const onConsole = (m) => m.type() === "error" && !/Failed to load resource|ERR_FAILED|net::/.test(m.text()) && errors.push(m.text().slice(0, 300));
      page.on("pageerror", onErr);
      page.on("console", onConsole);
      const rec = { path: r.path, viewport: vp.name };
      try {
        const resp = await page.goto(BASE + r.path, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await page.waitForLoadState("load", { timeout: 20_000 }).catch(() => {});
        rec.status = resp?.status() ?? null;
        rec.finalPath = new URL(page.url()).pathname;
        Object.assign(
          rec,
          await page.evaluate(() => {
            const main = document.querySelector("main");
            const imgs = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && !i.src.startsWith("data:"));
            const sw = document.documentElement.scrollWidth;
            const cw = document.documentElement.clientWidth;
            const wide = sw > cw + 1 ? [...document.querySelectorAll("main *")].filter((e) => e.getBoundingClientRect().right > cw + 1 && getComputedStyle(e).position !== "fixed" && !e.closest("[role=region],.overflow-x-auto,[class*=overflow-x]")).slice(0, 3).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 60)}`) : [];
            return {
              h1: document.querySelector("h1")?.textContent?.trim().slice(0, 120) ?? null,
              mainText: main?.innerText.trim().length ?? 0,
              brokenImages: imgs.map((i) => i.src.slice(0, 120)),
              overflowPx: Math.max(0, sw - cw),
              overflowEls: wide,
              robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null,
              canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
              links: [...new Set([...document.querySelectorAll("a[href^='/']")].map((a) => a.getAttribute("href").split("#")[0].split("?")[0]).filter(Boolean))],
            };
          }),
        );
      } catch (e) {
        rec.error = String(e).slice(0, 300);
      }
      rec.errors = errors;
      rec.unknownLinks = (rec.links ?? []).filter((l) => !known.has(l) && !l.startsWith("/api") && !l.startsWith("/admin"));
      delete rec.links;
      page.off("pageerror", onErr);
      page.off("console", onConsole);
      results.push(rec);
      if (results.length % 100 === 0) console.log(`${results.length} visits…`);
    }
    await page.close();
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  await ctx.close();
}
await browser.close();

/* Pass/fail rules */
const expectStatus = (r) => (r.path === "/this-page-does-not-exist" ? 404 : 200);
for (const v of results) {
  const r = routes.get(v.path);
  v.template = r?.template;
  const problems = [];
  if (v.error) problems.push(`navigation: ${v.error}`);
  // Admin is staff-only: every panel route must land on the sign-in form (a short page by design).
  const admin = v.path.startsWith("/admin");
  if (admin && v.path !== "/admin/forbidden" && v.finalPath !== "/admin/login") problems.push(`admin route did not require sign-in (landed on ${v.finalPath})`);
  if (v.status !== expectStatus(v)) problems.push(`status ${v.status}`);
  if (!v.h1) problems.push("no h1");
  if (!admin && (v.mainText ?? 0) < 200 && v.status === 200) problems.push(`thin main (${v.mainText} chars)`);
  if (v.brokenImages?.length) problems.push(`broken images: ${v.brokenImages.length}`);
  if (v.overflowPx > 0) problems.push(`horizontal overflow ${v.overflowPx}px`);
  if (v.errors.length) problems.push(`runtime errors: ${v.errors.length}`);
  v.problems = problems;
  v.pass = problems.length === 0;
}
const summary = {
  generatedAt: new Date().toISOString(),
  base: BASE,
  routes: list.length,
  visits: results.length,
  passed: results.filter((r) => r.pass).length,
  failed: results.filter((r) => !r.pass).length,
  byTemplate: Object.fromEntries(
    [...new Set(list.map((r) => r.template))].sort().map((t) => {
      const vs = results.filter((v) => v.template === t);
      return [t, { routes: new Set(vs.map((v) => v.path)).size, visits: vs.length, passed: vs.filter((v) => v.pass).length }];
    }),
  ),
  unknownLinks: [...new Set(results.flatMap((r) => r.unknownLinks))].sort(),
};
writeFileSync(process.env.OUT ?? (ONLY ? "docs/qa/coverage-partial.json" : "docs/qa/coverage.json"), JSON.stringify({ summary, routes: list, results }, null, 1));
console.log(JSON.stringify({ ...summary, byTemplate: undefined }, null, 1));
for (const v of results.filter((r) => !r.pass).slice(0, 40)) console.log(`FAIL ${v.viewport} ${v.path}: ${v.problems.join("; ")}`);
