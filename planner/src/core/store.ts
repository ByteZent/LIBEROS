// Reads the vault into planner items and writes changes back to where each item is stored.
// The same code runs inside Obsidian and in the local server; only the FileSystem differs.
import { Config, Draft, Fields, FileSystem, Item, Mutation, Scope, Snapshot } from "./types"
import { CONFIG_FILE, categories, readConfig } from "./config"
import { addDays, addMinutes, dayOf, diffDays, diffMinutes, isDay, today } from "./dates"
import { anchor, next, shiftRule } from "./recur"
import { parseIcs } from "./ics"
import * as inline from "./inline"
import * as notes from "./notes"
import * as deadlines from "./deadlines"

interface Parsed {
  mtime: number
  note?: Item
  deadlines: Item[]
  inline: Item[]
}

// what the user changed on a feed event; the feed itself is never written
type Local = Record<string, Partial<Fields> & { hidden?: boolean }>

export class Store {
  private cache = new Map<string, Parsed>()
  private feedCache = new Map<string, { text: string; items: Item[] }>()
  private queue: Promise<unknown> = Promise.resolve()

  constructor(
    private fs: FileSystem,
    public folder: string,
  ) {}

  private file = (name: string) => `${this.folder}/${name}`
  private feedFile = (feed: string, ext: string) =>
    this.file(`feeds/${notes.fileName(feed)}.${ext}`)

  async config(): Promise<Config> {
    return readConfig(await this.fs.read(this.file(CONFIG_FILE)))
  }

  async saveConfig(config: Config): Promise<void> {
    await this.fs.write(this.file(CONFIG_FILE), JSON.stringify(config, null, 2) + "\n")
  }

  private async local(feed: string): Promise<Local> {
    try {
      return JSON.parse((await this.fs.read(this.feedFile(feed, "local.json"))) ?? "{}")
    } catch {
      return {}
    }
  }

  private async parse(path: string, mtime: number): Promise<Parsed> {
    const hit = this.cache.get(path)
    if (hit && hit.mtime === mtime) return hit
    const text = (await this.fs.read(path)) ?? ""
    const { data } = notes.split(text)
    const parsed: Parsed = {
      mtime,
      note: notes.toItem(data, path),
      deadlines: deadlines.scan(data, text, path),
      // cheap test first: most notes have no checkbox at all
      inline: text.includes("[") ? inline.scan(text, path) : [],
    }
    this.cache.set(path, parsed)
    return parsed
  }

  async snapshot(): Promise<Snapshot> {
    const config = await this.config()
    const skip = config.exclude.map((dir) => dir.replace(/\/+$/, "") + "/")
    const files = (await this.fs.list()).filter((f) => !skip.some((dir) => f.path.startsWith(dir)))
    const seen = new Set(files.map((f) => f.path))
    for (const path of this.cache.keys()) if (!seen.has(path)) this.cache.delete(path)

    const items: Item[] = []
    for (const file of files) {
      const parsed = await this.parse(file.path, file.mtime)
      if (parsed.note) items.push(parsed.note)
      items.push(...parsed.deadlines)
      if (config.inlineTasks) items.push(...parsed.inline)
    }
    for (const feed of config.feeds) {
      const text = await this.fs.read(this.feedFile(feed.name, "ics"))
      if (!text) continue
      let cached = this.feedCache.get(feed.name)
      if (!cached || cached.text !== text) {
        cached = { text, items: parseIcs(text, feed) }
        this.feedCache.set(feed.name, cached)
      }
      const local = await this.local(feed.name)
      for (const item of cached.items) {
        const { hidden, ...change } = local[item.uid!] ?? {}
        if (!hidden) items.push({ ...item, ...change })
      }
    }
    return { items, categories: categories(config, items), config, folder: this.folder }
  }

