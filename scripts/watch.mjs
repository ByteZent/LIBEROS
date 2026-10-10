// Watch: reads the feeds in watch/sources.yml into the stream of the Watch map: every item with
// the countries its headline names, a domain, and the notes it names (no dependencies beyond
// gray-matter). The items are in content/_private/watch/items.json, with a page of them for
// Obsidian next to it. Of an item are kept its title, link, date and source, and the summary its
// feed gives, cut to SUMMARY characters: never the text of the article.
// The private preview shows the stream on the map; the public site only with `public: true` in
// sources.yml (see quartz/util/watch.ts).
//
//   node scripts/watch.mjs                       fetch the feeds, then write the Watch page
//   node scripts/watch.mjs --offline             rewrite the page from the stored items (after editing notes)
//   node scripts/watch.mjs promote <id> [title]  make a development note in _inbox from an item
//   node scripts/watch.mjs drop <id>...          take items out of the stream
// Nothing has to be promoted: the stream is the overview, a note is for what I want to keep and
// judge. A promoted item gives way to its note, a dropped one leaves the stream; neither comes back.
//
// Where an item is: the countries its headline names, or else the first two its summary names,
// by the names in watch/gazetteer.json (countries and capitals, English and German) and
// watch/places.yml (my additions). Its domain: the one whose words the headline and summary use
// most (DOMAINS below), or else the `domain:` of its source.
//
// An item is linked to a note when its title or the feed's summary names the note, as a whole word.
// Names of up to three letters (US, EU) must match in case.
//   actors and case studies (by type)  by title, filename and aliases; `watch: false` takes one out
//   any other note                     only with `watch:` in its frontmatter: `true` for title,
//                                      filename and aliases, or the phrases to look for instead
//                                      (`watch: ["hybrid warfare", "grey zone"]`): the title of a
//                                      concept is mostly a common word
//   the `terms` of sources.yml         words to watch that have no note yet
import fs from "fs"
import path from "path"
import crypto from "crypto"
import matter from "gray-matter"
import { pathToFileURL } from "url"
import { asList } from "./places.mjs"

