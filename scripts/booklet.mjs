// Booklets: the notes for an assessment as one A5 booklet, to print, fold and carry.
// Usage: node scripts/booklet.mjs <COURSE> [TEST] [--site DIR] [--out DIR]
//        node scripts/booklet.mjs --notes "Note A,Note B" [--title "…"]
//        node scripts/booklet.mjs --all
//   COURSE [TEST]  the notes of every session up to that assessment, in teaching order → booklets/
//                  TEST is any part of the assessment's name ("1", "final"); omit: the next dated one
//   --notes        an explicit list of notes, in the given order → booklets/
//   --all          the assessments a course map lists in its frontmatter, `booklets: ["Test 1"]`
//                  (the names in the What column) → <site>/booklets/
//                  (what the deploy runs; the course map links to these files, see BookletLinks.tsx)
//   --site DIR     the built site to read (default: public; public-private also has _inbox notes)
// The booklet is cut from the *built* pages, so formulas, callouts, diagrams and citations look
// as on the site: run `make build` first. Each booklet is two files:
//   <name>.pdf        A5 pages in reading order
//   <name>-print.pdf  the same, imposed on A4 landscape: print double-sided, flip on the SHORT
//                     edge, fold the stack in the middle and staple
// Study cut: Sources, Open Questions and Key Connections are left out. The Self-Test keeps its
// questions; the answers move to the back. The notes' Glossary tables merge into one at the end.
// A mind map of the course (tag `mindmap`, the course in `courses:`) opens the booklet: only the
// map itself, drawn on landscape pages (turn the booklet), a few branches around the centre on
// each. A link to a note of the booklet gives its page.
// Which notes belong to an assessment comes from the course map (09-Learning/93-Course-Maps):
// its Assessment table (What | When | Form) and its Sessions table (Date | Theme | Notes).
// Needs Chrome or Chromium (CHROME=/path/to/binary overrides the lookup).
import fs from "fs"
import os from "os"
import path from "path"
import { execFileSync, spawn, spawnSync } from "child_process"
import { pathToFileURL } from "url"
import matter from "gray-matter"
import { fromHtml } from "hast-util-from-html"
import { toHtml } from "hast-util-to-html"
import { toString } from "hast-util-to-string"
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib"

const VAULT = "content"
const SKIP = new Set(["_templates", "_dashboards", ".obsidian", ".trash"])
const DROP = /^(Sources|Open Questions|Key Connections)\b/i
const A4 = [841.89, 595.28] // landscape, in points

const args = process.argv.slice(2)
const option = (name) => {
  const i = args.indexOf(name)
  return i < 0 ? undefined : args.splice(i, 2)[1]
}
const SITE = option("--site") ?? "public"
const NOTES = option("--notes")
const TITLE = option("--title")
const ALL = args.includes("--all")
const OUT = option("--out") ?? (ALL ? path.join(SITE, "booklets") : "booklets")
const [code, test] = args.filter((a) => !a.startsWith("--"))

const fail = (message) => {
  console.error(message)
  process.exit(1)
}
if (!fs.existsSync(path.join(SITE, "index.css")))
  fail(`no built site in ${SITE}/: run \`make build\` first`)
if (!ALL && !NOTES && !code)
  fail('usage: make booklet COURSE=<code> [TEST=1]   or   make booklet NOTES="A,B" TITLE="…"')

// ── vault: where a note lives, and which note is a course's map ──────────────

function* notes(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* notes(full)
    else if (entry.name.endsWith(".md")) yield full
  }
}

