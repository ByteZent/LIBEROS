// Mind map: a nested list inside a `> [!mindmap] Topic` callout, drawn as a map.
//   > [!mindmap] Modernity in Britain
//   > - Industry `process`
//   >     - [[Britain 1780–1939 (Timeline)]]
//   >     - Why Britain first? `question`
//   >     - [Fedlex](https://www.fedlex.admin.ch) `source`
// The callout title is the centre, every list item a node. A node can hold links to notes, to
// pages of the site and to the web. Words in backticks are tags.
// The script lays the branches out to both sides of the centre, lets branches fold, pans and
// zooms, and filters by text, by tag and by kind of node (note, link, idea). The list stays in
// the page: "List" shows it, and it is what a reader without JavaScript gets.

const MM_ROW = 34 // vertical distance between two neighbouring leaves
const MM_GAP = 34 // horizontal distance between a node and its children
const MM_PAD = 24
const MM_COLORS = ["#3d7a94", "#b5533c", "#4f8a5b", "#b08a2e", "#7d5ba6", "#2f8f8a", "#6b7785"]

type Kind = "note" | "link" | "idea"
const KIND_LABELS: Record<Kind, string> = { note: "Notes", link: "Web links", idea: "Ideas" }

interface MapNode {
  el: HTMLElement
  text: string
  tags: string[]
  kind: Kind
  parent: MapNode | null
  children: MapNode[]
  depth: number
  collapsed: boolean
  side: 1 | -1
  color: string
  w: number
  x: number
  y: number
  shown: boolean
  left: number // position on the canvas
  top: number
  toggle?: HTMLButtonElement
}

function mmEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

// one list item → one node: its own line without the nested list, tags taken out
function readItem(li: HTMLElement, parent: MapNode, canvas: HTMLElement): MapNode {
  const own = li.cloneNode(true) as HTMLElement
  own.querySelectorAll("ul, ol").forEach((list) => list.remove())
  const tags = [...own.querySelectorAll("code")].map((code) => {
    const tag = (code.textContent ?? "").trim()
    code.remove()
    return tag
  })
  const line = own.querySelector(":scope > p") ?? own
  const el = mmEl("div", "mm-node")
  const label = mmEl("span", "mm-label")
  label.innerHTML = line.innerHTML.trim()
  for (const link of label.querySelectorAll("a")) link.dataset.noPopover = "true"
  el.appendChild(label)
  for (const tag of tags.filter(Boolean)) el.appendChild(mmEl("span", "mm-tag", tag))
  canvas.appendChild(el)

  const kind: Kind = label.querySelector("a.internal")
    ? "note"
    : label.querySelector("a")
      ? "link"
      : "idea"
  el.dataset.kind = kind
  const node: MapNode = {
    el,
    text: `${label.textContent ?? ""} ${tags.join(" ")}`.toLowerCase(),
    tags: tags.filter(Boolean),
    kind,
    parent,
    children: [],
    depth: parent.depth + 1,
    collapsed: false,
    side: 1,
    color: parent.color,
    w: 0,
    x: 0,
    y: 0,
    shown: true,
    left: 0,
    top: 0,
  }
  const sub = li.querySelector(":scope > ul, :scope > ol")
  if (sub) {
    for (const child of sub.querySelectorAll<HTMLElement>(":scope > li"))
      node.children.push(readItem(child, node, canvas))
  }
  return node
}

