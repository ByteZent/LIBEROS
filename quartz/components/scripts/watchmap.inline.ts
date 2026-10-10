import { geoNaturalEarth1, geoPath, select, zoom, zoomIdentity } from "d3"
import type { Feature, FeatureCollection } from "geojson"
import {
  FullSlug,
  getFullSlug,
  joinSegments,
  pathToRoot,
  resolveRelative,
  simplifySlug,
} from "../../util/path"
import type { WatchData, WatchPlace } from "../../util/watch"

// The Watch map: current affairs on a world map, from /static/watch.json (plugins/emitters/watch.ts)
// and the borders in /static/world.json (scripts/worldmap.mjs). It shows two kinds of things:
// the stream (headlines `make watch` collected from the feeds, linking out to their source) and
// the developments (my notes about an event). Three uses:
//   > [!map|all]      everything: filters by time, domain and text, and the stream under the map
//   > [!map|events]   the [!event] and [!process] entries of this page that have a line
//                     "Place: …" (a note, an ISO code, or "lat, lon"; several with ";")
//   > [!map]          the developments that concern this note, and the note's own place.
//                     The Developments block of a note (Developments.tsx) draws the same map.
// What is in a country, without a point, is drawn at the country's label point, and the
// country is shaded by how many there are. Disputed areas are hatched and take no country's colour.

const W = 960
const H = 500
const ENTRY = '.callout[data-callout="event"], .callout[data-callout="process"]'
const WINDOWS: [string, number][] = [
  ["3 days", 3],
  ["7 days", 7],
  ["30 days", 30],
  ["1 year", 365],
  ["All", 0],
]
const LIMIT = 250
const DAY = 24 * 60 * 60 * 1000

type Mode = "all" | "note" | "events"

interface World {
  countries: FeatureCollection
  disputed: FeatureCollection
  points: Record<string, { name: string; at: [number, number] }>
}

interface Item {
  title: string
  date?: string
  domain: string[]
  summary?: string
  places: WatchPlace[]
  /** a development: its page */
  slug?: FullSlug
  /** a headline of the stream: where it leads, who published it, and its id for `make promote` */
  link?: string
  source?: string
  id?: string
  /** a timeline entry: its callout on this page */
  el?: HTMLElement
}

interface Mark {
  key: string
  at: [number, number]
  label: string
  items: Item[]
  /** a symbol: the kind of its items, and where it sits around its place, in pixels */
  kind?: string
  offset?: [number, number]
}

// The symbol of each kind: the paths of a 24 × 24 icon, drawn in white on a badge in the kind's
// colour (styles/watchmap.scss), as on the timeline.
const ICONS: Record<string, string> = {
  military:
    '<circle cx="12" cy="12" r="7"/><path d="M12 2v6"/><path d="M12 16v6"/><path d="M2 12h6"/><path d="M16 12h6"/>',
  security: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
  intelligence:
    '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  technology:
    '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 2v5"/><path d="M14 2v5"/><path d="M10 17v5"/><path d="M14 17v5"/><path d="M2 10h5"/><path d="M2 14h5"/><path d="M17 10h5"/><path d="M17 14h5"/>',
  economics: '<path d="M3 21h18"/><path d="M6 21v-7"/><path d="M12 21V5"/><path d="M18 21V10"/>',
  law: '<path d="M12 3v18"/><path d="M7 21h10"/><path d="M5 7h14"/><path d="m5 7-3 7a3 3 0 0 0 6 0z"/><path d="m19 7-3 7a3 3 0 0 0 6 0z"/>',
  ir: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3.5 3 3.5 15 0 18"/><path d="M12 3c-3.5 3-3.5 15 0 18"/>',
  policy:
    '<path d="M3 21h18"/><path d="M6 21V11"/><path d="M10 21V11"/><path d="M14 21V11"/><path d="M18 21V11"/><path d="M12 3l9 5H3z"/>',
  strategy: '<path d="M6 22V3"/><path d="M6 4h12l-3 4 3 4H6"/>',
  psychology: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>',
  sociology:
    '<circle cx="8" cy="9" r="3"/><circle cx="17" cy="9" r="3"/><path d="M2 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 15c3.5 0 6 1.7 6 5"/>',
  none: '<circle cx="12" cy="12" r="3"/>',
  // the kinds that did not fit around a place at this zoom
  more: '<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>',
}
// the categories of a timeline that are the same kind under another name
const KINDS: Record<string, string> = { war: "military", political: "policy", economy: "economics" }
/** The kind of an item: its first domain, where there is a symbol for it. */
function kindOf(item: Item) {
  const kind = KINDS[item.domain[0]] ?? item.domain[0]
  return kind in ICONS ? kind : "none"
}