  // Fetches every feed and keeps the answer next to the settings. `get` is the caller's way to
  // the network: Obsidian's requestUrl, or fetch in the server.
  async syncFeeds(get: (url: string) => Promise<string>): Promise<string> {
    const { feeds } = await this.config()
    if (feeds.length === 0) return "No calendar feeds configured"
    const report: string[] = []
    for (const feed of feeds) {
      try {
        const text = await get(feed.url)
        if (!text.includes("BEGIN:VCALENDAR")) throw new Error("not a calendar")
        const file = this.feedFile(feed.name, "ics")
        if ((await this.fs.read(file)) !== text) await this.fs.write(file, text)
        report.push(`${feed.name}: ${parseIcs(text, feed).length} events`)
      } catch (error) {
        report.push(`${feed.name}: failed (${error instanceof Error ? error.message : error})`)
      }
    }
    return report.join(" · ")
  }

  // one change at a time: two writes to the same note must not overtake each other
  apply(mutation: Mutation & { raw?: string }): Promise<string | undefined> {
    const run = this.queue.then(() => this.run(mutation))
    this.queue = run.catch(() => undefined)
    return run
  }

  private async run(m: Mutation & { raw?: string }): Promise<string | undefined> {
    if (m.op === "create") return this.create(m.item)
    const item = await this.find(m.id, m.raw)
    if (item.readonly) throw new Error(`"${item.title}" is read from a course map: edit it there`)
    switch (m.op) {
      case "update":
        await this.save(item, m.patch)
        break
      case "move":
        await this.save(item, movePatch(item, m.start, m.end, m.occurrence))
        break
      case "done":
        await this.done(item, m.done, m.key)
        break
      case "delete":
        await this.remove(item, m.occurrence)
        break
    }
    return item.id
  }

  // An inline task is known by its line number, which shifts when the note is edited:
  // `raw` (the line as the board last saw it) finds it again.
  private async find(id: string, raw?: string): Promise<Item> {
    const { items } = await this.snapshot()
    const item = items.find((i) => i.id === id)
    if (item && (item.source !== "inline" || raw === undefined || item.raw === raw)) return item
    const path = id.replace(/^line:/, "").replace(/:\d+$/, "")
    const moved = items.find((i) => i.source === "inline" && i.path === path && i.raw === raw)
    if (!moved) throw new Error("This item changed in the vault in the meantime. Try again.")
    return moved
  }

  private async create(draft: Draft): Promise<string> {
    const dir = this.file(draft.kind === "task" ? "Tasks" : "Events")
    const name = notes.fileName(draft.title)
    let path = `${dir}/${name}.md`
    for (let n = 2; (await this.fs.read(path)) !== null; n++) path = `${dir}/${name} ${n}.md`
    await this.fs.write(path, notes.newNote(draft))
    return notes.noteId(path)
  }

  private async save(item: Item, patch: Partial<Fields>, doneOn?: string): Promise<void> {
    if (Object.keys(patch).length === 0) return
    if (item.source === "note") {
      const text = await this.fs.read(item.path!)
      if (text === null) throw new Error(`${item.path} is gone`)
      await this.fs.write(item.path!, notes.patchFrontmatter(text, notes.toProperties(patch)))
    } else if (item.source === "inline") {
      await this.editLine(item, (line) => [inline.patchLine(line, patch, doneOn)])
    } else if (item.source === "feed") {
      await this.saveLocal(item, patch)
    }
  }

  private async saveLocal(item: Item, change: Local[string]): Promise<void> {
    const local = await this.local(item.feed!)
    local[item.uid!] = { ...local[item.uid!], ...change }
    await this.fs.write(
      this.feedFile(item.feed!, "local.json"),
      JSON.stringify(local, null, 2) + "\n",
    )
  }

  // replaces the task's line by what `edit` returns (several lines, or none to delete it)
  private async editLine(item: Item, edit: (line: string) => string[]): Promise<void> {
    const text = await this.fs.read(item.path!)
    if (text === null) throw new Error(`${item.path} is gone`)
    const lines = text.split("\n")
    const strip = (line?: string) => line?.replace(/\r$/, "")
    let at = item.line!
    if (strip(lines[at]) !== item.raw) at = lines.findIndex((line) => strip(line) === item.raw)
    if (at < 0) throw new Error("This task changed in its note in the meantime. Try again.")
    lines.splice(at, 1, ...edit(strip(lines[at])!))
    await this.fs.write(item.path!, lines.join("\n"))
  }

