// Ideas for papers, essays and pages (content/09-Learning/94-Ideas, template `T - Idea`).
// Usage: node scripts/ideas.mjs                      the board: every idea by stage, with its age
//        node scripts/ideas.mjs new "Title" ["Text"]  capture an idea now
// A new idea gets the time of capture (`captured: YYYY-MM-DDTHH:mm`), the text as its first
// statement, and under "Related notes" the published notes that share its vocabulary: suggestions
// to keep or delete.
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const VAULT = "content"
const IDEAS = path.join(VAULT, "09-Learning", "94-Ideas")
const TEMPLATE = path.join(VAULT, "_templates", "T - Idea.md")
const STAGES = ["spark", "exploring", "outlined", "drafting", "written", "dropped"]
const STALE_DAYS = 14 // a spark older than this needs a decision: explore it or drop it
const SKIP = new Set([
  "_templates",
  "_dashboards",
  "_private",
  "_inbox",
  "tags",
  "00-Meta",
  "09-Learning",
  ".obsidian",
  ".trash",
])

const pad = (n) => String(n).padStart(2, "0")
const now = new Date()
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`
const asList = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]).map(String)

function* notes(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* notes(full)
    else if (entry.name.endsWith(".md") && !["index.md", "README.md"].includes(entry.name))
      yield full
  }
}

// ── related notes ────────────────────────────────────────────────────────────

const STOP = new Set(
  "about actually after also another because before being between could currently does doing every first from have into just know like maybe more most much need other people really should some something such than that their them then there these they thing think thinking this those through under what when where which while will with would write writing your".split(
    " ",
  ),
)
// "voting", "voters", "votes" and "vote" should meet
const stem = (word) => word.replace(/(ing|ers|er|ed|es|s|e)$/, "")
const words = (text) =>
  new Set((text.toLowerCase().match(/\p{L}{4,}/gu) ?? []).filter((w) => !STOP.has(w)).map(stem))

function related(text, limit = 3) {
  const wanted = words(text)
  const pool = []
  for (const file of notes(VAULT)) {
    const { data, content } = matter(fs.readFileSync(file, "utf8"))
    if (data.draft === true) continue
    const name = path.basename(file, ".md")
    const body = (content.toLowerCase().match(/\p{L}{4,}/gu) ?? []).map(stem)
    pool.push({
      name,
      head: words([name, ...asList(data.aliases), ...asList(data.tags)].join(" ")),
      count: (w) => body.filter((b) => b === w).length,
    })
  }
  const scored = pool.map((note) => ({ name: note.name, score: 0 }))
  for (const w of wanted) {
    // a note counts for a word it names itself after, or keeps coming back to: the more often, the more
    const hit = pool.map((note) => {
      const n = note.count(w)
      return note.head.has(w) ? 2 : n >= 3 ? Math.min(n, 12) / 6 : 0
    })
    const carriers = hit.filter(Boolean).length
    if (carriers === 0) continue
    // a word that half the vault uses says little about any one note
    const rarity = Math.log(pool.length / carriers)
    hit.forEach((h, i) => (scored[i].score += h * rarity))
  }
  const best = Math.max(0, ...scored.map((s) => s.score))
  return scored
    .filter((s) => s.score >= 1.5 && s.score >= best / 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.name)
}

// ── new ──────────────────────────────────────────────────────────────────────

if (process.argv[2] === "new") {
  const title = (process.argv[3] ?? "").trim()
  const text = (process.argv[4] ?? "").trim()
  if (!title) {
    console.error('usage: make idea TITLE="Working title" [TEXT="The idea in a sentence or two"]')
    process.exit(1)
  }
  // characters Obsidian does not allow in a filename; the title keeps them
  const file = path.join(
    IDEAS,
    `${title
      .replace(/[\\/:*?"<>|#^[\]]/g, "")
      .replace(/\s+/g, " ")
      .trim()}.md`,
  )
  if (fs.existsSync(file)) {
    console.error(`exists: ${file}`)
    process.exit(1)
  }
  const links = related(`${title} ${text}`)
  let note = fs
    .readFileSync(TEMPLATE, "utf8")
    .replace('title: "{{title}}"', `title: ${JSON.stringify(title)}`)
    .replaceAll("{{title}}", title)
    .replaceAll("{{date}}", date)
    .replaceAll("{{time}}", time)
  if (text)
    note = note.replace(
      /^> One or two sentences.*$/m,
      text
        .split(/\r?\n/)
        .map((line) => `> ${line}`)
        .join("\n"),
    )
  if (links.length)
    note = note.replace(
      "- [[ ]]: what it contributes",
      links.map((name) => `- [[${name}]]: suggested, keep it if it fits`).join("\n"),
    )
  fs.writeFileSync(file, note)
  console.log(`captured ${date} ${time} → ${file}`)
  if (links.length) console.log(`possibly related: ${links.join(" · ")}`)
  process.exit(0)
}

// ── board ────────────────────────────────────────────────────────────────────

const ideas = []
for (const entry of fs.existsSync(IDEAS) ? fs.readdirSync(IDEAS) : []) {
  if (!entry.endsWith(".md") || entry === "index.md") continue
  const file = path.join(IDEAS, entry)
  const { data } = matter(fs.readFileSync(file, "utf8"))
  const captured = new Date(String(data.captured ?? data.created ?? ""))
  ideas.push({
    title: data.title ?? path.basename(entry, ".md"),
    stage: STAGES.includes(data.stage) ? data.stage : "spark",
    output: data.output ?? "",
    courses: asList(data.courses),
    draft: data.draft === true,
    age: isNaN(captured) ? undefined : Math.floor((now - captured) / 86400000),
    touched: Math.floor((now - fs.statSync(file).mtime) / 86400000),
  })
}
if (ideas.length === 0) {
  console.log('no ideas yet: make idea TITLE="Working title" TEXT="The idea in a sentence or two"')
  process.exit(0)
}
const days = (n) => (n === undefined ? "?" : n === 0 ? "today" : `${n}d`)
for (const stage of STAGES) {
  const group = ideas.filter((i) => i.stage === stage).sort((a, b) => (a.age ?? 0) - (b.age ?? 0))
  if (!group.length) continue
  console.log(`── ${stage} (${group.length})`)
  for (const i of group) {
    const meta = [i.output, ...i.courses, i.draft ? "draft" : ""].filter(Boolean).join(" · ")
    const stale =
      stage === "spark" && (i.touched ?? 0) >= STALE_DAYS
        ? "  → untouched: explore it or drop it"
        : ""
    console.log(`  ${days(i.age).padStart(5)}  ${i.title}${meta ? `  (${meta})` : ""}${stale}`)
  }
}
