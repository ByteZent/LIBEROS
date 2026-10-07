// The dialog to create or edit an item, and the question a recurring item raises when it changes.
import {
  Category,
  Draft,
  Fields,
  Item,
  Occurrence,
  Priority,
  UNCATEGORISED,
  VAULT_TASK,
  addDays,
  addMinutes,
  dayOf,
  describe,
  diffDays,
  diffMinutes,
  isDay,
  today,
  weekday,
} from "../core"
import { contrast, dialog, h } from "./dom"

export type EditorResult =
  | { action: "save"; fields: Partial<Fields> & { kind?: "event" | "task" } }
  | { action: "delete" }
  | { action: "skip" } // leave out this occurrence of a series
  | { action: "done"; done: boolean }
  | { action: "open" }

const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]

const PRESETS: [string, string, (start: string) => string][] = [
  ["daily", "Every day", () => "FREQ=DAILY"],
  ["weekdays", "Every weekday", () => "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"],
  ["weekly", "Every week", (s) => `FREQ=WEEKLY;BYDAY=${DAYS[weekday(s)]}`],
  ["biweekly", "Every 2 weeks", (s) => `FREQ=WEEKLY;INTERVAL=2;BYDAY=${DAYS[weekday(s)]}`],
  ["monthly", "Every month", () => "FREQ=MONTHLY"],
  ["yearly", "Every year", () => "FREQ=YEARLY"],
]

// a rule as the form shows it: one of the presets with an optional last day, or the raw text
function readRule(rrule: string | undefined, start: string | undefined) {
  if (!rrule) return { preset: "none", until: "", custom: "" }
  const parts = rrule.split(";").filter(Boolean)
  const until = parts.find((p) => /^UNTIL=/i.test(p))?.slice(6, 14) ?? ""
  const rest = parts.filter((p) => !/^UNTIL=/i.test(p)).join(";")
  const preset = start && PRESETS.find(([, , make]) => make(start) === rest)?.[0]
  return {
    preset: preset || "custom",
    until: until ? `${until.slice(0, 4)}-${until.slice(4, 6)}-${until.slice(6, 8)}` : "",
    custom: preset ? "" : rrule,
  }
}

function writeRule(preset: string, until: string, custom: string, start: string | undefined) {
  if (preset === "none" || !start) return undefined
  if (preset === "custom") return custom.trim().replace(/^RRULE:/i, "") || undefined
  const rule = PRESETS.find(([id]) => id === preset)![2](start)
  return until ? `${rule};UNTIL=${until.replace(/-/g, "")}T235959` : rule
}

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

export interface EditorInput {
  item?: Item // an existing item …
  occurrence?: Occurrence // … and the occurrence that was clicked
  draft?: Draft // or what to prefill a new one with
  categories: Category[]
}

const LENGTHS: [string, number][] = [
  ["30 min", 30],
  ["1 h", 60],
  ["1½ h", 90],
  ["2 h", 120],
  ["3 h", 180],
]
const PRIORITIES: [string, string][] = [
  ["", "None"],
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
]
const clock = (s?: string) => (s && !isDay(s) ? s.slice(11) : "")

// A row of buttons of which one is chosen. `set` marks a value from outside.
function choice(
  options: [string, string][],
  value: string,
  onChange: (value: string) => void,
  disabled = false,
) {
  const buttons = options.map(([id, label]) =>
    h(
      "button",
      {
        type: "button",
        disabled,
        onclick: () => {
          set(id)
          onChange(id)
        },
      },
      label,
    ),
  )
  const set = (id: string) =>
    buttons.forEach((button, i) => button.classList.toggle("lp-on", options[i][0] === id))
  set(value)
  return { el: h("div", { class: "lp-choice" }, ...buttons), set }
}

