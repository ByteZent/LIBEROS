// Timeline (Zeitstrahl): what the stylesheet cannot do. The markdown stays a list of callouts:
//   > [!event|war key] **1914–1918** First World War `S1`
//   > [!process|economy] **1760–1840** Industrial Revolution `S3`
//   > [!period] **1815–1873** Age of free trade
// From those the script builds
//   - a chart to scale: one lane per category, spans as bars, eras as bands, connections as lines
//   - filters by category (several at once: the chart then shows only their lanes), by session
//     and for key events
//   - a full-screen view of the chart and its filters
//   - `line` after the bar (`[!event|political key line]`) draws a dashed line in the category
//     colour through all lanes at the entry's date, to show what else happened then
//   - fields: paragraphs that open with "Why it matters:", "Debate:", "Source:", "Perspectives:"
//   - connections: `- → causes [[#^id|label]]: reason` gets its counterpart at the target
//   - a self-test that hides the dates or the titles until an entry is clicked

const ENTRY = '.callout[data-callout="event"], .callout[data-callout="process"]'
const PERIOD = '.callout[data-callout="period"]'
const ORDER = [
  "political",
  "war",
  "empire",
  "economy",
  "social",
  // currents of thought, split out of "ideas"
  "conservatism",
  "liberalism",
  "radicalism",
  "political-economy",
  "religion",
  "science",
  "ideas",
  "law",
]
const FIELDS = ["why it matters", "debate", "source", "perspectives"]
// how a connection reads from the source, and from the target looking back
const TYPES: Record<string, string> = {
  causes: "caused by",
  enables: "enabled by",
  provokes: "a reaction to",
  continues: "continued by",
  "contrasts with": "contrasts with",
  "leads to": "follows",
}
const TYPE_AT_END = new RegExp(`(${Object.keys(TYPES).join("|")})\\s*$`, "i")
const ZOOMS = [1, 2, 4, 8]
const ROW = 22
const AXIS = 22
const BAND = 18
const PAD = 14

interface Entry {
  el: HTMLElement
  title: string
  start: number | null
  end: number | null
  process: boolean
  key: boolean
  // a dashed line through all lanes of the chart at the entry's date
  line: boolean
  lines: HTMLElement[]
  categories: string[]
  session: string | null
  marks: HTMLElement[]
  anchor: { x0: number; x1: number; y: number } | null
}

interface Connection {
  from: Entry
  to: Entry
  type: string
  path?: SVGPathElement
}

// "1837–1901", "1914–18", "1880s", "c. 1600", "before 1793" → [start, end]; no year → null
function parseDate(text: string): [number | null, number] | null {
  const t = text.toLowerCase().replace(/\s+/g, " ")
  const first = t.match(/\d{3,4}/)
  if (!first) return null
  const a = Number(first[0])
  if (new RegExp(`${first[0]}s`).test(t)) return [a, a + 9]
  const range = t.match(/(\d{3,4})\s*[–—-]\s*(\d{2,4})/)
  if (range) {
    const b = range[2].length < 3 ? Number(range[1].slice(0, -2) + range[2]) : Number(range[2])
    return [a, Math.max(a, b)]
  }
  if (/^(before|until|bis|vor)\b/.test(t)) return [null, a]
  return [a, a]
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

// wrap the words of the title, so the self-test can hide them apart from the date
function prepareTitle(entry: HTMLElement): { title: string; date: string; session: string | null } {
  const p =
    entry.querySelector<HTMLElement>(".callout-title-inner > p") ??
    entry.querySelector<HTMLElement>(".callout-title-inner")
  const date = p?.querySelector("strong")?.textContent?.trim() ?? ""
  const session = p?.querySelector("code")?.textContent?.trim() ?? null
  if (p && !p.querySelector(".tl-title-text")) {
    const words = el("span", "tl-title-text")
    const loose = [...p.childNodes].filter(
      (n) => !(n instanceof HTMLElement && (n.tagName === "STRONG" || n.tagName === "CODE")),
    )
    loose.forEach((n) => words.appendChild(n))
    const strong = p.querySelector("strong")
    if (strong) strong.after(" ", words, " ")
    else p.prepend(words, " ")
  }
  const title = (p?.querySelector(".tl-title-text")?.textContent ?? "").replace(/\s+/g, " ").trim()
  return { title, date, session }
}

const label = (e: Entry) => {
  const date = e.el.querySelector(".callout-title-inner strong")?.textContent?.trim() ?? ""
  return `${date} ${e.title}`.trim()
}

function body(entry: HTMLElement): HTMLElement {
  let content = entry.querySelector<HTMLElement>(":scope > .callout-content")
  if (!content) {
    content = el("div", "callout-content")
    entry.appendChild(content)
  }
  return content
}

function listen<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | Window,
  type: K,
  fn: (e: HTMLElementEventMap[K]) => void,
) {
  target.addEventListener(type, fn as EventListener)
  window.addCleanup(() => target.removeEventListener(type, fn as EventListener))
}

