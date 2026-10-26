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
 * The homepage's map of every listed school with a recorded location. Static on purpose:
 * it supports the search beside it rather than competing with it.
 */
export function HeroMap({ points, ni, total }: { points: Point[]; ni: number; total: number }) {
  const tone = (p: Point) => (p.nation === "northern_ireland" ? "var(--copper)" : p.selectivity === "partially_selective" ? "var(--violet)" : "var(--green)");
  // Only schools with a recorded location are drawn; the label and legend describe exactly what is plotted.
  const mapped = points.length;
  const has = { england: points.some((p) => p.nation === "england" && p.selectivity !== "partially_selective"), partial: points.some((p) => p.selectivity === "partially_selective"), ni: points.some((p) => p.nation === "northern_ireland") };
  const niMissing = ni - points.filter((p) => p.nation === "northern_ireland").length;
  return (
    <figure className="relative mx-auto w-full max-w-[24rem]">
      <p className="mb-3 text-center text-[0.875rem] text-ink-2">
        <b className="font-display text-[1.125rem] font-extrabold text-ink num">{mapped}</b> of {total} listed schools mapped
      </p>
      <div className="mx-auto aspect-square w-full overflow-hidden rounded-full bg-card ring-1 ring-rule">
        <svg viewBox={`${-W * 0.12} ${-H * 0.06} ${W * 1.24} ${H * 1.12}`} className="h-full w-full" role="img" aria-label={`Map of the ${mapped} listed grammar schools with a recorded location${niMissing > 0 ? `; Northern Ireland's ${niMissing} schools are not plotted because no locations are held for them yet` : ""}.`}>
          <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="var(--lilac-wash)" />
          <path d={LAND} fill="#ffffff" stroke="rgb(82 95 225 / 0.35)" strokeWidth="1.2" strokeLinejoin="round" />
          {points.map((p) => {
            const [x, y] = xy(p.lat, p.lng);
            return <circle key={p.slug} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3.4" fill={tone(p)} stroke="#fff" strokeWidth="0.9" />;
          })}
        </svg>
      </div>
      <figcaption className="mt-3 flex flex-col items-center gap-1 text-[0.8125rem]">
        <span className="flex flex-wrap justify-center gap-x-3 gap-y-1 font-semibold text-ink">
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
        {niMissing > 0 ? <span className="text-ink-2">Northern Ireland&apos;s {niMissing} schools are not plotted: locations not yet held.</span> : null}
      </figcaption>
    </figure>
  );
}