export function openEditor(
  parent: HTMLElement,
  input: EditorInput,
): Promise<EditorResult | undefined> {
  const { item, occurrence } = input
  const from: Partial<Fields> & { kind: string } = item ?? input.draft ?? { kind: "event" }
  // which fields the item's storage can take
  const source = item?.source ?? "note"
  const locked = item?.readonly === true
  const can = (field: string) =>
    !locked &&
    (source === "note" ||
      (source === "feed" && field !== "due" && field !== "priority") ||
      (source === "inline" && ["start", "end", "due"].includes(field)))

  return dialog<EditorResult>(parent, (close) => {
    let kind = (item?.kind ?? from.kind) === "task" ? "task" : "event"
    let allDay = from.start ? isDay(from.start) : false
    let category = from.category ?? ""
    let priority: string = from.priority ?? ""
    const rule = readRule(from.rrule, from.start ?? from.due)

    const text = (type: string, value: string | undefined, name: string, extra = {}) =>
      h("input", { type, value: value ?? "", disabled: !can(name), ...extra })
    const row = (label: string, ...controls: (HTMLElement | false | null)[]) =>
      h(
        "div",
        { class: "lp-line" },
        h("span", { class: "lp-label" }, label),
        h("div", { class: "lp-controls" }, ...controls),
      )

    // ── when ────────────────────────────────────────────────────────────────
    // a new event from the "+ New" button starts at the next full hour and lasts one
    const hour = String(Math.min(new Date().getHours() + 1, 23)).padStart(2, "0")
    const suggested = !item && !from.start ? `${today()}T${hour}:00` : undefined
    const start = from.start ?? (kind === "event" ? suggested : undefined)
    const end = from.end ?? (start && start === suggested ? addMinutes(start, 60) : undefined)
    const date = text("date", start && dayOf(start), "start")
    const time = text("time", clock(start), "start", { step: 300 })
    const endTime = text("time", clock(end), "end", { step: 300 })
    const endDate = text("date", end && dayOf(end), "end")
    // a timed item rarely ends on another day: the end date only shows when it does
    const spansDays = !!start && !!end && !isDay(start) && dayOf(end) !== dayOf(start)
    const dash = h("span", { class: "lp-dash" }, "–")
    const whole = h("input", { type: "checkbox", checked: allDay, disabled: !can("start") })
    const lengths = choice(
      LENGTHS.map(([label, minutes]) => [String(minutes), label]),
      "",
      (minutes) => {
        if (!date.value) date.value = today()
        if (!time.value) time.value = "09:00"
        endTime.value = addMinutes(`${date.value}T${time.value}`, Number(minutes)).slice(11)
        sync()
      },
      !can("end"),
    )

    const readStart = () =>
      !date.value ? undefined : allDay || !time.value ? date.value : `${date.value}T${time.value}`
    const readEnd = () => {
      const s = readStart()
      if (!s) return undefined
      if (isDay(s)) return endDate.value > s ? endDate.value : undefined
      if (!endTime.value) return undefined
      // an end before the start on the same day means the next morning
      const day = spansDays && endDate.value ? endDate.value : dayOf(s)
      const e = `${day}T${endTime.value}`
      return e > s ? e : `${addDays(dayOf(s), 1)}T${endTime.value}`
    }

    // ── the rest ────────────────────────────────────────────────────────────
    const title = text("text", from.title, "title", {
      class: "lp-title-input",
      placeholder: kind === "task" ? "What is to do?" : "Add a title",
    })
    const due = text("date", from.due, "due")
    const dueSoon = choice(
      [
        ["0", "Today"],
        ["1", "Tomorrow"],
        ["7", "In a week"],
        ["", "None"],
      ],
      "x",
      (days) => {
        due.value = days === "" ? "" : addDays(today(), Number(days))
        sync()
      },
      !can("due"),
    )
    const repeat = h(
      "select",
      { disabled: !can("rrule") },
      h("option", { value: "none" }, "Does not repeat"),
      ...PRESETS.map(([id, label]) => h("option", { value: id }, label)),
      h("option", { value: "custom" }, "Custom rule"),
    )
    repeat.value = rule.preset
    const until = text("date", rule.until, "rrule", { title: "Last day of the series" })
    const untilLabel = h("span", { class: "lp-dash" }, "until")
    const custom = text("text", rule.custom, "rrule", { placeholder: "FREQ=WEEKLY;BYDAY=MO,TH" })
    const newCategory = text("text", "", "category", {
      class: "lp-new-category",
      placeholder: "New category",
    })
    const categoryChips = h("div", { class: "lp-chips" })
    // the two stand-ins for "no category" are not something to pick
    const picks = input.categories.filter((c) => c.name !== UNCATEGORISED && c.name !== VAULT_TASK)
    const paintCategories = () =>
      categoryChips.replaceChildren(
        ...picks.map((c) => {
          const on = c.name === category
          return h(
            "button",
            {
              type: "button",
              class: `lp-chip ${on ? "lp-on" : ""}`,
              disabled: !can("category"),
              style: on
                ? `background:${c.color};border-color:${c.color};color:${contrast(c.color)}`
                : "",
              onclick: () => {
                category = on ? "" : c.name
                newCategory.value = ""
                paintCategories()
              },
            },
            h("span", { class: "lp-dot", style: `background:${c.color}` }),
            c.name,
          )
        }),
        newCategory,
      )
    newCategory.addEventListener("input", () => {
      category = newCategory.value.trim()
      for (const chip of categoryChips.querySelectorAll(".lp-chip")) {
        chip.classList.remove("lp-on")
        chip.removeAttribute("style")
      }
    })
    paintCategories()
    const priorities = choice(PRIORITIES, priority, (value) => (priority = value), !can("priority"))
    const tags = text("text", (from.tags ?? []).join(" "), "tags", {
      placeholder: "course/MilPsy-HS26 reading",
    })
    const location = text("text", from.location, "location", { placeholder: "Room or place" })
    const notes = h("textarea", { rows: 3, placeholder: "Becomes the text of the new note" })

    const kinds = choice(
      [
        ["event", "Event"],
        ["task", "Task"],
      ],
      kind,
      (value) => {
        kind = value
        // the suggested hour is for events; a task stays unscheduled unless a time is chosen
        if (suggested && kind === "task" && readStart() === suggested) {
          date.value = time.value = endTime.value = ""
        } else if (suggested && kind === "event" && !date.value) {
          date.value = dayOf(suggested)
          time.value = suggested.slice(11)
          endTime.value = addMinutes(suggested, 60).slice(11)
        }
        title.placeholder = kind === "task" ? "What is to do?" : "Add a title"
        sync()
      },
    )
    const dueRow = row("Due", due, dueSoon.el)
    const priorityRow = row("Priority", priorities.el)
    const hint = h("p", { class: "lp-hint" })
    const error = h("p", { class: "lp-error" })

    function sync() {
      const s = readStart()
      const e = readEnd()
      const timed = !allDay
      time.hidden = endTime.hidden = !timed
      endDate.hidden = timed && !spansDays
      dash.hidden = endTime.hidden && endDate.hidden
      lengths.el.hidden = !timed
      lengths.set(s && e && !isDay(s) ? String(diffMinutes(s, e)) : "")
      dueRow.hidden = priorityRow.hidden = kind !== "task"
      const offset = due.value ? String(diffDays(today(), due.value)) : ""
      dueSoon.set(offset)
      until.hidden = untilLabel.hidden = repeat.value === "none" || repeat.value === "custom"
      custom.hidden = repeat.value !== "custom"
      const made = writeRule(repeat.value, until.value, custom.value, s ?? due.value)
      hint.textContent = made ? `Repeats ${describe(made)}` : ""
      error.textContent = ""
    }
    whole.addEventListener("change", () => {
      allDay = whole.checked
      if (!allDay && !time.value) time.value = "09:00"
      sync()
    })
    for (const control of [date, time, endTime, endDate, due, repeat, until, custom]) {
      control.addEventListener("input", sync)
    }
    sync()

    const save = () => {
      const s = readStart()
      const fields: Partial<Fields> = {
        title: title.value.trim(),
        start: s,
        end: readEnd(),
        due: due.value || undefined,
        rrule: writeRule(repeat.value, until.value, custom.value, s ?? due.value),
        category: category || undefined,
        tags: tags.value
          .split(/[\s,]+/)
          .map((t) => t.replace(/^#/, ""))
          .filter(Boolean),
        priority: (priority || undefined) as Priority | undefined,
        location: location.value.trim() || undefined,
      }
      if (!fields.title) {
        title.focus()
        return void (error.textContent = "Give it a title.")
      }
      if (kind === "event" && !fields.start) {
        date.focus()
        return void (error.textContent = "An event needs a day.")
      }
      if (allDay && endDate.value && endDate.value < date.value) {
        return void (error.textContent = "The last day is before the first.")
      }
      if (!item) {
        if (notes.value.trim()) fields.description = notes.value
        if (kind !== "task") fields.due = fields.priority = undefined
        return close({ action: "save", fields: { ...fields, kind: kind as "event" | "task" } })
      }
      // only what changed is written back
      const patch: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(fields)) {
        if (can(key) && !same(value, (item as any)[key])) patch[key] = value
      }
      close({ action: "save", fields: patch })
    }

    const origin = !item
      ? ""
      : item.source === "feed"
        ? `From the calendar “${item.feed}”. Changes stay in this vault and are not sent back.`
        : item.source === "inline"
          ? `A checkbox in ${item.path}. Its text is edited in the note.`
          : item.source === "deadline"
            ? `From the Assessment table of ${item.path}.`
            : ""
    const recurring = !!item?.rrule && !!occurrence?.key
    const done = occurrence?.done ?? item?.status === "done"
    const heading = !item
      ? null
      : h(
          "span",
          { class: "lp-kind" },
          item.kind === "deadline" ? "Deadline" : item.kind === "task" ? "Task" : "Event",
          item.source === "feed" ? ` · ${item.feed}` : "",
          item.course ? ` · ${item.course}` : "",
          recurring ? ` · ${occurrence!.start.replace("T", " ")}` : "",
        )
    const more = h(
      "details",
      { class: "lp-more", open: !!(from.tags?.length || from.location) },
      h("summary", {}, "More"),
      row("Tags", tags),
      row("Location", location),
      !item && row("Notes", notes),
    )

    const form = h(
      "form",
      {
        class: "lp-editor",
        onsubmit: (e: Event) => {
          e.preventDefault()
          save()
        },
        onkeydown: (e: KeyboardEvent) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save()
        },
      },
      h(
        "div", // not <header>, <footer>: the site styles those for its own page frame
        { class: "lp-head" },
        item ? heading : kinds.el,
        h("span", { class: "lp-grow" }),
        item?.path &&
          h(
            "button",
            { type: "button", class: "lp-quiet", onclick: () => close({ action: "open" }) },
            "Open note",
          ),
        h(
          "button",
          { type: "button", class: "lp-quiet", title: "Close", onclick: () => close() },
          "✕",
        ),
      ),
      h(
        "div",
        { class: `lp-title-line ${done ? "lp-done" : ""}` },
        item?.kind === "task" &&
          !locked &&
          h("span", {
            class: "lp-box",
            title: done ? "Reopen" : "Mark done",
            onclick: () => close({ action: "done", done: !done }),
          }),
        title,
      ),
      row(
        "When",
        date,
        time,
        dash,
        endTime,
        endDate,
        h("label", { class: "lp-switch" }, whole, "All day"),
        lengths.el,
      ),
      dueRow,
      row("Repeat", repeat, untilLabel, until, custom),
      hint,
      row("Category", categoryChips),
      priorityRow,
      more,
      item?.description ? h("p", { class: "lp-description" }, item.description) : null,
      origin ? h("p", { class: "lp-hint" }, origin) : null,
      error,
      h(
        "div",
        { class: "lp-actions" },
        item &&
          !locked &&
          h(
            "button",
            { type: "button", class: "lp-danger", onclick: () => close({ action: "delete" }) },
            item.source === "feed" ? "Hide" : "Delete",
          ),
        recurring &&
          item!.source !== "inline" &&
          h(
            "button",
            { type: "button", onclick: () => close({ action: "skip" }) },
            "Skip this one",
          ),
        h("span", { class: "lp-grow" }),
        h("button", { type: "button", onclick: () => close() }, locked ? "Close" : "Cancel"),
        !locked && h("button", { type: "submit", class: "lp-primary" }, item ? "Save" : "Create"),
      ),
    )
    if (!item) setTimeout(() => title.focus())
    return form
  })
}

// A change to one occurrence of a series: this one, or all of them?
export function askScope(parent: HTMLElement, verb: string): Promise<"one" | "all" | undefined> {
  return dialog<"one" | "all">(parent, (close) =>
    h(
      "div",
      { class: "lp-editor" },
      h("h3", {}, `${verb} a repeating item`),
      h(
        "div",
        { class: "lp-actions" },
        h("button", { class: "lp-primary", onclick: () => close("one") }, "Only this one"),
        h("button", { onclick: () => close("all") }, "The whole series"),
        h("span", { class: "lp-grow" }),
        h("button", { onclick: () => close() }, "Cancel"),
      ),
    ),
  )
}

export function confirm(parent: HTMLElement, question: string, yes: string): Promise<boolean> {
  return dialog<boolean>(parent, (close) =>
    h(
      "div",
      { class: "lp-editor" },
      h("p", {}, question),
      h(
        "div",
        { class: "lp-actions" },
        h("span", { class: "lp-grow" }),
        h("button", { onclick: () => close() }, "Cancel"),
        h("button", { class: "lp-danger", onclick: () => close(true) }, yes),
      ),
    ),
  ).then((answer) => answer === true)
}
