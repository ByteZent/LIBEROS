// The calendar board: month, week, day and agenda views with drag and drop, a filter bar and a
// side panel of what is not on the calendar yet. Runs in Obsidian and on the site alike.
import { Calendar, EventApi, EventInput } from "@fullcalendar/core"
import enGb from "@fullcalendar/core/locales/en-gb"
import dayGrid from "@fullcalendar/daygrid"
import timeGrid from "@fullcalendar/timegrid"
import list from "@fullcalendar/list"
import interaction, { Draggable } from "@fullcalendar/interaction"
import {
  Draft,
  Item,
  Mutation,
  Occurrence,
  Scope,
  Snapshot,
  addDays,
  addMinutes,
  anchor,
  categoryOf,
  dayOf,
  describe,
  diffDays,
  duration,
  expand,
  fromLocal,
  today,
} from "../core"
import { Host } from "./host"
import { contrast, h } from "./dom"
import { askScope, confirm, openEditor } from "./editor"

interface State {
  view: string
  date?: string
  hidden: string[] // categories switched off
  done: boolean // show what is finished
  side: boolean
  query: string
}

const STATE_KEY = "liberos-planner"
const courseName = (code: string) => code.replace(/-[A-Z]{2}\d{2}$/, "")
const label = (item: Item) =>
  item.course ? `${courseName(item.course)}: ${item.title}` : item.title
const noteName = (path: string) => path.split("/").pop()!.replace(/\.md$/, "")

