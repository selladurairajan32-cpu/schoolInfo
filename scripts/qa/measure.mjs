#!/usr/bin/env node
/**
 * Responsive measurement: visits representative pages at nine widths and
 * records computed typography, component dimensions, spacing, overflow and
 * console errors, plus a viewport screenshot. Run against live and the
 * development build with the same LABEL-free page list to compare.
 *
 * Usage: BASE=https://school-info-seven.vercel.app LABEL=live node scripts/qa/measure.mjs
 * Output: docs/qa/measure-<LABEL>.json and /tmp/claude-0/shots/<LABEL>/*.jpg (SHOTS env overrides the folder)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3100";
const LABEL = process.env.LABEL ?? "dev";
const SHOTS = process.env.SHOTS ?? `/tmp/claude-0/shots/${LABEL}`;
export const WIDTHS = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];
export const PAGES = [
  ["home", "/"],
  ["directory", "/grammar-schools"],
  ["directory-table", "/grammar-schools?view=table"],
  ["area", "/grammar-schools/kent"],
  ["profile-rich", "/schools/aylesbury-grammar-school"],
  ["profile-results", "/schools/maidstone-grammar-school"],
  ["profile-ni", "/schools/abbey-christian-brothers-grammar-newry"],
  ["profile-long-name", "/schools/queen-elizabeths-grammar-alford-a-selective-academy"],
  ["profile-partial", "/schools/st-bernards-high-school"],
  ["chapter-admissions", "/schools/aylesbury-grammar-school/admissions"],
  ["chapter-results", "/schools/maidstone-grammar-school/results"],
  ["chapter-applications", "/schools/aylesbury-grammar-school/historical-admissions"],
  ["admissions-hub", "/admissions"],
  ["guide", "/admissions/appeals"],
  ["eleven-plus", "/11-plus"],
  ["test-detail", "/11-plus/buckinghamshire-secondary-transfer-test"],
  ["compare", "/compare?schools=aylesbury-grammar-school,aylesbury-high-school,tiffin-school"],
  ["eligibility", "/tools/eligibility-checker?schools=aylesbury-grammar-school"],
  ["calendar", "/calendar"],
  ["methodology", "/methodology"],
];

if (process.argv[1].endsWith("measure.mjs")) {
  mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const rows = [];
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : w < 1100 ? 1024 : 900 }, reducedMotion: "reduce" });
    await ctx.route(/tiles\.openfreemap\.org|api\.postcodes\.io/, (r) => r.abort());
    const page = await ctx.newPage();
    for (const [key, path] of PAGES) {
      const errors = [];
      const onErr = (e) => errors.push(String(e.message ?? e).slice(0, 200));
      const onCon = (m) => m.type() === "error" && !/Failed to load resource|net::/.test(m.text()) && errors.push(m.text().slice(0, 200));
      page.on("pageerror", onErr);
      page.on("console", onCon);
      await page.goto(BASE + path, { waitUntil: "load", timeout: 90_000 });
      await page.waitForTimeout(400);
      const m = await page.evaluate(() => {
        const px = (v) => Math.round(parseFloat(v) * 10) / 10;
        const vis = (e) => e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== "none" && getComputedStyle(e).visibility !== "hidden";
        const first = (sel) => [...document.querySelectorAll(sel)].find(vis) ?? null;
        const type = (e) => {
          if (!e) return null;
          const s = getComputedStyle(e);
          return { size: px(s.fontSize), lh: px(s.lineHeight) || null, weight: s.fontWeight, text: (e.textContent || "").trim().slice(0, 40) };
        };
        const all = (sel) => [...document.querySelectorAll(sel)].filter(vis);
        const sizes = (sel) => {
          const v = all(sel).map((e) => px(getComputedStyle(e).fontSize));
          return v.length ? { min: Math.min(...v), max: Math.max(...v), n: v.length } : null;
        };
        const main = document.querySelector("main");
        const header = document.querySelector("[data-site-header]");
        const hero = document.querySelector("[data-hero]");
        const sections = [...(main?.querySelectorAll(":scope > section, :scope > div > section") ?? [])].filter(vis);
        const pads = sections.map((s) => px(getComputedStyle(s).paddingTop) + px(getComputedStyle(s).paddingBottom));
        // Profile: the report column and the facts grid
        const reportGrid = document.querySelector("[data-report-body]") ?? [...document.querySelectorAll("main .container-page")].find((d) => /grid-cols-\[12\.5rem/.test(d.className));
        const reportCol = reportGrid ? [...reportGrid.children].filter(vis).at(-1) : null;
        const dl = first("main dl");
        const dt = dl?.querySelector("dt");
        const cw = document.documentElement.clientWidth;
        const container = first("main .container-page");
        const cs = container ? getComputedStyle(container) : null;
        return {
          h1: type(first("main h1")),
          h2: type(first("main h2")),
          h2Sizes: sizes("main h2"),
          h3: type(first("main h3")),
          h3Sizes: sizes("main h3"),
          body: type(first("main p:not(.label):not(.eyebrow):not([class*='uppercase'])")),
          bodySizes: sizes("main p:not(.label):not(.eyebrow)"),
          nav: type(first("header nav button, header nav a")),
          meta: sizes("main .label, main .text-small, main small, main time"),
          table: sizes("main td"),
          headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
          heroH: hero ? Math.round(hero.getBoundingClientRect().height) : null,
          heroVh: hero ? Math.round((hero.getBoundingClientRect().height / innerHeight) * 100) : null,
          sectionPadMax: pads.length ? Math.max(...pads) : null,
          containerContent: container ? Math.round(container.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) : null,
          reportColW: reportCol ? Math.round(reportCol.getBoundingClientRect().width) : null,
          dtW: dt ? Math.round(dt.getBoundingClientRect().width) : null,
          ddW: dt?.nextElementSibling ? Math.round(dt.nextElementSibling.getBoundingClientRect().width) : null,
          docH: document.documentElement.scrollHeight,
          overflowPx: Math.max(0, document.documentElement.scrollWidth - cw),
          tinyText: all("main *").filter((e) => e.childElementCount === 0 && (e.textContent || "").trim().length > 2 && parseFloat(getComputedStyle(e).fontSize) < 12.5).length,
        };
      });
      page.off("pageerror", onErr);
      page.off("console", onCon);
      await page.screenshot({ path: `${SHOTS}/${key}-${w}.jpg`, type: "jpeg", quality: 55 });
      rows.push({ key, path, width: w, ...m, errors });
      console.log(w, key, `h1=${m.h1?.size} h2=${m.h2?.size} body=${m.body?.size} hero=${m.heroH} pad=${m.sectionPadMax} report=${m.reportColW} of=${m.overflowPx}`);
    }
    await ctx.close();
  }
  await browser.close();
  writeFileSync(`docs/qa/measure-${LABEL}.json`, JSON.stringify({ base: BASE, label: LABEL, generatedAt: new Date().toISOString(), rows }, null, 1));
}