// as Quartz does it (quartz/util/path.ts)
const slugOf = (file) =>
  path
    .relative(VAULT, file)
    .replace(/\.md$/, "")
    .split(path.sep)
    .map((s) => s.replace(/\s/g, "-").replace(/&/g, "-and-").replace(/%/g, "-percent"))
    .map((s) => s.replace(/[?#]/g, ""))
    .join("/")

const vault = [...notes(VAULT)].map((file) => {
  let data = {}
  try {
    data = matter(fs.readFileSync(file, "utf8")).data
  } catch {
    console.warn(`! could not parse frontmatter: ${file}`)
  }
  return { file, slug: slugOf(file), name: path.basename(file, ".md"), data }
})
const maps = new Map(
  vault.filter((n) => n.data.type === "moc" && n.data.course).map((n) => [n.data.course, n]),
)
// the mind maps of a course, by title
const mindmaps = (course) =>
  vault
    .filter((n) => [n.data.tags ?? []].flat().includes("mindmap"))
    .filter((n) => [n.data.courses ?? []].flat().includes(course))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((n) => n.slug)
const pageFile = (slug) => path.join(SITE, `${slug}.html`)
const onSite = (slug) => fs.existsSync(pageFile(slug))

// ── built pages ──────────────────────────────────────────────────────────────

const isEl = (node, tag) => node.type === "element" && (!tag || node.tagName === tag)
const classes = (node) => node.properties?.className ?? []
const h = (tagName, properties, children) => ({
  type: "element",
  tagName,
  properties,
  children: typeof children === "string" ? [{ type: "text", value: children }] : children,
})
// every element under `node` in document order; `prune` stops the descent into a match
function* walk(node, prune) {
  for (const child of node.children ?? []) {
    if (!isEl(child)) continue
    yield child
    if (!prune?.(child)) yield* walk(child, prune)
  }
}
const find = (node, test) => [...walk(node)].filter(test)

const stylesheets = new Set() // of every page that goes into a booklet
function page(slug) {
  const tree = fromHtml(fs.readFileSync(pageFile(slug), "utf8"))
  const base = pathToFileURL(path.resolve(pageFile(slug)))
  for (const link of find(tree, (n) => isEl(n, "link")))
    if ([link.properties.rel].flat().includes("stylesheet"))
      stylesheets.add(new URL(link.properties.href, base).href)
  return {
    base,
    title: toString(find(tree, (n) => isEl(n, "title"))[0] ?? h("title", {}, slug)),
    article: find(tree, (n) => isEl(n, "article"))[0] ?? h("article", {}, []),
  }
}

// the body rows of the tables in the `## <heading>` section, plus the section's paragraphs
function section(article, heading) {
  const rows = []
  const paragraphs = []
  let inside = false
  for (const node of walk(article, (n) => isEl(n, "tr") || isEl(n, "p"))) {
    if (isEl(node, "h2")) inside = heading.test(toString(node))
    else if (inside && isEl(node, "p")) paragraphs.push(toString(node).trim())
    else if (inside && isEl(node, "tr")) {
      const cells = node.children.filter((c) => isEl(c, "td"))
      if (cells.length) rows.push(cells)
    }
  }
  return { rows, paragraphs }
}

// NB: BookletLinks.tsx applies the same rules to the same tables. Change both together.
const fileName = (course, what) =>
  `${course}-${what
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`

function courseMap(course) {
  const map = maps.get(course)
  if (!map) fail(`no course map with \`course: ${course}\` in 09-Learning/93-Course-Maps`)
  if (!onSite(map.slug)) fail(`the course map of ${course} is not in ${SITE}/: run \`make build\``)
  const { article, title } = page(map.slug)
  const semester = String(map.data.semester ?? "")
  const year = Number(semester.match(/\d{4}/)?.[0]) || new Date().getFullYear()
  const autumn = /^HS/i.test(semester)

  const assessment = section(article, /Assessment/)
  const assessments = assessment.rows.map(([what, when, form]) => {
    const d = toString(when ?? h("td", {}, "")).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
    return {
      what: toString(what).trim(),
      when: when ? toString(when).trim() : "",
      form: form ? toString(form).trim() : "",
      date: d ? new Date(+d[3], d[2] - 1, +d[1]) : undefined,
    }
  })
  const sessions = section(article, /Sessions/).rows.map(([when, , linked]) => {
    const d = toString(when).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})?/)
    // an autumn semester runs into January and February of the next year
    const y = d?.[3] ? +d[3] : year + (autumn && d && +d[2] < 8 ? 1 : 0)
    return {
      date: d ? new Date(y, d[2] - 1, +d[1]) : undefined,
      slugs: find(linked ?? h("td", {}, []), (n) => isEl(n, "a") && n.properties.dataSlug).map(
        (a) => a.properties.dataSlug,
      ),
    }
  })
  for (const a of assessments) {
    const taught = sessions.filter((s) => a.date && s.date && s.date <= a.date)
    a.slugs = [...new Set(taught.flatMap((s) => s.slugs))].filter(onSite)
    a.maps = a.slugs.length ? mindmaps(course).filter(onSite) : []
    a.missing = taught.filter((s) => s.slugs.filter(onSite).length === 0).length
  }
  return {
    course,
    title,
    assessments,
    scheme: assessment.paragraphs.find((p) => /^Answer scheme/i.test(p)),
  }
}

