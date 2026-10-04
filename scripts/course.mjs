// Exam readiness: what a course needs before its next assessment, built from the course map
// (09-Learning/93-Course-Maps, `course: <code>`) and the frontmatter of the notes.
// Usage: node scripts/course.mjs [CODE] [--sync]
//   without CODE  every course: next assessment, notes, objectives covered
//   CODE          assessments with days left, what is open before each, objectives, notes by maturity
//   --sync        rewrite the "Ready?" column of the map's objectives table from the notes' status.
//                 Only cells that were generated (☑ …, or "☐ no note yet") change; a hand-written
//                 remark such as "☐ partly: …" stays.
// The course map supplies three tables: Assessment (What | When | Form), Learning objectives
// (Objective | Notes | Ready?) and Sessions (Date | Theme | Notes). Dates are dd.mm.yyyy; session
// dates may leave the year out. Cards due for review live in the browser: see /flashcards.
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const VAULT = "content"
const SKIP = new Set(["_templates", "_dashboards", ".obsidian", ".trash"])
const STATUSES = ["seedling", "developing", "evergreen"]
const DAY = 24 * 60 * 60 * 1000

function* notes(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* notes(full)
    else if (entry.name.endsWith(".md")) yield full
  }
}

const asList = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]).map(String)
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`

const all = []
for (const file of notes(VAULT)) {
  try {
    const { data, content } = matter(fs.readFileSync(file, "utf8"))
    const rel = path.relative(VAULT, file)
    all.push({
      ...data,
      file: rel,
      name: path.basename(file, ".md"),
      content,
      courses: asList(data.courses),
      inbox: rel.startsWith("_inbox" + path.sep),
      cards: (content.match(/^> \[!qard\]/gim) ?? []).length,
    })
  } catch {
    console.warn(`! could not parse frontmatter: ${file}`)
  }
}
const byName = new Map(all.map((n) => [n.name, n]))
const maps = new Map(all.filter((n) => n.type === "moc" && n.course).map((n) => [n.course, n]))
const published = (n) => !n.inbox && n.draft !== true

// ── course map tables ────────────────────────────────────────────────────────

// the rows of the table under a `## <heading>`, each as { cells, line } (line: index in the file body)
function table(lines, heading) {
  const start = lines.findIndex((l) => l.startsWith("## ") && heading.test(l))
  if (start < 0) return []
  const rows = []
  for (let i = start + 1; i < lines.length && !lines[i].startsWith("## "); i++) {
    if (!lines[i].startsWith("|")) continue
    // a `|` inside [[Note|alias]] does not end a cell
    const cells = lines[i]
      .replace(/\[\[[^\]]*\]\]/g, (link) => link.replaceAll("|", "\u0000"))
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.replaceAll("\u0000", "|").trim())
    rows.push({ cells, line: i })
  }
  return rows.slice(2) // header and separator
}

