#!/usr/bin/env node
/**
 * Responsive matrix: one representative route per template × eight widths.
 * Checks horizontal overflow, which navigation is active, small touch
 * targets and that wide tables scroll inside their own region, and saves
 * JPEGs (full page at 1440 and 390, top of page at 320).
 *
 * Usage: BASE=http://localhost:3100 node scripts/qa/responsive.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const WIDTHS = [1920, 1440, 1280, 1024, 768, 430, 390, 375, 320];
const FULL = new Set([1440, 390]);
const OUT = "docs/screenshots";
const SAMPLES = [
  ["Homepage", "/"],
  ["Directory — ledger + area index", "/grammar-schools"],
  ["Directory — table view", "/grammar-schools?view=table"],
  ["Directory — map view", "/grammar-schools?view=map"],
  ["Area listing", "/grammar-schools/kent"],
  ["School profile — overview (rich)", "/schools/aylesbury-grammar-school"],
  ["School profile — overview (long name, sparse)", "/schools/queen-elizabeths-grammar-alford-a-selective-academy"],
  ["School profile — overview (Northern Ireland)", "/schools/abbey-christian-brothers-grammar-newry"],
  ["School profile — admissions chapter", "/schools/aylesbury-grammar-school/admissions"],
  ["School profile — results chapter", "/schools/maidstone-grammar-school/results"],
  ["School profile — applications chapter", "/schools/aylesbury-grammar-school/historical-admissions"],
  ["Admissions hub", "/admissions"],
  ["Guide article", "/admissions/appeals"],
  ["11+ explainer article", "/11-plus"],
  ["Test providers index", "/11-plus/exam-providers"],
  ["Entrance test detail", "/11-plus/buckinghamshire-secondary-transfer-test"],
  ["Practice tool", "/11-plus/preparation"],
  ["Compare tool", "/compare?schools=aylesbury-grammar-school,aylesbury-high-school,tiffin-school"],
  ["Eligibility checker", "/tools/eligibility-checker?schools=aylesbury-grammar-school"],
  ["Catchment checker", "/tools/catchment-checker?schools=aylesbury-grammar-school"],
  ["Admissions planner", "/tools/planner"],
  ["Research assistant", "/assistant"],
  ["Admissions calendar", "/calendar"],
  ["Content article", "/methodology"],
  ["Data sources status", "/data-sources"],
  ["Corrections form", "/corrections"],
  ["Account / sign-in", "/account"],
  ["Not found", "/this-page-does-not-exist"],
];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const rows = [];
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : w < 1100 ? 1024 : 1000 }, reducedMotion: "reduce", hasTouch: w < 1024 });
  await ctx.route(/tiles\.openfreemap\.org|api\.postcodes\.io/, (r) => r.abort());
  const page = await ctx.newPage();
  for (const [name, path] of SAMPLES) {
    const resp = await page.goto(BASE + path, { waitUntil: "load", timeout: 90_000 });
    await page.waitForTimeout(300);
    const m = await page.evaluate(() => {
      const cw = document.documentElement.clientWidth;
      const vis = (sel) => {
        const e = document.querySelector(sel);
        return !!e && getComputedStyle(e).display !== "none" && e.getBoundingClientRect().width > 0;
      };
      const targets = [...document.querySelectorAll("main a, main button, main input, main select, header a, header button")].filter((e) => {
        const r = e.getBoundingClientRect();
        const cs = getComputedStyle(e);
        if (!r.width || !r.height || cs.visibility === "hidden" || cs.opacity === "0") return false;
        // Visually hidden native inputs: their visible <label> is the target.
        if (r.width <= 1 || r.height <= 1 || cs.clip === "rect(0px, 0px, 0px, 0px)" || cs.clipPath === "inset(50%)") return false;
        // Links set inline in running text or headings are exempt (WCAG 2.5.8 inline exception).
        if (e.tagName === "A" && cs.display === "inline") return false;
        return r.height < 24 || r.width < 24;
      });
      const tables = [...document.querySelectorAll("main table")].map((t) => {
        const box = t.closest("[role=region], .overflow-x-auto, [class*='overflow-x']");
        return { contained: !!box || t.getBoundingClientRect().right <= cw + 1 };
      });
      return {
        overflowPx: Math.max(0, document.documentElement.scrollWidth - cw),
        desktopNav: vis("[data-nav-root]"),
        mobileNav: vis("header .lg\\:hidden button"),
        smallTargets: targets.length,
        smallTargetSamples: targets.slice(0, 3).map((e) => `${e.tagName.toLowerCase()} "${(e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 30)}"`),
        tables: tables.length,
        tablesUncontained: tables.filter((t) => !t.contained).length,
        h1Size: getComputedStyle(document.querySelector("h1") ?? document.body).fontSize,
      };
    });
    const file = `${OUT}/${slug(name)}-${w}.jpg`;
    if (FULL.has(w) || w === 320) await page.screenshot({ path: file, type: "jpeg", quality: 50, fullPage: FULL.has(w) });
    const pass = m.overflowPx === 0 && m.tablesUncontained === 0 && (w >= 1024 ? m.desktopNav : m.mobileNav);
    rows.push({ template: name, path, width: w, status: resp?.status(), ...m, screenshot: FULL.has(w) || w === 320 ? file : null, pass });
    console.log(`${pass ? "ok  " : "FAIL"} ${w} ${path} overflow=${m.overflowPx} small=${m.smallTargets}`);
  }
  await ctx.close();
}
await browser.close();
writeFileSync("docs/qa/responsive.json", JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, widths: WIDTHS, rows }, null, 1));
console.log(`${rows.filter((r) => r.pass).length}/${rows.length} passed`);
