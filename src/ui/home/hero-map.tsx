import coast from "@/content/geo/british-isles.json";

type Ring = number[][];
type Point = { slug: string; lat: number; lng: number; nation: string; selectivity: string };

/* Equirectangular, scaled for latitude, cropped to Great Britain and Ireland below Shetland. */
const KX = Math.cos((54.5 * Math.PI) / 180);
const BOX = { west: -10.8, east: 2.0, north: 59.0, south: 49.8 };
const S = 40;
const W = (BOX.east - BOX.west) * KX * S;
const H = (BOX.north - BOX.south) * S;
const xy = (lat: number, lng: number) => [(lng - BOX.west) * KX * S, (BOX.north - lat) * S] as const;
const path = (rings: Ring[]) =>
  rings
    .filter((r) => r.some(([, lat]) => lat! < BOX.north))
    .map((r) => "M" + r.map(([lng, lat]) => xy(lat!, lng!).map((n) => n.toFixed(1)).join(",")).join("L") + "Z")
    .join("");
const LAND = path([...(coast.uk as Ring[]), ...(coast.ie as Ring[])]);

/**
 * The homepage's circular hero picture — the reference's framed photo with an
 * orange arc and a floating badge, drawn here as a map of every listed school.
 */
export function HeroMap({ points, ni }: { points: Point[]; ni: number }) {
  const tone = (p: Point) => (p.nation === "northern_ireland" ? "var(--copper)" : p.selectivity === "partially_selective" ? "var(--violet)" : "var(--green)");
  // Only schools with a recorded location are drawn; the badge and legend describe exactly what is plotted.
  const mapped = points.length;
  const has = { england: points.some((p) => p.nation === "england" && p.selectivity !== "partially_selective"), partial: points.some((p) => p.selectivity === "partially_selective"), ni: points.some((p) => p.nation === "northern_ireland") };
  const niMissing = ni - points.filter((p) => p.nation === "northern_ireland").length;
  return (
    <figure className="relative mx-auto aspect-square w-full max-w-[30rem]">
      {/* Orange arc around the frame (reference) */}
      <svg aria-hidden viewBox="0 0 200 200" className="spin-slow absolute -inset-[5%] h-[110%] w-[110%] text-copper">
        <path d="M100 4a96 96 0 0 1 96 96" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M100 196a96 96 0 0 1-96-96" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
        <circle cx="196" cy="100" r="3" fill="currentColor" />
      </svg>
      <div className="absolute inset-0 overflow-hidden rounded-full bg-card shadow-[0_30px_60px_-30px_rgb(35_31_64/0.45)] ring-[10px] ring-white/70">
        <svg viewBox={`${-W * 0.12} ${-H * 0.06} ${W * 1.24} ${H * 1.12}`} className="h-full w-full" role="img" aria-label={`Map of the ${mapped} listed grammar schools with a recorded location${niMissing > 0 ? `; Northern Ireland's ${niMissing} schools are not plotted because no locations are held for them yet` : ""}.`}>
          <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="var(--lilac-wash)" />
          <path d={LAND} fill="#ffffff" stroke="rgb(82 95 225 / 0.35)" strokeWidth="1.2" strokeLinejoin="round" />
          {points.map((p, i) => {
            const [x, y] = xy(p.lat, p.lng);
            return <circle key={p.slug} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3.4" fill={tone(p)} stroke="#fff" strokeWidth="0.9" className="hero-dot" style={{ animationDelay: `${300 + (i % 40) * 25}ms` }} />;
          })}
        </svg>
      </div>
      {/* Floating badge — reference "50000+ Hours of Learning" */}
      <div className="float-y absolute top-[8%] -left-[2%] grid size-[7.5rem] place-items-center rounded-full bg-amber text-center text-navy shadow-[0_18px_30px_-14px_rgb(255_164_27/0.9)] ring-8 ring-white sm:size-[8.5rem]">
        <span>
          <span className="block font-display text-[1.9rem] leading-none font-extrabold sm:text-[2.2rem]">{mapped}</span>
          <span className="mt-1 block text-[0.8125rem] leading-tight font-bold">
            schools
            <br />
            mapped
          </span>
        </span>
      </div>
      <figcaption className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
        <span className="flex items-center gap-3 rounded-full bg-card px-4 py-2 text-[0.8125rem] font-bold whitespace-nowrap text-ink shadow-card">
          {has.england ? (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full bg-green" /> Fully selective
            </span>
          ) : null}
          {has.partial ? (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full bg-violet" /> Partially selective
            </span>
          ) : null}
          {has.ni ? (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full bg-copper" /> N. Ireland
            </span>
          ) : null}
        </span>
        {niMissing > 0 ? <span className="rounded-full bg-card/90 px-3 py-0.5 text-[0.75rem] font-semibold whitespace-nowrap text-ink-2">Northern Ireland&apos;s {niMissing} schools: locations not yet held</span> : null}
      </figcaption>
    </figure>
  );
}
