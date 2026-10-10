// Weekly brief: the developments of one week by place, the indicators they fired and what to
// watch next, as a note in 05-Assessments/53-Weekly-Briefs. Also the re-assess list of `make review`.
//
//   node scripts/brief.mjs [YYYY-Www | last] [--inbox]   write the brief (default: this week)
//   node scripts/brief.mjs --reassess                    list the assessments an indicator overtook
//
//   --inbox   also read _inbox; the brief then goes to _inbox as well, as a preview
//
// An assessment declares its indicators in the frontmatter (`indicators: { key: text }`), a
// development names the one it bears on (`indicator: key`). An assessment is to re-assess when a
// development that fired one of its indicators is newer than its `as_of`.
// Everything is written anew on each run, except what I wrote under "Assessment of the week".
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { pathToFileURL } from "url"
import { asList, noteIndex, resolveLocation } from "./places.mjs"

const VAULT = "content"
const OUT = path.join(VAULT, "05-Assessments", "53-Weekly-Briefs")
const WORLD = "quartz/static/world.json"
const OWN = "## Assessment of the week"
const SKIP = new Set(["_templates", "_dashboards", "_private", "tags", ".obsidian", ".trash"])
const DAY = 24 * 60 * 60 * 1000

function* notes(dir, skip) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* notes(full, skip)
    else if (entry.name.endsWith(".md") && !["index.md", "README.md"].includes(entry.name))
      yield full
  }
}

const day = (value) => {
  const text = value instanceof Date && !isNaN(value) ? value.toISOString() : String(value ?? "")
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : undefined
}

/** The first paragraph of a note's [!bluf] callout, on one line. */
const bluf = (content) => {
  const lines = content.split("\n")
  const start = lines.findIndex((line) => /^> \[!bluf\]/i.test(line))
  if (start < 0) return ""
  const text = []
  for (const line of lines.slice(start + 1)) {
    if (!/^>\s*\S/.test(line)) break
    text.push(line.replace(/^>\s*/, ""))
  }
  return text.join(" ")
}

/** The developments (newest first) and the assessments with their indicators. */
export function readWatch({ inbox = false } = {}) {
  const skip = new Set(SKIP)
  if (!inbox) skip.add("_inbox")
  const files = [...notes(VAULT, skip)]
  const index = noteIndex(files)
  const world = fs.existsSync(WORLD) ? JSON.parse(fs.readFileSync(WORLD, "utf8")) : { points: {} }
  const placeName = (place) =>
    place.iso ? (world.points[place.iso]?.name ?? place.iso) : (place.name ?? place.geo.join(", "))

  const developments = []
  const assessments = []
  for (const file of files) {
    let parsed
    try {
      parsed = matter(fs.readFileSync(file, "utf8"))
    } catch {
      continue
    }
    const { data, content } = parsed
    const note = { file, name: path.basename(file, ".md"), title: data.title ?? "" }
    if (data.type === "development" && day(data.event_date)) {
      const { places, global } = resolveLocation(data, index)
      developments.push({
        ...note,
        date: day(data.event_date),
        domain: asList(data.domain).map(String),
        places: places.map(placeName),
        global,
        indicators: asList(data.indicator).map(String),
        summary: bluf(content),
      })
    }
    const declared = data.indicators
    if (data.type === "assessment" && declared && typeof declared === "object")
      assessments.push({ ...note, asOf: day(data.as_of), declared: Object.entries(declared) })
  }
  developments.sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name))
  for (const assessment of assessments) {
    assessment.indicators = assessment.declared.map(([key, text]) => {
      const fired = developments.filter((d) => d.indicators.includes(key))
      const open = fired.filter((d) => !assessment.asOf || d.date > assessment.asOf)
      return { key, text: String(text), fired, open }
    })
    assessment.reassess = assessment.indicators.some((i) => i.open.length > 0)
  }
  return { developments, assessments }
}

/** Monday and Sunday (YYYY-MM-DD) of an ISO week, and its name: "2026-W41", "last", or this week. */
function week(arg) {
  let monday
  const named = /^(\d{4})-W(\d{2})$/.exec(arg ?? "")
  if (named) {
    // the week with the year's first Thursday is week 1, so 4 January is always in it
    const jan4 = Date.UTC(Number(named[1]), 0, 4)
    const first = jan4 - ((new Date(jan4).getUTCDay() + 6) % 7) * DAY
    monday = first + (Number(named[2]) - 1) * 7 * DAY
  } else {
    const now = new Date()
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    monday = today - ((new Date(today).getUTCDay() + 6) % 7) * DAY - (arg === "last" ? 7 * DAY : 0)
  }
  const thursday = new Date(monday + 3 * DAY)
  const jan4 = Date.UTC(thursday.getUTCFullYear(), 0, 4)
  const first = jan4 - ((new Date(jan4).getUTCDay() + 6) % 7) * DAY
  const number = Math.round((monday - first) / (7 * DAY)) + 1
  return {
    name: `${thursday.getUTCFullYear()}-W${String(number).padStart(2, "0")}`,
    from: day(new Date(monday)),
    to: day(new Date(monday + 6 * DAY)),
  }
}

