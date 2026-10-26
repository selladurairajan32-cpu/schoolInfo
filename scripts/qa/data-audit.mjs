#!/usr/bin/env node
/**
 * School data audit.
 *
 *  A. Structural checks on every listed school (duplicates, missing and malformed fields).
 *  B. Every curated admissions event checked against its cited official page.
 *  C. Every English school compared field by field with its live GIAS record.
 *  D. Every English school's latest inspection compared with its Ofsted provider page.
 *  E. Reachability of every school website and every cited source document.
 *
 * Usage: node scripts/qa/data-audit.mjs   → docs/qa/data-audit.json
 */
import { readFileSync, writeFileSync } from "node:fs";
import postgres from "postgres";

const UA = "Mozilla/5.0 (GrammarAtlasDataAudit; +https://school-info-seven.vercel.app/methodology)";
const sql = postgres(process.env.DATABASE_URL ?? "postgres://gsi:gsi@localhost:5432/gsi", { max: 4 });
const out = { generatedAt: new Date().toISOString(), structural: {}, events: [], gias: [], ofsted: [], links: [] };
const text = (h) =>
  h
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;|&#x27;/g, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, " ");
async function get(url, timeout = 25_000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html,*/*" }, redirect: "follow", signal: ctl.signal });
    return { status: r.status, url: r.url, body: r.ok ? await r.text() : "" };
  } catch (e) {
    return { status: 0, error: String(e.cause?.code ?? e.name ?? e).slice(0, 60), body: "" };
  } finally {
    clearTimeout(t);
  }
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); }));
}

/* ── A. Structural ───────────────────────────────────────── */
const schools = await sql`
  SELECT s.id, s.slug, s.name, s.nation, s.selectivity, s.establishment_type, s.gender, s.age_low, s.age_high, s.has_sixth_form, s.boarding, s.status,
         la.name AS la, l.postcode, l.town, l.street, (l.location IS NOT NULL) AS has_location, c.website, c.telephone,
         (SELECT value FROM school_identifiers i WHERE i.school_id = s.id AND i.scheme = 'urn' AND i.is_current LIMIT 1) AS urn,
         (SELECT value FROM school_identifiers i WHERE i.school_id = s.id AND i.scheme = 'deni' AND i.is_current LIMIT 1) AS deni,
         (SELECT pupils FROM school_census sc WHERE sc.school_id = s.id ORDER BY census_date DESC LIMIT 1) AS pupils,
         (SELECT capacity FROM school_census sc WHERE sc.school_id = s.id ORDER BY census_date DESC LIMIT 1) AS capacity,
         (SELECT max(start_date) FROM inspections i WHERE i.school_id = s.id) AS last_inspection
  FROM schools s
  LEFT JOIN geographic_areas la ON la.id = s.local_authority_id
  LEFT JOIN school_locations l ON l.school_id = s.id
  LEFT JOIN school_contacts c ON c.school_id = s.id
  WHERE s.is_open AND s.selectivity <> 'non_selective'
  ORDER BY s.slug`;
const PC = /^(GIR 0AA|[A-PR-UWYZ][A-HK-Y]?\d[A-Z\d]? ?\d[ABD-HJLNP-UW-Z]{2})$/i;
const count = (f) => schools.filter(f).map((s) => s.slug);
const dup = (key) => Object.values(Object.groupBy(schools.filter((s) => key(s)), key)).filter((g) => g.length > 1).map((g) => g.map((s) => s.slug));
out.structural = {
  schools: schools.length,
  byNation: Object.fromEntries(Object.entries(Object.groupBy(schools, (s) => s.nation)).map(([k, v]) => [k, v.length])),
  duplicateSlug: dup((s) => s.slug),
  duplicateUrn: dup((s) => s.urn),
  duplicateNamePostcode: dup((s) => (s.postcode ? `${s.name.toLowerCase()}|${s.postcode}` : null)),
  missingPostcode: count((s) => !s.postcode),
  malformedPostcode: count((s) => s.postcode && !PC.test(s.postcode.trim())),
  missingLocation: count((s) => !s.has_location),
  missingLocalAuthority: count((s) => !s.la),
  missingWebsite: count((s) => !s.website),
  malformedWebsite: count((s) => s.website && !/^https?:\/\/[^\s/]+\.[^\s]+$/i.test(s.website.trim())),
  missingTelephone: count((s) => !s.telephone),
  malformedTelephone: count((s) => s.telephone && !/^[\d +()-]{10,16}$/.test(s.telephone.trim())),
  unknownGender: count((s) => s.gender === "unknown"),
  missingAgeRange: count((s) => s.age_low == null || s.age_high == null),
  implausibleAgeRange: count((s) => s.age_low != null && (s.age_low < 10 || s.age_low > 12 || s.age_high < 16 || s.age_high > 19)),
  sixthFormMismatch: count((s) => s.has_sixth_form === true && s.age_high != null && s.age_high < 17),
  missingUrnEngland: count((s) => s.nation === "england" && !s.urn),
  missingDeniNI: count((s) => s.nation === "northern_ireland" && !s.deni),
  pupilsOverCapacity20pc: schools.filter((s) => s.pupils && s.capacity && s.pupils > s.capacity * 1.2).map((s) => `${s.slug} (${s.pupils}/${s.capacity})`),
};
const yrs = await sql`
  SELECT 'results' AS k, max(academic_year)::text AS latest, count(DISTINCT academic_year)::int AS n FROM academic_results
  UNION ALL SELECT 'allocations', max(entry_year)::text, count(DISTINCT entry_year)::int FROM historical_allocations
  UNION ALL SELECT 'inspections', max(start_date)::text, count(*)::int FROM inspections
  UNION ALL SELECT 'census', max(census_date)::text, count(DISTINCT census_date)::int FROM school_census`;
out.structural.dataYears = yrs;
const pastUpcoming = await sql`SELECT title, starts_on::text FROM admission_events WHERE starts_on < current_date ORDER BY starts_on`;
out.structural.eventsInPast = pastUpcoming;
console.log("A. structural", JSON.stringify(out.structural, null, 0).slice(0, 1500));

/* ── B. Curated admissions events against their sources ───────────── */
const editorial = JSON.parse(readFileSync("data/curated/editorial.json", "utf8"));
const pages = new Map();
for (const e of editorial.events) {
  if (!pages.has(e.url)) pages.set(e.url, await get(e.url));
  const p = pages.get(e.url);
  const body = text(p.body);
  const quotes = [...(e.locator ?? "").matchAll(/"([^"]{6,})"/g)].map((m) => m[1].replace(/\s+/g, " "));
  const d = new Date(`${e.startsOn}T12:00:00Z`);
  const day = d.getUTCDate();
  const month = d.toLocaleString("en-GB", { month: "long", timeZone: "UTC" });
  const dateForms = [`${day} ${month}`, `${day}${["th", "st", "nd", "rd"][day % 10 > 3 || [11, 12, 13].includes(day) ? 0 : day % 10]} ${month}`, `${month} ${day}`];
  out.events.push({
    title: e.title,
    startsOn: e.startsOn,
    url: e.url,
    status: p.status,
    quoteFound: quotes.length ? quotes.map((q) => ({ q: q.slice(0, 80), found: body.toLowerCase().includes(q.toLowerCase().slice(0, 60)) })) : null,
    dateFound: dateForms.some((f) => body.toLowerCase().includes(f.toLowerCase())),
    past: e.startsOn < new Date().toISOString().slice(0, 10),
  });
}
console.log("B. events", out.events.map((e) => `${e.startsOn} ${e.status} date:${e.dateFound} ${e.title.slice(0, 40)}`).join("\n"));

/* ── C. GIAS field comparison (England) ─────────────────────────── */
const norm = (v) => (v ?? "").toString().toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "").replace(/[^a-z0-9]/g, "");
const english = schools.filter((s) => s.nation === "england" && s.urn);
// GIAS rate-limits bursts (HTTP 429): one request at a time with a pause, backing off on 429.
await pool(english, 1, async (s) => {
  let r;
  for (let attempt = 0; attempt < 5; attempt++) {
    r = await get(`https://get-information-schools.service.gov.uk/Establishments/Establishment/Details/${s.urn}`);
    if (r.status !== 429) break;
    await new Promise((res) => setTimeout(res, 15_000 * (attempt + 1)));
  }
  await new Promise((res) => setTimeout(res, 1_200));
  const f = {};
  for (const m of r.body.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/g)) f[text(m[1]).trim().split("  ")[0].trim()] = text(m[2]).trim();
  // The page heading carries a visually hidden "Establishment" caption before the name.
  const name = text((r.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) ?? [])[1] ?? "").replace(/^\s*Establishment\s+/, "").trim();
  const g = {
    name,
    postcode: (f["Address"] ?? "").match(/[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\s*$/i)?.[0]?.trim() ?? null,
    la: (f["Local authority"] ?? "").replace(/\(\d+\)/, "").trim(),
    age: f["Age range"] ?? Object.entries(f).find(([k]) => k.startsWith("Age range"))?.[1],
    gender: f["Gender of entry"],
    type: f["School type"],
    website: (f["Website"] ?? "").replace(/\(opens in new tab\)/, "").trim(),
    telephone: f["Telephone"],
    status: f["Establishment status"],
    admissions: f["Admissions policy"],
    sixth: f["Official sixth form"],
    boarders: f["Boarders"],
    pupils: f["Number of pupils"],
  };
  const genderMap = { boys: "boys", girls: "girls", mixed: "mixed" };
  const diffs = [];
  const cmp = (field, ours, theirs, eq = (a, b) => norm(a) === norm(b)) => {
    if (theirs === undefined || theirs === null || theirs === "" || /not recorded|not applicable/i.test(theirs)) return;
    if (!eq(ours, theirs)) diffs.push({ field, ours: ours ?? null, gias: theirs });
  };
  cmp("name", s.name, g.name);
  cmp("postcode", s.postcode, g.postcode);
  cmp("local authority", s.la, g.la);
  cmp("age range", s.age_low != null ? `${s.age_low} to ${s.age_high}` : null, g.age);
  cmp("gender", s.gender, g.gender?.toLowerCase(), (a, b) => genderMap[b] === a);
  cmp("school type", s.establishment_type, g.type);
  cmp("website", s.website, g.website);
  cmp("telephone", s.telephone, g.telephone);
  cmp("status", "open", g.status?.toLowerCase().startsWith("open") ? "open" : g.status);
  cmp("sixth form", s.has_sixth_form === true ? "has a sixth form" : s.has_sixth_form === false ? "does not have a sixth form" : null, g.sixth);
  out.gias.push({ slug: s.slug, urn: s.urn, http: r.status, fieldsCompared: Object.values(g).filter(Boolean).length, diffs, admissionsPolicy: g.admissions, pupilsGias: g.pupils, pupilsOurs: s.pupils });
});
console.log(`C. GIAS: ${out.gias.length} fetched, ${out.gias.filter((x) => x.http !== 200).length} failed, ${out.gias.filter((x) => x.diffs.length).length} with differences`);

