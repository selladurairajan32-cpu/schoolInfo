// Polite reference crawler: honours robots Crawl-Delay (20s) between page loads.
import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT = process.argv[2];
const urls = fs.readFileSync(process.argv[3], 'utf8').split('\n').filter(Boolean);
const DELAY = 20000;
fs.mkdirSync(OUT + '/shots', { recursive: true });

function slug(u) { return u.replace(/^https?:\/\/[^/]+/, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home'; }

async function extract(page) {
  return page.evaluate(() => {
    const cs = (el) => { const s = getComputedStyle(el); return {
      tag: el.tagName.toLowerCase(), cls: (el.className && el.className.baseVal === undefined ? el.className : '').toString().slice(0, 120),
      text: (el.innerText || '').trim().slice(0, 60), font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight,
      ls: s.letterSpacing, color: s.color, bg: s.backgroundColor, bgi: s.backgroundImage.slice(0, 160), radius: s.borderRadius,
      border: s.border, shadow: s.boxShadow, padding: s.padding, margin: s.margin, transition: s.transition, transform: s.transform,
      w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height), tt: s.textTransform, maxw: s.maxWidth } };
    const pick = (sel, n = 6) => [...document.querySelectorAll(sel)].filter(e => e.offsetParent !== null).slice(0, n).map(cs);
    const links = [...document.querySelectorAll('a[href]')].map(a => ({ href: a.href, text: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 80),
      zone: a.closest('header') ? 'header' : a.closest('footer') ? 'footer' : a.closest('nav') ? 'nav' : a.closest('aside') ? 'aside' : 'body' }));
    const kf = new Set(), trans = new Set(), anims = new Set(), vars = {}, media = new Set();
    for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; }
      const walk = (rs) => { for (const r of rs) {
        if (r.type === 7) kf.add(r.name + ': ' + r.cssText.slice(0, 400));
        else if (r.type === 4) { media.add(r.conditionText); walk(r.cssRules); }
        else if (r.style) { if (r.style.transition) trans.add(r.selectorText.slice(0, 80) + ' => ' + r.style.transition);
          if (r.style.animation || r.style.animationName) anims.add(r.selectorText.slice(0, 80) + ' => ' + (r.style.animation || r.style.animationName));
          if (r.selectorText === ':root' || r.selectorText === 'body') for (const p of r.style) if (p.startsWith('--')) vars[p] = r.style.getPropertyValue(p).trim(); } } };
      walk(rules); }
    const sections = [...document.querySelectorAll('section, .elementor-section, .e-con, .wp-block-group')].filter(e => e.offsetParent !== null && e.getBoundingClientRect().height > 80).slice(0, 40)
      .map(e => ({ ...cs(e), heading: (e.querySelector('h1,h2,h3')?.innerText || '').slice(0, 80) }));
    return {
      title: document.title, canonical: document.querySelector('link[rel=canonical]')?.href || '',
      bodyClass: document.body.className.slice(0, 300), docH: document.documentElement.scrollHeight,
      body: cs(document.body), h1: pick('h1', 3), h2: pick('h2', 8), h3: pick('h3', 8), h4: pick('h4', 4), p: pick('main p, .entry-content p, p', 6),
      header: pick('header', 2), nav: pick('header nav a, header .menu a', 12), submenu: [...document.querySelectorAll('.sub-menu, .dropdown-menu, .elementor-nav-menu--dropdown')].slice(0, 3).map(cs),
      buttons: pick('a.elementor-button, .elementor-button, button, .wp-block-button__link, .btn, input[type=submit]', 10),
      cards: pick('.elementor-widget-image-box, .elementor-icon-box-wrapper, .card, article, .elementor-post, .product, .elementor-testimonial, .e-con-inner > .e-con', 10),
      inputs: pick('input:not([type=hidden]), textarea, select', 6), tables: pick('table, th, td', 6), footer: pick('footer', 2),
      imgs: [...document.images].slice(0, 30).map(i => ({ src: i.currentSrc.slice(0, 140), w: i.naturalWidth, alt: i.alt.slice(0, 60) })),
      fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight + ' ' + f.style),
      animatedEls: [...document.querySelectorAll('[data-settings*="animation"], .elementor-invisible, .animated, [data-aos], .wow')].slice(0, 30).map(e => ({ cls: e.className.toString().slice(0, 140), settings: (e.getAttribute('data-settings') || e.getAttribute('data-aos') || '').slice(0, 200) })),
      keyframes: [...kf].slice(0, 80), transitions: [...trans].slice(0, 150), animations: [...anims].slice(0, 80), vars, media: [...media],
      sections, links,
    };
  });
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (design-audit; polite crawler honouring Crawl-Delay)' });
  const page = await ctx.newPage();
  for (const [i, url] of urls.entries()) {
    const rec = { url, i };
    try {
      const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => (rec.err = String(e), null));
      rec.status = res ? res.status() : null; rec.finalUrl = page.url();
      await page.waitForTimeout(1500);
      Object.assign(rec, await extract(page));
      // scroll to trigger reveal animations, then full-page screenshot
      for (let y = 0; y < Math.min(rec.docH, 20000); y += 700) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600);
      await page.screenshot({ path: `${OUT}/shots/${slug(url)}-1440.png`, fullPage: true }).catch(() => {});
      // hover the first nav item with a submenu to capture dropdown state
      if (i === 0) {
        const has = await page.$('header .menu-item-has-children > a, header li.menu-item-has-children > a');
        if (has) { await has.hover(); await page.waitForTimeout(800); await page.screenshot({ path: `${OUT}/shots/home-dropdown.png` });
          rec.dropdownOpen = await page.evaluate(() => { const s = document.querySelector('header .sub-menu'); if (!s) return null; const c = getComputedStyle(s);
            return { opacity: c.opacity, transform: c.transform, transition: c.transition, bg: c.backgroundColor, shadow: c.boxShadow, radius: c.borderRadius, padding: c.padding, w: s.getBoundingClientRect().width }; }); }
        // capture hover state on first button
        const btn = await page.$('.elementor-button'); if (btn) { const before = await btn.evaluate(e => { const s = getComputedStyle(e); return [s.backgroundColor, s.color, s.transform, s.boxShadow]; });
          await btn.hover(); await page.waitForTimeout(600); rec.buttonHover = { before, after: await btn.evaluate(e => { const s = getComputedStyle(e); return [s.backgroundColor, s.color, s.transform, s.boxShadow]; }) }; }
      }
      await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1000);
      rec.mobile = await page.evaluate(() => ({ h1: (() => { const h = document.querySelector('h1'); if (!h) return null; const s = getComputedStyle(h); return [s.fontSize, s.lineHeight]; })(),
        overflow: document.documentElement.scrollWidth > innerWidth, header: (() => { const h = document.querySelector('header'); return h ? h.getBoundingClientRect().height : null; })() }));
      await page.screenshot({ path: `${OUT}/shots/${slug(url)}-390.png`, fullPage: false }).catch(() => {});
      if (i === 0) { const t = await page.$('.elementor-menu-toggle, .menu-toggle, button[aria-label*=enu]'); if (t) { await t.click().catch(() => {}); await page.waitForTimeout(900); await page.screenshot({ path: `${OUT}/shots/home-mobile-menu.png` }); } }
      await page.setViewportSize({ width: 1440, height: 900 });
    } catch (e) { rec.err = String(e); }
    fs.writeFileSync(`${OUT}/${String(i).padStart(2, '0')}-${slug(url)}.json`, JSON.stringify(rec, null, 1));
    console.log(i, url, rec.status, rec.err || '');
    if (i < urls.length - 1) await new Promise(r => setTimeout(r, DELAY));
  }
  await browser.close();
})();