function brief({ developments, assessments }, { name, from, to }, own) {
  const inWeek = developments.filter((d) => d.date >= from && d.date <= to)
  const byPlace = new Map()
  for (const d of inWeek) {
    const place = d.places[0] ?? (d.global ? "Global" : "No place")
    byPlace.set(place, [...(byPlace.get(place) ?? []), d])
  }
  const fired = assessments.flatMap((a) =>
    a.indicators.flatMap((i) =>
      i.fired.filter((d) => inWeek.includes(d)).map((d) => ({ a, i, d })),
    ),
  )
  const reassess = assessments.filter((a) => a.reassess)
  const today = new Date().toLocaleDateString("sv-SE")
  const count = (n, one, many) => `${n} ${n === 1 ? one : many}`
  const lines = [
    "---",
    `title: "Weekly Brief ${name}"`,
    "type: brief",
    `period: ${from}/${to}`,
    `created: ${today}`,
    `modified: ${today}`,
    "tags:",
    "  - brief",
    "draft: false",
    "---",
    "",
    "> [!bluf]",
    `> ${from} to ${to}: ${count(inWeek.length, "development", "developments")} in ${count(byPlace.size, "place", "places")}, ${count(fired.length, "indicator", "indicators")} fired, ${count(reassess.length, "assessment", "assessments")} to re-assess.`,
    "",
    OWN,
    "",
    own || "> [!assessment] Assessment\n> What the week adds up to, and how confident I am.",
    "",
    "## Developments",
    "",
  ]
  if (inWeek.length === 0) lines.push("None recorded.", "")
  for (const place of [...byPlace.keys()].sort()) {
    lines.push(`### ${place}`, "")
    for (const d of byPlace.get(place)) {
      const also = d.places.length > 1 ? `; also ${d.places.slice(1).join(", ")}` : ""
      lines.push(
        `- **${d.date}** [[${d.name}]] (${d.domain.join(", ")}${also})${d.summary ? `: ${d.summary}` : ""}`,
      )
    }
    lines.push("")
  }
  lines.push("## Indicators", "")
  if (fired.length === 0) lines.push("None fired this week.", "")
  else {
    for (const { a, i, d } of fired) lines.push(`- [[${a.name}]]: *${i.text}*, by [[${d.name}]]`)
    lines.push("")
  }
  if (reassess.length > 0) {
    lines.push("## To re-assess", "")
    for (const a of reassess)
      lines.push(
        `- [[${a.name}]]${a.asOf ? `, as of ${a.asOf}` : ""}: ${count(a.indicators.filter((i) => i.open.length > 0).length, "indicator", "indicators")} fired since`,
      )
    lines.push("")
  }
  const pending = assessments.flatMap((a) =>
    a.indicators.filter((i) => i.fired.length === 0).map((i) => ({ a, i })),
  )
  lines.push("## To watch", "")
  if (pending.length === 0) lines.push("No indicator is waiting.", "")
  else {
    for (const { a, i } of pending) lines.push(`- ${i.text} ([[${a.name}]])`)
    lines.push("")
  }
  return lines.join("\n")
}

function main() {
  const args = process.argv.slice(2)
  const inbox = args.includes("--inbox")
  if (args.includes("--reassess")) {
    for (const a of readWatch({ inbox: true }).assessments.filter((a) => a.reassess))
      for (const i of a.indicators.filter((i) => i.open.length > 0))
        console.log(
          `re-assess   ${path.relative(VAULT, a.file)}: "${i.text}" ← ${i.open.map((d) => `${d.name} (${d.date})`).join(", ")}`,
        )
    return
  }
  const span = week(args.find((arg) => !arg.startsWith("--")))
  const dir = inbox ? path.join(VAULT, "_inbox") : OUT
  const out = path.join(dir, `Weekly Brief ${span.name}.md`)
  // keep what I wrote under "Assessment of the week"
  let own = ""
  if (fs.existsSync(out)) {
    const old = fs.readFileSync(out, "utf8")
    const start = old.indexOf(`${OWN}\n`)
    if (start >= 0) {
      const rest = old.slice(start + OWN.length)
      const end = rest.search(/\n## /)
      own = (end < 0 ? rest : rest.slice(0, end)).trim()
    }
  }
  fs.mkdirSync(dir, { recursive: true })
  const index = path.join(OUT, "index.md")
  if (!inbox && !fs.existsSync(index))
    fs.writeFileSync(
      index,
      `---\ntitle: Weekly Briefs\ndescription: "The week's developments, the indicators they fired and what to watch next."\ntype: moc\ncreated: ${new Date().toLocaleDateString("sv-SE")}\n---\n\nThe week's developments, the indicators they fired and what to watch next. Written by \`make brief\`.\n`,
    )
  fs.writeFileSync(out, brief(readWatch({ inbox }), span, own))
  console.log(`${span.from} to ${span.to} → ${out}`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main()