  private async done(item: Item, done: boolean, key?: string): Promise<void> {
    if (item.kind !== "task") throw new Error("Only tasks can be completed")
    if (item.source === "inline") {
      // a recurring line stays as the record of what was done; its successor goes above it
      const from = anchor(item)
      const following = done && item.rrule && from ? next(item, key ?? from) : undefined
      await this.editLine(item, (line) => {
        const finished = inline.patchLine(line, { status: done ? "done" : "open" }, today())
        if (!following || !from) return [finished]
        const shift = (at?: string) =>
          at &&
          (isDay(at)
            ? addDays(at, diffDays(from, following))
            : addMinutes(at, diffMinutes(from, following)))
        const again = inline.patchLine(line, {
          start: shift(item.start),
          end: shift(item.end),
          due: shift(item.due),
        })
        return [again, finished]
      })
      return
    }
    if (item.rrule && key) {
      const completed = new Set(item.completed ?? [])
      if (done) completed.add(key)
      else completed.delete(key)
      await this.save(item, { completed: [...completed].sort() })
    } else {
      await this.save(item, { status: done ? "done" : "open" })
    }
  }

  private async remove(item: Item, occurrence?: Scope): Promise<void> {
    if (item.rrule && occurrence?.scope === "one" && item.source !== "inline") {
      const { [occurrence.key]: _, ...overrides } = item.overrides ?? {}
      const exdates = [...new Set([...(item.exdates ?? []), occurrence.key])].sort()
      await this.save(item, { exdates, overrides })
    } else if (item.source === "note") {
      await this.fs.trash(item.path!)
    } else if (item.source === "inline") {
      await this.editLine(item, () => [])
    } else if (item.source === "feed") {
      await this.saveLocal(item, { hidden: true })
    }
  }
}

// The fields to change when an item (or one occurrence of a series) is put somewhere else.
export function movePatch(
  item: Item,
  start: string,
  end: string | undefined,
  occurrence?: Scope,
): Partial<Fields> {
  const from = anchor(item)
  // a task that only has a due date: a day changes the due date, a time slot schedules it
  if (!item.start && item.due && isDay(start)) {
    const days = occurrence ? diffDays(occurrence.key, start) : diffDays(item.due, start)
    return { due: addDays(item.due, days) }
  }
  if (!item.rrule || !occurrence || !from) return { start, end }
  if (occurrence.scope === "one" && item.source !== "inline") {
    return { overrides: { ...item.overrides, [occurrence.key]: { start, end } } }
  }

  // the whole series moves by what this occurrence moved
  const days = diffDays(occurrence.key, start)
  const newStart = isDay(start)
    ? addDays(dayOf(from), days)
    : `${addDays(dayOf(from), days)}T${start.slice(11)}`
  const newEnd =
    end === undefined
      ? undefined
      : isDay(start)
        ? addDays(newStart, diffDays(start, end))
        : addMinutes(newStart, diffMinutes(start, end))
  // skipped, moved and completed occurrences are named by their old start: they move along,
  // unless the series changed between whole days and clock times
  const sameForm = isDay(from) === isDay(newStart)
  const minutes = sameForm ? diffMinutes(from, newStart) : 0
  const rekey = (key: string) =>
    isDay(key) ? addDays(key, minutes / 1440) : addMinutes(key, minutes)
  return {
    start: newStart,
    end: newEnd,
    rrule: shiftRule(item.rrule, days),
    exdates: sameForm ? (item.exdates ?? []).map(rekey) : [],
    completed: sameForm ? (item.completed ?? []).map(rekey) : [],
    overrides: sameForm
      ? Object.fromEntries(Object.entries(item.overrides ?? {}).map(([k, v]) => [rekey(k), v]))
      : {},
  }
}