export function mountBoard(root: HTMLElement, host: Host): { destroy(): void } {
  let snapshot: Snapshot | undefined
  let colors = new Map<string, string>()
  const state: State = { view: "", hidden: [], done: false, side: true, query: "" }
  try {
    Object.assign(state, JSON.parse(host.storage.get(STATE_KEY) ?? "{}"))
  } catch {
    // a broken saved state is as good as none
  }
  const remember = () => host.storage.set(STATE_KEY, JSON.stringify(state))
  let firstVisit = !state.view // nothing remembered yet: the configured view applies

  // ── frame ─────────────────────────────────────────────────────────────────
  const search = h("input", {
    type: "search",
    class: "lp-search",
    placeholder: "Filter: text, #tag, category",
    value: state.query,
    oninput: () => {
      state.query = search.value
      remember()
      render()
    },
  })
  const chips = h("div", { class: "lp-chips" })
  const doneBox = h("input", {
    type: "checkbox",
    checked: state.done,
    onchange: () => {
      state.done = doneBox.checked
      remember()
      render()
    },
  })
  const syncButton = h(
    "button",
    {
      title: "Fetch the calendar feeds again",
      onclick: async () => {
        syncButton.disabled = true
        try {
          host.notify(await host.sync!())
          await reload()
        } catch (error) {
          host.notify(message(error))
        }
        syncButton.disabled = false
      },
    },
    "Sync",
  )
  const side = h("aside", { class: "lp-side" })
  const calendarEl = h("div", { class: "lp-calendar" })
  const main = h("div", { class: "lp-main" }, side, calendarEl)
  const bar = h(
    "div",
    { class: "lp-bar" },
    h(
      "button",
      { class: "lp-primary", onclick: () => create({ kind: "event", title: "" }) },
      "+ New",
    ),
    h(
      "button",
      {
        title: "Show or hide the task panel",
        onclick: () => {
          state.side = !state.side
          remember()
          layout()
        },
      },
      "Tasks",
    ),
    search,
    chips,
    h("label", { class: "lp-toggle" }, doneBox, "Done"),
    host.sync ? syncButton : null,
  )
  root.classList.add("lp-root")
  root.replaceChildren(bar, main)

  const layout = () => {
    main.classList.toggle("lp-no-side", !state.side)
    calendar.updateSize()
  }

  // ── data ──────────────────────────────────────────────────────────────────
  const message = (error: unknown) => (error instanceof Error ? error.message : String(error))

  function visible(item: Item): boolean {
    if (state.hidden.includes(categoryOf(item))) return false
    const words = state.query.toLowerCase().split(/\s+/).filter(Boolean)
    if (words.length === 0) return true
    const text = [
      item.title,
      categoryOf(item),
      item.location,
      item.course,
      item.feed,
      item.path,
      ...item.tags.map((t) => `#${t}`),
    ]
      .join(" ")
      .toLowerCase()
    return words.every((word) => text.includes(word))
  }

  function toEvent(occ: Occurrence): EventInput {
    const { item } = occ
    const color = colors.get(categoryOf(item)) ?? "#6f7780"
    const end = occ.allDay
      ? addDays(occ.end ?? occ.start, 1) // the calendar counts a day event up to the next morning
      : (occ.end ?? addMinutes(occ.start, duration(item) || 30))
    // over: a day event when its last day has passed, a timed one when its end has
    const past = occ.allDay ? end <= today() : end <= fromLocal(new Date(), false)
    return {
      id: `${item.id}|${occ.key ?? ""}`,
      title: label(item),
      start: occ.start,
      end,
      allDay: occ.allDay,
      backgroundColor: color,
      borderColor: color,
      textColor: contrast(color),
      editable: !item.readonly,
      classNames: [
        "lp-event",
        `lp-${item.kind}`,
        occ.done ? "lp-done" : "",
        past ? "lp-past" : "",
        item.rrule ? "lp-repeats" : "",
        item.priority ? `lp-${item.priority}` : "",
      ].filter(Boolean),
      extendedProps: { occ, color },
    }
  }

  function events(from: Date, to: Date): EventInput[] {
    if (!snapshot) return []
    const [a, b] = [fromLocal(from, true), fromLocal(to, true)]
    return snapshot.items
      .filter(visible)
      .flatMap((item) => expand(item, a, b))
      .filter((occ) => state.done || !occ.done)
      .map(toEvent)
  }

  let loading = false
  let again = false
  async function reload(): Promise<void> {
    // a change that arrives while loading asks for one more round
    if (loading) return void (again = true)
    loading = true
    try {
      snapshot = await host.load()
      colors = new Map(snapshot.categories.map((c) => [c.name, c.color]))
      render()
    } catch (error) {
      host.notify(`Planner: ${message(error)}`)
    }
    loading = false
    if (again) {
      again = false
      await reload()
    }
  }

  async function commit(mutation: Mutation & { raw?: string }, revert?: () => void) {
    try {
      await host.apply(mutation)
    } catch (error) {
      revert?.()
      host.notify(message(error))
    }
    await reload()
  }

  // ── actions ───────────────────────────────────────────────────────────────
  // a series asks whether the change is meant for one occurrence; a checkbox line cannot hold
  // exceptions, so it always changes as a whole
  async function scopeOf(occ: Occurrence, verb: string): Promise<Scope | undefined | "cancel"> {
    if (!occ.item.rrule || !occ.key) return undefined
    if (occ.item.source === "inline") return { key: occ.key, scope: "all" }
    const scope = await askScope(root, verb)
    return scope ? { key: occ.key, scope } : "cancel"
  }

  async function moved(event: EventApi, revert: () => void, resized: boolean) {
    const occ = event.extendedProps.occ as Occurrence
    const start = fromLocal(event.start!, event.allDay)
    let end: string | undefined
    if (event.end) {
      end = event.allDay ? addDays(fromLocal(event.end, true), -1) : fromLocal(event.end, false)
    }
    // an item without a length keeps none unless it was stretched
    const keepsEnd = resized || (occ.end !== undefined && occ.allDay === event.allDay)
    if (!keepsEnd || (event.allDay && end === start)) end = undefined
    const occurrence = await scopeOf(occ, "Move")
    if (occurrence === "cancel") return revert()
    await commit({ op: "move", id: occ.item.id, raw: occ.item.raw, start, end, occurrence }, revert)
  }

  async function create(draft: Draft) {
    const result = await openEditor(root, { draft, categories: snapshot?.categories ?? [] })
    if (result?.action !== "save") return
    await commit({ op: "create", item: { ...draft, ...result.fields } as Draft })
  }

  async function edit(item: Item, occ?: Occurrence) {
    const result = await openEditor(root, {
      item,
      occurrence: occ,
      categories: snapshot?.categories ?? [],
    })
    if (!result) return
    const ref = { id: item.id, raw: item.raw }
    if (result.action === "open") host.open(item)
    else if (result.action === "save") {
      if (Object.keys(result.fields).length > 0) {
        await commit({ op: "update", ...ref, patch: result.fields })
      }
    } else if (result.action === "done")
      await commit({ op: "done", ...ref, done: result.done, key: occ?.key })
    else if (result.action === "skip") {
      await commit({ op: "delete", ...ref, occurrence: { key: occ!.key!, scope: "one" } })
    } else if (result.action === "delete") {
      const what =
        item.source === "feed"
          ? `Hide “${item.title}”? It stays in the feed and is only hidden here.`
          : item.source === "inline"
            ? `Delete the line “${item.title}” from ${item.path}?`
            : `Move “${item.title}” to the trash?`
      if (await confirm(root, what, item.source === "feed" ? "Hide" : "Delete")) {
        await commit({ op: "delete", ...ref })
      }
    }
  }

  const toggle = (item: Item, done: boolean, key?: string) =>
    commit({ op: "done", id: item.id, raw: item.raw, done, key })

  // ── calendar ──────────────────────────────────────────────────────────────
  const clock = { hour: "2-digit", minute: "2-digit", hour12: false } as const
  const calendar = new Calendar(calendarEl, {
    plugins: [dayGrid, timeGrid, list, interaction],
    locale: enGb,
    initialView: state.view || "timeGridWeek",
    initialDate: state.date,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
    },
    buttonText: { today: "Today", month: "Month", week: "Week", day: "Day", list: "Agenda" },
    height: "100%",
    firstDay: 1,
    weekNumbers: true,
    weekNumberCalculation: "ISO",
    nowIndicator: true,
    navLinks: true,
    dayMaxEvents: true,
    // items at the same time stand side by side instead of covering each other
    slotEventOverlap: false,
    eventMinHeight: 16,
    slotDuration: "00:30:00",
    snapDuration: "00:15:00",
    scrollTime: "07:00:00",
    slotLabelFormat: clock,
    eventTimeFormat: clock,
    editable: true,
    selectable: true,
    selectMirror: true,
    droppable: true,
    events: (info, done) => done(events(info.start, info.end)),
    datesSet: (info) => {
      state.view = info.view.type
      state.date = fromLocal(calendar.getDate(), true)
      scheduleFit()
      remember()
    },
    select: (info) => {
      calendar.unselect()
      const start = fromLocal(info.start, info.allDay)
      const last = info.allDay ? addDays(fromLocal(info.end, true), -1) : fromLocal(info.end, false)
      create({ kind: "event", title: "", start, end: last === start ? undefined : last })
    },
    eventDrop: (info) => moved(info.event, info.revert, false),
    eventResize: (info) => moved(info.event, info.revert, true),
    // a task dragged in from the side panel
    drop: (info) => {
      const item = snapshot?.items.find((i) => i.id === info.draggedEl.dataset.id)
      if (!item) return
      const start = fromLocal(info.date, info.allDay)
      commit({ op: "move", id: item.id, raw: item.raw, start })
    },
    eventClick: (info) => {
      info.jsEvent.preventDefault()
      const occ = info.event.extendedProps.occ as Occurrence
      if ((info.jsEvent.target as HTMLElement).closest(".lp-box")) {
        toggle(occ.item, !occ.done, occ.key)
      } else edit(occ.item, occ)
    },
    eventDidMount: (info) => {
      const occ = info.event.extendedProps.occ as Occurrence
      const { item } = occ
      // the category stays visible as a stripe when the block itself is greyed out
      info.el.style.setProperty("--lp-category", info.event.extendedProps.color)
      scheduleFit()
      info.el.title = [
        label(item),
        item.location,
        categoryOf(item),
        item.due ? `due ${item.due}` : "",
        item.rrule ? `repeats ${describe(item.rrule)}` : "",
        item.description,
      ]
        .filter(Boolean)
        .join("\n")
      if (item.kind !== "task" || info.el.querySelector(".lp-box")) return
      // a box to tick, in front of the title; its look follows the event's lp-done class
      const title = info.el.querySelector(".fc-event-title, .fc-list-event-title")
      title?.prepend(h("span", { class: "lp-box", title: "Done" }))
    },
  })

  // ── fitting the text ──────────────────────────────────────────────────────
  // A block in the week and day views shows as much as it has room for: the text shrinks in
  // steps, then the time line goes (it is in the tooltip and readable from the grid).
  const SIZES = ["", "0.92em", "0.84em", "0.76em", "0.68em"]

  function fit(el: HTMLElement) {
    const frame = el.querySelector<HTMLElement>(".fc-event-main-frame")
    const title = el.querySelector<HTMLElement>(".fc-event-title")
    if (!frame || !title) return
    const fits = () =>
      title.scrollHeight <= title.clientHeight + 1 &&
      frame.scrollHeight <= frame.clientHeight + 1 &&
      title.scrollWidth <= title.clientWidth + 1
    for (const timeless of [false, true]) {
      el.classList.toggle("lp-no-time", timeless)
      for (const size of timeless ? SIZES : SIZES.slice(0, 3)) {
        el.style.fontSize = size
        if (fits()) return
      }
    }
  }

  let fitting = 0
  function scheduleFit() {
    cancelAnimationFrame(fitting)
    fitting = requestAnimationFrame(() => {
      calendarEl.querySelectorAll<HTMLElement>(".fc-timegrid-event.lp-event").forEach(fit)
    })
  }

  // ── side panel ────────────────────────────────────────────────────────────
  function row(item: Item, meta?: string): HTMLElement {
    const color = colors.get(categoryOf(item)) ?? "#6f7780"
    const movable = item.kind === "task" && !item.readonly
    return h(
      "div",
      {
        class: `lp-task ${movable ? "lp-drag" : ""} ${item.status === "done" ? "lp-done" : ""}`,
        dataset: { id: item.id },
        title: movable ? "Drag onto the calendar to schedule" : "",
        onclick: (e: Event) => {
          if ((e.target as HTMLElement).closest(".lp-box")) toggle(item, item.status !== "done")
          else edit(item)
        },
      },
      item.kind === "task" ? h("span", { class: "lp-box" }) : null,
      h("span", { class: "lp-dot", style: `background:${color}` }),
      h("span", { class: "lp-title" }, label(item)),
      meta ? h("span", { class: "lp-meta" }, meta) : null,
    )
  }

  function section(title: string, rows: HTMLElement[], open = true): HTMLElement | null {
    if (rows.length === 0) return null
    return h(
      "details",
      { class: "lp-section", open },
      h("summary", {}, title, h("span", { class: "lp-count" }, String(rows.length))),
      ...rows,
    )
  }

  function renderSide() {
    const items = (snapshot?.items ?? []).filter(visible)
    const now = today()
    const inDays = (day: string) => {
      const n = diffDays(now, day)
      return n === 0 ? "today" : n === 1 ? "tomorrow" : n > 0 ? `in ${n} days` : `${-n} d ago`
    }
    const open = items.filter((i) => i.kind === "task" && i.status === "open")
    const deadlines = items
      .filter((i) => i.kind === "deadline" && dayOf(i.start!) >= now)
      .sort((a, b) => a.start!.localeCompare(b.start!))
    const overdue = open
      .filter((i) => !i.rrule && anchor(i) && dayOf(i.due ?? i.start!) < now)
      .sort((a, b) => anchor(a)!.localeCompare(anchor(b)!))
    const unplaced = open.filter((i) => !anchor(i))
    const own = unplaced.filter((i) => i.source !== "inline")
    const byNote = new Map<string, Item[]>()
    for (const item of unplaced.filter((i) => i.source === "inline")) {
      byNote.set(item.path!, [...(byNote.get(item.path!) ?? []), item])
    }

    const quick = h("input", { type: "text", placeholder: "Add a task and press Enter" })
    side.replaceChildren(
      h(
        "form",
        {
          class: "lp-quick",
          onsubmit: (e: Event) => {
            e.preventDefault()
            const title = quick.value.trim()
            if (title) commit({ op: "create", item: { kind: "task", title } })
            quick.value = ""
          },
        },
        quick,
      ),
      section(
        "Exams and hand-ins",
        deadlines.slice(0, 8).map((i) => row(i, inDays(dayOf(i.start!)))),
      ) ?? "",
      section(
        "Overdue",
        overdue.map((i) => row(i, inDays(dayOf(i.due ?? i.start!)))),
      ) ?? "",
      section(
        "Unscheduled",
        own.map((i) => row(i)),
      ) ?? "",
      ...[...byNote.entries()]
        .sort(([a], [b]) => noteName(a).localeCompare(noteName(b)))
        .map(
          ([path, tasks]) =>
            section(
              noteName(path),
              tasks.map((i) => row(i)),
              false,
            ) ?? "",
        ),
    )
  }

  function renderChips() {
    chips.replaceChildren(
      ...(snapshot?.categories ?? [])
        .filter((c) => snapshot!.items.some((i) => categoryOf(i) === c.name))
        .map((c) => {
          const off = state.hidden.includes(c.name)
          return h(
            "button",
            {
              class: `lp-chip ${off ? "lp-off" : ""}`,
              style: off
                ? ""
                : `background:${c.color};color:${contrast(c.color)};border-color:${c.color}`,
              title: off ? "Show" : "Hide",
              onclick: () => {
                state.hidden = off
                  ? state.hidden.filter((name) => name !== c.name)
                  : [...state.hidden, c.name]
                remember()
                render()
              },
            },
            c.name,
          )
        }),
    )
  }

  function render() {
    if (snapshot) {
      if (firstVisit) calendar.changeView(snapshot.config.defaultView)
      firstVisit = false
      calendar.setOption("firstDay", snapshot.config.weekStart)
      calendar.setOption("slotMinTime", `${snapshot.config.dayStart}:00`)
      calendar.setOption("slotMaxTime", `${snapshot.config.dayEnd}:00`)
    }
    renderChips()
    renderSide()
    calendar.refetchEvents()
  }

  // ── life cycle ────────────────────────────────────────────────────────────
  calendar.render()
  layout()
  const draggable = new Draggable(side, {
    itemSelector: ".lp-drag",
    eventData: (el) => ({ title: el.querySelector(".lp-title")?.textContent ?? "", create: false }),
  })
  const resize = new ResizeObserver(() => {
    calendar.updateSize()
    scheduleFit()
  })
  resize.observe(calendarEl)
  // what has ended turns grey without waiting for the next change
  const aging = setInterval(() => calendar.refetchEvents(), 5 * 60_000)
  let timer: ReturnType<typeof setTimeout> | undefined
  const unsubscribe = host.onChange(() => {
    clearTimeout(timer)
    timer = setTimeout(reload, 200)
  })
  reload()

  return {
    destroy() {
      clearTimeout(timer)
      clearInterval(aging)
      cancelAnimationFrame(fitting)
      unsubscribe()
      resize.disconnect()
      draggable.destroy()
      calendar.destroy()
      root.replaceChildren()
      root.classList.remove("lp-root")
    },
  }
}