function setupMindmap(callout: HTMLElement) {
  const content = callout.querySelector<HTMLElement>(":scope > .callout-content")
  const list = content?.querySelector<HTMLElement>("ul, ol")
  if (!content || !list) return
  callout.querySelectorAll(".mm-tools, .mm-viewport").forEach((old) => old.remove())

  const title = callout.querySelector(".callout-title-inner")?.textContent?.trim() || "Mind map"
  const viewport = mmEl("div", "mm-viewport")
  const canvas = mmEl("div", "mm-canvas")
  const NS = "http://www.w3.org/2000/svg"
  const edges = document.createElementNS(NS, "svg")
  edges.setAttribute("class", "mm-edges")
  edges.setAttribute("aria-hidden", "true")
  canvas.appendChild(edges)
  viewport.appendChild(canvas)

  // ── the tree
  const rootEl = mmEl("div", "mm-node mm-root")
  rootEl.appendChild(mmEl("span", "mm-label", title))
  canvas.appendChild(rootEl)
  const root: MapNode = {
    el: rootEl,
    text: title.toLowerCase(),
    tags: [],
    kind: "idea",
    parent: null,
    children: [],
    depth: 0,
    collapsed: false,
    side: 1,
    color: "var(--secondary)",
    w: 0,
    x: 0,
    y: 0,
    shown: true,
    left: 0,
    top: 0,
  }
  for (const li of list.querySelectorAll<HTMLElement>(":scope > li"))
    root.children.push(readItem(li, root, canvas))
  const all: MapNode[] = []
  const walk = (node: MapNode, fn: (n: MapNode) => void) => {
    fn(node)
    for (const child of node.children) walk(child, fn)
  }
  walk(root, (n) => all.push(n))
  if (all.length < 2) return
  // every main branch has its colour, handed down to its nodes
  root.children.forEach((branch, i) =>
    walk(branch, (n) => {
      n.color = MM_COLORS[i % MM_COLORS.length]
    }),
  )
  for (const node of all) {
    node.el.style.setProperty("--mm-color", node.color)
    node.el.classList.add(`mm-depth-${Math.min(node.depth, 3)}`)
    if (node.children.length > 0) {
      const toggle = mmEl("button", "mm-toggle")
      toggle.type = "button"
      node.el.appendChild(toggle)
      node.toggle = toggle
      toggle.addEventListener("click", (e) => {
        e.stopPropagation()
        node.collapsed = !node.collapsed
        layout(node)
      })
    }
  }
  // a large map opens folded to its main branches and their children
  if (all.length > 45) for (const node of all) if (node.depth >= 2) node.collapsed = true

  // ── toolbar: one labelled row per kind of filter, the zoom buttons sit on the map itself
  const tools = mmEl("div", "mm-tools")
  const state = { query: "", tag: null as string | null, kind: null as Kind | null, list: false }
  const chips: { button: HTMLButtonElement; pressed: () => boolean }[] = []
  const chip = (text: string, onClick: () => void, pressed: () => boolean, className = "") => {
    const button = mmEl("button", `mm-chip ${className}`.trim(), text)
    button.type = "button"
    button.setAttribute("aria-pressed", "false")
    button.addEventListener("click", () => {
      onClick()
      layout()
    })
    chips.push({ button, pressed })
    return button
  }
  const plain = (text: string, label: string, onClick: () => void, className = "mm-chip") => {
    const button = mmEl("button", className, text)
    button.type = "button"
    button.ariaLabel = label
    button.addEventListener("click", onClick)
    return button
  }
  const row = (name: string, ...items: HTMLElement[]) => {
    const line = mmEl("div", "mm-row")
    line.setAttribute("role", "group")
    line.setAttribute("aria-label", name)
    line.append(mmEl("span", "mm-row-name", name), ...items)
    return line
  }

  const search = mmEl("input", "mm-search")
  search.type = "search"
  search.placeholder = "Type to filter…"
  search.setAttribute("aria-label", "Filter the mind map by text")
  const count = mmEl("span", "mm-count")
  const clear = plain(
    "Clear filters",
    "Remove all filters",
    () => {
      state.query = ""
      state.tag = null
      state.kind = null
      search.value = ""
      layout()
    },
    "mm-chip mm-clear",
  )
  tools.append(row("Search", search, clear, count))

  const kinds = (["note", "link", "idea"] as Kind[]).filter((k) =>
    all.some((n) => n !== root && n.kind === k),
  )
  if (kinds.length > 1)
    tools.append(
      row(
        "Kind",
        ...kinds.map((kind) =>
          chip(
            KIND_LABELS[kind],
            () => (state.kind = state.kind === kind ? null : kind),
            () => state.kind === kind,
            `mm-kind-${kind}`,
          ),
        ),
      ),
    )

  // tags like S3 name a session and get a row of their own
  const tags = [...new Set(all.flatMap((n) => n.tags))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  )
  const isSession = (tag: string) => /^S\d+$/i.test(tag)
  const tagChip = (tag: string) =>
    chip(
      tag,
      () => (state.tag = state.tag === tag ? null : tag),
      () => state.tag === tag,
      "mm-chip-tag",
    )
  const plainTags = tags.filter((tag) => !isSession(tag))
  const sessions = tags.filter(isSession)
  if (plainTags.length > 0) tools.append(row("Tag", ...plainTags.map(tagChip)))
  if (sessions.length > 0) tools.append(row("Session", ...sessions.map(tagChip)))

  tools.append(
    row(
      "View",
      plain("Unfold all", "Unfold all branches", () => {
        for (const node of all) node.collapsed = false
        layout()
      }),
      plain("Fold", "Fold to the main branches", () => {
        for (const node of all) node.collapsed = node.depth >= 1
        layout()
      }),
      chip(
        "As list",
        () => (state.list = !state.list),
        () => state.list,
      ),
    ),
  )

  const zoom = mmEl("div", "mm-zoom")
  zoom.append(
    plain("−", "Zoom out", () => zoomBy(1 / 1.25)),
    plain("+", "Zoom in", () => zoomBy(1.25)),
    plain("Fit", "Fit the whole map into the frame", () => fit()),
  )
  viewport.appendChild(zoom)

  content.prepend(tools, viewport)
  callout.classList.add("mm-ready")

  for (const node of all) node.w = node.el.offsetWidth

  // ── pan and zoom
  const pan = { x: 0, y: 0, scale: 1 }
  let size = { w: 0, h: 0 }
  let centreX = 0 // the middle of the central node, on the canvas
  const place = () => {
    canvas.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${pan.scale})`
  }
  // the frame is as tall as the map needs at the current zoom, within limits
  const tallest = () => Math.round(window.innerHeight * 0.7)
  const frame = () => {
    const wanted = Math.round(size.h * pan.scale) + 16
    viewport.style.height = `${Math.min(Math.max(wanted, 220), tallest())}px`
  }
  // "all": the whole map in the frame. "readable": the same, but never smaller than 0.75.
  // "keep": the zoom stays as the reader set it, only the position is centred again.
  function fit(mode: "all" | "readable" | "keep" = "all") {
    const vw = viewport.clientWidth
    if (mode !== "keep") {
      pan.scale = Math.min(1, vw / size.w, tallest() / size.h)
      if (mode === "readable") pan.scale = Math.max(pan.scale, 0.75)
    }
    frame()
    const wide = size.w * pan.scale
    // a map wider than the frame opens on its centre node, the rest is reached by dragging
    pan.x =
      wide <= vw ? (vw - wide) / 2 : Math.min(0, Math.max(vw - wide, vw / 2 - centreX * pan.scale))
    pan.y = (viewport.clientHeight - size.h * pan.scale) / 2
    place()
  }
  function zoomBy(factor: number, cx = viewport.clientWidth / 2, cy = viewport.clientHeight / 2) {
    const next = Math.min(2.5, Math.max(0.3, pan.scale * factor))
    const ratio = next / pan.scale
    pan.x = cx - (cx - pan.x) * ratio
    pan.y = cy - (cy - pan.y) * ratio
    pan.scale = next
    place()
  }
  let drag: { x: number; y: number } | null = null
  const onDown = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return
    drag = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    viewport.setPointerCapture(e.pointerId)
    viewport.classList.add("mm-dragging")
  }
  const onMove = (e: PointerEvent) => {
    if (!drag) return
    pan.x = e.clientX - drag.x
    pan.y = e.clientY - drag.y
    place()
  }
  const onUp = () => {
    drag = null
    viewport.classList.remove("mm-dragging")
  }
  // the page scrolls with the wheel; Ctrl or ⌘ + wheel (and pinch) zooms the map
  const onWheel = (e: WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    const box = viewport.getBoundingClientRect()
    zoomBy(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - box.left, e.clientY - box.top)
  }
  const onSearch = () => {
    state.query = search.value.trim().toLowerCase()
    layout()
  }
  viewport.addEventListener("pointerdown", onDown)
  viewport.addEventListener("pointermove", onMove)
  viewport.addEventListener("pointerup", onUp)
  viewport.addEventListener("pointercancel", onUp)
  viewport.addEventListener("wheel", onWheel, { passive: false })
  search.addEventListener("input", onSearch)

  // ── layout
  // anchor: the node that was clicked. It stays where it is on the screen and the zoom is kept,
  // so folding a branch does not throw the reader back to the overview.
  let first = true
  function layout(anchor?: MapNode) {
    const held = anchor
      ? { x: pan.x + anchor.left * pan.scale, y: pan.y + anchor.top * pan.scale }
      : null
    const filtering = state.query !== "" || state.tag !== null || state.kind !== null
    // a tag on a branch counts for everything below it: `S3` on a node shows its whole subtree
    const tagged = (n: MapNode | null, tag: string): boolean =>
      n !== null && (n.tags.includes(tag) || tagged(n.parent, tag))
    const matches = (n: MapNode) =>
      n !== root &&
      (state.query === "" || n.text.includes(state.query)) &&
      (state.tag === null || tagged(n, state.tag)) &&
      (state.kind === null || n.kind === state.kind)
    // a node stays if it matches or leads to a match
    const keep = new Map<MapNode, boolean>()
    const mark = (n: MapNode): boolean => {
      const below = n.children.map(mark).some(Boolean)
      const stays = !filtering || n === root || matches(n) || below
      keep.set(n, stays)
      return stays
    }
    mark(root)
    const open = (n: MapNode) => (filtering ? true : !n.collapsed)
    const kids = (n: MapNode) => (open(n) ? n.children.filter((c) => keep.get(c)) : [])

    for (const n of all) n.shown = false
    const leaves = (n: MapNode): number => {
      const below = kids(n)
      return below.length === 0 ? 1 : below.reduce((sum, c) => sum + leaves(c), 0)
    }
    // main branches go to the right until half of the leaves are placed, the rest to the left
    const main = kids(root)
    const total = main.reduce((sum, c) => sum + leaves(c), 0)
    let placed = 0
    for (const branch of main) {
      const side = main.length < 4 || placed < total / 2 ? 1 : -1
      placed += leaves(branch)
      walk(branch, (n) => {
        n.side = side
      })
    }

    const column = new Map<string, number>() // widest node per side and depth
    const height: Record<number, number> = { 1: 0, [-1]: 0 }
    const setY = (n: MapNode, side: 1 | -1): number => {
      n.shown = true
      const key = `${side}:${n.depth}`
      column.set(key, Math.max(column.get(key) ?? 0, n.w))
      const below = kids(n)
      if (below.length === 0) {
        n.y = height[side]
        height[side] += MM_ROW
      } else {
        const ys = below.map((c) => setY(c, side))
        n.y = (ys[0] + ys[ys.length - 1]) / 2
      }
      return n.y
    }
    for (const branch of main) setY(branch, branch.side)
    root.shown = true
    const tall = Math.max(height[1], height[-1], MM_ROW)
    root.y = (tall - MM_ROW) / 2
    root.x = 0
    const shift: Record<number, number> = {
      1: (tall - height[1]) / 2,
      [-1]: (tall - height[-1]) / 2,
    }
    const offset = (side: 1 | -1, depth: number) => {
      let sum = 0
      for (let d = 1; d < depth; d++) sum += (column.get(`${side}:${d}`) ?? 0) + MM_GAP
      return sum
    }
    for (const n of all) {
      if (!n.shown || n === root) continue
      n.y += shift[n.side]
      n.x =
        n.side === 1 ? root.w + MM_GAP + offset(1, n.depth) : -MM_GAP - offset(-1, n.depth) - n.w
    }

    const shown = all.filter((n) => n.shown)
    const minX = Math.min(...shown.map((n) => n.x))
    const maxX = Math.max(...shown.map((n) => n.x + n.w))
    size = { w: maxX - minX + 2 * MM_PAD, h: tall + 2 * MM_PAD }
    canvas.style.width = `${size.w}px`
    canvas.style.height = `${size.h}px`
    edges.setAttribute("width", String(size.w))
    edges.setAttribute("height", String(size.h))
    edges.replaceChildren()
    centreX = root.x - minX + MM_PAD + root.w / 2

    for (const n of all) {
      n.el.hidden = !n.shown
      if (!n.shown) continue
      const left = n.x - minX + MM_PAD
      const top = n.y + MM_PAD
      n.left = left
      n.top = top
      n.el.style.left = `${left}px`
      n.el.style.top = `${top}px`
      n.el.classList.toggle("mm-left", n.side === -1 && n !== root)
      n.el.classList.toggle("mm-dim", filtering && n !== root && !matches(n))
      if (n.toggle) {
        const hidden = n.children.length - kids(n).length
        n.toggle.textContent = open(n) ? "−" : String(n.children.length)
        n.toggle.ariaLabel = open(n) ? "Fold this branch" : `Unfold ${hidden} branches`
        n.toggle.hidden = filtering || n === root
      }
      if (!n.parent) continue
      const p = n.parent
      const mid = MM_ROW / 2 - 4
      const x1 = (n.side === 1 ? p.x + p.w : p.x) - minX + MM_PAD
      const y1 = p.y + MM_PAD + mid
      const x2 = (n.side === 1 ? n.x : n.x + n.w) - minX + MM_PAD
      const y2 = n.y + MM_PAD + mid
      const bend = (x2 - x1) / 2
      const path = document.createElementNS(NS, "path")
      path.setAttribute("d", `M${x1},${y1} C${x1 + bend},${y1} ${x2 - bend},${y2} ${x2},${y2}`)
      path.setAttribute("stroke", n.color)
      edges.appendChild(path)
    }

    for (const { button, pressed } of chips) button.setAttribute("aria-pressed", String(pressed()))
    const hits = all.filter((n) => matches(n)).length
    count.textContent = filtering ? `${hits} of ${all.length - 1} nodes` : `${all.length - 1} nodes`
    clear.hidden = !filtering
    tools.classList.toggle("mm-filtering", filtering)
    callout.classList.toggle("mm-as-list", state.list)
    if (state.list) return
    if (anchor && held) {
      frame()
      pan.x = held.x - anchor.left * pan.scale
      pan.y = held.y - anchor.top * pan.scale
      place()
    } else {
      fit(first ? "readable" : "keep")
    }
    first = false
  }

  layout()

  let timer: number | undefined
  const onResize = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      if (!state.list) fit("keep")
    }, 150)
  }
  window.addEventListener("resize", onResize)
  window.addCleanup(() => {
    window.removeEventListener("resize", onResize)
    viewport.removeEventListener("pointerdown", onDown)
    viewport.removeEventListener("pointermove", onMove)
    viewport.removeEventListener("pointerup", onUp)
    viewport.removeEventListener("pointercancel", onUp)
    viewport.removeEventListener("wheel", onWheel)
    search.removeEventListener("input", onSearch)
  })
}

document.addEventListener("nav", () => {
  for (const callout of document.querySelectorAll<HTMLElement>(
    'article .callout[data-callout="mindmap"]',
  ))
    setupMindmap(callout)
})
