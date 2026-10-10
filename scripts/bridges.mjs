// Bridge prompts: pairs of notes that share tags but do not link to each other, most specific
// overlap first. Each pair is a question for a Key Connections line, an open question or a synthesis.
// (Notes that already name each other under `## Key Connections` become "How does X relate to Y?"
// cards on the site: /flashcards/connections.)
// Usage: node scripts/bridges.mjs [--inbox] [N]
//   default   published notes only, the 15 strongest pairs
//   --inbox   also read _inbox
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const VAULT = "content"
const INBOX = process.argv.includes("--inbox")
const TOP = Number(process.argv.slice(2).find((arg) => /^\d+$/.test(arg))) || 15
const SKIP = new Set([
  "_templates",
  "_dashboards",
  "_private",
  "tags",
  "00-Meta",
  "09-Learning",
  ".obsidian",
  ".trash",
])
if (!INBOX) SKIP.add("_inbox")
// a tag that only repeats the note's type says nothing about its subject
const TYPE_TAGS = new Set([
  "concept",
  "model",
  "actor",
  "thinker",
  "work",
  "case",
  "judgment",
  "norm",
  "assessment",
  "development",
  "brief",
  "framework",
  "synthesis",
  "source",
  "question",
  "moc",
  "meta",
])

function* notes(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* notes(full)
    else if (entry.name.endsWith(".md") && !["index.md", "README.md"].includes(entry.name))
      yield full
  }
}

const asList = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]).map(String)

const all = []
const byName = new Map() // filename and aliases → note
for (const file of notes(VAULT)) {
  const { data, content } = matter(fs.readFileSync(file, "utf8"))
  if (data.draft === true && !INBOX) continue
  const note = {
    name: path.basename(file, ".md"),
    tags: new Set(asList(data.tags).filter((t) => !TYPE_TAGS.has(t) && !t.startsWith("course/"))),
    courses: asList(data.courses),
    targets: [...content.matchAll(/\[\[([^\]|#]+)/g)].map((m) =>
      m[1].trim().split("/").pop().toLowerCase(),
    ),
  }
  all.push(note)
  for (const key of [note.name, ...asList(data.aliases)]) byName.set(key.toLowerCase(), note)
}
for (const note of all) note.links = new Set(note.targets.map((t) => byName.get(t)).filter(Boolean))

// a tag carried by few notes says more than one carried by many
const count = new Map()
for (const note of all) for (const tag of note.tags) count.set(tag, (count.get(tag) ?? 0) + 1)
const weight = (tag) => Math.log(all.length / count.get(tag)) + 0.1

const pairs = []
for (let i = 0; i < all.length; i++) {
  for (let j = i + 1; j < all.length; j++) {
    const [a, b] = [all[i], all[j]]
    if (a.links.has(b) || b.links.has(a)) continue
    const shared = [...a.tags].filter((tag) => b.tags.has(tag))
    if (shared.length === 0) continue
    const across = !a.courses.some((c) => b.courses.includes(c))
    // a link between two courses is worth more than one inside a course
    const score = shared.reduce((sum, tag) => sum + weight(tag), 0) * (across ? 1.25 : 1)
    pairs.push({ a, b, shared, across, score })
  }
}
pairs.sort((x, y) => y.score - x.score || x.a.name.localeCompare(y.a.name))

console.log(
  `${pairs.length} unlinked pairs with a shared tag among ${all.length} notes${INBOX ? " (incl. _inbox)" : ""}\n`,
)
for (const { a, b, shared, across } of pairs.slice(0, TOP)) {
  console.log(`How does ${a.name} relate to ${b.name}?`)
  console.log(`    shared: ${shared.join(", ")}${across ? "  · different courses" : ""}`)
}
