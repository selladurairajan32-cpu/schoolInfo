#!/usr/bin/env node
/**
 * Route-scope discovery for the redesign QA.
 *
 * Combines independent sources into one inventory (docs/qa/routes.json):
 *   1. App Router filesystem (page.tsx files, dynamic segments, route groups)
 *   2. Hard-coded internal hrefs in navigation, footer and page source
 *   3. Database-driven sitemaps on a local server (enumerates dynamic params)
 *   4. Live deployment sitemaps
 *   5. Redirect/rewrite config (next.config.ts, middleware)
 *
 * Usage: node scripts/qa/discover-routes.mjs [--local http://localhost:3000] [--live https://school-info-seven.vercel.app]
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i > -1 ? process.argv[i + 1] : d;
};
const LOCAL = arg("--local", "http://localhost:3000");
const LIVE = arg("--live", "https://school-info-seven.vercel.app");
const ROOT = process.cwd();
const APP = join(ROOT, "src/app");

const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));

/* 1 — filesystem patterns */
const files = walk(APP);
const patterns = files
  .filter((f) => /[/\\]page\.(t|j)sx?$/.test(f))
  .map((f) => {
    const segs = relative(APP, f).split(sep).slice(0, -1);
    const visible = segs.filter((s) => !/^\(.*\)$/.test(s) && !s.startsWith("@"));
    const route = "/" + visible.join("/");
    return { pattern: route === "/" ? "/" : route, file: relative(ROOT, f), dynamic: visible.some((s) => s.startsWith("[")), group: segs.find((s) => /^\(.*\)$/.test(s)) ?? null };
  });
const handlers = files.filter((f) => /[/\\]route\.(t|j)s$/.test(f)).map((f) => "/" + relative(APP, f).split(sep).slice(0, -1).join("/"));

/* 2 — hard-coded internal hrefs */
const srcFiles = walk(join(ROOT, "src")).filter((f) => /\.(tsx?|mjs)$/.test(f));
const hrefs = new Map();
for (const f of srcFiles) {
  const text = readFileSync(f, "utf8");
  for (const m of text.matchAll(/(?:href=|href:\s*|\[)\s*["'`](\/(?!\/)[a-z0-9\-/?=&#.,_]*)["'`]/gi)) {
    const h = m[1].replace(/#.*$/, "");
    if (!h || h.startsWith("/api") || h.startsWith("/_next")) continue;
    if (!hrefs.has(h)) hrefs.set(h, new Set());
    hrefs.get(h).add(relative(ROOT, f));
  }
}

/* 5 — redirects / rewrites / middleware */
const nextConfig = readFileSync(join(ROOT, "next.config.ts"), "utf8");
const redirects = { redirectsFn: /async\s+redirects\s*\(/.test(nextConfig), rewritesFn: /async\s+rewrites\s*\(/.test(nextConfig), middleware: ["middleware.ts", "src/middleware.ts", "proxy.ts", "src/proxy.ts"].filter((p) => existsSync(join(ROOT, p))) };

/* 3, 4 — sitemaps */
async function sitemap(base) {
  const out = new Map();
  try {
    const idx = await (await fetch(`${base}/sitemap.xml`)).text();
    for (const [, loc] of idx.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const name = loc.replace(/^.*\/sitemaps\//, "").replace(/\.xml$/, "");
      const xml = await (await fetch(`${base}/sitemaps/${name}.xml`)).text();
      for (const [, u] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) out.set(new URL(u).pathname, name);
    }
  } catch (e) {
    console.warn(`sitemap fetch failed for ${base}: ${e}`);
  }
  return out;
}
const [local, live] = await Promise.all([sitemap(LOCAL), sitemap(LIVE)]);

/* Map a concrete path to its filesystem pattern */
const dyn = patterns
  .map((p) => ({ ...p, re: new RegExp("^" + p.pattern.replace(/\[\[\.\.\.[^\]]+\]\]/g, ".*").replace(/\[\.\.\.[^\]]+\]/g, ".+").replace(/\[[^\]]+\]/g, "[^/]+") + "$") }))
  .sort((a, b) => Number(a.dynamic) - Number(b.dynamic));
const patternOf = (path) => dyn.find((p) => p.re.test(path))?.pattern ?? null;

const routes = new Map();
const add = (path, source) => {
  const clean = path.split("?")[0].replace(/\/$/, "") || "/";
  const key = path.includes("?") ? path : clean;
  if (!routes.has(key)) routes.set(key, { path: key, pattern: patternOf(clean), sources: new Set() });
  routes.get(key).sources.add(source);
};
for (const p of patterns) if (!p.dynamic) add(p.pattern, "filesystem");
for (const [h] of hrefs) add(h, "source-href");
for (const [p, n] of local) add(p, `local-sitemap:${n}`);
for (const [p, n] of live) add(p, `live-sitemap:${n}`);

const list = [...routes.values()].map((r) => ({ ...r, sources: [...r.sources].sort() })).sort((a, b) => a.path.localeCompare(b.path));
mkdirSync(join(ROOT, "docs/qa"), { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  local: LOCAL,
  live: LIVE,
  patterns,
  handlers,
  redirects,
  counts: {
    patterns: patterns.length,
    staticPatterns: patterns.filter((p) => !p.dynamic).length,
    dynamicPatterns: patterns.filter((p) => p.dynamic).length,
    localSitemap: local.size,
    liveSitemap: live.size,
    onlyLocal: [...local.keys()].filter((p) => !live.has(p)).length,
    onlyLive: [...live.keys()].filter((p) => !local.has(p)).length,
    unmatched: list.filter((r) => !r.pattern).length,
  },
  onlyLive: [...live.keys()].filter((p) => !local.has(p)),
  onlyLocal: [...local.keys()].filter((p) => !live.has(p)),
  routes: list,
};
writeFileSync(join(ROOT, "docs/qa/routes.json"), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report.counts, null, 1));
