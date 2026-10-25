#!/usr/bin/env node
/**
 * Screenshot pages at several widths for visual QA.
 * Usage: node scripts/qa/shoot.mjs <outDir> <widths comma list> <path> [path…]
 * Env: BASE (default http://localhost:3000), FULL=0 for viewport-only shots.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [out, widthsArg, ...paths] = process.argv.slice(2);
const BASE = process.env.BASE ?? "http://localhost:3000";
const widths = widthsArg.split(",").map(Number);
mkdirSync(out, { recursive: true });
const name = (p, w) => `${(p.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home").slice(0, 80)}-${w}.png`;

const browser = await chromium.launch();
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 600 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(BASE + p, { waitUntil: "load", timeout: 90_000 });
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => {});
    // Scroll through so lazy content and reveals settle, then back to the top.
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 800) await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/${name(p, w)}`, fullPage: process.env.FULL !== "0" });
    console.log(`${w} ${p}`);
  }
  await ctx.close();
}
await browser.close();
