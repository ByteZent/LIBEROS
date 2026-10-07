// Wall-clock strings ("YYYY-MM-DD" or "YYYY-MM-DDTHH:mm") and the arithmetic on them.
// The arithmetic runs on "floating" dates: a Date whose UTC fields hold the wall clock, so that
// adding a day or a week never meets a daylight-saving jump.

const pad = (n: number) => String(n).padStart(2, "0")
const ISO = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2}))?/

export const isDay = (s: string) => s.length === 10
export const dayOf = (s: string) => s.slice(0, 10)

export function toFloat(s: string): Date {
  const m = ISO.exec(s)
  if (!m) throw new Error(`not a date: ${s}`)
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0)))
}

export function fromFloat(d: Date, day: boolean): string {
  const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
  return day ? date : `${date}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

// a real Date (as the calendar hands them out), read in the local time zone
export function fromLocal(d: Date, day: boolean): string {
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return day ? date : `${date}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const today = () => fromLocal(new Date(), true)

// whatever a frontmatter value or a form field holds, as a wall-clock string
export function norm(value: unknown): string | undefined {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined
    // YAML 1.1 parsers read a bare date as midnight UTC
    const midnight = value.getUTCHours() === 0 && value.getUTCMinutes() === 0
    return fromFloat(value, midnight)
  }
  if (typeof value !== "string") return undefined
  const m = ISO.exec(value.trim())
  if (!m) return undefined
  const date = `${m[1]}-${m[2]}-${m[3]}`
  return m[4] === undefined ? date : `${date}T${pad(+m[4])}:${m[5]}`
}

export const addMinutes = (s: string, minutes: number) =>
  fromFloat(new Date(toFloat(s).getTime() + minutes * 60_000), isDay(s))

export const addDays = (s: string, days: number) => addMinutes(s, days * 1440)

export const diffMinutes = (from: string, to: string) =>
  Math.round((toFloat(to).getTime() - toFloat(from).getTime()) / 60_000)

export const diffDays = (from: string, to: string) =>
  Math.round(diffMinutes(dayOf(from), dayOf(to)) / 1440)

// the same instant in the other form: a day becomes midnight, a time loses its clock
export const asDay = (s: string) => dayOf(s)
export const asTime = (s: string, clock = "00:00") => (isDay(s) ? `${s}T${clock}` : s)

// 0 Sunday … 6 Saturday
export const weekday = (s: string) => toFloat(s).getUTCDay()
