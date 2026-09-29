// Exam prep: list every vault note tagged with a course code, grouped by maturity.
// Usage: node scripts/course.mjs [CODE]   (without CODE: list all codes in use)
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const VAULT = "content"
const SKIP = new Set(["_templates", "_dashboards", ".obsidian", ".trash"])
const STATUSES = ["seedling", "developing", "evergreen"]

function* notes(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* notes(full)
    else if (entry.name.endsWith(".md")) yield full
  }
}

const asList = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]).map(String)

const all = []
for (const file of notes(VAULT)) {
  try {
    const { data } = matter(fs.readFileSync(file, "utf8"))
    all.push({ file: path.relative(VAULT, file), courses: asList(data.courses), ...data })
  } catch {
    console.warn(`! could not parse frontmatter: ${file}`)
  }
}

const code = process.argv[2]
if (!code) {
  const counts = {}
  for (const n of all) for (const c of n.courses) counts[c] = (counts[c] ?? 0) + 1
  const codes = Object.entries(counts).sort()
  console.log("usage: make course COURSE=<code>")
  console.log(codes.length ? "codes in use:" : "no notes carry a `courses:` code yet")
  for (const [c, n] of codes) console.log(`  ${c.padEnd(16)} ${n} note(s)`)
  process.exit(codes.length ? 0 : 1)
}

const hits = all.filter((n) => n.courses.includes(code))
console.log(`${code}: ${hits.length} note(s)`)
for (const status of [...STATUSES, undefined]) {
  const group = hits.filter((n) => (status ? n.status === status : !STATUSES.includes(n.status)))
  if (!group.length) continue
  console.log(`── ${status ?? "no status"} (${group.length})`)
  for (const n of group)
    console.log(
      `  ${String(n.type ?? "").padEnd(10)} ${n.file}${n.review ? `  (review ${n.review instanceof Date ? n.review.toISOString().slice(0, 10) : n.review})` : ""}`,
    )
}
const seedlings = hits.filter((n) => n.status === "seedling").length
if (seedlings) console.log(`\n→ ${seedlings} seedling(s) to develop before the exam`)
