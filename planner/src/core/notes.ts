// Notes that are a planner item: `type: event` or `type: task` in the frontmatter.
//
//   ---
//   title: Seminar paper outline
//   type: task
//   status: open            # open | done | cancelled
//   start: 2026-10-12T14:00 # scheduled; a bare date is a whole day
//   end: 2026-10-12T15:30
//   due: 2026-10-20
//   rrule: FREQ=WEEKLY;BYDAY=MO
//   category: Selbststudium
//   tags: [planner, course/PS1-HS26]
//   priority: high
//   ---
import { Document, isMap, parseDocument } from "yaml"
import { Draft, Fields, Item, Override, Priority, Status } from "./types"
import { norm, today } from "./dates"

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/

// the order in which a new note lists its properties
const ORDER = [
  "title",
  "type",
  "status",
  "start",
  "end",
  "due",
  "rrule",
  "exdates",
  "overrides",
  "completed",
  "category",
  "tags",
  "priority",
  "location",
  "created",
]

const list = (v: unknown): string[] =>
  (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]).map(String)
const dates = (v: unknown) =>
  list(v instanceof Date ? [v] : v)
    .map(norm)
    .filter((d): d is string => !!d)

export const noteId = (path: string) => `note:${path}`

export function split(text: string): { data: Record<string, unknown>; body: string } {
  const m = FRONTMATTER.exec(text)
  if (!m) return { data: {}, body: text }
  try {
    const data = parseDocument(m[1]).toJS()
    return { data: data && typeof data === "object" ? data : {}, body: text.slice(m[0].length) }
  } catch {
    return { data: {}, body: text.slice(m[0].length) }
  }
}

export function toItem(data: Record<string, unknown>, path: string): Item | undefined {
  const kind = String(data.type ?? "").toLowerCase()
  if (kind !== "event" && kind !== "task") return undefined
  const status = String(data.status ?? "open").toLowerCase()
  const priority = String(data.priority ?? "").toLowerCase()
  const overrides: Record<string, Override> = {}
  if (data.overrides && typeof data.overrides === "object") {
    for (const [key, value] of Object.entries(data.overrides as Record<string, any>)) {
      const at = norm(key)
      if (!at || !value) continue
      overrides[at] = {
        start: norm(value.start),
        end: norm(value.end),
        cancelled: value.cancelled === true || undefined,
      }
    }
  }
  return {
    id: noteId(path),
    source: "note",
    kind,
    path,
    title: String(data.title ?? path.split("/").pop()!.replace(/\.md$/, "")),
    start: norm(data.start),
    end: norm(data.end),
    due: norm(data.due),
    rrule: data.rrule ? String(data.rrule).replace(/^RRULE:/i, "") : undefined,
    exdates: dates(data.exdates),
    overrides,
    completed: dates(data.completed),
    status: (["done", "cancelled"].includes(status) ? status : "open") as Status,
    category: data.category ? String(data.category) : undefined,
    tags: list(data.tags).map((t) => t.replace(/^#/, "")),
    priority: (["high", "medium", "low"].includes(priority) ? priority : undefined) as
      | Priority
      | undefined,
    location: data.location ? String(data.location) : undefined,
  }
}

const empty = (v: unknown) =>
  v == null ||
  v === "" ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0)

// Sets the given properties and leaves everything else in the frontmatter as it was written.
// An empty value removes its property.
export function patchFrontmatter(text: string, patch: Record<string, unknown>): string {
  const m = FRONTMATTER.exec(text)
  const doc = m ? parseDocument(m[1]) : new Document({})
  if (!isMap(doc.contents)) doc.contents = doc.createNode({}) as any
  for (const [key, value] of Object.entries(patch)) {
    if (empty(value)) doc.delete(key)
    else doc.set(key, value)
  }
  const yaml = doc.toString({ lineWidth: 0 }).trimEnd()
  const body = m ? text.slice(m[0].length) : text
  return `---\n${yaml}\n---\n${body}`
}

export function newNote(draft: Draft): string {
  const data: Record<string, unknown> = {
    ...draft,
    type: draft.kind,
    status: draft.kind === "task" ? (draft.status ?? "open") : undefined,
    created: today(),
  }
  const ordered: Record<string, unknown> = {}
  for (const key of ORDER) if (!empty(data[key])) ordered[key] = data[key]
  const body = draft.description?.trim() ? `\n${draft.description.trim()}\n` : ""
  return patchFrontmatter(body, ordered)
}

// a file name Obsidian, Quartz and the file system all accept
export const fileName = (title: string) =>
  title
    .replace(/[\\/:*?"<>|#^[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "Untitled"

// the frontmatter properties for a change to the item's fields
export function toProperties(patch: Partial<Fields>): Record<string, unknown> {
  const { description: _, ...properties } = patch
  return properties
}
