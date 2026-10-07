// Reads an iCalendar (.ics) file into planner items. Enough of RFC 5545 for a published
// calendar: events with zoned, UTC, floating or all-day times, RRULE, EXDATE and the moved
// occurrences of a series (RECURRENCE-ID). Times are converted to the local time zone.
import { Feed, Item, Override } from "./types"
import { addDays, addMinutes, fromLocal, isDay } from "./dates"

interface Prop {
  name: string
  params: Record<string, string>
  value: string
}

const unescape = (s: string) =>
  s.replace(/\\([nN,;\\])/g, (_, c: string) => (c === "n" || c === "N" ? "\n" : c))

function parseLine(line: string): Prop | undefined {
  // the value starts at the first colon outside a quoted parameter
  let quoted = false
  let colon = -1
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') quoted = !quoted
    else if (line[i] === ":" && !quoted) {
      colon = i
      break
    }
  }
  if (colon < 0) return undefined
  const [name, ...rest] = line.slice(0, colon).split(";")
  const params: Record<string, string> = {}
  for (const param of rest) {
    const eq = param.indexOf("=")
    if (eq > 0) params[param.slice(0, eq).toUpperCase()] = param.slice(eq + 1).replace(/^"|"$/g, "")
  }
  return { name: name.toUpperCase(), params, value: line.slice(colon + 1) }
}

// how far `zone` is ahead of UTC at `instant`, in milliseconds
function zoneOffset(zone: string, instant: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(new Date(instant))
  const n = (type: string) => Number(parts.find((p) => p.type === type)!.value)
  const wall = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"))
  return wall - Math.floor(instant / 1000) * 1000
}

const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone

// 20260928T054500 (in `zone`), 20260928T054500Z or 20260928 → a local wall-clock string
function parseTime(value: string, zone?: string): string | undefined {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(value.trim())
  if (!m) return undefined
  if (m[4] === undefined) return `${m[1]}-${m[2]}-${m[3]}`
  const wall = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}`
  const utc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])
  if (m[7]) return fromLocal(new Date(utc), false)
  if (!zone || zone === localZone) return wall
  try {
    // two passes settle the offset around a daylight-saving change
    let instant = utc - zoneOffset(zone, utc)
    instant = utc - zoneOffset(zone, instant)
    return fromLocal(new Date(instant), false)
  } catch {
    return wall // an unknown zone name: keep the wall clock
  }
}

function parseDuration(value: string): number {
  const m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(value)
  if (!m) return 0
  const minutes = +(m[2] ?? 0) * 10080 + +(m[3] ?? 0) * 1440 + +(m[4] ?? 0) * 60 + +(m[5] ?? 0)
  return m[1] === "-" ? -minutes : minutes
}

// UNTIL is given in UTC; the planner computes on the local wall clock
function localRule(rrule: string, zone?: string): string {
  return rrule
    .split(";")
    .map((part) => {
      const [name, value] = part.split("=")
      if (name.toUpperCase() !== "UNTIL") return part
      const until = parseTime(value, zone)
      if (!until) return part
      const stamp = until.replace(/[-:]/g, "")
      return `UNTIL=${isDay(until) ? `${stamp}T235959` : `${stamp}00`}`
    })
    .join(";")
}

interface RawEvent {
  uid: string
  title: string
  description?: string
  location?: string
  start?: string
  end?: string
  rrule?: string
  exdates: string[]
  recurrenceId?: string
  cancelled: boolean
  categories: string[]
}

function readEvents(text: string): RawEvent[] {
  // a line that starts with a space or tab continues the one before
  const lines = text
    .replace(/\r\n?/g, "\n")
    .replace(/\n[ \t]/g, "")
    .split("\n")
  const events: RawEvent[] = []
  let event: RawEvent | undefined
  let nested = 0 // VALARM and the like inside an event
  let length: number | undefined
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      event = { uid: "", title: "", exdates: [], cancelled: false, categories: [] }
      length = undefined
      continue
    }
    if (!event) continue
    if (line.startsWith("BEGIN:")) nested++
    else if (line.startsWith("END:") && nested > 0) nested--
    else if (line === "END:VEVENT") {
      if (event.start && event.uid) {
        if (!event.end && length) event.end = addMinutes(event.start, length)
        // DTEND is exclusive; a day event ends on its last day here
        if (event.end && isDay(event.start)) event.end = addDays(event.end.slice(0, 10), -1)
        if (event.end && event.end <= event.start) event.end = undefined
        events.push(event)
      }
      event = undefined
    } else if (nested === 0) {
      const prop = parseLine(line)
      if (!prop) continue
      const zone = prop.params.TZID
      switch (prop.name) {
        case "UID":
          event.uid = prop.value.trim()
          break
        case "SUMMARY":
          event.title = unescape(prop.value).trim()
          break
        case "DESCRIPTION":
          event.description = unescape(prop.value).trim() || undefined
          break
        case "LOCATION":
          event.location = unescape(prop.value).trim() || undefined
          break
        case "DTSTART":
          event.start = parseTime(prop.value, zone)
          break
        case "DTEND":
          event.end = parseTime(prop.value, zone)
          break
        case "DURATION":
          length = parseDuration(prop.value.trim())
          break
        case "RRULE":
          event.rrule = prop.value.trim()
          break
        case "EXDATE":
          for (const value of prop.value.split(",")) {
            const at = parseTime(value, zone)
            if (at) event.exdates.push(at)
          }
          break
        case "RECURRENCE-ID":
          event.recurrenceId = parseTime(prop.value, zone)
          break
        case "STATUS":
          event.cancelled = prop.value.trim().toUpperCase() === "CANCELLED"
          break
        case "CATEGORIES":
          event.categories.push(...prop.value.split(",").map((c) => unescape(c).trim()))
          break
      }
    }
  }
  return events
}

export const feedId = (feed: string, uid: string) => `feed:${feed}:${uid}`

export function parseIcs(text: string, feed: Feed): Item[] {
  const events = readEvents(text)
  const field = feed.categoryField
    ? new RegExp(`^${feed.categoryField.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*(.+)$`, "im")
    : undefined
  const rules = (feed.rules ?? []).flatMap((rule) => {
    try {
      return [{ match: new RegExp(rule.match, "iu"), category: rule.category }]
    } catch {
      return [] // a pattern that is not a regular expression is skipped
    }
  })
  const items = new Map<string, Item>()
  for (const event of events.filter((e) => !e.recurrenceId)) {
    const zoneRule = event.rrule ? localRule(event.rrule) : undefined
    items.set(event.uid, {
      id: feedId(feed.name, event.uid),
      source: "feed",
      kind: "event",
      feed: feed.name,
      uid: event.uid,
      title: event.title || "(untitled)",
      start: event.start,
      end: event.end,
      rrule: zoneRule,
      exdates: event.exdates.length > 0 ? event.exdates : undefined,
      status: event.cancelled ? "cancelled" : "open",
      category:
        (field && event.description?.match(field)?.[1].trim()) ||
        rules.find((rule) => rule.match.test(event.title))?.category ||
        event.categories[0] ||
        feed.name,
      tags: [],
      location: event.location,
      description: event.description,
    })
  }
  // a moved or cancelled occurrence of a series
  for (const event of events.filter((e) => e.recurrenceId)) {
    const series = items.get(event.uid)
    if (!series) continue
    const change: Override = event.cancelled
      ? { cancelled: true }
      : { start: event.start, end: event.end }
    series.overrides = { ...series.overrides, [event.recurrenceId!]: change }
  }
  return [...items.values()]
}