let loaded: Promise<[World, WatchData]> | undefined
function load(): Promise<[World, WatchData]> {
  const root = pathToRoot(getFullSlug(window))
  const json = (name: string) => fetch(joinSegments(root, "static", name)).then((r) => r.json())
  loaded ??= Promise.all([json("world.json"), json("watch.json")])
  return loaded
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) {
  const node = document.createElement(tag)
  if (cls) node.className = cls
  if (text !== undefined) node.textContent = text
  return node
}

const keyOf = (place: WatchPlace) => place.iso ?? (place.geo ? place.geo.join(",") : "")

/** The places a "Place: …" line names. */
function placesOf(text: string, data: WatchData): WatchPlace[] {
  const places: WatchPlace[] = []
  for (const part of text.split(";").map((p) => p.trim())) {
    const point = part.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
    if (point) places.push({ geo: [Number(point[1]), Number(point[2])], name: part })
    else if (data.names[part.toLowerCase()]) places.push(data.names[part.toLowerCase()])
    else if (/^[A-Z]{3}$/.test(part)) places.push({ iso: part })
  }
  return places
}

/** The timeline entries of the page that say where they are. */
function entries(data: WatchData): Item[] {
  const items: Item[] = []
  for (const callout of document.querySelectorAll<HTMLElement>(`article :is(${ENTRY})`)) {
    const line = [...callout.querySelectorAll("p")].find((p) =>
      /^place:/i.test(p.textContent ?? ""),
    )
    if (!line) continue
    const places = placesOf((line.textContent ?? "").replace(/^place:/i, ""), data)
    const title = callout.querySelector(".callout-title-inner")?.textContent?.trim() ?? ""
    if (places.length > 0)
      items.push({
        title,
        domain: (callout.dataset.calloutMetadata ?? "").split(/\s+/).slice(0, 1).filter(Boolean),
        places,
        el: callout,
      })
  }
  return items
}