// ── one note → one chapter ───────────────────────────────────────────────────

const ref = (key) => `@@P:${key}@@` // stands for a page number until the pages are counted

function chapter(slug, inBooklet) {
  const { article, title, base } = page(slug)
  const source = vault.find((n) => n.slug === slug)
  if (source && fs.statSync(source.file).mtimeMs > fs.statSync(pageFile(slug)).mtimeMs)
    console.warn(`! ${source.name} was edited after the last build: run \`make build\``)

  const tidy = (node) => {
    node.children = (node.children ?? []).flatMap((child) => {
      if (!isEl(child)) return [child]
      const p = child.properties
      // heading anchors and fold arrows are for the screen
      if (isEl(child, "a") && p.role === "anchor") return []
      if (classes(child).includes("fold-callout-icon")) return []
      tidy(child)
      if (isEl(child, "a")) {
        // paper has no links: a note in this booklet gets its page, everything else stays as text
        const target = p.dataSlug
        const text = h("span", {}, child.children)
        return target && target !== slug && inBooklet.has(target)
          ? [text, h("span", { className: ["xref"] }, ` (→ p. ${ref(target)})`)]
          : [text]
      }
      if (isEl(child, "img") && p.src) p.src = new URL(p.src, base).href
      if (classes(child).includes("callout"))
        p.className = classes(child).filter((c) => !/^is-collaps/.test(c))
      return [child]
    })
  }
  tidy(article)

  const body = []
  const answers = []
  const glossary = []
  let current = "" // the `## heading` the walk is under
  for (const node of article.children) {
    if (isEl(node, "h2")) current = toString(node).trim()
    if (DROP.test(current)) continue
    if (/^Glossary\b/i.test(current)) {
      for (const tr of find(node, (n) => isEl(n, "tr"))) {
        const cells = tr.children.filter((c) => isEl(c, "td"))
        if (cells.length >= 2) glossary.push(cells)
      }
      continue
    }
    if (/^Self-Test\b/i.test(current)) {
      if (isEl(node, "h2")) {
        body.push(h("h2", {}, "Self-Test"), h("ol", { className: ["questions"] }, []))
        continue
      }
      if (isEl(node, "blockquote") && node.properties.dataCallout === "qard") {
        const inner = (name) => find(node, (n) => classes(n).includes(name))[0]?.children ?? []
        // the card's own "3. " goes: the list numbers the questions
        const question = inner("callout-title-inner").flatMap((n) =>
          isEl(n, "p") ? n.children : [n],
        )
        const first = question.find((n) => n.type === "text" && n.value.trim())
        if (first) first.value = first.value.replace(/^\s*\d+\.\s*/, "")
        body.findLast((n) => classes(n).includes("questions")).children.push(h("li", {}, question))
        answers.push(h("li", {}, inner("callout-content")))
        continue
      }
    }
    body.push(node)
  }
  return { slug, title, body, answers, glossary }
}

// a mind map note → a chapter with nothing but the map: the list inside its [!mindmap] callout,
// which drawMaps turns into the drawing once Chrome has the page
function mindmap(slug, inBooklet) {
  const { title, body } = chapter(slug, inBooklet)
  const lists = body
    .flatMap((node) => [node, ...walk(node)])
    .filter((n) => isEl(n, "blockquote") && n.properties.dataCallout === "mindmap")
    .flatMap((callout) => {
      const part = (name) => find(callout, (n) => classes(n).includes(name))[0]
      const centre = toString(part("callout-title-inner") ?? h("p", {}, title)).trim()
      return (part("callout-content")?.children ?? [])
        .filter((n) => isEl(n, "ul") || isEl(n, "ol"))
        .map((list) => ({
          ...list,
          properties: { ...list.properties, className: ["mindmap"], dataCentre: centre },
        }))
    })
  const script = h("script", {}, `(${drawMaps})()`)
  return { slug, title, body: [...lists, script], answers: [], glossary: [], map: true }
}

