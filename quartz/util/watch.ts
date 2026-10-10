import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, SimpleSlug, simplifySlug } from "./path"
// @ts-ignore: plain JavaScript, shared with the note lint and the Watch scripts
import { asList, linkTarget, ownPlace, resolveLocation } from "../../scripts/places.mjs"

// The Watch data of the site, built once per build, read by the Developments block
// (components/Developments.tsx) and written to /static/watch.json for the map
// (components/scripts/watchmap.inline.ts):
//   - the stream: the items `make watch` collected from the feeds (scripts/watch.mjs), each with
//     the countries its headline names. Headline, link, date, source and the feed's own summary.
//   - the developments (`type: development`): the notes I wrote about an event, where they are,
//     which notes they concern and which indicators of which assessments they fire.
// The stream is part of the private preview (make serve-private). The public site gets it only
// with `public: true` in watch/sources.yml, and then the deployment has to run `make watch`
// before the build: the items are not in the repository.

const ITEMS = "content/_private/watch/items.json"
const SOURCES = "watch/sources.yml"

/** `iso`: a whole country (ISO 3166-1 alpha-3); `geo`: a point, [lat, lon]. */
export interface WatchPlace {
  iso?: string
  geo?: [number, number]
  name?: string
}

export interface WatchDevelopment {
  slug: FullSlug
  title: string
  /** YYYY-MM-DD, when it happened */
  date: string
  domain: string[]
  summary: string
  places: WatchPlace[]
  /** the notes it concerns: its actors, the notes of its location and the notes it links to */
  about: SimpleSlug[]
  indicators: string[]
}

/** An item of the stream: a headline from a feed, linking out to its source. */
export interface WatchItem {
  id: string
  title: string
  /** what the feed says about it, shortened */
  summary?: string
  link: string
  /** YYYY-MM-DD, when it was published */
  date: string
  source: string
  tier: string
  lang?: string
  domain: string[]
  places: WatchPlace[]
  /** the notes it names */
  about: SimpleSlug[]
}

export interface WatchIndicator {
  key: string
  text: string
  /** the developments that name it, newest first */
  fired: FullSlug[]
  /** true when one of them is newer than the assessment's `as_of` */
  open: boolean
}

export interface WatchAssessment {
  slug: FullSlug
  title: string
  asOf?: string
  places: WatchPlace[]
  indicators: WatchIndicator[]
  /** an indicator fired after `as_of`: the judgement is older than the evidence */
  reassess: boolean
}

export interface WatchData {
  stream: WatchItem[]
  developments: WatchDevelopment[]
  assessments: WatchAssessment[]
  /** every note with a place, by its simple slug */
  notes: Record<string, WatchPlace>
  /** the same notes by title, filename and alias in lower case, for `Place:` on a timeline entry */
  names: Record<string, WatchPlace>
}

const day = (value: unknown): string | undefined => {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "")
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : undefined
}

const cache = new WeakMap<QuartzPluginData[], WatchData>()

function stream(slugOf: (name: unknown) => SimpleSlug[]): WatchItem[] {
  try {
    const config = yaml.load(fs.readFileSync(SOURCES, "utf8")) as Record<string, unknown>
    if (process.env.LIBEROS_PRIVATE !== "1" && config?.public !== true) return []
    const keep = Number(config?.keep) > 0 ? Number(config.keep) : 14
    const since = new Date(Date.now() - keep * 24 * 60 * 60 * 1000).toISOString()
    const stored = JSON.parse(fs.readFileSync(ITEMS, "utf8"))
    return (stored.items as Record<string, any>[])
      .filter((item) => item.status === "new" && item.date >= since)
      .map((item) => ({
        id: item.id,
        title: item.title,
        ...(item.summary ? { summary: item.summary } : {}),
        link: item.link,
        date: item.date.slice(0, 10),
        source: item.source,
        tier: item.tier,
        ...(item.lang ? { lang: item.lang } : {}),
        domain: item.domain ? [item.domain] : [],
        places: asList(item.places).map((iso: string) => ({ iso })),
        about: asList(item.notes).flatMap(slugOf),
      }))
  } catch {
    // no feeds read yet
    return []
  }
}

