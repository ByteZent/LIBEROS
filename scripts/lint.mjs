// Note lint: checks that flashcards, self-tests, places and developments follow the vault's conventions.
// Usage: node scripts/lint.mjs
// Errors (exit 1) in published notes, warnings in _inbox and _private (they are not on the site yet):
//   - a note has [!qard] cards but no `qard-deck` (it would become a deck of its own, named after the file)
//   - a `## Self-Test` heading without an identifier (expected: `## Self-Test: <topic>`)
//   - a `[!question]` callout inside a Self-Test section (expected: `[!qard]`)
//   - an image card (`<!-- qard-hide: Label; … -->`) without an SVG above the comment, or naming
//     a label the SVG does not have
//   - `iso` that is not an ISO 3166-1 alpha-3 code, `geo` that is not `[lat, lon]`
//   - a development (`type: development`) without `event_date`, `domain` or `source`, with a
//     `source` that is neither a URL nor a citekey of the library, or without a place on the map
//     (see scripts/places.mjs), or with an `indicator` that no assessment declares
//   - an assessment whose `indicators` is not a map of key and text, or declares a key that
//     another assessment has already
// Warnings everywhere:
//   - `qard-deck` is not one of the note's `courses` (practice questions are exempt: `type: practice`)
//   - a calculation card with `<!-- qard-variant -->` where a variant has no `<!-- qard-answer -->`
//   - `qard-sets` on a note without cards, or naming the note's own `qard-deck`
//   - a concept, model or framework note without any card
//   - a Self-Test with only recall cards (no card that asks to apply, compare or judge)
//   - a development with a `domain` the standards do not list, or an entry in `actors` without a note
//   - an `iso` the map does not have (quartz/static/world.json)
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { parseBib } from "./bib.mjs"
import { linkTarget, noteIndex, placeProblems, resolveLocation } from "./places.mjs"

const VAULT = "content"
const SKIP = new Set(["_templates", "_dashboards", "tags", ".obsidian", ".trash"])
const UNPUBLISHED = new Set(["_inbox", "_private"])
const NEEDS_CARDS = new Set(["concept", "model", "framework"])
const LIBRARY = "bibliography/library.bib"
const WORLD = "quartz/static/world.json"
const DOMAINS = new Set(
  "strategy military policy economics law ir security intelligence technology psychology sociology".split(
    " ",
  ),
)
// a card that makes you use the idea, not just recall it
const DEEP =
  /\b(draw|zeichn\w*|skizzier\w*|apply|compare|contrast|differ|distinguish|versus|vs\.?|why|explain|judge|assess|evaluate|predict|what (would|happens|changes|follows)|how (would|does|do|can|could)|case|scenario|example|limit|critici[sz]e|weshalb|warum|wieso|inwiefern|erkl[äa]r\w*|erl[äa]uter\w*|vergleich\w*|unterscheid\w*|unterschied\w*|beurteil\w*|bewert\w*|beispiel\w*)\b/i

function* notes(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* notes(full)
    else if (entry.name.endsWith(".md") && entry.name !== "README.md") yield full
  }
}

// every SVG in the vault by filename, for the image cards
const svgs = new Map()
const collectSvgs = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) collectSvgs(path.join(dir, entry.name))
    else if (entry.name.endsWith(".svg")) svgs.set(entry.name, path.join(dir, entry.name))
  }
}
collectSvgs(VAULT)
// the text of an SVG label as it is compared with a qard-hide entry (see transformers/qards.ts)
const label = (text) =>
  text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
const svgLabels = (file) =>
  [...fs.readFileSync(file, "utf8").matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map((m) =>
    label(m[1]),
  )

const asList = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]).map(String)

// for the developments: every note by name, and the citekeys a `source` may name
const index = noteIndex(notes(VAULT))
const citekeys = new Set(
  fs.existsSync(LIBRARY) ? parseBib(fs.readFileSync(LIBRARY, "utf8")).map((e) => e.key) : [],
)
const mapped = fs.existsSync(WORLD)
  ? new Set(Object.keys(JSON.parse(fs.readFileSync(WORLD, "utf8")).points))
  : null