function jumpTo(entry: Entry) {
  entry.el.classList.remove("tl-hidden")
  entry.el.scrollIntoView({ behavior: "smooth", block: "center" })
  entry.el.classList.add("tl-highlight")
  setTimeout(() => entry.el.classList.remove("tl-highlight"), 1600)
}

// a chip that points at another entry: hover marks it, click jumps to it
function wire(chip: HTMLAnchorElement, target: Entry) {
  chip.classList.add("timeline-ref")
  chip.dataset.noPopover = "true"
  const on = () => target.el.classList.add("tl-highlight")
  const off = () => target.el.classList.remove("tl-highlight")
  listen(chip, "mouseenter", on)
  listen(chip, "mouseleave", off)
  listen(chip, "focus", on)
  listen(chip, "blur", off)
  listen(chip, "click", (e) => {
    e.preventDefault()
    e.stopPropagation()
    jumpTo(target)
  })
}

// ─── fields ─────────────────────────────────────────────────────────────────

function markFields(entry: HTMLElement) {
  for (const block of entry.querySelectorAll<HTMLElement>(
    ":scope > .callout-content p, :scope > .callout-content li",
  )) {
    const lead = block.firstElementChild
    if (lead?.tagName !== "STRONG" || block.firstChild !== lead) continue
    const name = (lead.textContent ?? "").replace(/:\s*$/, "").trim().toLowerCase()
    if (!FIELDS.includes(name)) continue
    block.classList.add("tl-field")
    block.dataset.field = name.replace(/\s+/g, "-")
  }
}

// ─── connections ────────────────────────────────────────────────────────────

