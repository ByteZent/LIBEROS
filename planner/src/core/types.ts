// The planner's data model, shared by the Obsidian plugin, the browser board and the local server.
//
// Times are local wall-clock strings without a zone: "YYYY-MM-DD" (a whole day) or
// "YYYY-MM-DDTHH:mm". An item sits on the calendar at `start`, or at `due` if it has no start.
// The `end` of an all-day item is its last day (inclusive).

export type Kind = "event" | "task" | "deadline"
export type Status = "open" | "done" | "cancelled"
export type Priority = "high" | "medium" | "low"

// where an item is stored, which decides how a change to it is written back
//   note      a note of its own with `type: event | task` in the frontmatter
//   inline    a `- [ ]` line inside any note
//   feed      an event of a subscribed .ics calendar; changes are kept as local overrides
//   deadline  a row of a course map's Assessment table; read-only
export type Source = "note" | "inline" | "feed" | "deadline"

export interface Override {
  start?: string
  end?: string
  cancelled?: boolean
}

export interface Fields {
  title: string
  start?: string
  end?: string
  due?: string
  rrule?: string // RFC 5545 rule without the "RRULE:" prefix, e.g. FREQ=WEEKLY;BYDAY=MO
  exdates?: string[] // skipped occurrences, by their original start
  overrides?: Record<string, Override> // moved occurrences, by their original start
  completed?: string[] // a recurring task: the occurrences that are done
  status: Status
  category?: string
  tags: string[]
  priority?: Priority
  location?: string
  description?: string
}

export interface Item extends Fields {
  id: string
  source: Source
  kind: Kind
  path?: string // the note to open, relative to the content root
  line?: number // inline tasks and deadlines: 0-based line in that note
  raw?: string // inline tasks: the line as it was read, to find it again before writing
  recurrence?: string // inline tasks: the text after 🔁, e.g. "every week"
  feed?: string
  uid?: string
  course?: string
  readonly?: boolean
}

export interface Occurrence {
  item: Item
  key?: string // a recurring item: the original start of this occurrence
  start: string
  end?: string
  allDay: boolean
  done: boolean
}

export interface Category {
  name: string
  color: string
}

export interface Feed {
  name: string
  url: string
  // a line "<field>: <value>" in an event's description names its category (Proton exports none)
  categoryField?: string
  // for events without that line: the first rule whose pattern matches the title names it
  rules?: { match: string; category: string }[]
}

export interface Config {
  categories: Category[]
  feeds: Feed[]
  refreshMinutes: number // how often the feeds are fetched again
  weekStart: number // 0 Sunday, 1 Monday
  dayStart: string // first and last hour of the week and day views
  dayEnd: string
  defaultView: string
  inlineTasks: boolean // also show the `- [ ]` lines of the notes
  exclude: string[] // folders that are never scanned
}

export interface Snapshot {
  items: Item[]
  categories: Category[] // the configured ones, then every other category in use
  config: Config
  folder: string
}

export interface Draft extends Partial<Fields> {
  kind: "event" | "task"
  title: string
}

// "one": this occurrence only; "all": the whole series
export interface Scope {
  key: string
  scope: "one" | "all"
}

export type Mutation =
  | { op: "create"; item: Draft }
  | { op: "update"; id: string; patch: Partial<Fields> }
  | { op: "move"; id: string; start: string; end?: string; occurrence?: Scope }
  | { op: "done"; id: string; done: boolean; key?: string }
  | { op: "delete"; id: string; occurrence?: Scope }

// what the store needs from its surroundings: the vault API in Obsidian, node:fs in the server.
// Paths are relative to the content root and use forward slashes.
export interface FileSystem {
  list(): Promise<{ path: string; mtime: number }[]> // every Markdown file
  read(path: string): Promise<string | null> // null: no such file
  write(path: string, text: string): Promise<void> // creates missing folders
  trash(path: string): Promise<void>
}