// indicator key → the assessments that declare it
const indicators = new Map()
for (const note of new Set(index.values()))
  if (note.data.type === "assessment" && typeof note.data.indicators === "object")
    for (const key of Object.keys(note.data.indicators ?? {}))
      indicators.set(key, [...(indicators.get(key) ?? []), note.file])

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
  let images = [] // SVGs embedded in the current callout so far
  let variants = 0 // `qard-variant` and `qard-answer` markers in the current callout
  let answers = 0
  const closeCard = () => {
    if (variants > 0 && answers < variants + 1)
      problems.push([
        published,
        `a card has ${variants + 1} variants but ${answers} \`qard-answer\`: each variant needs its givens above the marker`,
      ])
    variants = answers = 0
  }
  for (const line of content.split("\n")) {
    if (/^(```|~~~)/.test(line)) fence = !fence
    if (fence) continue
    if (!line.startsWith(">") || /^> \[!/.test(line)) {
      images = []
      closeCard()
    }
    if (/^>\s*<!--\s*qard-variant\b/.test(line)) variants++
    if (/^>\s*<!--\s*qard-answer\b/.test(line)) answers++
    images.push(...[...line.matchAll(/!\[\[([^\]|]+\.svg)/gi)].map((m) => path.basename(m[1])))
    const hide = line.match(/<!--\s*qard-hide\s*:(.*?)-->/)
    if (hide) {
      const known = images
        .filter((name) => svgs.has(name))
        .flatMap((name) => svgLabels(svgs.get(name)))
      if (known.length === 0)
        problems.push([published, "`qard-hide` without an SVG above it in the card"])
      else
        for (const entry of hide[1]
          .split(";")
          .map((e) => e.trim())
          .filter(Boolean))
          if (!known.includes(label(entry)))
            problems.push([published, `\`qard-hide\`: no label "${entry}" in ${images.join(", ")}`])
    }
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

  closeCard()

  const deck = typeof data["qard-deck"] === "string" ? data["qard-deck"].trim() : ""
  const courses = asList(data.courses)
  if (cards.length > 0 && !deck)
    problems.push([published, `${cards.length} cards but no \`qard-deck\``])
  // a set of practice questions has a deck of its own, named after the set
  if (
    published &&
    deck &&
    data.type !== "practice" &&
    courses.length > 0 &&
    !courses.includes(deck)
  )
    problems.push([
      false,
      `\`qard-deck: ${deck}\` is not one of its courses (${courses.join(", ")})`,
    ])
  // card sets the note's cards are in as well (`qard-sets: ["MikroEcon Test 1"]`)
  const sets = asList(data["qard-sets"])
  if (sets.length > 0 && cards.length === 0)
    problems.push([false, `\`qard-sets\` (${sets.join(", ")}) but no cards`])
  if (deck && sets.includes(deck))
    problems.push([false, `\`qard-sets\` names the note's own deck (${deck})`])
  if (cards.length === 0 && NEEDS_CARDS.has(data.type))
    problems.push([false, `${data.type} note without cards`])
  if (cards.length > 0 && !cards.some((q) => DEEP.test(q)))
    problems.push([false, "only recall cards: add one that asks to apply or compare"])

  for (const message of placeProblems(data)) problems.push([published, message])
  if (
    mapped &&
    typeof data.iso === "string" &&
    /^[A-Z]{3}$/.test(data.iso) &&
    !mapped.has(data.iso)
  )
    problems.push([false, `\`iso: ${data.iso}\` is not on the map`])
  if (data.type === "assessment" && data.indicators != null) {
    if (typeof data.indicators !== "object" || Array.isArray(data.indicators))
      problems.push([published, "`indicators` is not a map (`key: text` on each line)"])
    else
      for (const key of Object.keys(data.indicators))
        if (indicators.get(key).length > 1 && indicators.get(key)[0] !== file)
          problems.push([
            published,
            `indicator \`${key}\` is declared in ${path.relative(VAULT, indicators.get(key)[0])} already`,
          ])
  }
  if (data.type === "development") {
    const date = data.event_date
    if (!(date instanceof Date ? !isNaN(date) : /^\d{4}-\d{2}-\d{2}$/.test(String(date ?? ""))))
      problems.push([published, "development without `event_date` (YYYY-MM-DD)"])
    const domains = asList(data.domain)
    if (domains.length === 0) problems.push([published, "development without `domain`"])
    for (const domain of domains)
      if (!DOMAINS.has(domain))
        problems.push([false, `\`domain: ${domain}\` is not in the standards`])
    const source = typeof data.source === "string" ? data.source.trim() : ""
    if (!source) problems.push([published, "development without `source` (URL or citekey)"])
    else if (!/^https?:\/\/\S+$/.test(source) && !citekeys.has(source.replace(/^@/, "")))
      problems.push([
        published,
        `\`source: ${source}\` is neither a URL nor a citekey of the library`,
      ])
    for (const actor of asList(data.actors))
      if (!index.has(linkTarget(actor))) problems.push([false, `\`actors\`: no note "${actor}"`])
    for (const message of resolveLocation(data, index).problems) problems.push([published, message])
    for (const key of asList(data.indicator))
      if (!indicators.has(key))
        problems.push([published, `\`indicator: ${key}\` is declared by no assessment`])
  }

  for (const [isError, message] of problems) {
    if (isError) errors++
    else warnings++
    console.log(`${isError ? "error" : "warn "}  ${rel}: ${message}`)
  }
}
console.log(`${errors} error(s), ${warnings} warning(s)`)
process.exit(errors ? 1 : 0)
