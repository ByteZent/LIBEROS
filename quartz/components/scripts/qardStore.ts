// Review history of the flashcards, kept in this browser's localStorage (see flashcards.inline.ts).
// A Leitner system: a card you knew when it was due moves up one box and comes back after that
// box's interval; a card you missed goes back to box 1 and is due the next day; a card that was
// hard stays in its box and comes back after half that box's interval.
// A leech is a card missed on LEECH or more days: a sign that the card or its note needs rewriting.
// Cards are keyed by the id Plugin.Qards() gives them, so a card keeps its history in every deck
// it appears in, and loses it when its question is reworded.

export interface CardState {
  box: number // 1…INTERVALS.length; a card without a state is new
  due: string // YYYY-MM-DD, local time
  seen: number // days on which the card was rated
  missed: number // days on which it was missed
  last: string // day of the last rating
}

export type Progress = Record<string, CardState>

const KEY = "liberos-qards"
// days until the next review, by box
export const INTERVALS = [1, 3, 7, 14, 30, 60, 120]
export const LEECH = 3
export type Rating = "known" | "hard" | "missed"

export function day(offset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function loadProgress(): Progress {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? "{}")
    return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {}
  } catch {
    return {}
  }
}

export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // private mode or a full store: the session still works, it is just not remembered
  }
}

export const isNew = (progress: Progress, id: string) => !progress[id]
export const isDue = (progress: Progress, id: string, today = day()) =>
  !progress[id] || progress[id].due <= today
export const isLeech = (progress: Progress, id: string) => (progress[id]?.missed ?? 0) >= LEECH

// Only the first answer of the day moves a card up: knowing it again in "Repeat missed" or in a
// second run does not count. A miss always sends it back.
export function rateCard(progress: Progress, id: string, rating: Rating) {
  const today = day()
  const state = progress[id] ?? { box: 0, due: today, seen: 0, missed: 0, last: "" }
  const firstToday = state.last !== today
  if (rating === "known") {
    if (state.due > today) return
    state.box = Math.min(state.box + 1, INTERVALS.length)
    state.due = day(INTERVALS[state.box - 1])
  } else if (rating === "hard") {
    state.box = Math.max(state.box, 1)
    state.due = day(Math.max(1, Math.round(INTERVALS[state.box - 1] / 2)))
  } else {
    if (firstToday || state.box > 1) state.missed++
    state.box = 1
    state.due = day(INTERVALS[0])
  }
  if (firstToday) state.seen++
  state.last = today
  progress[id] = state
}

// keeps only well-formed entries of an imported file; the later due date does not win, the import does
export function mergeProgress(progress: Progress, imported: unknown): number {
  if (!imported || typeof imported !== "object" || Array.isArray(imported)) return 0
  let count = 0
  for (const [id, value] of Object.entries(imported as Record<string, Partial<CardState>>)) {
    if (!value || typeof value.box !== "number" || !/^\d{4}-\d{2}-\d{2}$/.test(value.due ?? ""))
      continue
    progress[id] = {
      box: Math.min(Math.max(Math.round(value.box), 1), INTERVALS.length),
      due: value.due!,
      seen: Number(value.seen) || 0,
      missed: Number(value.missed) || 0,
      last: typeof value.last === "string" ? value.last : "",
    }
    count++
  }
  return count
}
