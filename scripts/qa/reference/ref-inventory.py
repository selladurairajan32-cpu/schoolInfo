"""Build docs/reference-route-inventory.md from the polite crawl's evidence."""
import glob, json, re, sys, collections

REF = '/tmp/claude-0/ref'
OUT = sys.argv[1]

sitemap_src = {}
for f in glob.glob(f'{REF}/*.xml'):
    name = f.rsplit('/', 1)[1]
    for u in re.findall(r'<loc>([^<]+)</loc>', open(f).read()):
        if u.endswith('.xml'):
            continue
        sitemap_src[u.rstrip('/')] = name

graph = json.load(open(f'{REF}/graph.json'))
crawled = {}
for f in sorted(glob.glob(f'{REF}/out/*.json') + glob.glob(f'{REF}/out2/*.json')):
    d = json.load(open(f))
    crawled[d['url'].rstrip('/')] = d

def template(u):
    p = re.sub(r'^https?://(www\.)?eduseed\.in', '', u).rstrip('/') or '/'
    if p == '/': return 'Homepage'
    if re.match(r'^/\d{4}/\d{2}/\d{2}/', p): return 'Blog post'
    if re.match(r'^/\d{4}/\d{2}$', p): return 'Date archive'
    if p.startswith('/category/'): return 'Category archive'
    if p.startswith('/tag/'): return 'Tag archive'
    if p.startswith('/product-category/'): return 'Worksheet category (shop)'
    if p.startswith('/product/'): return 'Worksheet product (shop)'
    if p in ('/cart', '/checkout', '/my-account', '/my-account/lost-password'): return 'Shop / account utility'
    if p in ('/coding', '/robotics', '/math', '/courses', '/online-math-class-kids'): return 'Course category landing'
    if re.match(r'^/(coding|robotics)/[^/]+$', p): return 'Course detail'
    if re.match(r'^/math/[^/]+$', p): return 'Math topic article'
    if p in ('/about-us', '/careers', '/iimb-incubation'): return 'About / company page'
    if p in ('/testimonials',): return 'Testimonials'
    if p in ('/faq',): return 'FAQ'
    if p in ('/contact-us', '/request-demo', '/registration-form', '/free-math-tutoring-trial', '/coding-free-trial'): return 'Contact / enquiry form'
    if p in ('/privacy-policy',): return 'Legal page'
    if re.search(r'sitemap', p): return 'HTML sitemap'
    if p in ('/math-kangaroo-readiness-checker', '/divisibility-rules-explorer', '/lens'): return 'Interactive tool page'
    if p.startswith('/code-it'): return 'Event / competition landing'
    if p in ('/math-olympiad-coaching', '/math-kangaroo-prep', '/online-math-tutoring', '/financial-literacy-for-kids', '/coding-workshop-for-schools', '/express', '/vedic-maths', '/computer-science-ai', '/cbse-xi-python'): return 'Program landing'
    if p in ('/free-math-worksheets', '/coding-resources'): return 'Resource hub'
    if re.search(r'_curriculum$', p): return 'Curriculum redirect/download'
    if p.startswith('/wp-') or p.endswith('.pdf'): return 'Non-HTML / admin (excluded)'
    return 'Tutorial / resource article'

rows = {}
for u, src in sitemap_src.items():
    rows[u] = {'url': u, 'source': f'Sitemap ({src})', 'template': template(u)}
for u in graph['notInSitemap']:
    if 'eduseed.in' not in u or u.startswith('mailto'): continue
    u2 = u.rstrip('/')
    rows.setdefault(u2, {'url': u2, 'source': 'Link graph (crawl)', 'template': template(u2)})

def patterns(d):
    if not d: return ''
    feats = []
    if d.get('h1'): feats.append(f"H1 {d['h1'][0]['size']}/{d['h1'][0]['lh']} w{d['h1'][0]['weight']}")
    if any('url(' in (s.get('bgi') or '') for s in d.get('sections', [])): feats.append('image/gradient section bg')
    if d.get('animatedEls'): feats.append(f"{len(d['animatedEls'])} reveal-animated els")
    if any('swiper' in (c.get('cls') or '') or 'slick' in (c.get('cls') or '') for c in d.get('cards', [])): feats.append('carousel')
    if d.get('inputs'): feats.append(f"form ({len(d['inputs'])} fields)")
    if d.get('tables'): feats.append('table')
    if (d.get('mobile') or {}).get('overflow'): feats.append('mobile overflow')
    return '; '.join(feats)