const VAULT = "content"
const SOURCES = "watch/sources.yml"
const OUT = path.join(VAULT, "_private", "watch")
const STORE = path.join(OUT, "items.json")
const PAGE = path.join(OUT, "Watch.md")
const TEMPLATE = path.join(VAULT, "_templates", "T - Development.md")
const GAZETTEER = "watch/gazetteer.json"
// how much of a feed's summary is kept: some feeds put the whole article there
const SUMMARY = 500
const PLACES = "watch/places.yml"
// the words that give a domain away, by the language of the source; the first of equals wins
const DOMAINS = {
  en: {
    military:
      /\b(troops?|army|armies|navy|naval|air force|missiles?|drones?|airstrikes?|strikes?|brigades?|battalions?|offensive|front ?line|artillery|tanks?|fighter jets?|warships?|submarines?|frigates?|military|soldiers?|shelling|munitions?|ammunition|weapons?|warfare|war|combat|deterrence|nuclear|air defen[cs]e)\b/gi,
    security:
      /\b(terror\w*|hybrid|sabotage|cyber\w*|border|police|extremis\w*|insurgen\w*|coup|unrest|militia\w*|jihadis\w*|piracy|hostages?|security)\b/gi,
    intelligence:
      /\b(intelligence|espionage|spy|spies|spying|surveillance|disinformation|propaganda|influence operations?)\b/gi,
    technology:
      /\b(AI|artificial intelligence|quantum|hypersonic|semiconductors?|chips?|satellites?|space|technolog\w*|software|autonomous|robot\w*)\b/gi,
    economics:
      /\b(sanctions?|tariffs?|trade|econom\w*|budget|inflation|oil|gas|energy|exports?|imports?|markets?|debt|investment|procurement|contracts?|industr\w*)\b/gi,
    law: /\b(court|ruling|treaty|treaties|tribunal|ICC|ICJ|legal|law|lawsuit|judges?|constitution\w*|war crimes?|indict\w*|human rights)\b/gi,
    ir: /\b(summit|diploma\w*|talks|negotiat\w*|alliance|allies|NATO|UN|ambassador|foreign minister|bilateral|ceasefire|peace|Security Council)\b/gi,
    policy:
      /\b(elections?|parliament\w*|government|ministers?|president|coalition|vote|referendum|policy|reforms?|opposition|protests?)\b/gi,
  },
  de: {
    military:
      /(?<![\p{L}])(Truppen|Armee|Bundeswehr|Raketen?|Drohnen?|Angriffe?n?|Luftangriffe?|Krieg\w*|Militär\w*|Soldat\w*|Marine|Luftwaffe|Panzer|Waffen?|Munition|Offensive|Front|Gefecht\w*|Abschreckung|Atomwaffen|Flugabwehr|Verteidigung\w*)(?![\p{L}])/gu,
    security:
      /(?<![\p{L}])(Terror\w*|Anschl[aä]g\w*|Sabotage|Cyber\w*|Grenz\w*|Polizei|Extremis\w*|Putsch\w*|Unruhen|Miliz\w*|Geiseln?|Sicherheit\w*)(?![\p{L}])/gu,
    intelligence:
      /(?<![\p{L}])(Geheimdienst\w*|Nachrichtendienst\w*|Spion\w*|Überwachung|Desinformation|Propaganda)(?![\p{L}])/gu,
    technology:
      /(?<![\p{L}])(KI|Künstliche Intelligenz|Quanten\w*|Hyperschall\w*|Halbleiter|Chips?|Satellit\w*|Weltraum|Technologie\w*|Software)(?![\p{L}])/gu,
    economics:
      /(?<![\p{L}])(Sanktion\w*|Zölle?n?|Handel\w*|Wirtschaft\w*|Haushalt\w*|Inflation|Öl|Gas|Energie\w*|Export\w*|Import\w*|Märkte?|Schulden|Rüstungs\w*|Industrie\w*)(?![\p{L}])/gu,
    law: /(?<![\p{L}])(Gericht\w*|Urteil\w*|Vertrag\w*|Verträge|Gesetz\w*|Richter\w*|Verfassung\w*|Kriegsverbrechen|Anklage|Völkerrecht\w*|Menschenrechte?)(?![\p{L}])/gu,
    ir: /(?<![\p{L}])(Gipfel\w*|Diplomat\w*|Gespräche|Verhandlung\w*|Bündnis\w*|Nato|NATO|Uno|UNO|Botschafter\w*|Aussenminister\w*|Außenminister\w*|Waffenruhe|Waffenstillstand|Frieden\w*|Sicherheitsrat)(?![\p{L}])/gu,
    policy:
      /(?<![\p{L}])(Wahl\w*|Parlament\w*|Regierung\w*|Minister\w*|Präsident\w*|Koalition\w*|Abstimmung\w*|Referendum|Reform\w*|Opposition|Proteste?)(?![\p{L}])/gu,
  },
}
const NAMED = new Set(["actor", "case"])
const SKIP = new Set(["_templates", "_dashboards", "_private", "tags", ".obsidian", ".trash"])
const TIERS = ["primary", "analysis", "data"]
const DAY = 24 * 60 * 60 * 1000
// stored items are kept this much longer than they are shown, so that a slow feed cannot bring one back
const REMEMBER = 4

// ── feeds ────────────────────────────────────────────────────────────────────

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }
const decode = (text) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (all, code) => {
    if (code[0] !== "#") return ENTITIES[code.toLowerCase()] ?? all
    const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1))
    return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : ""
  })