// Runs in Chrome, not in Node: every ul.mindmap becomes a drawn map. The centre stands in the
// middle of a landscape page with as many branches to its right and left as the page holds,
// then the next page follows. The boxes are laid out by CSS (flex), so nothing depends on
// measured text; measuring only decides which branch goes on which page.
function drawMaps() {
  const COLORS = ["#3d7a94", "#b5533c", "#4f8a5b", "#b08a2e", "#7d5ba6", "#2f8f8a", "#6b7785"]
  const el = (tag, className, html) => {
    const node = document.createElement(tag)
    node.className = className
    if (html !== undefined) node.innerHTML = html
    return node
  }
  // one list item → its own line without the nested list, tags taken out
  const read = (li) => {
    const own = li.cloneNode(true)
    own.querySelectorAll("ul, ol").forEach((list) => list.remove())
    const tags = [...own.querySelectorAll("code")].map((code) => {
      code.remove()
      return code.textContent.trim()
    })
    const sub = li.querySelector(":scope > ul, :scope > ol")
    return {
      html: (own.querySelector(":scope > p") ?? own).innerHTML.trim(),
      tags: tags.filter(Boolean),
      children: sub ? [...sub.children].map(read) : [],
    }
  }
  const draw = (item, depth) => {
    const node = el("div", "mmp-node")
    const label = el("span", `mmp-label mmp-d${Math.min(depth, 3)}`, item.html)
    for (const tag of item.tags) label.append(" ", el("span", "mmp-tag", tag))
    node.append(label)
    if (item.children.length) {
      const kids = el("div", "mmp-kids")
      for (const child of item.children) {
        const kid = el("div", "mmp-kid")
        kid.append(draw(child, depth + 1))
        kids.append(kid)
      }
      node.append(kids)
    }
    return node
  }
  const heading = document.querySelector("h1")
  for (const list of document.querySelectorAll(".mindmap")) {
    const branches = [...list.children].map((li, i) => {
      const kid = el("div", "mmp-kid")
      kid.style.setProperty("--c", COLORS[i % COLORS.length])
      kid.append(draw(read(li), 1))
      return kid
    })
    const sheet = () => {
      const page = el("section", "mmp-page")
      const head = el("div", "mmp-head")
      const area = el("div", "mmp-area")
      const map = el("div", "mmp-map")
      const left = el("div", "mmp-kids mmp-left")
      const right = el("div", "mmp-kids mmp-right")
      map.append(left, el("span", "mmp-centre", list.dataset.centre), right)
      area.append(map)
      page.append(head, area)
      list.before(page)
      return { page, head, area, map, left, right, room: { left: 0, right: 0 } }
    }
    // how tall is each branch, and how much does a page hold?
    const probe = sheet()
    probe.right.append(...branches)
    const heights = branches.map((b) => b.offsetHeight)
    const room = probe.area.clientHeight
    probe.page.remove()

    const sheets = []
    branches.forEach((branch, i) => {
      let last = sheets.at(-1)
      const side = ["right", "left"].find(
        (s) =>
          last &&
          (s === "right" ? last.room.left === 0 : true) &&
          (last.room[s] === 0 || last.room[s] + heights[i] <= room),
      )
      if (!side) sheets.push((last = sheet()))
      last[side ?? "right"].append(branch)
      last.room[side ?? "right"] += heights[i]
    })
    sheets.forEach((s, i) => {
      s.head.textContent = `${heading?.textContent ?? ""}${sheets.length > 1 ? ` · ${i + 1}/${sheets.length}` : ""}`
      for (const side of [s.left, s.right]) if (!side.children.length) side.remove()
      // a branch wider or taller than the page shrinks its page
      const scale = Math.min(
        1,
        s.area.clientWidth / s.map.offsetWidth,
        s.area.clientHeight / s.map.offsetHeight,
      )
      if (scale < 1) s.map.style.zoom = scale
    })
    list.style.display = "none"
  }
  if (heading) heading.style.display = "none"
}

// ── the booklet's parts as HTML ──────────────────────────────────────────────

