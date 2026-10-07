// Exam and hand-in dates, read from the course maps (09-Learning/93-Course-Maps): a note with
// `type: moc` and `course: <code>` whose `## Assessment` table has the columns What | When | Form.
// A row counts if "When" names a day as dd.mm.yyyy; "August 2027" is too vague for a calendar.
import { Item } from "./types"

export const EXAM_CATEGORY = "Exam"

const cells = (line: string) =>
  line
    .replace(/\[\[[^\]]*\]\]/g, (link) => link.replaceAll("|", "\u0000"))
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.replaceAll("\u0000", "|").trim())

const plain = (cell: string) =>
  cell
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/[*_`]/g, "")
    .trim()

export function scan(data: Record<string, unknown>, text: string, path: string): Item[] {
  if (data.type !== "moc" || !data.course) return []
  const course = String(data.course)
  const lines = text.split("\n")
  const heading = lines.findIndex((l) => /^##\s+Assessment/i.test(l))
  if (heading < 0) return []
  const items: Item[] = []
  let row = 0
  for (let i = heading + 1; i < lines.length && !lines[i].startsWith("## "); i++) {
    if (!lines[i].trimStart().startsWith("|")) continue
    if (row++ < 2) continue // header and separator
    const [what, when, form] = cells(lines[i])
    const date = /(\d{1,2})\.(\d{1,2})\.(\d{4})/.exec(when ?? "")
    if (!what || !date) continue
    const day = `${date[3]}-${date[2].padStart(2, "0")}-${date[1].padStart(2, "0")}`
    const time = /(\d{1,2})[:.](\d{2})\s*(?:h|Uhr)?\s*$/.exec(
      when.slice(date.index + date[0].length),
    )
    items.push({
      id: `deadline:${path}:${i}`,
      source: "deadline",
      kind: "deadline",
      path,
      line: i,
      title: plain(what),
      start: time ? `${day}T${time[1].padStart(2, "0")}:${time[2]}` : day,
      status: "open",
      category: EXAM_CATEGORY,
      tags: [`course/${course}`],
      course,
      description: form ? plain(form) : undefined,
      readonly: true,
    })
  }
  return items
}
