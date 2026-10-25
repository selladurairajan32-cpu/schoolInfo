import { chromium } from 'playwright';
(async () => { const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(process.argv[2], { waitUntil: 'networkidle', timeout: 60000 });
  console.log(JSON.stringify(await p.evaluate(() => { const o = []; for (const sh of document.styleSheets) { let rs; try { rs = sh.cssRules; } catch { continue; }
    for (const r of rs) if (r.selectorText && /^a\.edu-btn(:hover)?, button\.edu-btn/.test(r.selectorText)) o.push(r.selectorText.slice(0, 40) + ' => ' + r.style.cssText); } return o; }), null, 1)); await b.close(); })();
