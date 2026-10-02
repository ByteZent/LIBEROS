// Note lint: checks that flashcards and self-tests follow the vault's conventions.
// Usage: node scripts/lint.mjs
// Errors (exit 1) in published notes, warnings in _inbox and _private (they are not on the site yet):
//   - a note has [!qard] cards but no `qard-deck` (it would become a deck of its own, named after the file)
//   - a `## Self-Test` heading without an identifier (expected: `## Self-Test: <topic>`)
//   - a `[!question]` callout inside a Self-Test section (expected: `[!qard]`)
// Warnings everywhere:
//   - `qard-deck` is not one of the note's `courses`
//   - a concept, model or framework note without any card
//   - a Self-Test with only recall cards (no card that asks to apply, compare or judge)
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const VAULT = "content"
const SKIP = new Set(["_templates", "_dashboards", "tags", ".obsidian", ".trash"])
const UNPUBLISHED = new Set(["_inbox", "_private"])
const NEEDS_CARDS = new Set(["concept", "model", "framework"])
// a card that makes you use the idea, not just recall it
const DEEP =
  /\b(apply|compare|contrast|differ|distinguish|versus|vs\.?|why|explain|judge|assess|evaluate|predict|what (would|happens|changes|follows)|how (would|does|do|can|could)|case|scenario|example|limit|critici[sz]e)\b/i

function* notes(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* notes(full)
    else if (entry.name.endsWith(".md") && entry.name !== "README.md") yield full
  }
}

const asList = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]).map(String)

let errors = 0
let warnings = 0
for (const file of notes(VAULT)) {
  const rel = path.relative(VAULT, file)
  const published = !UNPUBLISHED.has(rel.split(path.sep)[0])
  const problems = [] // [isError, message]
  let parsed
  try {
    parsed = matter(fs.readFileSync(file, "utf8"))
  } catch {
    problems.push([true, "frontmatter cannot be parsed"])
    parsed = { data: {}, content: "" }
  }
  const { data, content } = parsed

  const cards = []
  let inSelfTest = false
  let fence = false
  for (const line of content.split("\n")) {
    if (/^(```|~~~)/.test(line)) fence = !fence
    if (fence) continue
    if (/^#{1,6} /.test(line)) {
      inSelfTest = /^## Self-Test/.test(line)
      if (/^## Self-Test\s*:?\s*$/.test(line))
        problems.push([published, "`## Self-Test` has no identifier (use `## Self-Test: <topic>`)"])
    }
    const card = line.match(/^> \[!qard\][-+]?\s*(.*)$/i)
    if (card) cards.push(card[1])
    if (inSelfTest && /^> \[!question\]/i.test(line))
      problems.push([published, "`[!question]` in the Self-Test (use `[!qard]`)"])
  }

  const deck = typeof data["qard-deck"] === "string" ? data["qard-deck"].trim() : ""
  const courses = asList(data.courses)
  if (cards.length > 0 && !deck)
    problems.push([published, `${cards.length} cards but no \`qard-deck\``])
  if (published && deck && courses.length > 0 && !courses.includes(deck))
    problems.push([
      false,
      `\`qard-deck: ${deck}\` is not one of its courses (${courses.join(", ")})`,
    ])
  if (cards.length === 0 && NEEDS_CARDS.has(data.type))
    problems.push([false, `${data.type} note without cards`])
  if (cards.length > 0 && !cards.some((q) => DEEP.test(q)))
    problems.push([false, "only recall cards: add one that asks to apply or compare"])

  for (const [isError, message] of problems) {
    if (isError) errors++
    else warnings++
    console.log(`${isError ? "error" : "warn "}  ${rel}: ${message}`)
  }
}
console.log(`${errors} error(s), ${warnings} warning(s)`)
process.exit(errors ? 1 : 0)
