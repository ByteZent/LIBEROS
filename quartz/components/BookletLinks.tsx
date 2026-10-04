import { Element, Root } from "hast"
import { toString } from "hast-util-to-string"
import { visit } from "unist-util-visit"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { pathToRoot } from "../util/path"

// On a course map (type: moc with a `course` code): one badge per assessment that has a printable
// booklet, i.e. one the map lists in its frontmatter (`booklets: ["Test 1"]`, the names in the
// What column) that is a dated row of the Assessment table with at least one published note in
// the Sessions rows up to that date. Each links to the A5 reading PDF and to the imposed print PDF.
// The files are built after Quartz by scripts/booklet.mjs --all (see `make build` and the deploy),
// so under `make serve` the links only work once `make booklets` has run.
// NB: scripts/booklet.mjs applies the same rules to the same tables. Change both together.
const fileName = (course: string, what: string) =>
  `${course}-${what
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`

export default (() => {
  function BookletLinks({ fileData, allFiles, tree, displayClass }: QuartzComponentProps) {
    const fm: Record<string, unknown> = fileData.frontmatter ?? {}
    if (fm.type !== "moc" || typeof fm.course !== "string" || !fm.booklets) return null
    const semester = String(fm.semester ?? "")
    const year = Number(semester.match(/\d{4}/)?.[0]) || new Date().getFullYear()
    const autumn = /^HS/i.test(semester)
    const published = new Set(allFiles.map((f) => f.slug as string))

    const assessments: { what: string; date: Date }[] = []
    const sessions: { date: Date; notes: number }[] = []
    let heading = "" // the `## heading` the walk is under
    visit(tree as Root, "element", (node: Element) => {
      if (node.tagName === "h2") heading = toString(node)
      if (node.tagName !== "tr") return
      const cells = node.children.filter((c): c is Element => (c as Element).tagName === "td")
      if (cells.length < 2) return
      if (/Assessment/.test(heading)) {
        const d = toString(cells[1]).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/)
        if (d)
          assessments.push({
            what: toString(cells[0]).trim(),
            date: new Date(+d[3], +d[2] - 1, +d[1]),
          })
      } else if (/Sessions/.test(heading)) {
        const d = toString(cells[0]).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})?/)
        if (!d) return
        // an autumn semester runs into January and February of the next year
        const y = d[3] ? +d[3] : year + (autumn && +d[2] < 8 ? 1 : 0)
        let notes = 0
        if (cells[2])
          visit(cells[2], "element", (a: Element) => {
            // CrawlLinks sets the property under its attribute name
            if (a.tagName === "a" && published.has(String(a.properties["data-slug"]))) notes++
          })
        sessions.push({ date: new Date(y, +d[2] - 1, +d[1]), notes })
      }
    })
    const listed = [fm.booklets ?? []].flat().map(String)
    const booklets = assessments.filter(
      (a) => listed.includes(a.what) && sessions.some((s) => s.date <= a.date && s.notes > 0),
    )
    if (booklets.length === 0) return null

    const base = `${pathToRoot(fileData.slug!)}/booklets`
    return (
      <div class={classNames(displayClass, "note-status")}>
        {booklets.map(({ what }) => {
          const file = `${base}/${fileName(fm.course as string, what)}`
          return (
            <span class="ns-item ns-course">
              <span class="ns-key">BOOKLET</span>
              {what}
              <a
                href={`${file}.pdf`}
                title="A5 pages in reading order"
                target="_blank"
                data-router-ignore
              >
                read
              </a>
              <a
                href={`${file}-print.pdf`}
                title="Imposed on A4: print double-sided, flip on the short edge, fold and staple"
                target="_blank"
                data-router-ignore
              >
                print
              </a>
            </span>
          )
        })}
      </div>
    )
  }

  return BookletLinks
}) satisfies QuartzComponentConstructor
