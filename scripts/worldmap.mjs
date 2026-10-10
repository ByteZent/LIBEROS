// World map data for the Watch map (quartz/components/scripts/watchmap.inline.ts): builds
// quartz/static/world.json and watch/gazetteer.json from Natural Earth (public domain,
// naturalearthdata.com).
// Usage: node scripts/worldmap.mjs      (only needed again to update the borders)
//
// world.json:
//   countries   the 1:110m countries, keyed by ISO 3166-1 alpha-3 (`id`), coordinates to 0.01°
//   disputed    the 1:50m breakaway and disputed areas, drawn hatched over the countries
//   points      a label point [lon, lat] and the name for every country of the 1:50m set, so that
//               a state too small for the 1:110m map (Singapore, Malta) still gets a marker
//
// gazetteer.json: the names by which `make watch` finds the country of a headline (scripts/watch.mjs):
// every country in English and German, with its formal name and its capital. My own additions
// (adjectives, other cities) are in watch/places.yml.
//
// Natural Earth draws borders as they are controlled (Crimea with Russia). The map does not take
// that as a statement: every disputed area is hatched and takes no country's colour.
import fs from "fs"

const BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson"
const OUT = "quartz/static/world.json"
const GAZETTEER = "watch/gazetteer.json"
// Natural Earth's own codes where ISO has none; XKX is the code in common use for Kosovo
const CODES = { KOS: "XKX" }

const load = async (name) => {
  const response = await fetch(`${BASE}/${name}.geojson`, { signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`)
  return (await response.json()).features
}

const id = (p) => {
  const code = /^[A-Z]{3}$/.test(p.ISO_A3_EH ?? "") ? p.ISO_A3_EH : p.ADM0_A3
  return CODES[code] ?? code
}

const round = (n) => Math.round(n * 100) / 100
/** Coordinates to 0.01°, without the points that fall together; rings that collapse are dropped. */
function simplify(geometry) {
  const ring = (points) => {
    const out = []
    for (const [x, y] of points) {
      const p = [round(x), round(y)]
      const last = out[out.length - 1]
      if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p)
    }
    return out.length >= 4 ? out : null
  }
  const polygon = (rings) => {
    const outer = ring(rings[0])
    return outer ? [outer, ...rings.slice(1).map(ring).filter(Boolean)] : null
  }
  const polygons = (geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates)
    .map(polygon)
    .filter(Boolean)
  return polygons.length === 1
    ? { type: "Polygon", coordinates: polygons[0] }
    : { type: "MultiPolygon", coordinates: polygons }
}

const [small, medium, disputed, cities] = await Promise.all(
  [
    "ne_110m_admin_0_countries",
    "ne_50m_admin_0_countries",
    "ne_50m_admin_0_breakaway_disputed_areas",
    "ne_110m_populated_places",
  ].map(load),
)

const world = {
  source: "Natural Earth 1:110m countries, 1:50m breakaway and disputed areas (public domain)",
  countries: {
    type: "FeatureCollection",
    features: small
      // Antarctica only stretches the map
      .filter((f) => f.properties.ADM0_A3 !== "ATA")
      .map((f) => ({
        type: "Feature",
        id: id(f.properties),
        properties: { name: f.properties.NAME_LONG },
        geometry: simplify(f.geometry),
      })),
  },
  disputed: {
    type: "FeatureCollection",
    features: disputed.map((f) => ({
      type: "Feature",
      properties: {
        name: f.properties.NAME_LONG ?? f.properties.NAME,
        note: f.properties.NOTE_BRK ?? "",
      },
      geometry: simplify(f.geometry),
    })),
  },
  points: Object.fromEntries(
    medium
      .filter((f) => Number.isFinite(f.properties.LABEL_X) && Number.isFinite(f.properties.LABEL_Y))
      .map((f) => [
        id(f.properties),
        {
          name: f.properties.NAME_EN ?? f.properties.NAME_LONG,
          at: [round(f.properties.LABEL_X), round(f.properties.LABEL_Y)],
        },
      ])
      .sort(([a], [b]) => a.localeCompare(b)),
  ),
}

fs.writeFileSync(OUT, JSON.stringify(world))

// name → code; a name with a full stop is an abbreviation ("Dem. Rep. Korea"), one with a comma
// is not how a headline writes it ("Washington, D.C.")
const names = {}
const add = (name, code) => {
  if (typeof name !== "string" || name.length < 4 || /[.,]/.test(name)) return
  names[name] ??= code
}
const codes = new Map(medium.map((f) => [f.properties.ADM0_A3, id(f.properties)]))
for (const f of medium)
  for (const field of ["NAME", "NAME_EN", "NAME_LONG", "FORMAL_EN", "NAME_DE"])
    add(f.properties[field], id(f.properties))
for (const f of cities)
  if (f.properties.FEATURECLA === "Admin-0 capital" && codes.has(f.properties.ADM0_A3))
    for (const field of ["NAME", "NAMEASCII", "NAME_EN", "NAME_DE"])
      add(f.properties[field], codes.get(f.properties.ADM0_A3))
fs.writeFileSync(
  GAZETTEER,
  JSON.stringify(Object.fromEntries(Object.entries(names).sort()), null, 2) + "\n",
)
console.log(
  `${world.countries.features.length} countries, ${world.disputed.features.length} disputed areas, ${Object.keys(world.points).length} points → ${OUT} (${Math.round(fs.statSync(OUT).size / 1024)} kB)`,
)
console.log(`${Object.keys(names).length} names → ${GAZETTEER}`)