function setup(host: HTMLElement, mode: Mode, world: World, data: WatchData) {
  const slug = getFullSlug(window)
  const simple = simplifySlug(slug)
  const own: WatchPlace[] = []
  let items: Item[]
  if (mode === "events") items = entries(data)
  else if (mode === "all") items = [...data.developments, ...data.stream]
  else {
    const assessment = data.assessments.find((a) => a.slug === slug)
    if (data.notes[simple]) own.push(data.notes[simple])
    if (assessment) own.push(...assessment.places)
    const iso = data.notes[simple]?.iso
    // for an assessment also what fired its indicators
    const fired = new Set(assessment?.indicators.flatMap((i) => i.fired))
    const here = (item: { about: string[]; places: WatchPlace[] }) =>
      item.about.includes(simple) || (iso && item.places.some((p) => p.iso === iso))
    items = [
      ...data.developments.filter((d) => d.slug === slug || fired.has(d.slug) || here(d)),
      // the stream of a country, as in the Developments block
      ...(data.notes[simple] ? data.stream.filter(here) : []),
    ]
  }
  // newest first, a note before the headlines of its day
  items = [...items].sort(
    (a, b) => (b.date ?? "").localeCompare(a.date ?? "") || Number(!a.slug) - Number(!b.slug),
  )
  const mixed = items.some((i) => i.slug) && items.some((i) => i.link)

  // ── state ──────────────────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10)
  const dates = items.map((i) => i.date ?? today).sort()
  const first = dates[0] ?? today
  const span = Math.max(1, Math.round((Date.parse(today) - Date.parse(first)) / DAY))
  const state = {
    // the stream is read by the week; notes alone are too few for a window until there are many
    days: mode !== "all" ? 0 : items.some((i) => i.link) ? 7 : items.length > 30 ? 365 : 0,
    end: today,
    domains: new Set<string>(),
    notesOnly: false,
    summaries: false,
    text: "",
    selected: "",
  }
  const visible = () => {
    const from =
      state.days > 0
        ? new Date(Date.parse(state.end) - state.days * DAY).toISOString().slice(0, 10)
        : ""
    return items.filter(
      (i) =>
        (!i.date || (i.date > from && i.date <= state.end)) &&
        (state.domains.size === 0 || i.domain.some((d) => state.domains.has(d))) &&
        (!state.notesOnly || i.slug !== undefined) &&
        (!state.text ||
          `${i.title} ${i.source ?? ""} ${i.summary ?? ""}`.toLowerCase().includes(state.text)),
    )
  }

  // ── frame ──────────────────────────────────────────────────────────────────
  host.replaceChildren()
  host.classList.add("watch-map", `wm-${mode}`)
  const bar = el("div", "wm-bar")
  const caption = el("div", "wm-caption")
  const list = el("div", "wm-list")
  const projection = geoNaturalEarth1().fitExtent(
    [
      [4, 4],
      [W - 4, H - 4],
    ],
    world.countries,
  )
  const path = geoPath(projection)
  const svg = select(host)
    .append("svg")
    .attr("class", "wm-svg")
    .attr("viewBox", `0 0 ${W} ${H}`)
    .attr("role", "img")
    .attr("aria-label", "World map of developments")
  const hatch = `wm-hatch-${Math.random().toString(36).slice(2, 8)}`
  svg
    .append("defs")
    .append("pattern")
    .attr("id", hatch)
    .attr("width", 4)
    .attr("height", 4)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("patternTransform", "rotate(45)")
    .append("line")
    .attr("class", "wm-hatch")
    .attr("y2", 4)
  const layer = svg.append("g")
  const countries = layer
    .append("g")
    .selectAll("path")
    .data(world.countries.features)
    .join("path")
    .attr("class", "wm-country")
    .attr("d", path)
  countries.append("title")
  // under the hatching the area gets the background, so that it shows no country's shade
  for (const fill of ["var(--light)", `url(#${hatch})`])
    layer
      .append("g")
      .selectAll("path")
      .data(world.disputed.features)
      .join("path")
      .attr("class", "wm-disputed")
      .attr("fill", fill)
      .attr("d", path)
      .append("title")
      .text((f) => `${f.properties?.name}: disputed. ${f.properties?.note ?? ""}`)
  const marks = layer.append("g").attr("class", "wm-marks")

  const reassess = new Set(
    data.assessments.filter((a) => a.reassess).flatMap((a) => a.places.map((p) => p.iso)),
  )
  const mine = new Set(own.map((p) => p.iso))
  countries
    .classed("wm-reassess", (f) => mode !== "events" && reassess.has(String(f.id)))
    .classed("wm-own", (f) => mine.has(String(f.id)))

  const position = (place: WatchPlace): [number, number] | undefined =>
    place.geo ? [place.geo[1], place.geo[0]] : world.points[place.iso ?? ""]?.at
  const nameOf = (place: WatchPlace) =>
    place.iso ? (world.points[place.iso]?.name ?? place.iso) : (place.name ?? place.geo!.join(", "))

  let k = 1
  // the small map of a note is drawn at a third of the size: its symbols are larger to make up
  const unit = mode === "note" ? 2.2 : 1
  const size = (n: number) => unit * Math.min(14, 7.5 + 1.1 * Math.sqrt(n))
  // how many symbols a place gets: one from afar, all of them close up
  const slots = () => (k < 2 ? 1 : k < 4.5 ? 3 : 12)
  // a symbol keeps its size on the screen and its distance from the place, whatever the zoom
  const place = (mark: Mark) => {
    const [x, y] = projection(mark.at) ?? [-99, -99]
    const [dx, dy] = mark.offset ?? [0, 0]
    return `translate(${x + dx / k},${y + dy / k}) scale(${1 / k})`
  }

  const open = (item: Item) => {
    if (item.el) {
      item.el.scrollIntoView({ behavior: "smooth", block: "center" })
      item.el.classList.add("wm-flash")
      setTimeout(() => item.el?.classList.remove("wm-flash"), 1600)
    } else if (item.slug)
      window.spaNavigate(new URL(resolveRelative(slug, item.slug), location.href))
    else if (item.link) window.open(item.link, "_blank", "noopener")
  }

  // ── drawing ────────────────────────────────────────────────────────────────
  let drawnOnce = false
  function render() {
    drawnOnce = true
    const shown = visible()
    const byKey = new Map<string, Mark>()
    const count = new Map<string, number>()
    for (const item of shown)
      for (const place of item.places) {
        const at = position(place)
        if (place.iso) count.set(place.iso, (count.get(place.iso) ?? 0) + 1)
        if (!at) continue
        const key = keyOf(place)
        const mark = byKey.get(key) ?? { key, at, label: nameOf(place), items: [] }
        mark.items.push(item)
        byKey.set(key, mark)
      }
    const most = Math.max(1, ...count.values())
    countries
      .classed("wm-active", (f) => count.has(String(f.id)))
      .classed("wm-selected", (f) => state.selected.split("|")[0] === f.id)
      .style("fill-opacity", (f) => {
        const n = count.get(String(f.id))
        return n ? String(0.18 + 0.5 * (n / most)) : null
      })
      .on("click", (event, f) => {
        if (!byKey.has(String(f.id))) return
        event.stopPropagation()
        pick(byKey.get(String(f.id))!)
      })
      .select("title")
      .text((f) => {
        const n = count.get(String(f.id))
        return n ? `${f.properties?.name}: ${n}` : (f.properties?.name ?? "")
      })

    // the symbols of a place: one per kind, the commonest in the middle. How many fit depends
    // on the zoom; what does not fit goes into a last, plain one
    const drawn: Mark[] = []
    for (const place of byKey.values()) {
      const kinds = new Map<string, Item[]>()
      for (const item of place.items) {
        const kind = kindOf(item)
        kinds.set(kind, [...(kinds.get(kind) ?? []), item])
      }
      let groups = [...kinds].sort((a, b) => b[1].length - a[1].length)
      const room = slots()
      // from afar: one symbol for everything there, of the commonest kind that has a name
      if (room === 1)
        groups = [[(groups.find(([kind]) => kind !== "none") ?? groups[0])[0], place.items]]
      else if (groups.length > room)
        groups = [
          ...groups.slice(0, room - 1),
          ["more", groups.slice(room - 1).flatMap((g) => g[1])],
        ]
      groups.forEach(([kind, list], n) => {
        // the first in the middle, the others on a ring around it
        const angle = ((n - 1) / Math.max(1, groups.length - 1)) * 2 * Math.PI - Math.PI / 2
        const ring = n === 0 ? 0 : size(groups[0][1].length) + size(list.length) - 1
        drawn.push({
          key: groups.length === 1 ? place.key : `${place.key}|${kind}`,
          at: place.at,
          label:
            groups.length === 1
              ? place.label
              : `${place.label}, ${kind === "more" ? "other kinds" : kind === "none" ? "no kind" : kind}`,
          items: list,
          kind,
          offset: [Math.cos(angle) * ring, Math.sin(angle) * ring],
        })
      })
    }
    for (const mark of drawn) byKey.set(mark.key, mark)
    if (state.selected && !byKey.has(state.selected)) state.selected = ""

    marks
      .selectAll<SVGGElement, Mark>("g.wm-mark")
      .data(drawn, (mark) => mark.key)
      .join((enter) => {
        const g = enter.append("g")
        g.append("circle")
        g.append("g").attr("class", "wm-icon")
        g.append("title")
        return g
      })
      .attr("class", (mark) => `wm-mark wm-d-${mark.kind}`)
      .classed("wm-noted", (mark) => mark.items.some((i) => i.slug))
      .classed("wm-selected", (mark) => mark.key === state.selected)
      .attr("transform", place)
      .on("click", (event, mark) => {
        event.stopPropagation()
        pick(mark)
      })
      .each(function (mark) {
        const r = size(mark.items.length)
        const g = select(this)
        g.select("circle").attr("r", r)
        g.select(".wm-icon")
          .attr("transform", `translate(${-r * 0.62},${-r * 0.62}) scale(${(r * 1.24) / 24})`)
          .html(ICONS[mark.kind ?? "none"] ?? ICONS.none)
      })
      .select("title")
      .text(
        (mark) =>
          `${mark.label}\n${mark.items
            .slice(0, 8)
            .map((i) => `${i.date ? `${i.date}  ` : ""}${i.title}`)
            .join("\n")}${mark.items.length > 8 ? `\n… ${mark.items.length - 8} more` : ""}`,
      )

    if (mode === "note") return
    const selected = byKey.get(state.selected)
    const listed = selected ? selected.items : shown
    const [one, many] = mode === "events" ? ["entry", "entries"] : ["item", "items"]
    const noted = listed.filter((i) => i.slug).length
    caption.replaceChildren(
      `${listed.length} ${listed.length === 1 ? one : many}`,
      mixed && noted > 0 ? `, ${noted} with a note` : "",
      selected ? ` in ${selected.label}` : "",
    )
    if (selected) {
      const clear = el("button", "wm-clear", "show all")
      clear.addEventListener("click", () => pick(selected))
      caption.append(clear)
    }
    list.replaceChildren()
    // by day while the list covers weeks, by month when it covers more
    const dated = listed.filter((i) => i.date)
    const byDay =
      dated.length > 0 &&
      Date.parse(dated[0].date!) - Date.parse(dated[dated.length - 1].date!) < 45 * DAY
    let group = ""
    for (const item of listed.slice(0, LIMIT)) {
      const heading = item.date
        ? new Date(item.date).toLocaleDateString(
            "en-GB",
            byDay
              ? { weekday: "long", day: "numeric", month: "long" }
              : { month: "long", year: "numeric" },
          )
        : ""
      if (heading !== group) list.append(el("h4", undefined, (group = heading)))
      const row = el("div", `wm-item${item.slug ? " wm-noted" : ""}`)
      const title = el("a", "wm-title", item.title)
      if (item.slug) {
        title.classList.add("internal")
        title.href = resolveRelative(slug, item.slug)
      } else if (item.link) {
        title.classList.add("external")
        title.href = item.link
        title.target = "_blank"
        title.rel = "noopener noreferrer"
      } else title.addEventListener("click", () => open(item))
      const meta = [
        byDay ? "" : (item.date ?? ""),
        item.slug && mixed ? "note" : (item.source ?? ""),
        item.places
          .filter((p) => p.iso)
          .map((p) => p.iso)
          .join(" "),
        item.domain.join(" · "),
      ].filter(Boolean)
      row.append(title, el("span", "wm-meta", meta.join("  ·  ")))
      if (item.id) {
        // for the one headline in a hundred that I want to write about
        const keep = el("button", "wm-keep", "＋")
        const command = `make promote ID=${item.id}`
        keep.title = `Copy “${command}”: makes a development note of this in _inbox`
        keep.addEventListener("click", async () => {
          await navigator.clipboard.writeText(command)
          keep.textContent = "copied"
          setTimeout(() => (keep.textContent = "＋"), 1500)
        })
        row.append(keep)
      }
      // a note's own bottom line is shown; a feed's summary of a headline opens on a click
      if (item.summary && item.slug) row.append(el("span", "wm-summary", item.summary))
      else if (item.summary) {
        const more = el("details", "wm-more")
        more.open = state.summaries
        more.append(el("summary", undefined, "Summary"), el("p", undefined, item.summary))
        row.append(more)
      }
      list.append(row)
    }
    if (listed.length > LIMIT)
      list.append(
        el("p", "wm-empty", `and ${listed.length - LIMIT} more: narrow the time or the filters.`),
      )
    if (items.length === 0)
      list.append(
        el(
          "p",
          "wm-empty",
          mode === "events" ? "No entry has a “Place:” line yet." : "Nothing yet.",
        ),
      )
  }

  // a mark on the small map leads to the note; on the others it filters the list
  function pick(mark: Mark) {
    if (mode === "note") return open(mark.items[0])
    if (mode === "events" && mark.items.length === 1) open(mark.items[0])
    state.selected = state.selected === mark.key ? "" : mark.key
    render()
  }

  // ── zoom ───────────────────────────────────────────────────────────────────
  const zoomer = zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 14])
    .translateExtent([
      [0, 0],
      [W, H],
    ])
    .on("zoom", (event) => {
      const before = slots()
      k = event.transform.k
      layer.attr("transform", event.transform)
      if (slots() !== before && drawnOnce) render()
      else marks.selectAll<SVGGElement, Mark>("g.wm-mark").attr("transform", place)
    })
  svg.call(zoomer).on("click", () => {
    if (!state.selected) return
    state.selected = ""
    render()
  })
  // the small map and a campaign map open on what they are about
  if (mode !== "all") {
    const focus = [...own, ...items.flatMap((i) => i.places)]
    let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
    for (const place of focus) {
      const country = place.iso && world.countries.features.find((f: Feature) => f.id === place.iso)
      const at = position(place)
      const point = at && projection(at)
      const box = country
        ? path.bounds(country)
        : point && [
            [point[0] - 12, point[1] - 12],
            [point[0] + 12, point[1] + 12],
          ]
      if (!box) continue
      x0 = Math.min(x0, box[0][0])
      y0 = Math.min(y0, box[0][1])
      x1 = Math.max(x1, box[1][0])
      y1 = Math.max(y1, box[1][1])
    }
    if (x1 > x0) {
      const scale = Math.max(1, Math.min(8, 0.6 / Math.max((x1 - x0) / W, (y1 - y0) / H)))
      svg.call(
        zoomer.transform,
        zoomIdentity
          .translate(W / 2, H / 2)
          .scale(scale)
          .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
      )
    }
  }

  // ── controls ───────────────────────────────────────────────────────────────
  if (mode === "all" && items.length > 0) {
    const windows = el("div", "wm-group")
    for (const [label, days] of WINDOWS) {
      const button = el("button", "wm-chip", label)
      button.setAttribute("aria-pressed", String(state.days === days))
      button.addEventListener("click", () => {
        state.days = days
        for (const other of windows.children)
          other.setAttribute("aria-pressed", String(other === button))
        render()
      })
      windows.append(button)
    }

    const time = el("div", "wm-group wm-time")
    const play = el("button", "wm-chip", "▶")
    play.title = "Play through the period"
    const slider = el("input")
    slider.type = "range"
    slider.min = "0"
    slider.max = String(span)
    slider.value = String(span)
    slider.setAttribute("aria-label", "Up to this day")
    const until = el("span", "wm-until", today)
    const seek = (offset: number) => {
      slider.value = String(offset)
      state.end = new Date(Date.parse(first) + offset * DAY).toISOString().slice(0, 10)
      until.textContent = state.end
      render()
    }
    slider.addEventListener("input", () => seek(Number(slider.value)))
    let timer = 0
    const stop = () => {
      clearInterval(timer)
      timer = 0
      play.textContent = "▶"
    }
    play.addEventListener("click", () => {
      if (timer) return stop()
      play.textContent = "❚❚"
      if (Number(slider.value) >= span) seek(0)
      timer = window.setInterval(() => {
        const next = Math.min(span, Number(slider.value) + Math.max(1, Math.ceil(span / 80)))
        seek(next)
        if (next >= span) stop()
      }, 160)
    })
    window.addCleanup(stop)
    time.append(play, slider, until)

    const domains = el("div", "wm-group")
    for (const domain of [...new Set(items.flatMap((i) => i.domain))].sort()) {
      const button = el("button", `wm-chip wm-d-${domain}`)
      // the chip is the legend of the symbol as well
      const icon = el("span", "wm-chip-icon")
      icon.innerHTML = `<svg viewBox="0 0 24 24">${ICONS[domain] ?? ICONS.none}</svg>`
      button.append(icon, domain)
      button.setAttribute("aria-pressed", "false")
      button.addEventListener("click", () => {
        if (!state.domains.delete(domain)) state.domains.add(domain)
        button.setAttribute("aria-pressed", String(state.domains.has(domain)))
        render()
      })
      domains.append(button)
    }
    if (mixed) {
      const notes = el("button", "wm-chip", "notes only")
      notes.setAttribute("aria-pressed", "false")
      notes.addEventListener("click", () => {
        state.notesOnly = !state.notesOnly
        notes.setAttribute("aria-pressed", String(state.notesOnly))
        render()
      })
      domains.append(notes)
    }
    if (items.some((i) => i.summary && !i.slug)) {
      const summaries = el("button", "wm-chip", "summaries")
      summaries.title = "Open or close the summaries of all headlines"
      summaries.setAttribute("aria-pressed", "false")
      summaries.addEventListener("click", () => {
        state.summaries = !state.summaries
        summaries.setAttribute("aria-pressed", String(state.summaries))
        for (const more of list.querySelectorAll("details")) more.open = state.summaries
      })
      domains.append(summaries)
    }
    const search = el("input", "wm-search")
    search.type = "search"
    search.placeholder = "Filter by headline, summary or source"
    search.setAttribute("aria-label", "Filter by headline, summary or source")
    search.addEventListener("input", () => {
      state.text = search.value.trim().toLowerCase()
      render()
    })
    bar.append(windows, time, domains, search)
    host.prepend(bar)
  }
  if (mode !== "note") {
    const legend = el("div", "wm-legend")
    legend.append(el("span", "wm-key wm-key-disputed", "disputed area"))
    if (mode === "all" && reassess.size > 0)
      legend.append(el("span", "wm-key wm-key-reassess", "assessment to re-assess"))
    host.append(legend, caption, list)
  }
  render()
}

document.addEventListener("nav", async () => {
  const hosts: [HTMLElement, Mode][] = []
  for (const callout of document.querySelectorAll<HTMLElement>(
    'article .callout[data-callout="map"]',
  )) {
    const options = (callout.dataset.calloutMetadata ?? "").split(/\s+/)
    const host = el("div")
    callout.replaceWith(host)
    hosts.push([
      host,
      options.includes("all") ? "all" : options.includes("events") ? "events" : "note",
    ])
  }
  for (const host of document.querySelectorAll<HTMLElement>("[data-watch-map]:empty"))
    hosts.push([host, "note"])
  if (hosts.length === 0) return
  try {
    const [world, data] = await load()
    for (const [host, mode] of hosts) setup(host, mode, world, data)
  } catch {
    // offline without the data: the page reads without its map
    loaded = undefined
    for (const [host] of hosts) host.remove()
  }
})