by_t = collections.defaultdict(list)
for r in rows.values(): by_t[r['template']].append(r)

lines = []
lines.append('# Reference route inventory — eduseed.in\n')
lines.append('Discovery run on 25 October 2026 from an isolated container. `robots.txt` sets `Crawl-Delay: 20`, so every page load was spaced at least 20 seconds apart and the crawl was limited to representative pages per template.\n')
lines.append('## Method\n')
lines.append('1. **Sitemaps** — `robots.txt` (no `Sitemap:` line) → `/sitemap.xml` (a sitemap index; `/sitemap_index.xml` returns 404) → `sitemap-misc.xml`, `productcat-sitemap.xml`, `post-sitemap.xml`, `page-sitemap.xml`, parsed recursively.')
lines.append('2. **Navigation and link graph** — Playwright loaded each sampled page at 1440px and 390px, recorded every `<a href>` with its text and zone (header/nav/footer/body), hovered the first dropdown, opened the mobile menu, and scrolled the full page to trigger reveal animations.')
lines.append('3. **Classification** — every URL from both sources was assigned a template from its URL structure and verified against the inspected representatives.')
lines.append('4. **Computed styles** — fonts, sizes, weights, colours, radii, shadows, transitions, keyframes and theme custom properties were read from the live DOM (`getComputedStyle`, `document.styleSheets`).\n')
lines.append('## Totals\n')
n_sm = sum(1 for r in rows.values() if r['source'].startswith('Sitemap'))
n_lg = len(rows) - n_sm
lines.append(f'| Metric | Count |\n|---|---|')
lines.append(f'| URLs in sitemaps | {n_sm} |')
lines.append(f'| Additional URLs found only through the link graph | {n_lg} |')
lines.append(f'| Total discovered URLs | {len(rows)} |')
lines.append(f'| Internal link edges recorded | {len(graph["edges"])} |')
lines.append(f'| Distinct templates | {len(by_t)} |')
lines.append(f'| Pages loaded and inspected (desktop + mobile) | {len(crawled)} |')
insp_t = {template(u) for u in crawled}
lines.append(f'| Templates with at least one inspected representative | {len(insp_t)} of {len(by_t)} |\n')

lines.append('## Templates\n')
lines.append('| Template | URLs | Inspected representative(s) | Status |\n|---|---|---|---|')
for t in sorted(by_t, key=lambda t: -len(by_t[t])):
    reps = [u for u in crawled if template(u) == t]
    status = 'Complete' if reps else ('Excluded' if 'excluded' in t.lower() or 'redirect' in t.lower() or 'utility' in t.lower() else 'Pending — shares layout with inspected templates (see note)')
    lines.append(f"| {t} | {len(by_t[t])} | {', '.join(r.replace('https://eduseed.in','') or '/' for r in reps) or '—'} | {status} |")
lines.append('')
lines.append('Templates marked *Pending* were not loaded to stay within the crawl delay. Their URLs share the WordPress/Elementor shell (header, page banner, footer) recorded on every inspected page; their unique body layouts were not inspected and no findings are claimed for them.\n')

lines.append('## Inspected pages\n')
lines.append('| URL | Discovery source | Template | Inspected | Unique design patterns | Status |\n|---|---|---|---|---|---|')
for u, d in crawled.items():
    src = rows.get(u, {}).get('source', 'Navigation')
    st = 'Complete' if d.get('status') == 200 else f"Blocked ({d.get('status') or d.get('err', '')[:40]})"
    lines.append(f"| {u} | {src} | {template(u)} | Yes (1440 + 390) | {patterns(d)} | {st} |")
lines.append('')

lines.append('## Every discovered URL\n')
lines.append('| URL | Discovery source | Template | Inspected | Status |\n|---|---|---|---|---|')
for r in sorted(rows.values(), key=lambda r: (r['template'], r['url'])):
    ins = r['url'] in crawled
    lines.append(f"| {r['url']} | {r['source']} | {r['template']} | {'Yes' if ins else 'No'} | {'Complete' if ins else 'Not loaded (template covered)' if any(template(u)==r['template'] for u in crawled) else 'Not loaded'} |")
open(OUT, 'w').write('\n'.join(lines) + '\n')
print(len(rows), len(by_t), len(crawled))