const links = (cell) =>
  [...cell.matchAll(/\[\[([^\]|#]+)/g)].map((m) => m[1].trim().split("/").pop())

function parseMap(map) {
  const lines = map.content.split("\n")
  const year = Number(String(map.semester ?? "").match(/\d{4}/)?.[0]) || new Date().getFullYear()
  const autumn = /^HS/i.test(String(map.semester ?? ""))
  const assessments = table(lines, /Assessment/).map(({ cells: [what, when = "", form = ""] }) => {
    const d = when.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
    return { what, when, form, date: d ? new Date(+d[3], d[2] - 1, +d[1]) : undefined }
  })
  const objectives = table(lines, /Learning objectives/).map(({ cells, line }) => ({
    text: cells[0],
    notes: links(cells[1] ?? ""),
    ready: cells[2] ?? "",
    line,
  }))
  const sessions = table(lines, /Sessions/).map(
    ({ cells: [when = "", theme = "", linked = ""] }) => {
      const d = when.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})?/)
      // an autumn semester runs into January and February of the next year
      const y = d?.[3] ? +d[3] : year + (autumn && d && +d[2] < 8 ? 1 : 0)
      return {
        when,
        theme,
        notes: links(linked),
        date: d ? new Date(y, d[2] - 1, +d[1]) : undefined,
      }
    },
  )
  return { lines, assessments, objectives, sessions }
}

const today = new Date()
today.setHours(0, 0, 0, 0)
const daysUntil = (date) => Math.round((date - today) / DAY)
const inDays = (date) => {
  const n = daysUntil(date)
  return n === 0 ? "today" : n > 0 ? `in ${plural(n, "day")}` : `${plural(-n, "day")} ago`
}

const state = (name) => {
  const n = byName.get(name)
  return n ? `${n.status ?? "no status"}${n.inbox ? " (in `_inbox`)" : ""}` : "missing"
}
// what the "Ready?" cell of an objective says when it is derived from its notes
function readyCell(objective) {
  const generated = objective.ready === "" || /^☑|^☐( no note yet)?$/.test(objective.ready)
  if (!generated) return objective.ready
  if (objective.notes.length === 0) return "☐ no note yet"
  return `☑ ${[...new Set(objective.notes.map(state))].join(" / ")}`
}

// ── all courses ──────────────────────────────────────────────────────────────

const code = process.argv.slice(2).find((arg) => !arg.startsWith("--"))
const SYNC = process.argv.includes("--sync")

if (!code) {
  const codes = [...new Set([...maps.keys(), ...all.flatMap((n) => n.courses)])]
  if (codes.length === 0) {
    console.log("no notes carry a `courses:` code yet")
    process.exit(1)
  }
  const rows = codes.map((c) => {
    const hits = all.filter((n) => n.courses.includes(c) && n.type !== "idea")
    const map = maps.get(c)
    const { assessments = [], objectives = [] } = map ? parseMap(map) : {}
    const next = assessments
      .filter((a) => a.date && daysUntil(a.date) >= 0)
      .sort((a, b) => a.date - b.date)[0]
    return {
      c,
      next,
      notes: `${plural(hits.length, "note")}${hits.some((n) => n.inbox) ? `, ${hits.filter((n) => n.inbox).length} in _inbox` : ""}`,
      objectives: objectives.length
        ? `${objectives.filter((o) => o.notes.some((name) => byName.has(name))).length}/${objectives.length} objectives`
        : "no course map",
    }
  })
  rows.sort((a, b) => (a.next?.date ?? Infinity) - (b.next?.date ?? Infinity))
  console.log("usage: make course COURSE=<code>   (SYNC=1: update the map's Ready? column)\n")
  for (const r of rows)
    console.log(
      `  ${r.c.padEnd(16)} ${(r.next ? `${inDays(r.next.date)}: ${r.next.what}` : "no dated assessment").padEnd(36)} ${r.notes.padEnd(24)} ${r.objectives}`,
    )
  process.exit(0)
}

// ── one course ───────────────────────────────────────────────────────────────

// an idea for a paper belongs to the course, but it is not a note to learn from
const hits = all.filter((n) => n.courses.includes(code) && n.type !== "idea")
const ideas = all.filter((n) => n.courses.includes(code) && n.type === "idea")
const map = maps.get(code)
console.log(`${map?.title ?? code} · ${code}`)

if (!map) {
  console.log("  no course map with `course: " + code + "` in 09-Learning/93-Course-Maps")
} else {
  const { lines, assessments, objectives, sessions } = parseMap(map)

  if (assessments.length) console.log("\n── assessments")
  const listed = new Set() // an open item is named under the first assessment it matters for
  for (const a of [...assessments].sort((x, y) => (x.date ?? Infinity) - (y.date ?? Infinity))) {
    const when = a.date ? inDays(a.date) : "no date"
    console.log(`  ${when.padEnd(12)} ${a.what} (${a.when})`)
    if (!a.date || daysUntil(a.date) < 0) continue
    // what was taught up to that day and is not ready
    const taught = sessions.filter((s) => s.date && s.date <= a.date)
    if (taught.length === 0) continue
    const names = [...new Set(taught.flatMap((s) => s.notes))]
    const open = [
      ...taught.filter((s) => s.notes.length === 0).map((s) => `no note: ${s.when} ${s.theme}`),
      ...names.filter((n) => !byName.has(n)).map((n) => `missing: [[${n}]]`),
      ...names.filter((n) => byName.get(n)?.inbox).map((n) => `in _inbox: ${n}`),
      ...names
        .filter((n) => byName.has(n) && !byName.get(n).inbox && byName.get(n).status === "seedling")
        .map((n) => `seedling: ${n}`),
    ]
    const indent = " ".repeat(15)
    const fresh = open.filter((item) => !listed.has(item))
    for (const item of fresh) console.log(`${indent}☐ ${item}`)
    if (open.length > fresh.length)
      console.log(`${indent}… and the ${plural(open.length - fresh.length, "open item")} above`)
    if (open.length === 0)
      console.log(`${indent}☑ every session up to then has a published, developed note`)
    for (const item of open) listed.add(item)
  }

  if (objectives.length) {
    const covered = objectives.filter((o) => o.notes.some((n) => byName.has(n))).length
    console.log(`\n── objectives (${covered} of ${objectives.length} have a note)`)
    for (const o of objectives)
      console.log(
        `  ${readyCell(o).startsWith("☑") ? "☑" : "☐"} ${o.text}\n      ${readyCell(o).slice(2)}`,
      )

    const stale = objectives.filter((o) => readyCell(o) !== o.ready)
    if (SYNC && stale.length) {
      for (const o of stale) {
        const at = lines[o.line].lastIndexOf("|", lines[o.line].length - 2)
        lines[o.line] = `${lines[o.line].slice(0, at)}| ${readyCell(o)} |`
      }
      const file = path.join(VAULT, map.file)
      const raw = fs.readFileSync(file, "utf8")
      fs.writeFileSync(file, raw.slice(0, raw.length - map.content.length) + lines.join("\n"))
      console.log(`\n→ updated ${plural(stale.length, "Ready? cell")} in ${map.file}`)
    } else if (stale.length) {
      console.log(
        `\n→ ${plural(stale.length, "Ready? cell")} in the course map out of date: make course COURSE=${code} SYNC=1`,
      )
    }
  }
}

const cards = hits.reduce((n, note) => n + note.cards, 0)
const live = hits.filter(published)
console.log(
  `\n── notes (${hits.length}: ${live.length} on the site, ${hits.filter((n) => n.inbox).length} in _inbox) · ` +
    `${plural(cards, "card")}, ${live.reduce((n, note) => n + note.cards, 0)} on the site`,
)
for (const status of [...STATUSES, undefined]) {
  const group = hits.filter((n) => (status ? n.status === status : !STATUSES.includes(n.status)))
  if (!group.length) continue
  console.log(`  ${status ?? "no status"} (${group.length})`)
  for (const n of group)
    console.log(`    ${String(n.type ?? "").padEnd(10)} ${n.file}  (${plural(n.cards, "card")})`)
}
if (ideas.length) {
  console.log(`\n── ideas (${ideas.length})`)
  for (const n of ideas) console.log(`    ${String(n.stage ?? "spark").padEnd(10)} ${n.file}`)
}