export function watchData(allFiles: QuartzPluginData[]): WatchData {
  const cached = cache.get(allFiles)
  if (cached) return cached

  // every note by filename, title and alias, as scripts/places.mjs looks them up
  const index = new Map<string, { title: string; data: Record<string, unknown>; slug: FullSlug }>()
  for (const file of allFiles) {
    if (!file.slug) continue
    const data: Record<string, unknown> = file.frontmatter ?? {}
    const name = path.basename(file.relativePath ?? file.slug, ".md")
    const note = { title: file.frontmatter?.title ?? name, data, slug: file.slug }
    for (const key of [name, data.title, ...asList(data.aliases)])
      if (typeof key === "string" && key.trim() && !index.has(key.trim().toLowerCase()))
        index.set(key.trim().toLowerCase(), note)
  }
  const slugOf = (name: unknown) => {
    const note = index.get(linkTarget(name))
    return note ? [simplifySlug(note.slug)] : []
  }

  const notes: Record<string, WatchPlace> = {}
  const names: Record<string, WatchPlace> = {}
  for (const [name, note] of index) {
    const place: WatchPlace | undefined = ownPlace(note)
    if (!place) continue
    notes[simplifySlug(note.slug)] = place
    names[name] = place
  }

  const developments: WatchDevelopment[] = []
  for (const file of allFiles) {
    const data: Record<string, unknown> = file.frontmatter ?? {}
    const date = day(data.event_date)
    if (data.type !== "development" || !file.slug || !date) continue
    const location = Array.isArray(data.location) ? data.location : asList(data.location)
    developments.push({
      slug: file.slug,
      title: file.frontmatter?.title ?? file.slug,
      date,
      domain: asList(data.domain).map(String),
      // the description opens with the title of the [!bluf] callout
      summary: (file.description ?? "").replace(/^\s*bluf\s+/i, ""),
      places: resolveLocation(data, index).places,
      about: [
        ...new Set([
          ...asList(data.actors).flatMap(slugOf),
          ...location.filter((entry: unknown) => typeof entry === "string").flatMap(slugOf),
          ...(file.links ?? []),
        ]),
      ],
      indicators: asList(data.indicator).map(String),
    })
  }
  developments.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))

  const assessments: WatchAssessment[] = []
  for (const file of allFiles) {
    const data: Record<string, unknown> = file.frontmatter ?? {}
    const declared = data.indicators
    if (data.type !== "assessment" || !file.slug) continue
    if (!declared || typeof declared !== "object" || Array.isArray(declared)) continue
    const asOf = day(data.as_of)
    const indicators = Object.entries(declared).map(([key, text]) => {
      const fired = developments.filter((d) => d.indicators.includes(key))
      return {
        key,
        text: String(text),
        fired: fired.map((d) => d.slug),
        open: fired.some((d) => !asOf || d.date > asOf),
      }
    })
    assessments.push({
      slug: file.slug,
      title: file.frontmatter?.title ?? file.slug,
      asOf,
      places: resolveLocation(data, index).places,
      indicators,
      reassess: indicators.some((i) => i.open),
    })
  }

  const result = { stream: stream(slugOf), developments, assessments, notes, names }
  cache.set(allFiles, result)
  return result
}

/** The developments that concern a note: they name or link it, are the note, or are in its country. */
export function developmentsFor(data: WatchData, slug: FullSlug): WatchDevelopment[] {
  const simple = simplifySlug(slug)
  const iso = data.notes[simple]?.iso
  return data.developments.filter(
    (d) =>
      d.slug !== slug && (d.about.includes(simple) || (iso && d.places.some((p) => p.iso === iso))),
  )
}

/** The items of the stream that name a note, or are in its country. */
export function streamFor(data: WatchData, slug: FullSlug): WatchItem[] {
  const simple = simplifySlug(slug)
  const iso = data.notes[simple]?.iso
  return data.stream.filter(
    (item) => item.about.includes(simple) || (iso && item.places.some((p) => p.iso === iso)),
  )
}
