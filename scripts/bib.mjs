// Bibliography tooling for LIBEROS (no dependencies).
//
//   node scripts/bib.mjs merge <out.bib> <in.bib>...   merge .bib files, drop exact duplicates, report conflicts
//   node scripts/bib.mjs check                         check bibliography/library.bib and the vault's citations
//
// Duplicates are detected by citekey, DOI, ISBN and normalised title + year.
import fs from "fs"
import path from "path"
import { pathToFileURL } from "url"

const LIBRARY = "bibliography/library.bib"
const VAULT = "content"

// ── parsing ──────────────────────────────────────────────────────────────────

/** Split a .bib file into entries, honouring nested braces. Skips @comment/@string/@preamble. */
export function parseBib(text, source = "") {
  const entries = []
  const re = /@(\w+)\s*\{\s*([^,\s]+)\s*,/g
  let m
  while ((m = re.exec(text))) {
    const type = m[1].toLowerCase()
    let depth = 1
    let i = re.lastIndex
    for (; i < text.length && depth > 0; i++) {
      if (text[i] === "{") depth++
      else if (text[i] === "}") depth--
    }
    const raw = text.slice(m.index, i)
    re.lastIndex = i
    if (["comment", "string", "preamble"].includes(type)) continue
    entries.push({
      type,
      key: m[2],
      raw,
      fields: parseFields(text.slice(m.index + m[0].length, i - 1)),
      source,
    })
  }
  return entries
}

function parseFields(body) {
  const fields = {}
  const re = /(\w+)\s*=\s*/g
  let m
  while ((m = re.exec(body))) {
    let i = re.lastIndex
    let value = ""
    if (body[i] === "{") {
      let depth = 0
      const start = i
      for (; i < body.length; i++) {
        if (body[i] === "{") depth++
        else if (body[i] === "}" && --depth === 0) break
      }
      value = body.slice(start + 1, i)
      i++
    } else if (body[i] === '"') {
      const end = body.indexOf('"', i + 1)
      value = body.slice(i + 1, end)
      i = end + 1
    } else {
      const end = body.slice(i).search(/[,\n}]/)
      value = body.slice(i, end < 0 ? undefined : i + end).trim()
      i += end < 0 ? body.length : end
    }
    fields[m[1].toLowerCase()] = value.replace(/\s+/g, " ").trim()
    re.lastIndex = i
  }
  return fields
}

const norm = (s = "") =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
const year = (f) => (f.date ?? f.year ?? "").slice(0, 4)
const canonical = (e) =>
  e.type + JSON.stringify(Object.entries(e.fields).sort(([a], [b]) => a.localeCompare(b)))

/** Groups of entries (with different keys) that look like the same work. */
function suspectedDuplicates(entries) {
  const groups = []
  const by = (label, fn) => {
    const map = new Map()
    for (const e of entries) {
      const k = fn(e)
      if (!k) continue
      map.set(k, [...(map.get(k) ?? []), e])
    }
    for (const [k, list] of map) {
      const keys = [...new Set(list.map((e) => e.key))]
      if (keys.length > 1) groups.push({ reason: `${label} ${k}`, keys })
    }
  }
  by("same DOI", (e) => e.fields.doi?.toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, ""))
  by("same ISBN", (e) => e.fields.isbn?.replace(/[^0-9xX]/g, ""))
  by("same title+year", (e) => (e.fields.title ? `${norm(e.fields.title)}/${year(e.fields)}` : ""))
  return groups
}

// ── merge ────────────────────────────────────────────────────────────────────