const CSS = `
@page { size: A5; margin: 13mm 13mm 17mm; }
html { font-size: 9pt; }
body { margin: 0; background: #fff; color: #111; line-height: 1.38; }
h1, h2, h3, h4 { break-after: avoid; color: #111; }
h1 { font-size: 1.7rem; margin: 0 0 0.8rem; padding-bottom: 0.4rem; border-bottom: 1.5pt solid #111; }
h2 { font-size: 1.2rem; margin: 1.3rem 0 0.4rem; }
h3 { font-size: 1rem; margin: 1rem 0 0.3rem; }
p, ul, ol { margin: 0.4rem 0; orphans: 2; widows: 2; }
ul { padding-left: 1.3rem; }
ol { padding-left: 1.9rem; }
.table-container { overflow: visible; margin: 0.5rem 0; }
.table-container > table, table { width: 100%; margin: 0; padding: 0; border-collapse: collapse; font-size: 0.88em; }
.table-container > table > *, table > * { line-height: 1.3; }
.table-container > table th, .table-container > table td, th, td { min-width: 0; padding: 2pt 4pt; border: 0.5pt solid #999; vertical-align: top; text-align: left; hyphens: auto; }
th { background: #eee; }
tr, img, .katex-display { break-inside: avoid; }
img { display: block; max-width: 100%; max-height: 75mm; margin: 0.5rem auto; }
.callout { margin: 0.6rem 0; padding: 0 0.6rem; }
.katex-display { margin: 0.6rem 0; }
.xref { color: #555; font-size: 0.85em; white-space: nowrap; }
.questions li, .answers li { margin: 0.35rem 0; }
.answers li > :first-child { margin-top: 0; }
.answers li { break-inside: avoid; }
.glossary td:nth-child(-n + 2) { width: 22%; }
.glossary th:last-child, .glossary td:last-child { width: 12%; color: #555; font-size: 0.9em; hyphens: none; }
.cover { height: 175mm; display: flex; flex-direction: column; }
.cover .site { font-family: var(--headerFont); letter-spacing: 0.2em; font-size: 0.9rem; }
.cover h1 { margin-top: 38mm; font-size: 2.3rem; border: 0; padding: 0; }
.cover .what { font-size: 1.3rem; margin: 0.3rem 0 1.2rem; }
.cover .scheme { margin-top: auto; padding-top: 0.6rem; border-top: 0.5pt solid #111; }
.cover .built { color: #555; font-size: 0.85em; }
.toc { list-style: none; padding: 0; }
.toc li { display: flex; align-items: baseline; gap: 0.4rem; margin: 0.45rem 0; }
.toc .dots { flex: 1; border-bottom: 0.5pt dotted #777; }
.toc .extra { margin-top: 1rem; }
.mindmap { padding-left: 1.1rem; }
.mindmap code { font-size: 0.8em; color: #555; background: none; padding: 0; }
@page map { size: 210mm 148mm; margin: 11mm 13mm 15mm; }
.mmp-page { page: map; height: 121mm; display: flex; flex-direction: column; --c: #555; }
.mmp-page + .mmp-page { break-before: page; }
.mmp-head { flex: none; font-size: 0.8rem; font-weight: 600; padding-bottom: 2pt; border-bottom: 0.5pt solid #111; }
.mmp-area { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; }
.mmp-map { display: flex; align-items: center; width: max-content; font-size: 6.9pt; line-height: 1.18; }
.mmp-left { direction: rtl; }
.mmp-node { display: flex; align-items: center; }
.mmp-label { direction: ltr; box-sizing: border-box; max-width: 30mm; padding: 0.6pt 2.5pt; border-bottom: 0.6pt solid var(--c); hyphens: manual; }
.mmp-d1 { max-width: 21mm; padding: 2pt 4pt; border: 0; border-radius: 3pt; background: var(--c); color: #fff; font-weight: 600; font-size: 1.08em; }
.mmp-d2 { max-width: 24mm; padding: 1.2pt 3pt; border: 0.6pt solid var(--c); border-radius: 3pt; font-weight: 600; }
.mmp-centre { flex: none; box-sizing: border-box; max-width: 34mm; padding: 4pt 6pt; border: 1.2pt solid #111; border-radius: 5pt; font-weight: 700; font-size: 1.3em; text-align: center; }
.mmp-tag { font-family: var(--codeFont); font-size: 0.8em; font-weight: 400; opacity: 0.65; white-space: nowrap; }
.mmp-label .xref { font-size: 0.9em; font-weight: 400; color: inherit; opacity: 0.75; }
.mmp-kids { position: relative; display: flex; flex-direction: column; margin-inline-start: 5pt; }
.mmp-kids::before, .mmp-kid::before, .mmp-kid::after { content: ""; position: absolute; inset-inline-start: 0; box-sizing: border-box; width: 5pt; }
.mmp-kids::before { inset-inline-start: -5pt; top: 50%; border-top: 0.6pt solid var(--c); }
.mmp-kid { position: relative; padding-block: 1.3pt; padding-inline-start: 5pt; break-inside: avoid; }
.mmp-map > .mmp-kids > .mmp-kid { padding-block: 4pt; }
.mmp-kid::before { top: 50%; border-top: 0.6pt solid var(--c); }
.mmp-kid::after { top: 0; bottom: 0; border-inline-start: 0.6pt solid var(--c); }
.mmp-kid:first-child::before, .mmp-kid:last-child::before { display: none; }
.mmp-kid:first-child::after { top: 50%; border-top: 0.6pt solid var(--c); border-start-start-radius: 4pt; }
.mmp-kid:last-child::after { bottom: 50%; border-bottom: 0.6pt solid var(--c); border-end-start-radius: 4pt; }
.mmp-kid:only-child::before { display: block; }
.mmp-kid:only-child::after { display: none; }
`

