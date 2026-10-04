// Central glossary: collect the `## Glossary` table of every note into one page.
// Usage: node scripts/glossary.mjs [--inbox] [--check]
//   default   published notes only → content/09-Learning/Glossary.md
//   --inbox   also read _inbox     → content/_inbox/Glossary (preview).md (not published)
//   --check   write nothing; list terms without a definition or with conflicting entries
// Note tables are the source: | Deutsch | English | Definition | Be able to |. Never edit the generated page.
// Be able to: apply (core term that carries a concept or model) · define (technical term) · translate (plain vocabulary).
import fs from "fs"
import path from "path"

const VAULT = "content"
const INBOX = process.argv.includes("--inbox")
const CHECK = process.argv.includes("--check")
const OUT = INBOX ? "_inbox/Glossary (preview).md" : "09-Learning/Glossary.md"
const SKIP = new Set(["_templates", "_dashboards", "_private", "tags", ".obsidian", ".trash"])
if (!INBOX) SKIP.add("_inbox")

function* notes(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* notes(full)
    else if (entry.name.endsWith(".md") && !entry.name.startsWith("Glossary")) yield full
  }
}

const LEVELS = ["", "translate", "define", "apply"] // index = weight; a term in several notes gets the highest
const cells = (row) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim())

// key: "de|en" → { de, en, level, defs: Map(definition → [notes]), notes: [] }
const terms = new Map()
for (const file of notes(VAULT)) {
  const lines = fs.readFileSync(file, "utf8").split("\n")
  const start = lines.findIndex((l) => /^## Glossary/.test(l))
  if (start < 0) continue
  const note = path.basename(file, ".md")
  for (const line of lines.slice(start + 1)) {
    if (/^## /.test(line)) break
    if (!line.startsWith("|") || /^\|\s*-+/.test(line)) continue
    const [de, en, def = "", lvl = ""] = cells(line)
    if (!de || de === "Deutsch") continue
    const key = `${de.toLowerCase()}|${en.toLowerCase()}`
    const t = terms.get(key) ?? { de, en, level: 0, defs: new Map(), notes: [] }
    t.level = Math.max(t.level, LEVELS.indexOf(lvl.toLowerCase()))
    if (!t.notes.includes(note)) t.notes.push(note)
    if (def) t.defs.set(def, [...(t.defs.get(def) ?? []), note])
    terms.set(key, t)
  }
}

const sorted = [...terms.values()].sort((a, b) =>
  a.de.localeCompare(b.de, "de", { sensitivity: "base" }),
)

if (CHECK) {
  const missing = sorted.filter((t) => t.defs.size === 0)
  const conflict = sorted.filter((t) => t.defs.size > 1)
  const unrated = sorted.filter((t) => t.level === 0)
  for (const t of unrated) console.log(`no level:       ${t.de}  (${t.notes.join(", ")})`)
  for (const t of missing) console.log(`no definition:  ${t.de}  (${t.notes.join(", ")})`)
  for (const t of conflict)
    console.log(`${t.defs.size} definitions: ${t.de}  (${t.notes.join(", ")})`)
  console.log(
    `${sorted.length} terms · ${missing.length} without definition · ${conflict.length} with conflicting definitions · ${unrated.length} without level`,
  )
  process.exit(missing.length || conflict.length || unrated.length ? 1 : 0)
}

const letter = (s) => {
  const c = s.normalize("NFD").replace(/[^A-Za-z]/g, "")[0]
  return c ? c.toUpperCase() : "#"
}
const groups = new Map()
for (const t of sorted) groups.set(letter(t.de), [...(groups.get(letter(t.de)) ?? []), t])

const count = (n) => sorted.filter((t) => t.level === n).length
const today = new Date().toISOString().slice(0, 10)
let out = `---
title: "Glossary"
aliases:
  - Glossar
  - Central glossary
type: meta
created: ${today}
modified: ${today}
tags:
  - meta
  - glossary
draft: false
---

> [!bluf]
> Every German term from the notes' glossaries with its English equivalent and a one-line definition, ${sorted.length} terms in alphabetical order.
>
> **Be able to:**
> - **apply** = core term that carries a concept or model: explain it and use it on a case (${count(3)})
> - **define** = technical term: give its definition (${count(2)})
> - **translate** = plain vocabulary: know the equivalent (${count(1)}).
>
> This page is **generated** by \`make glossary\`.
> Do not edit it: change the glossary table in the note and run the command again.

${[...groups.keys()].map((l) => `[[#${l}]]`).join(" · ")}
`
for (const [l, list] of groups) {
  out += `\n## ${l}\n\n| Deutsch | English | Definition | Be able to |\n|---|---|---|---|\n`
  for (const t of list) {
    const defs = [...t.defs.keys()]
    const def = defs.length <= 1 ? (defs[0] ?? "") : defs.map((d, i) => `(${i + 1}) ${d}`).join(" ")
    out += `| ${t.level === 3 ? `**${t.de}**` : t.de} | ${t.en} | ${def} | ${LEVELS[t.level]} |\n`
  }
}
fs.writeFileSync(path.join(VAULT, OUT), out)
console.log(
  `${sorted.length} terms from ${new Set(sorted.flatMap((t) => t.notes)).size} notes → ${VAULT}/${OUT}`,
)