/* ── D. Ofsted latest inspection (England) ─────────────────────── */
await pool(english, 4, async (s) => {
  const r = await get(`https://reports.ofsted.gov.uk/provider/23/${s.urn}`);
  const months = "January|February|March|April|May|June|July|August|September|October|November|December";
  const dates = [...text(r.body).matchAll(new RegExp(`\\b(\\d{1,2}) (${months}) (20\\d\\d)\\b`, "g"))].map((m) => new Date(`${m[1]} ${m[2]} ${m[3]} 12:00 UTC`).toISOString().slice(0, 10));
  const latestOnPage = dates.sort().at(-1) ?? null;
  const ours = s.last_inspection ? new Date(s.last_inspection).toISOString().slice(0, 10) : null;
  out.ofsted.push({ slug: s.slug, urn: s.urn, http: r.status, ours, oursFoundOnPage: ours ? dates.includes(ours) : null, latestDateOnPage: latestOnPage });
});
console.log(`D. Ofsted: ${out.ofsted.length} fetched, ${out.ofsted.filter((x) => x.http !== 200).length} failed, ${out.ofsted.filter((x) => x.oursFoundOnPage === false).length} inspection dates not found on the Ofsted page`);

/* ── E. Link reachability ─────────────────────────────────────── */
const sources = await sql`SELECT DISTINCT url FROM source_documents WHERE url ~ '^https?://'`;
const targets = [...schools.filter((s) => s.website).map((s) => ({ kind: "school website", slug: s.slug, url: /^https?:/i.test(s.website) ? s.website : `http://${s.website}` })), ...sources.map((s) => ({ kind: "source document", url: s.url })), ...editorial.sources.map((s) => ({ kind: "editorial source", url: s.url }))];
await pool(targets, 8, async (t) => {
  const r = await get(t.url, 20_000);
  out.links.push({ ...t, status: r.status, error: r.error ?? null, finalUrl: r.url && r.url !== t.url ? r.url : null });
});
const bad = out.links.filter((l) => l.status === 0 || l.status >= 400);
console.log(`E. links: ${out.links.length} checked, ${bad.length} failing`);
writeFileSync("docs/qa/data-audit.json", JSON.stringify(out, null, 1));
await sql.end();
