// Places: where a note is on the map. Shared by the note lint and the Watch scripts.
//   iso: CHE              on a state's note: ISO 3166-1 alpha-3
//   geo: [47.37, 8.54]    on the note of anything with one place: latitude, longitude
// A development (`type: development`) names its place in `location:`: a note, an ISO code, a
// [lat, lon] pair, a list of these, or `global`. Without `location:` it takes the places of the
// notes in `actors:`.
import fs from "fs"
import path from "path"
import matter from "gray-matter"

export const asList = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v])

const ISO = /^[A-Z]{3}$/
const isPoint = (v) =>
  Array.isArray(v) &&
  v.length === 2 &&
  v.every((n) => typeof n === "number" && Number.isFinite(n)) &&
  Math.abs(v[0]) <= 90 &&
  Math.abs(v[1]) <= 180

/** The name a `[[Note|label]]`, `[[Note#Heading]]` or plain title points to, as the index keys it. */
export const linkTarget = (text) =>
  String(text)
    .replace(/^\[\[|\]\]$/g, "")
    .split(/[|#]/)[0]
    .trim()
    .toLowerCase()

/** Filename, title and aliases (lower case) → { file, title, data } for the given note files. */
export function noteIndex(files) {
  const index = new Map()
  for (const file of files) {
    let data
    try {
      data = matter(fs.readFileSync(file, "utf8")).data
    } catch {
      continue
    }
    const name = path.basename(file, ".md")
    const note = { file, title: typeof data.title === "string" ? data.title : name, data }
    for (const key of [name, data.title, ...asList(data.aliases)])
      if (typeof key === "string" && key.trim() && !index.has(key.trim().toLowerCase()))
        index.set(key.trim().toLowerCase(), note)
  }
  return index
}

/** What is wrong with a note's own `iso` and `geo`. */
export function placeProblems(data) {
  const problems = []
  if (data.iso != null && !(typeof data.iso === "string" && ISO.test(data.iso)))
    problems.push(`\`iso: ${data.iso}\` is not an ISO 3166-1 alpha-3 code (three capitals: CHE)`)
  if (data.geo != null && !isPoint(data.geo))
    problems.push("`geo` is not `[lat, lon]` (latitude -90 to 90, longitude -180 to 180)")
  return problems
}

/** A note's own place: { iso, name } or { geo, name }; `iso` wins. Undefined without a valid one. */
export function ownPlace(note) {
  const { iso, geo } = note.data
  if (typeof iso === "string" && ISO.test(iso)) return { iso, name: note.title }
  if (isPoint(geo)) return { geo, name: note.title }
}

/**
 * Where a development is: { places, global, problems }. `places` is empty for a `global` one and
 * for one that cannot be placed; `problems` says why.
 */
export function resolveLocation(data, index) {
  const places = []
  const problems = []
  let global = false
  const add = (place) => {
    const key = place.iso ?? place.geo.join(",")
    if (!places.some((p) => (p.iso ?? p.geo.join(",")) === key)) places.push(place)
  }

  const location = data.location
  const entries = isPoint(location) ? [location] : asList(location)
  for (const entry of entries) {
    if (isPoint(entry)) add({ geo: entry })
    else if (typeof entry !== "string")
      problems.push(`\`location\`: cannot read ${JSON.stringify(entry)}`)
    else if (entry.trim().toLowerCase() === "global") global = true
    else {
      const note = index.get(linkTarget(entry))
      const place = note && ownPlace(note)
      if (place) add(place)
      else if (note) problems.push(`\`location\`: "${note.title}" has neither \`iso\` nor \`geo\``)
      else if (ISO.test(entry.trim())) add({ iso: entry.trim() })
      else problems.push(`\`location\`: no note "${entry}", and it is not an ISO code`)
    }
  }
  if (entries.length > 0) return { places, global, problems }

  for (const actor of asList(data.actors)) {
    const note = index.get(linkTarget(actor))
    const place = note && ownPlace(note)
    if (place) add(place)
  }
  if (places.length === 0)
    problems.push("no place: set `location`, or give one of its `actors` an `iso` or `geo`")
  return { places, global, problems }
}