const html = (children) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
  [...stylesheets].map((href) => `<link rel="stylesheet" href="${href}">`).join("") +
  `<style>${CSS}</style></head><body>${toHtml(children)}</body></html>`

function parts(booklet) {
  const chapters = booklet.chapters
  const count = chapters.filter((c) => !c.map).length
  const answers = chapters.filter((c) => c.answers.length)
  // one glossary: a term that several notes define appears once, sorted by the German term
  const terms = new Map()
  for (const row of chapters.flatMap((c) => c.glossary)) {
    const key = row
      .slice(0, 2)
      .map((c) => toString(c).trim().toLowerCase())
      .join("|")
    row[0].properties.lang = "de" // so that the German term hyphenates as German
    if (!terms.has(key)) terms.set(key, row)
  }
  const glossary = [...terms.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "de", { sensitivity: "base" }))
    .map(([, row]) => h("tr", {}, row))

  const entry = (title, key, className) =>
    h("li", { className }, [
      h("span", {}, title),
      h("span", { className: ["dots"] }, []),
      h("span", {}, ref(key)),
    ])
  const out = [
    {
      key: "cover",
      html: html([
        h("div", { className: ["cover"] }, [
          h("div", { className: ["site"] }, "LIBEROS"),
          h("h1", {}, booklet.title),
          ...(booklet.what ? [h("div", { className: ["what"] }, booklet.what)] : []),
          ...(booklet.form ? [h("p", {}, booklet.form)] : []),
          h("div", { className: ["scheme"] }, [
            ...(booklet.scheme ? [h("p", {}, booklet.scheme)] : []),
            h(
              "p",
              { className: ["built"] },
              `${count} ${count === 1 ? "note" : "notes"} · built ${new Date().toISOString().slice(0, 10)}`,
            ),
          ]),
        ]),
      ]),
    },
    {
      key: "toc",
      html: html([
        h("h1", {}, "Contents"),
        h("ul", { className: ["toc"] }, [
          ...chapters.map((c) => entry(c.title, c.slug)),
          ...(answers.length ? [entry("Self-Test answers", "answers", ["extra"])] : []),
          ...(glossary.length
            ? [entry("Glossary", "glossary", answers.length ? [] : ["extra"])]
            : []),
        ]),
      ]),
    },
    ...chapters.map((c) => ({ key: c.slug, html: html([h("h1", {}, c.title), ...c.body]) })),
  ]
  if (answers.length)
    out.push({
      key: "answers",
      html: html([
        h("h1", {}, "Self-Test answers"),
        ...answers.flatMap((c) => [
          h("h2", {}, [
            { type: "text", value: c.title },
            h("span", { className: ["xref"] }, ` (p. ${ref(c.slug)})`),
          ]),
          h("ol", { className: ["answers"] }, c.answers),
        ]),
      ]),
    })
  if (glossary.length)
    out.push({
      key: "glossary",
      html: html([
        h("h1", {}, "Glossary"),
        h("table", { className: ["glossary"] }, [
          h("thead", {}, [
            h(
              "tr",
              {},
              ["Deutsch", "English", "Definition", "Level"].map((t) => h("th", {}, t)),
            ),
          ]),
          h("tbody", {}, glossary),
        ]),
      ]),
    })
  return out
}

