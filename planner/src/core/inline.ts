// Checkbox lines inside notes: `- [ ] Text #tag 🔁 every week ⏳ 2026-10-12 14:00 ⏱ 45m 📅 2026-10-20`.
// The markers follow the Tasks plugin where it has one (📅 due, ⏳ scheduled, 🔁 recurrence,
// ✅ done, priority arrows). Two are the planner's own: a clock time after ⏳ and ⏱ for a length.
import { Fields, Item, Priority } from "./types"
import { addMinutes, diffMinutes, isDay, norm } from "./dates"
import { fromText } from "./recur"

const LINE = /^(\s*(?:>\s*)*(?:[-*+]|\d+[.)])\s+\[)(.)(\]\s+)(.*)$/
const MARKER = /(📅|⏳|⏱|✅|🔁)️?\s*([^📅⏳⏱✅🔁]*)/gu
const DATE = /^(\d{4}-\d{2}-\d{2})(?:[ T](\d{1,2}:\d{2}))?\s*/
const PRIORITY: [string, Priority][] = [
  ["🔺", "high"],
  ["⏫", "high"],
  ["🔼", "medium"],
  ["🔽", "low"],
  ["⏬", "low"],
]

export interface InlineTask {
  prefix: string // everything up to the box, e.g. "  - ["
  mark: string // the character in the box
  gap: string
  text: string // what the user wrote, without the planner's markers
  start?: string
  minutes?: number
  due?: string
  done?: string
  recurrence?: string
}

export function parseLine(line: string): InlineTask | undefined {
  const m = LINE.exec(line)
  if (!m) return undefined
  const task: InlineTask = { prefix: m[1], mark: m[2], gap: m[3], text: "" }
  // what follows a marker's own value goes back into the text
  let rest = ""
  const text = m[4].replace(MARKER, (_, marker: string, value: string) => {
    if (marker === "🔁") {
      // the rule ends where a tag or a priority arrow begins
      const stop = value.search(/\s[#🔺⏫🔼🔽⏬]/u)
      task.recurrence = (stop < 0 ? value : value.slice(0, stop)).trim()
      rest += stop < 0 ? "" : value.slice(stop)
      return ""
    }
    if (marker === "⏱") {
      const minutes = /^(\d+)\s*m(?:in)?\b\s*/.exec(value)
      if (minutes) task.minutes = Number(minutes[1])
      rest += minutes ? value.slice(minutes[0].length) : value
      return ""
    }
    const date = DATE.exec(value)
    if (!date) return marker + value
    // only ⏳ carries a clock time
    const at = marker === "⏳" && date[2] ? norm(`${date[1]}T${date[2]}`) : date[1]
    if (marker === "📅") task.due = date[1]
    else if (marker === "⏳") task.start = at
    else task.done = date[1]
    rest += value.slice(date[0].length)
    return ""
  })
  task.text = `${text} ${rest}`.replace(/\s+/g, " ").trim()
  return task
}

export function formatLine(task: InlineTask): string {
  const parts = [task.text]
  if (task.recurrence) parts.push(`🔁 ${task.recurrence}`)
  if (task.start) parts.push(`⏳ ${task.start.replace("T", " ")}`)
  if (task.minutes && task.start && !isDay(task.start)) parts.push(`⏱ ${task.minutes}m`)
  if (task.due) parts.push(`📅 ${task.due}`)
  if (task.done) parts.push(`✅ ${task.done}`)
  return task.prefix + task.mark + task.gap + parts.filter(Boolean).join(" ")
}

// the text as a title: no tags, no priority arrows, links reduced to their label
const title = (text: string) =>
  text
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(^|\s)#[\p{L}\p{N}_/-]+/gu, "$1")
    .replace(/[🔺⏫🔼🔽⏬]️?/gu, "")
    .replace(/[*_`=]{1,2}/g, "")
    .replace(/\s+/g, " ")
    .trim()

export const inlineId = (path: string, line: number) => `line:${path}:${line}`

export function toItem(task: InlineTask, path: string, line: number, raw: string): Item {
  const tags = [...task.text.matchAll(/(?:^|\s)#([\p{L}\p{N}_/-]+)/gu)].map((m) => m[1])
  const mark = task.mark.toLowerCase()
  return {
    id: inlineId(path, line),
    source: "inline",
    kind: "task",
    path,
    line,
    raw,
    title: title(task.text) || "(empty task)",
    start: task.start,
    end:
      task.start && task.minutes && !isDay(task.start)
        ? addMinutes(task.start, task.minutes)
        : undefined,
    due: task.due,
    recurrence: task.recurrence,
    rrule: task.recurrence ? fromText(task.recurrence) : undefined,
    status: mark === "x" ? "done" : mark === "-" ? "cancelled" : "open",
    tags,
    priority: PRIORITY.find(([arrow]) => task.text.includes(arrow))?.[1],
  }
}

// the checkbox lines of a note, skipping the frontmatter and fenced code
export function scan(text: string, path: string): Item[] {
  const lines = text.split("\n")
  const items: Item[] = []
  let fence: string | undefined
  let i = 0
  if (lines[0]?.trim() === "---") {
    i = lines.indexOf("---", 1)
    i = i < 0 ? 0 : i + 1
  }
  for (; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, "")
    const opened = /^\s*(?:>\s*)*(```+|~~~+)/.exec(line)
    if (opened) {
      if (!fence) fence = opened[1][0]
      else if (opened[1][0] === fence) fence = undefined
      continue
    }
    if (fence) continue
    const task = parseLine(line)
    if (task) items.push(toItem(task, path, i, line))
  }
  return items
}

// a change to the item's fields, written into the line
export function patchLine(line: string, patch: Partial<Fields>, doneOn?: string): string {
  const task = parseLine(line)
  if (!task) return line
  if ("start" in patch) task.start = patch.start
  if ("due" in patch) task.due = patch.due
  if ("end" in patch || "start" in patch) {
    const end = "end" in patch ? patch.end : undefined
    task.minutes =
      task.start && end && !isDay(task.start)
        ? Math.max(diffMinutes(task.start, end), 5)
        : undefined
  }
  if (patch.status) {
    task.mark = patch.status === "done" ? "x" : patch.status === "cancelled" ? "-" : " "
    task.done = patch.status === "done" ? doneOn : undefined
  }
  return formatLine(task)
}
