// Open questions: collect the unchecked items of every note's `## Open Questions` section into one page.
// Usage: node scripts/questions.mjs [--inbox]
//   default   published notes only → content/09-Learning/92-Open-Questions/Open Questions in the Notes.md
//   --inbox   also read _inbox     → content/_inbox/Open Questions (preview).md (not published)
// The notes are the source: tick a question off (or delete it) there and run the command again.
// Never edit the generated page.
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const VAULT = "content"
const INBOX = process.argv.includes("--inbox")
const OUT = INBOX
  ? "_inbox/Open Questions (preview).md"
  : "09-Learning/92-Open-Questions/Open Questions in the Notes.md"
const SKIP = new Set(["_templates", "_dashboards", "_private", "tags", ".obsidian", ".trash"])
if (!INBOX) SKIP.add("_inbox")

function* notes(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* notes(full)
    else if (entry.name.endsWith(".md") && !entry.name.startsWith("Open Questions")) yield full
  }
}

const asList = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]).map(String)

// a course code reads better as the title of its course page (content/tags/course/<code>.md)
const courseTitle = (code) => {
  const page = path.join(VAULT, "tags", "course", `${code}.md`)
  return fs.existsSync(page) ? (matter(fs.readFileSync(page, "utf8")).data.title ?? code) : code
}

const NO_COURSE = "Not tied to a course"
const groups = new Map() // course → [{ note, questions }]
let total = 0
for (const file of notes(VAULT)) {
  const { data, content } = matter(fs.readFileSync(file, "utf8"))
  if (data.draft === true && !INBOX) continue
  const lines = content.split("\n")
  const start = lines.findIndex((l) => /^## Open Questions/.test(l))
  if (start < 0) continue
  const questions = []
  for (const line of lines.slice(start + 1)) {
    if (/^## /.test(line)) break
    const open = line.match(/^- \[ \]\s+(\S.*)$/)
    if (open) questions.push(open[1].trim())
  }
  if (questions.length === 0) continue
  total += questions.length
  const course = asList(data.courses)[0] ?? NO_COURSE
  groups.set(course, [
    ...(groups.get(course) ?? []),
    { note: path.basename(file, ".md"), questions },
  ])
}

const sorted = [...groups.entries()]
  .map(([code, list]) => [code === NO_COURSE ? code : courseTitle(code), list])
  .sort(([a], [b]) => (a === NO_COURSE) - (b === NO_COURSE) || a.localeCompare(b))
const noteCount = sorted.reduce((n, [, list]) => n + list.length, 0)

const today = new Date().toISOString().slice(0, 10)
let out = `---
title: "Open Questions in the Notes"
aliases:
  - Offene Fragen
type: meta
created: ${today}
modified: ${today}
tags:
  - meta
  - open-question
draft: false
---

> [!bluf]
> Every unanswered question from the notes' *Open Questions* sections in one place: ${total} questions from ${noteCount} notes, grouped by course. Use it as a reading list: pick a question, read for it, then answer it in the note or promote it to an Open Question note of its own.
>
> This page is **generated** by \`make questions\`.
> Do not edit it: tick the question off in the note and run the command again.
`
for (const [course, list] of sorted) {
  out += `\n## ${course}\n`
  for (const { note, questions } of list.sort((a, b) => a.note.localeCompare(b.note))) {
    out += `\n**[[${note}]]**\n\n${questions.map((q) => `- ${q}`).join("\n")}\n`
  }
}
fs.writeFileSync(path.join(VAULT, OUT), out)
console.log(`${total} open questions from ${noteCount} notes → ${VAULT}/${OUT}`)
