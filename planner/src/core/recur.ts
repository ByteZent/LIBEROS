// Recurrence: an item with an `rrule` becomes its occurrences inside a date range.
import * as rrule from "rrule"
import { Item, Occurrence } from "./types"
import { addDays, addMinutes, dayOf, diffMinutes, fromFloat, isDay, toFloat } from "./dates"

// rrule ships CommonJS that Node's ESM loader only exposes as a default export; bundlers expose
// the named one
const RRule: typeof rrule.RRule = rrule.RRule ?? Reflect.get(rrule, "default").RRule
type RRule = rrule.RRule

const DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]
const rules = new Map<string, RRule | null>()

function rule(rrule: string, start: string): RRule | null {
  const key = `${start}|${rrule}`
  if (!rules.has(key)) {
    let made: RRule | null = null
    try {
      made = new RRule({ ...RRule.parseString(rrule), dtstart: toFloat(start) })
    } catch {
      // a rule that cannot be read leaves the item as a single event
    }
    rules.set(key, made)
  }
  return rules.get(key)!
}

// where the item sits on the calendar: scheduled, or else on the day it is due
export const anchor = (item: Item) => item.start ?? item.due

// length in minutes; a day item counts whole days
export function duration(item: Item): number {
  const start = anchor(item)
  if (!start) return 0
  if (item.start && item.end) {
    return isDay(start)
      ? diffMinutes(start, dayOf(item.end)) + 1440
      : Math.max(diffMinutes(start, item.end), 0)
  }
  return isDay(start) ? 1440 : item.kind === "task" ? 30 : 60
}

// the end of an occurrence that starts at `start`, in the item's own form (a day: the last day)
function endFor(item: Item, start: string): string | undefined {
  if (!item.start || !item.end) return undefined
  const minutes = duration(item)
  return isDay(start) ? addDays(start, minutes / 1440 - 1) : addMinutes(start, minutes)
}

function occurrence(item: Item, start: string, end: string | undefined, key?: string): Occurrence {
  const done = item.status === "done" || (key !== undefined && (item.completed ?? []).includes(key))
  return { item, key, start, end, allDay: isDay(start), done }
}

// [from, to) as day strings
export function expand(item: Item, from: string, to: string): Occurrence[] {
  const start = anchor(item)
  if (!start || item.status === "cancelled") return []
  const overlaps = (s: string, e?: string) => dayOf(s) < to && dayOf(e ?? s) >= from
  const r = item.rrule ? rule(item.rrule, start) : null
  if (!r) return overlaps(start, item.end) ? [occurrence(item, start, item.end)] : []

  const day = isDay(start)
  const skipped = new Set(item.exdates ?? [])
  const moved = item.overrides ?? {}
  const out: Occurrence[] = []
  const lead = Math.ceil(duration(item) / 1440)
  for (const date of r.between(toFloat(addDays(from, -lead)), toFloat(to), true)) {
    const key = fromFloat(date, day)
    if (skipped.has(key) || moved[key]) continue
    const end = endFor(item, key)
    if (overlaps(key, end)) out.push(occurrence(item, key, end, key))
  }
  for (const [key, change] of Object.entries(moved)) {
    if (skipped.has(key) || change.cancelled) continue
    const at = change.start ?? key
    const end = change.end ?? endFor(item, at)
    if (overlaps(at, end)) out.push(occurrence(item, at, end, key))
  }
  return out
}

// the first occurrence after `after`, by its original start
export function next(item: Item, after: string): string | undefined {
  const start = anchor(item)
  if (!start || !item.rrule) return undefined
  const date = rule(item.rrule, start)?.after(toFloat(after), false)
  return date ? fromFloat(date, isDay(start)) : undefined
}

// A series moved by whole days: BYDAY=MO becomes BYDAY=TU. Numbered days (1MO, -1FR) and the
// monthly and yearly parts cannot be shifted blindly, so such a rule is returned unchanged.
export function shiftRule(rrule: string, days: number): string {
  if (days % 7 === 0) return rrule
  return rrule
    .split(";")
    .map((part) => {
      const [name, value] = part.split("=")
      if (name.toUpperCase() !== "BYDAY" || !/^[A-Z]{2}(,[A-Z]{2})*$/i.test(value ?? ""))
        return part
      const shifted = value
        .toUpperCase()
        .split(",")
        .map((d) => DAYS[(((DAYS.indexOf(d) + days) % 7) + 7) % 7])
      return `BYDAY=${shifted.join(",")}`
    })
    .join(";")
}

export function describe(rrule: string): string {
  try {
    return new RRule(RRule.parseString(rrule)).toText()
  } catch {
    return rrule
  }
}

// "every week", "every 2 weeks on Monday" → a rule; undefined if the text is not understood
export function fromText(text: string): string | undefined {
  try {
    const parsed = RRule.fromText(text.trim())
    const made = RRule.optionsToString(parsed.origOptions)
    return made.replace(/^RRULE:/, "") || undefined
  } catch {
    return undefined
  }
}