function connect(entries: Entry[]): Connection[] {
  const byId = new Map(entries.map((e) => [e.el.id, e]))
  const connections: Connection[] = []

  for (const from of entries) {
    const links = from.el.querySelectorAll<HTMLAnchorElement>(
      ':scope > .callout-content a[href*="#"]',
    )
    for (const link of links) {
      if (link.closest(".timeline-backlinks")) continue
      if (link.pathname !== window.location.pathname) continue
      const id = decodeURIComponent(link.hash.slice(1)).replace(/^\^/, "")
      const to = byId.get(id)
      if (!to || to === from) continue

      // the word in front of the link names the kind of connection
      let type = "leads to"
      const before = link.previousSibling
      if (before instanceof HTMLElement && before.classList.contains("tl-type")) {
        type = (before.textContent ?? type).trim().toLowerCase()
      } else if (before instanceof Text) {
        const m = before.data.match(TYPE_AT_END)
        if (m) {
          type = m[1].toLowerCase()
          before.data = before.data.slice(0, m.index)
          link.before(el("span", "tl-type", type), " ")
        }
      }

      // what follows the link in the same list item is the reason
      const unit = link.closest<HTMLElement>("li, p")
      unit?.classList.add("tl-conn")
      let reason = ""
      if (unit && unit.querySelectorAll('a[href*="#"]').length === 1) {
        for (let n = link.nextSibling; n; n = n.nextSibling) reason += n.textContent ?? ""
        reason = reason.replace(/^[\s:–—-]+/, "").trim()
      }

      // `[[#^id]]` without a label: show the target's own title
      if (/^[#^>\s]/.test(link.textContent ?? "")) link.textContent = label(to)
      wire(link, to)

      const content = body(to.el)
      let back = content.querySelector<HTMLElement>(":scope > .timeline-backlinks")
      if (!back) {
        back = el("ul", "timeline-backlinks")
        content.appendChild(back)
      }
      const item = el("li", "tl-conn")
      const chip = el("a", undefined, label(from))
      chip.href = `#${from.el.id}`
      item.append("← ", el("span", "tl-type", TYPES[type] ?? type), " ", chip)
      if (reason) item.append(el("span", "tl-reason", `: ${reason}`))
      back.appendChild(item)
      wire(chip, from)

      connections.push({ from, to, type })
    }
  }
  return connections
}

// ─── chart to scale ─────────────────────────────────────────────────────────

interface Era {
  start: number | null
  end: number
  title: string
}

function drawChart(
  chart: HTMLElement,
  entries: Entry[],
  eras: Era[],
  connections: Connection[],
  zoom: number,
  only: Set<string>,
) {
  chart.replaceChildren()
  const dated = entries.filter((e) => e.end !== null)
  for (const e of entries) {
    e.marks = []
    e.lines = []
    e.anchor = null
  }
  if (dated.length < 2) return

  const lanes = el("div", "tl-lanes")
  const scroll = el("div", "tl-scroll")
  const canvas = el("div", "tl-canvas")
  scroll.appendChild(canvas)
  chart.append(lanes, scroll)

  const years = dated.flatMap((e) => [e.start ?? e.end!, e.end!])
  const min = Math.floor(Math.min(...years) / 10) * 10
  const max = Math.ceil((Math.max(...years) + 1) / 10) * 10
  const width = Math.max(scroll.clientWidth, 240) * zoom
  const perYear = (width - 2 * PAD) / (max - min)
  const x = (year: number) => PAD + (year - min) * perYear

  const used = new Set(dated.flatMap((e) => e.categories))
  // with categories selected, only their lanes are drawn; the scale stays that of all entries
  const names = [
    ...ORDER.filter((c) => used.has(c)),
    ...[...used].filter((c) => !ORDER.includes(c)),
  ].filter((c) => only.size === 0 || only.has(c))
  if (only.size === 0 && dated.some((e) => e.categories.length === 0)) names.push("other")

  // lanes: place every entry on the first row where it does not run into its neighbour
  let top = AXIS
  for (const name of names) {
    const rows: number[] = []
    const members = dated
      .filter((e) => (name === "other" ? e.categories.length === 0 : e.categories.includes(name)))
      .sort((a, b) => (a.start ?? a.end!) - (b.start ?? b.end!))

    const placed = members.map((e) => {
      const from = e.start ?? e.end!
      const span = e.process || e.end! > from
      const x0 = x(from)
      const w = span ? Math.max(x(e.end! + 1) - x0, 6) : 0
      const text = Math.min(e.title.length * 6.4 + 10, 180)
      const inside = span && w >= text
      const left = span ? x0 : x0 - 6
      const right = span ? x0 + (inside ? w : w + 4 + text) : x0 + 8 + text
      let row = rows.findIndex((end) => end + 8 <= left)
      if (row < 0) row = rows.length
      rows[row] = right
      return { e, x0, w, span, inside, row }
    })

    const height = Math.max(rows.length, 1) * ROW + 8
    const laneLabel = el("div", "tl-lane-label", name)
    laneLabel.dataset.category = name
    laneLabel.style.height = `${height}px`
    lanes.appendChild(laneLabel)

    const line = el("div", "tl-lane-line")
    line.style.top = `${top}px`
    canvas.appendChild(line)

    for (const { e, x0, w, span, inside, row } of placed) {
      const mark = el("a", "tl-mark")
      mark.href = `#${e.el.id}`
      mark.dataset.noPopover = "true"
      mark.dataset.category = name
      mark.title = label(e)
      mark.classList.add(span ? "tl-span" : "tl-point")
      if (e.process) mark.classList.add("tl-process")
      if (e.key) mark.classList.add("tl-key")
      if (span && !inside) mark.classList.add("tl-label-out")
      const y = top + 4 + row * ROW
      mark.style.left = `${x0}px`
      mark.style.top = `${y}px`
      if (span) mark.style.width = `${w}px`
      mark.appendChild(el("span", "tl-mark-label", e.title))
      canvas.appendChild(mark)
      e.marks.push(mark)
      e.anchor ??= { x0, x1: x0 + (span ? w : 5), y: y + ROW / 2 - 2 }

      const focus = (on: boolean) => {
        canvas.classList.toggle("tl-focus", on)
        for (const m of e.marks) m.classList.toggle("tl-on", on)
        for (const l of e.lines) l.classList.toggle("tl-on", on)
        for (const c of connections) {
          if (c.from !== e && c.to !== e) continue
          c.path?.classList.toggle("tl-on", on)
          for (const l of (c.from === e ? c.to : c.from).lines) l.classList.toggle("tl-on", on)
          for (const m of (c.from === e ? c.to : c.from).marks) m.classList.toggle("tl-on", on)
        }
      }
      listen(mark, "mouseenter", () => focus(true))
      listen(mark, "mouseleave", () => focus(false))
      listen(mark, "focus", () => focus(true))
      listen(mark, "blur", () => focus(false))
      listen(mark, "click", (ev) => {
        ev.preventDefault()
        jumpTo(e)
      })
    }
    top += height
  }

  const total = top + BAND
  canvas.style.width = `${width}px`
  canvas.style.height = `${total}px`
  lanes.style.paddingTop = `${AXIS}px`

  // date lines: dashed, in the colour of the entry's first category, through every lane, also
  // when the entry's own lane is not shown. A span gets one at its start and one at its end
  for (const e of dated) {
    if (!e.line) continue
    const from = e.start ?? e.end!
    const at = e.end! > from ? [from, e.end! + 1] : [from]
    at.forEach((year, i) => {
      const line = el("div", "tl-date-line")
      if (e.categories[0]) line.dataset.category = e.categories[0]
      line.style.left = `${x(year)}px`
      // from the axis down, so that the flag sits among the years and not on a lane
      line.style.top = "0"
      line.style.height = `${top}px`
      // a flag with the year; the whole name while the entry is hovered, or as a tooltip
      const flag = el("span")
      flag.dataset.short = String(i === 0 ? from : e.end)
      flag.dataset.full = flag.title = i === 0 ? label(e) : `${e.end} ${e.title}`
      line.appendChild(flag)
      canvas.prepend(line)
      e.lines.push(line)
    })
  }

  // eras as bands behind the lanes, named along the bottom
  eras.forEach((era, i) => {
    const from = Math.max(era.start ?? min, min)
    const to = Math.min(era.end, max)
    if (to <= from) return
    const band = el("div", "tl-band")
    if (i % 2) band.classList.add("tl-band-alt")
    band.style.left = `${x(from)}px`
    band.style.width = `${x(to) - x(from)}px`
    band.title = era.title
    band.appendChild(el("span", undefined, era.title))
    canvas.prepend(band)
  })

  // axis: the first step that leaves room for the year
  const step = [1, 2, 5, 10, 20, 25, 50, 100].find((s) => s * perYear >= 46) ?? 200
  for (let year = Math.ceil(min / step) * step; year <= max; year += step) {
    const tick = el("div", "tl-tick", String(year))
    tick.style.left = `${x(year)}px`
    canvas.appendChild(tick)
  }

  // connections: a curve from the end of the source to the start of the target
  const NS = "http://www.w3.org/2000/svg"
  const svg = document.createElementNS(NS, "svg")
  svg.setAttribute("class", "tl-links")
  svg.setAttribute("width", String(width))
  svg.setAttribute("height", String(total))
  svg.setAttribute("aria-hidden", "true")
  for (const c of connections) {
    if (!c.from.anchor || !c.to.anchor) continue
    // always drawn from the earlier entry to the later one
    const [a, b] = [c.from.anchor, c.to.anchor].sort((p, q) => p.x0 - q.x0)
    const bend = Math.max(Math.abs(b.x0 - a.x1) / 2, 18)
    const path = document.createElementNS(NS, "path")
    path.setAttribute(
      "d",
      `M${a.x1},${a.y} C${a.x1 + bend},${a.y} ${b.x0 - bend},${b.y} ${b.x0},${b.y}`,
    )
    svg.appendChild(path)
    c.path = path
  }
  canvas.appendChild(svg)
}

// ─── toolbar: filters and self-test ─────────────────────────────────────────

function toggleButton(text: string, onClick: () => void): HTMLButtonElement {
  const button = el("button", undefined, text)
  button.type = "button"
  button.setAttribute("aria-pressed", "false")
  listen(button, "click", onClick)
  return button
}

function setup() {
  const root = document.querySelector<HTMLElement>("article")
  if (!root) return
  // start clean: a second run on the same page must not double what the first one added
  root
    .querySelectorAll(".timeline-tools, .timeline-backlinks, .tl-duration")
    .forEach((n) => n.remove())
  root.classList.remove("tl-test-dates", "tl-test-titles")

  const nodes = [...root.querySelectorAll<HTMLElement>(ENTRY)]
  if (nodes.length === 0) return

  let unnamed = 0
  const entries: Entry[] = nodes.map((node) => {
    node.classList.remove("tl-hidden", "tl-revealed")
    if (!node.id) node.id = `tl-entry-${++unnamed}`
    const { title, date, session } = prepareTitle(node)
    const span = parseDate(date)
    const tokens = (node.dataset.calloutMetadata ?? "")
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(Boolean)
    markFields(node)

    if (span && span[0] !== null && span[1] - span[0] >= 2) {
      node
        .querySelector(".tl-title-text")
        ?.after(" ", el("span", "tl-duration", `${span[1] - span[0]} years`))
    }
    listen(node, "click", () => node.classList.add("tl-revealed"))

    return {
      el: node,
      title,
      start: span ? span[0] : null,
      end: span ? span[1] : null,
      process: node.dataset.callout === "process",
      key: tokens.includes("key"),
      line: tokens.includes("line"),
      lines: [],
      categories: tokens.filter((t) => t !== "key" && t !== "line"),
      session,
      marks: [],
      anchor: null,
    }
  })

  const eras: Era[] = [...root.querySelectorAll<HTMLElement>(PERIOD)].flatMap((node) => {
    const { title, date } = prepareTitle(node)
    const span = parseDate(date)
    return span ? [{ start: span[0], end: span[1], title: `${date} ${title}` }] : []
  })

  const connections = connect(entries)

  // toolbar
  const tools = el("div", "timeline-tools")
  const state = {
    categories: new Set<string>(),
    session: null as string | null,
    keyOnly: false,
    test: null as "dates" | "titles" | null,
    zoom: 0,
  }

  const chartWrap = el("div", "timeline-chart-wrap")
  const chartHead = el("div", "timeline-chart-head")
  const chart = el("div", "timeline-chart")
  // a new drawing keeps the years that were in the middle of the view
  const redraw = () => {
    const old = chart.querySelector<HTMLElement>(".tl-scroll")
    const at =
      old && old.scrollWidth > 0 ? (old.scrollLeft + old.clientWidth / 2) / old.scrollWidth : null
    drawChart(chart, entries, eras, connections, ZOOMS[state.zoom], state.categories)
    const scroll = chart.querySelector<HTMLElement>(".tl-scroll")
    if (scroll && at !== null) scroll.scrollLeft = at * scroll.scrollWidth - scroll.clientWidth / 2
  }
  const zoomOut = toggleButton("−", () => {
    state.zoom = Math.max(0, state.zoom - 1)
    redraw()
    apply()
  })
  const zoomIn = toggleButton("+", () => {
    state.zoom = Math.min(ZOOMS.length - 1, state.zoom + 1)
    redraw()
    apply()
  })
  zoomOut.ariaLabel = "Zoom out"
  zoomIn.ariaLabel = "Zoom in"
  zoomOut.removeAttribute("aria-pressed")
  zoomIn.removeAttribute("aria-pressed")

  // full screen: the chart with its filters as a fixed layer over the page, and on top of that
  // the browser's own full screen where it is allowed (not on an iPhone, not in every frame)
  const EXPAND =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'
  const SHRINK =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>'
  const isFull = () => tools.classList.contains("tl-fullscreen")
  const setFull = (on: boolean) => {
    if (on === isFull()) return
    tools.classList.toggle("tl-fullscreen", on)
    fullButton.innerHTML = on ? SHRINK : EXPAND
    fullButton.ariaLabel = fullButton.title = on ? "Leave full screen" : "Full screen"
    // the chart is drawn to the width it has: draw again once the layout has settled
    requestAnimationFrame(() => {
      redraw()
      apply()
    })
  }
  let native = false
  const leaveFull = () => {
    if (document.fullscreenElement === tools) void document.exitFullscreen()
    setFull(false)
  }
  const fullButton = toggleButton("", () => {
    if (isFull()) return leaveFull()
    setFull(true)
    if (typeof tools.requestFullscreen === "function") tools.requestFullscreen().catch(() => {})
  })
  fullButton.classList.add("tl-full-button")
  fullButton.removeAttribute("aria-pressed")
  fullButton.innerHTML = EXPAND
  fullButton.ariaLabel = fullButton.title = "Full screen"
  // Escape in the browser's full screen ends it without a key event: follow it
  const onFullChange = () => {
    const now = document.fullscreenElement === tools
    if (native && !now) setFull(false)
    native = now
    if (now) requestAnimationFrame(redrawAll)
  }
  const redrawAll = () => {
    redraw()
    apply()
  }
  const onEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isFull()) leaveFull()
  }
  document.addEventListener("fullscreenchange", onFullChange)
  document.addEventListener("keydown", onEscape)
  window.addCleanup(() => {
    document.removeEventListener("fullscreenchange", onFullChange)
    document.removeEventListener("keydown", onEscape)
  })
  // a mark leads to its entry in the list below: leave full screen first, then jump
  chart.addEventListener(
    "click",
    (ev) => {
      if (!isFull()) return
      const mark = (ev.target as HTMLElement).closest<HTMLAnchorElement>(".tl-mark")
      const entry = mark && entries.find((e) => e.marks.includes(mark))
      if (!entry) return
      ev.preventDefault()
      ev.stopPropagation()
      leaveFull()
      window.setTimeout(() => jumpTo(entry), 250)
    },
    true,
  )

  chartHead.append(el("span", "timeline-chart-title", "To scale"), zoomOut, zoomIn, fullButton)
  chartWrap.append(chartHead, chart)

  const buttons: { button: HTMLButtonElement; pressed: () => boolean }[] = []
  const row = (name: string, aria: string) => {
    const bar = el("div", "timeline-legend")
    bar.setAttribute("role", "group")
    bar.setAttribute("aria-label", aria)
    bar.appendChild(el("span", "timeline-legend-name", name))
    return bar
  }

  const used = new Set(entries.flatMap((e) => e.categories))
  const categories = [
    ...ORDER.filter((c) => used.has(c)),
    ...[...used].filter((c) => !ORDER.includes(c)),
  ]
  // several categories can be on at once: an entry shows if it has one of them
  const categoryRow = row("Category", "Filter the timeline by category, several at once")
  const allButton = toggleButton("all", () => {
    state.categories.clear()
    redraw()
    apply()
  })
  buttons.push({ button: allButton, pressed: () => state.categories.size === 0 })
  categoryRow.appendChild(allButton)
  for (const name of categories) {
    const button = toggleButton(name, () => {
      if (!state.categories.delete(name)) state.categories.add(name)
      redraw()
      apply()
    })
    button.dataset.category = name
    buttons.push({ button, pressed: () => state.categories.has(name) })
    categoryRow.appendChild(button)
  }

  const sessions = [...new Set(entries.map((e) => e.session).filter((s): s is string => !!s))].sort(
    (a, b) => a.localeCompare(b, undefined, { numeric: true }),
  )
  const sessionRow = row("Session", "Filter the timeline by session")
  for (const name of sessions) {
    const button = toggleButton(name, () => {
      state.session = state.session === name ? null : name
      apply()
    })
    buttons.push({ button, pressed: () => state.session === name })
    sessionRow.appendChild(button)
  }

  const modeRow = row("Show", "Key events and self-test")
  const keyButton = toggleButton("Key events only", () => {
    state.keyOnly = !state.keyOnly
    apply()
  })
  buttons.push({ button: keyButton, pressed: () => state.keyOnly })
  modeRow.appendChild(keyButton)
  for (const mode of ["dates", "titles"] as const) {
    const button = toggleButton(`Self-test: hide ${mode}`, () => {
      state.test = state.test === mode ? null : mode
      for (const e of entries) e.el.classList.remove("tl-revealed")
      apply()
    })
    buttons.push({ button, pressed: () => state.test === mode })
    modeRow.appendChild(button)
  }

  const keys = entries.filter((e) => e.key).length
  const processes = entries.filter((e) => e.process).length
  const noWhy = entries.filter(
    (e) => !e.el.querySelector('.tl-field[data-field="why-it-matters"]'),
  ).length
  const stats = el(
    "p",
    "timeline-stats",
    [
      `${entries.length - processes} events`,
      `${processes} processes`,
      `${keys} key`,
      `${connections.length} connections`,
      `${noWhy} without "Why it matters"`,
    ].join(" · "),
  )

  tools.append(chartWrap)
  if (categories.length > 1) tools.append(categoryRow)
  if (sessions.length > 1) tools.append(sessionRow)
  tools.append(modeRow, stats)

  const first = root.querySelector(`${ENTRY}, ${PERIOD}`)
  first?.parentElement?.insertBefore(tools, first)

  function apply() {
    for (const e of entries) {
      const hidden =
        (state.categories.size > 0 && !e.categories.some((c) => state.categories.has(c))) ||
        (state.session !== null && e.session !== state.session) ||
        (state.keyOnly && !e.key)
      e.el.classList.toggle("tl-hidden", hidden)
      for (const m of e.marks) m.classList.toggle("tl-dim", hidden)
      // a date line stays when only the category filter hides its entry: it is there to be
      // read against the other lanes
      const offStage =
        (state.session !== null && e.session !== state.session) || (state.keyOnly && !e.key)
      for (const l of e.lines) l.classList.toggle("tl-dim", offStage)
    }
    for (const { button, pressed } of buttons)
      button.setAttribute("aria-pressed", String(pressed()))
    root!.classList.toggle("tl-test-dates", state.test === "dates")
    root!.classList.toggle("tl-test-titles", state.test === "titles")
    zoomOut.disabled = state.zoom === 0
    zoomIn.disabled = state.zoom === ZOOMS.length - 1
  }

  // a long run-up before the first era would squeeze the core: open zoomed in on the first era
  const years = entries.flatMap((e) => (e.end === null ? [] : [e.start ?? e.end, e.end]))
  const core = eras.find((era) => era.start !== null)?.start ?? null
  const opensOnCore = core !== null && Math.max(...years) - Math.min(...years) > 250
  if (opensOnCore) state.zoom = 1
  redraw()
  apply()
  if (opensOnCore) {
    const scroll = chart.querySelector<HTMLElement>(".tl-scroll")
    const mark = entries.find((e) => (e.start ?? e.end ?? 0) >= core! && e.anchor)?.anchor
    if (scroll && mark) scroll.scrollLeft = Math.max(mark.x0 - 60, 0)
  }

  let timer: number | undefined
  let lastWidth = chart.clientWidth
  listen(window, "resize" as keyof HTMLElementEventMap, () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      if (chart.clientWidth === lastWidth) return
      lastWidth = chart.clientWidth
      redraw()
      apply()
    }, 150)
  })
}

document.addEventListener("nav", setup)