// ── HTML → PDF ───────────────────────────────────────────────────────────────

const chrome = (() => {
  const candidates = [
    process.env.CHROME,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "google-chrome",
    "chromium",
    "chromium-browser",
  ].filter(Boolean)
  for (const bin of candidates) {
    try {
      execFileSync(bin, ["--version"], { stdio: "ignore" })
      return bin
    } catch {}
  }
  fail("no Chrome or Chromium found: install one or set CHROME=/path/to/binary")
})()

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "booklet-"))
let job = 0
const printed = new Map() // HTML → its PDF
function print(source) {
  const id = job++
  const file = path.join(tmp, `${id}.html`)
  const pdf = path.join(tmp, `${id}.pdf`)
  const profile = path.join(tmp, `profile-${id}`)
  fs.writeFileSync(file, source)
  const flags = [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--user-data-dir=${profile}`,
    `--print-to-pdf=${pdf}`,
    ...(process.env.CI ? ["--no-sandbox"] : []), // the runner's sandbox restrictions stop Chrome
    pathToFileURL(file).href,
  ]
  // Chrome does not always quit after printing, so wait for the file rather than for the exit:
  // done once the PDF is there and has stopped growing.
  return new Promise((resolve, reject) => {
    const proc = spawn(chrome, flags, { stdio: "ignore" })
    const started = Date.now()
    let size = -1
    const stop = (error) => {
      clearInterval(timer)
      // Chrome and its helpers: they share the profile directory on their command line
      proc.kill("SIGKILL")
      spawnSync("pkill", ["-9", "-f", profile])
      if (error) reject(error)
      else resolve(fs.readFileSync(pdf))
    }
    const timer = setInterval(() => {
      const now = fs.existsSync(pdf) ? fs.statSync(pdf).size : 0
      if (now > 0 && now === size) stop()
      else if (Date.now() - started > 90000) stop(new Error(`Chrome did not print ${file}`))
      size = now
    }, 250)
    proc.on("error", (error) => stop(new Error(`Chrome could not start: ${error.message}`)))
  })
}

// run `task` over `items`, a few at a time
async function pool(items, task, size = 4) {
  const queue = [...items]
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (queue.length) await task(queue.shift())
    }),
  )
}

async function build(booklet, name) {
  const list = parts(booklet)
  // A page number can only be printed once the pages are counted, and printing it can move a
  // page break. So: print, count, fill in the numbers, and print again whatever changed.
  let pages = new Map()
  for (let round = 0; round < 5; round++) {
    const stale = list.filter((part) => {
      const filled = part.html.replace(/@@P:(.*?)@@/g, (_, key) => pages.get(key) ?? "00")
      if (filled === part.printed) return false
      part.printed = filled
      return true
    })
    if (stale.length === 0) break
    await pool(stale, async (part) => {
      // the same note goes into several booklets of a course: print it once
      if (!printed.has(part.printed)) printed.set(part.printed, print(part.printed))
      part.pdf = await PDFDocument.load(await printed.get(part.printed))
    })
    let next = 1
    pages = new Map(
      list.map((part) => {
        const start = next
        next += part.pdf.getPageCount()
        return [part.key, start]
      }),
    )
  }

  const read = await PDFDocument.create()
  read.setTitle(`${booklet.title}${booklet.what ? ` · ${booklet.what}` : ""}`)
  const font = await read.embedFont(StandardFonts.Helvetica)
  for (const part of list)
    for (const p of await read.copyPages(part.pdf, part.pdf.getPageIndices())) read.addPage(p)
  read.getPages().forEach((p, i) => {
    if (i === 0) return // the cover
    const label = String(i + 1)
    const width = font.widthOfTextAtSize(label, 8)
    const color = rgb(0.3, 0.3, 0.3)
    // a landscape page (a mind map) is turned in the booklet: its left edge is the foot there
    if (p.getWidth() > p.getHeight())
      p.drawText(label, {
        x: 24,
        y: (p.getHeight() + width) / 2,
        size: 8,
        font,
        color,
        rotate: degrees(-90),
      })
    else p.drawText(label, { x: (p.getWidth() - width) / 2, y: 24, size: 8, font, color })
  })
  const bytes = await read.save()
  const count = read.getPageCount()

  // Imposition for a folded booklet: sheet s carries pages (n-2s, 2s+1) on the front and
  // (2s+2, n-2s-1) on the back, with n the page count rounded up to a multiple of four.
  const sheets = Math.ceil(count / 4)
  const n = sheets * 4
  const paper = await PDFDocument.create()
  const embedded = await paper.embedPdf(bytes, [...Array(count).keys()])
  for (let s = 0; s < sheets; s++)
    for (const side of [
      [n - 1 - 2 * s, 2 * s],
      [2 * s + 1, n - 2 - 2 * s],
    ]) {
      const sheet = paper.addPage(A4)
      side.forEach((index, half) => {
        const p = embedded[index] // undefined: one of the blank pages that fill the last sheet
        if (!p) return
        const left = (half * A4[0]) / 2
        if (p.width > p.height)
          sheet.drawPage(p, {
            x: left + (A4[0] / 2 + p.height) / 2,
            y: (A4[1] - p.width) / 2,
            rotate: degrees(90),
          })
        else sheet.drawPage(p, { x: left + (A4[0] / 2 - p.width) / 2, y: (A4[1] - p.height) / 2 })
      })
    }

  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, `${name}.pdf`), bytes)
  fs.writeFileSync(path.join(OUT, `${name}-print.pdf`), await paper.save())
  console.log(
    `${path.join(OUT, name)}.pdf  ${booklet.chapters.filter((c) => !c.map).length} notes, ${count} pages · -print.pdf: ${sheets} ${sheets === 1 ? "sheet" : "sheets"} of A4`,
  )
}

// ── what to build ────────────────────────────────────────────────────────────

const jobs = []
const forAssessment = (map, a) => {
  const inBooklet = new Set([...a.maps, ...a.slugs])
  jobs.push({
    name: fileName(map.course, a.what),
    booklet: {
      title: map.title,
      what: `${a.what} · ${a.when}`,
      form: a.form,
      scheme: map.scheme,
      chapters: [
        ...a.maps.map((slug) => mindmap(slug, inBooklet)),
        ...a.slugs.map((slug) => chapter(slug, inBooklet)),
      ],
    },
  })
}

if (ALL) {
  for (const course of maps.keys()) {
    if (!onSite(maps.get(course).slug)) continue
    const listed = [maps.get(course).data.booklets ?? []].flat().map(String)
    if (listed.length === 0) continue
    const map = courseMap(course)
    for (const a of map.assessments)
      if (a.slugs.length && listed.includes(a.what)) forAssessment(map, a)
  }
} else if (NOTES) {
  const slugs = NOTES.split(",").map((raw) => {
    const name = raw.trim()
    const hit = vault.find((n) => n.name === name && onSite(n.slug))
    return hit?.slug ?? fail(`no note "${name}" in ${SITE}/ (unpublished? try SITE=public-private)`)
  })
  const inBooklet = new Set(slugs)
  const chapters = slugs.map((slug) => chapter(slug, inBooklet))
  const title = TITLE ?? chapters[0].title
  jobs.push({ name: fileName("notes", title), booklet: { title, chapters } })
} else {
  const map = courseMap(code)
  const dated = map.assessments.filter((a) => a.date)
  const today = new Date().setHours(0, 0, 0, 0)
  const hits = test
    ? dated.filter((a) => a.what.toLowerCase().includes(String(test).toLowerCase()))
    : [...dated]
        .sort((a, b) => a.date - b.date)
        .filter((a) => a.date >= today)
        .slice(0, 1)
  if (hits.length !== 1)
    fail(
      `${test ? `TEST=${test} matches ${hits.length} assessments` : "no upcoming dated assessment"} in ${map.title}. Dated assessments:\n` +
        dated.map((a) => `  ${a.what} (${a.when})`).join("\n"),
    )
  const [a] = hits
  if (a.slugs.length === 0) fail(`no session up to ${a.what} (${a.when}) links a note on the site`)
  if (a.missing)
    console.warn(`! ${a.missing} session(s) up to ${a.what} have no note on the site yet`)
  forAssessment(map, a)
}

try {
  for (const { booklet, name } of jobs) await build(booklet, name)
  if (jobs.length === 0)
    console.log("no course map lists `booklets:` with notes on the site: nothing to build")
} finally {
  fs.rmSync(tmp, { recursive: true, force: true })
}
