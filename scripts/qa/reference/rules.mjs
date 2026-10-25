// Dump full CSS rule text for selectors of interest from one reference page.
import { chromium } from 'playwright';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(process.argv[2], { waitUntil: 'networkidle', timeout: 60000 });
  const out = await p.evaluate(() => {
    const want = /(^|[\s,.])(slide-up|elementor-invisible|animated|edu-btn|eduvibe-header-sticky|header-get-sticky|edu-card|edu-course|eduvibe-blog-post-1|thumbnail|section-title|pre-title|edu-accordion|elementor-tab-title|accordion|faq|breadcrumb|page-title|eduvibe-page-banner|edu-breadcrumb|course-meta|edu-meta|title-head)/i;
    const res = [];
    for (const sh of document.styleSheets) { let rs; try { rs = sh.cssRules; } catch { continue; }
      const walk = (rules, media) => { for (const r of rules) {
        if (r.type === 4) walk(r.cssRules, r.conditionText);
        else if (r.type === 7 && /slide|fade|zoom|bounce|sticky/i.test(r.name)) res.push('@keyframes ' + r.cssText.slice(0, 600));
        else if (r.selectorText && want.test(r.selectorText)) res.push((media ? '@media ' + media + ' ' : '') + r.cssText.slice(0, 500));
      } };
      walk(rs, null); }
    return res;
  });
  console.log(JSON.stringify(out, null, 1)); await b.close();
})();