/** The text of an element: CDATA unwrapped, entities decoded (twice: feeds escape HTML), tags dropped. */
const text = (xml) =>
  decode(decode((xml ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")).replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim()

const element = (block, ...names) => {
  for (const name of names) {
    const m = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "i"))
    if (m) return m[1]
  }
}

/** The entries of an RSS or Atom feed: [{ title, link, date, summary }], `date` a Date or undefined. */
export function parseFeed(xml) {
  const entries = []
  for (const [block] of xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)) {
    // Atom: <link href="…"/>, the one without rel or with rel="alternate"; RSS: <link>…</link>
    const links = [...block.matchAll(/<link\b([^>]*?)\/?>/gi)].map((m) => m[1])
    const atom = links.find((a) => /href=/.test(a) && (!/rel=/.test(a) || /rel=.alternate/.test(a)))
    const link = atom ? decode(atom.match(/href=["']([^"']*)/)[1]) : text(element(block, "link"))
    const date = new Date(text(element(block, "pubDate", "published", "updated", "dc:date")))
    const title = text(element(block, "title"))
    if (!title || !/^https?:\/\//.test(link)) continue
    entries.push({
      title,
      link: link.trim(),
      date: isNaN(date) ? undefined : date,
      summary: text(element(block, "description", "summary", "content:encoded", "content")),
    })
  }
  return entries
}

async function fetchFeed(source) {
  const response = await fetch(source.url, {
    headers: { "User-Agent": "LIBEROS-watch/1.0", Accept: "application/rss+xml, application/xml" },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const entries = parseFeed(await response.text())
  if (entries.length === 0) throw new Error("no entries (not a feed, or an empty one)")
  return entries
}

// ── linking ──────────────────────────────────────────────────────────────────

function* notes(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* notes(full)
    else if (entry.name.endsWith(".md") && entry.name !== "index.md") yield full
  }
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
const word = (name) =>
  new RegExp(`(?<![\\p{L}\\p{N}])${escape(name)}(?![\\p{L}\\p{N}])`, name.length <= 3 ? "u" : "iu")

/** What an item can be linked to: [{ label, note, patterns }], `note` false for a term. */
export function matchers(terms = []) {
  const list = []
  for (const file of notes(VAULT)) {
    let data
    try {
      data = matter(fs.readFileSync(file, "utf8")).data
    } catch {
      continue
    }
    const watch = data.watch ?? NAMED.has(data.type)
    if (watch === false) continue
    const name = path.basename(file, ".md")
    const names = (watch === true ? [name, data.title, ...asList(data.aliases)] : asList(watch))
      .filter((n) => typeof n === "string" && n.trim().length > 1)
      .map((n) => n.trim())
    if (names.length > 0)
      list.push({ label: name, note: true, patterns: [...new Set(names)].map(word) })
  }
  for (const term of terms.map(String).filter((t) => t.trim().length > 1))
    list.push({ label: term.trim(), note: false, patterns: [word(term.trim())] })
  return list
}

/** (text) → the codes of the countries it names, in the order it names them. */
export function placeFinder() {
  const names = new Map(Object.entries(JSON.parse(fs.readFileSync(GAZETTEER, "utf8"))))
  const own = fs.existsSync(PLACES)
    ? (matter.engines.yaml.parse(fs.readFileSync(PLACES, "utf8")) ?? {})
    : {}
  for (const name of asList(own.ignore)) names.delete(String(name))
  for (const [code, list] of Object.entries(own))
    if (/^[A-Z]{3}$/.test(code)) for (const name of asList(list)) names.set(String(name), code)
  // the longest name first: "Guinea-Bissau" before "Guinea"
  const all = [...names.keys()].sort((a, b) => b.length - a.length).map(escape)
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(${all.join("|")})(?![\\p{L}\\p{N}])`, "gu")
  return (text) => [...new Set([...text.matchAll(pattern)].map((m) => names.get(m[1])))]
}

/** The domain whose words a text uses most, or undefined. */
export function domainOf(text, lang = "en") {
  let best
  let most = 0
  for (const [domain, words] of Object.entries(DOMAINS[lang] ?? DOMAINS.en)) {
    const n = (text.match(words) ?? []).length
    if (n > most) [best, most] = [domain, n]
  }
  return best
}

export const match = (haystack, list) =>
  list.filter((m) => m.patterns.some((p) => p.test(haystack)))

// ── items ────────────────────────────────────────────────────────────────────

/** The summary of an entry as it is kept: cut at a word, and not at all when it only repeats the title. */
function summaryOf(entry) {
  const text = entry.summary.trim()
  if (!text || text.toLowerCase() === entry.title.toLowerCase()) return undefined
  if (text.length <= SUMMARY) return text
  return `${text.slice(0, SUMMARY).replace(/\s+\S*$/, "")} …`
}

/** A link without its tracking parameters, fragment and trailing slash: the same report, the same link. */
export function canonical(link) {
  try {
    const url = new URL(link)
    for (const key of [...url.searchParams.keys()])
      if (/^(utm_|fbclid$|gclid$|mc_|at_|ref$|source$)/i.test(key)) url.searchParams.delete(key)
    url.hash = ""
    return url.toString().replace(/\/$/, "")
  } catch {
    return link
  }
}

const idOf = (link) => crypto.createHash("sha1").update(link).digest("hex").slice(0, 7)
const day = (date) => new Date(date).toISOString().slice(0, 10)
const cell = (s) => s.replace(/\\/g, "\\\\").replace(/([|[\]<>*_`])/g, "\\$1")

function page(items, { keep, failed, fetched, sources }) {
  const since = Date.now() - keep * DAY
  const shown = items.filter((i) => i.status === "new" && Date.parse(i.date) >= since)
  const linked = shown.filter((i) => i.notes.length + i.terms.length > 0)
  const lines = [
    "---",
    "title: Watch",
    "type: meta",
    "---",
    "",
    "> [!bluf]",
    `> ${shown.length} items of the last ${keep} days from ${sources} sources, ${linked.length} of them linked to the vault. Fetched ${fetched}. On the site: the map of [[05-Assessments/51-Current-Affairs/index|Current Affairs]].`,
    ">",
    "> Written by `make watch`: do not edit, the next run overwrites it.",
    "",
  ]
  if (failed.length > 0) {
    lines.push(`> [!warning]- Could not be read: ${failed.map((f) => f.name).join(", ")}`)
    for (const f of failed) lines.push(`> - ${f.name}: ${f.error}`)
    lines.push("")
  }
  const source = (i) => `${cell(i.source)}${i.lang ? ` (${i.lang})` : ""}`
  const byTier = (a, b) =>
    TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) || a.source.localeCompare(b.source)
  for (const date of [...new Set(shown.map((i) => day(i.date)))].sort().reverse()) {
    const today = shown.filter((i) => day(i.date) === date)
    const hits = today
      .filter((i) => linked.includes(i))
      .sort((a, b) => b.notes.length - a.notes.length || byTier(a, b))
    const rest = today.filter((i) => !linked.includes(i)).sort(byTier)
    lines.push(`## ${date}`, "")
    if (hits.length > 0) {
      lines.push("| Tier | Source | Item | Where | Vault | ID |", "|---|---|---|---|---|---|")
      for (const i of hits) {
        const vault = [...i.notes.map((n) => `[[${n}]]`), ...i.terms.map((t) => `\`${cell(t)}\``)]
        lines.push(
          `| ${i.tier} | ${source(i)} | [${cell(i.title)}](${i.link}) | ${(i.places ?? []).join(" ")} | ${vault.join(" ")} | \`${i.id}\` |`,
        )
      }
      lines.push("")
    }
    if (rest.length > 0) {
      lines.push(`> [!note]- ${rest.length} without a link to the vault`)
      for (const i of rest)
        lines.push(
          `> - ${i.tier} · ${source(i)} · [${cell(i.title)}](${i.link}) · ${(i.places ?? []).join(" ")} · \`${i.id}\``,
        )
      lines.push("")
    }
  }
  if (shown.length === 0) lines.push("Nothing open.", "")
  return lines.join("\n")
}

/** Writes the development note for an item into _inbox, from the template. Returns its path. */
function promote(item, title) {
  const name = (title || item.title)
    .replace(/[\\/:*?"<>|#^[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120)
  const out = path.join(VAULT, "_inbox", `${name}.md`)
  if (fs.existsSync(out)) throw new Error(`exists: ${out}`)
  const source = `- [${cell(`${item.source}: ${item.title}`)}](${item.link}). [Reliability A–F / Credibility 1–6]`
  const note = fs
    .readFileSync(TEMPLATE, "utf8")
    .replace(/^````.*\n/gm, "")
    .replace(/^event_date:.*$/m, () => `event_date: ${day(item.date)}`)
    .replace(/^actors:.*$/m, () => `actors: ${JSON.stringify(item.notes)}`)
    .replace(/^source:.*$/m, () => `source: ${JSON.stringify(item.link)}`)
    .replace(/^- \[Reliability.*$/m, () => source)
    .replaceAll("{{title}}", () => name)
    .replaceAll("{{date}}", () => new Date().toLocaleDateString("sv-SE"))
  fs.writeFileSync(out, note)
  return out
}

async function main() {
  const [command, ...args] = process.argv.slice(2).filter((arg) => !arg.startsWith("--"))
  const offline = process.argv.includes("--offline") || command !== undefined
  const config = matter.engines.yaml.parse(fs.readFileSync(SOURCES, "utf8")) ?? {}
  const keep = Number(config.keep) > 0 ? Number(config.keep) : 14
  const sources = asList(config.sources).filter((s) => s && s.name && s.url)
  for (const s of sources)
    if (!TIERS.includes(s.tier)) {
      console.error(`${SOURCES}: ${s.name} has tier "${s.tier}" (expected: ${TIERS.join(", ")})`)
      process.exit(1)
    }

  const stored = fs.existsSync(STORE) ? JSON.parse(fs.readFileSync(STORE, "utf8")) : {}
  const cutoff = Date.now() - keep * REMEMBER * DAY
  let items = asList(stored.items).filter((i) => Date.parse(i.date) >= cutoff)
  const known = new Set(items.flatMap((i) => [i.link, `${i.source}\n${i.title.toLowerCase()}`]))
  const list = matchers(asList(config.terms))
  const placesIn = placeFinder()
  const failed = offline ? asList(stored.failed) : []
  let added = 0

  if (command) {
    const ids = (command === "promote" ? args.slice(0, 1) : args).filter(Boolean)
    if (!["promote", "drop"].includes(command) || ids.length === 0) {
      console.error('usage: make promote ID=a1b2c3d [TITLE="…"]   make drop ID="a1b2c3d e4f5a6b"')
      process.exit(1)
    }
    for (const id of ids) {
      const item = items.find((i) => i.id === id)
      if (!item) {
        console.error(`no item ${id} (the ids are on ${PAGE})`)
        process.exit(1)
      }
      if (command === "promote") {
        try {
          console.log(`created ${promote(item, args[1])}`)
        } catch (error) {
          console.error(error.message)
          process.exit(1)
        }
      }
      item.status = command === "promote" ? "promoted" : "dropped"
    }
  }

  if (offline) {
    // notes and terms may have changed: drop the links to what is gone, and link again by the
    // title
    const labels = (note) => new Set(list.filter((m) => m.note === note).map((m) => m.label))
    for (const item of items) {
      const hits = match(item.title, list)
      for (const [field, note] of [
        ["notes", true],
        ["terms", false],
      ]) {
        const current = labels(note)
        const found = hits.filter((m) => m.note === note).map((m) => m.label)
        item[field] = [...new Set([...item[field].filter((l) => current.has(l)), ...found])]
      }
      // the names of places may have changed too; without the headline naming one, keep what
      // the summary gave
      const places = placesIn(item.title).slice(0, 4)
      if (places.length > 0 || !item.places) item.places = places
      item.domain ??= domainOf(item.title, item.lang) ?? null
    }
  } else {
    const results = await Promise.allSettled(sources.map(fetchFeed))
    const byLink = new Map(items.map((item) => [item.link, item]))
    const shownSince = Date.now() - keep * DAY
    results.forEach((result, n) => {
      const source = sources[n]
      if (result.status === "rejected") {
        const error = result.reason?.cause?.code ?? result.reason?.message ?? String(result.reason)
        failed.push({ name: source.name, error })
        return
      }
      for (const entry of result.value) {
        const link = canonical(entry.link)
        const key = `${source.name}\n${entry.title.toLowerCase()}`
        // an entry without a date is new today; one older than the page shows is of no use
        const date = entry.date ?? new Date()
        // an item from before summaries were kept gets its own now
        const old = byLink.get(link)
        if (old && old.summary === undefined) old.summary = summaryOf(entry)
        if (known.has(link) || known.has(key) || date.getTime() < shownSince) continue
        known.add(link).add(key)
        const hits = match(`${entry.title}\n${entry.summary}`, list)
        const named = placesIn(entry.title).slice(0, 4)
        items.push({
          id: idOf(link),
          title: entry.title,
          summary: summaryOf(entry),
          link,
          date: date.toISOString(),
          source: source.name,
          tier: source.tier,
          ...(source.lang ? { lang: source.lang } : {}),
          places: named.length > 0 ? named : placesIn(entry.summary).slice(0, 2),
          domain:
            domainOf(`${entry.title}\n${entry.summary}`, source.lang) ?? source.domain ?? null,
          notes: hits.filter((m) => m.note).map((m) => m.label),
          terms: hits.filter((m) => !m.note).map((m) => m.label),
          status: "new",
        })
        added++
      }
    })
  }

  items.sort((a, b) => b.date.localeCompare(a.date))
  const fetched = offline
    ? (stored.fetched ?? "never")
    : new Date().toLocaleString("sv-SE").slice(0, 16)
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(STORE, JSON.stringify({ fetched, failed, items }, null, 2) + "\n")
  fs.writeFileSync(PAGE, page(items, { keep, failed, fetched, sources: sources.length }))

  const open = items.filter(
    (i) => i.status === "new" && Date.parse(i.date) >= Date.now() - keep * DAY,
  )
  const linked = open.filter((i) => i.notes.length + i.terms.length > 0).length
  const placed = open.filter((i) => i.places?.length > 0).length
  if (!offline) for (const f of failed) console.log(`warn   ${f.name}: ${f.error}`)
  console.log(
    `${offline ? "" : `${added} new, `}${open.length} in the stream (${placed} on the map, ${linked} linked to the vault), ${sources.length - failed.length}/${sources.length} sources read`,
  )
  console.log(`→ ${PAGE}`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main()