function merge(out, inputs) {
  const byKey = new Map()
  const conflicts = []
  let exact = 0
  for (const file of inputs) {
    for (const e of parseBib(fs.readFileSync(file, "utf8"), file)) {
      const prev = byKey.get(e.key)
      if (!prev) byKey.set(e.key, e)
      else if (canonical(prev) === canonical(e)) exact++
      else {
        // same key, different content: keep the richer entry, report for manual review
        const keep = Object.keys(e.fields).length > Object.keys(prev.fields).length ? e : prev
        conflicts.push({ key: e.key, files: [prev.source, e.source], kept: keep.source })
        byKey.set(e.key, keep)
      }
    }
  }
  const entries = [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key))
  const header = [
    `% Merged by scripts/bib.mjs on ${new Date().toISOString().slice(0, 10)} from:`,
    ...inputs.map((f) => `%   ${f}`),
    "",
  ].join("\n")
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, header + "\n" + entries.map((e) => e.raw.trim()).join("\n\n") + "\n")

  const suspects = suspectedDuplicates(entries)
  console.log(`${inputs.length} files → ${entries.length} unique entries in ${out}`)
  console.log(`  ${exact} exact duplicate(s) removed`)
  for (const c of conflicts)
    console.log(`  ! key "${c.key}" differs between files, kept the version from ${c.kept}`)
  for (const s of suspects)
    console.log(`  ? possible duplicate (${s.reason}): ${s.keys.join(", ")}`)
}

// ── check ────────────────────────────────────────────────────────────────────

function* markdown(dir) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    if (d.name.startsWith(".") || d.name === "_templates") continue
    const p = path.join(dir, d.name)
    if (d.isDirectory()) yield* markdown(p)
    else if (d.name.endsWith(".md")) yield p
  }
}

function check() {
  const entries = fs.existsSync(LIBRARY) ? parseBib(fs.readFileSync(LIBRARY, "utf8"), LIBRARY) : []
  const keys = new Set(entries.map((e) => e.key))
  let problems = 0

  const seen = new Map()
  for (const e of entries) seen.set(e.key, (seen.get(e.key) ?? 0) + 1)
  for (const [k, n] of seen)
    if (n > 1) (problems++, console.log(`! duplicate citekey "${k}" (${n}×)`))
  for (const s of suspectedDuplicates(entries))
    (problems++, console.log(`? possible duplicate (${s.reason}): ${s.keys.join(", ")}`))

  const cited = new Map()
  const noteFor = new Map()
  for (const file of markdown(VAULT)) {
    // code blocks and inline code are examples, not citations (Quartz doesn't render them either)
    const text = fs
      .readFileSync(file, "utf8")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`\n]*`/g, "")
    // pandoc-style citations: [@key], [@a; @b], [see @key, p. 3]
    for (const block of text.match(/\[[^\]\n]*@[^\]\n]*\]/g) ?? [])
      for (const [, k] of block.matchAll(/@([\w:.#$%&\-+?<>~/]+)/g))
        cited.set(k, [...(cited.get(k) ?? []), path.relative(VAULT, file)])
    const ck = text.match(/^citekey:\s*"?([^"\n]+)"?\s*$/m)?.[1]
    if (ck) noteFor.set(ck.trim(), path.relative(VAULT, file))
  }
  for (const [k, files] of cited)
    if (!keys.has(k))
      (problems++,
        console.log(`✗ [@${k}] cited but not in ${LIBRARY}: ${[...new Set(files)].join(", ")}`))
  for (const [k, file] of noteFor)
    if (!keys.has(k))
      (problems++, console.log(`✗ source note ${file} has citekey "${k}" not in library`))

  const withoutNote = [...cited.keys()].filter((k) => keys.has(k) && !noteFor.has(k))
  console.log(
    `\n${entries.length} entries · ${cited.size} cited · ${noteFor.size} source notes · ${problems} problem(s)`,
  )
  if (withoutNote.length)
    console.log(`  cited without a source note (optional): ${withoutNote.sort().join(", ")}`)
  process.exit(problems ? 1 : 0)
}

// ── cli ──────────────────────────────────────────────────────────────────────

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [cmd, ...args] = process.argv.slice(2)
  if (cmd === "merge" && args.length >= 2) merge(args[0], args.slice(1))
  else if (cmd === "check") check()
  else {
    console.log(
      "usage: node scripts/bib.mjs merge <out.bib> <in.bib>...  |  node scripts/bib.mjs check",
    )
    process.exit(1)
  }
}
