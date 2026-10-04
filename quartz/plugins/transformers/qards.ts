import fs from "fs"
import path from "path"
import { QuartzTransformerPlugin } from "../types"
import { Element, ElementContent, Root } from "hast"
import { visit } from "unist-util-visit"
import { toString } from "hast-util-to-string"
import { toHtml } from "hast-util-to-html"
import {
  FullSlug,
  joinSegments,
  normalizeHastElement,
  resolveRelative,
  slugTag,
} from "../../util/path"

// Collects the flashcards of the Qard Obsidian plugin (`> [!qard]- Question` callouts) from each
// note into file.data.qards; Plugin.Flashcards() turns them into the /flashcards pages.
// Must run after CrawlLinks and Latex so links and math in a card are already rendered.
//
// Same rules as the Obsidian plugin:
// - deck  = frontmatter `qard-deck`, otherwise the note's filename
// - topic = frontmatter `qard-topic`, otherwise the closest preceding heading ("General" before
//           the first one). A leading "Self-Test:" is dropped: "## Self-Test: OODA" → topic "OODA".
// - front = the callout title, plus everything above an optional `<!-- qard-answer -->` marker
//
// Site only (Obsidian ignores the comments and shows the whole callout body):
// - `<!-- qard-hide: Label; Other label -->` makes an image card: in every SVG above the comment,
//   the labels (the text of a <text> element) are replaced by (1), (2), … until the card is turned.
//   Without a `qard-answer` marker, the comment also ends the front.
// - `<!-- qard-solution -->` makes a calculation card: what follows on the back is the worked
//   solution, folded away under the result until asked for.
// - `<!-- qard-write -->` makes a written card: the site asks for the answer in a text field and
//   shows it next to the card's answer when the card is turned.
//
// Bridge cards are generated, not written: each line of a note's `## Key Connections` section
// (`- [[Other Note]]: how it relates`) becomes "How does <note> relate to <other note>?" in
// file.data.qardBridges; Plugin.Flashcards() collects them in a deck of their own.
export const FLASHCARDS_SLUG = "flashcards"
export const BRIDGES_HEADING = "Key Connections"

export type QardKind = "text" | "image" | "calc"

export interface Qard {
  id: string // stable while the note keeps its place and the question its wording: keys the review history
  kind: QardKind
  write?: boolean // the answer is typed first, then compared
  topic: string
  front: string // HTML, links already relative to the deck page
  back: string
}

export function qardDeckSlug(deck: string): FullSlug {
  return joinSegments(FLASHCARDS_SLUG, slugTag(deck)) as FullSlug
}

// FNV-1a, base 36: short enough to list every card id of a deck in the page
function hash(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

const hasClass = (node: ElementContent, name: string): node is Element =>
  node.type === "element" &&
  Array.isArray(node.properties?.className) &&
  node.properties.className.includes(name)

const isComment = (node: ElementContent, name: string): boolean =>
  node.type === "comment" && new RegExp(`^\\s*${name}\\b`).test(node.value)

// index of the top-level node that is, or contains, the `<!-- name -->` comment
const findMarker = (nodes: ElementContent[], name: string): number =>
  nodes.findIndex(
    (node) =>
      isComment(node, name) ||
      (node.type === "element" && node.children.some((child) => isComment(child, name))),
  )

const isBlank = (node: ElementContent): boolean =>
  node.type === "comment" || (node.type === "text" && node.value.trim() === "")

// a paragraph that held only a marker comment leaves nothing to show
const isEmpty = (node: ElementContent): boolean =>
  isBlank(node) || (node.type === "element" && node.tagName === "p" && node.children.every(isBlank))

function withoutComments(nodes: ElementContent[]): ElementContent[] {
  return nodes
    .filter((node) => node.type !== "comment")
    .map((node) =>
      node.type === "element" ? { ...node, children: withoutComments(node.children) } : node,
    )
}

function asText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined
}

const normalizeLabel = (text: string): string =>
  text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

// Replaces the SVG labels named in `labels` by their position in that list: (1), (2), …
// Returns the labels that no <text> element carries.
export function hideSvgLabels(svg: string, labels: string[]): { svg: string; missing: string[] } {
  const wanted = labels.map(normalizeLabel)
  const found = new Set<number>()
  const masked = svg.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g, (whole, attrs, inner) => {
    const n = wanted.indexOf(normalizeLabel(inner))
    if (n < 0) return whole
    found.add(n)
    const plain = String(attrs).replace(/\s(style|fill)="[^"]*"/g, "")
    return `<text${plain} style="fill:#d4a84b;font-weight:700">(${n + 1})</text>`
  })
  return { svg: masked, missing: labels.filter((_, n) => !found.has(n)) }
}

export const Qards: QuartzTransformerPlugin = () => ({
  name: "Qards",
  htmlPlugins(ctx) {
    return [
      () => (tree: Root, file) => {
        const fm: Record<string, unknown> = file.data.frontmatter ?? {}
        const slug = file.data.slug!
        const deck = asText(fm["qard-deck"]) ?? file.stem ?? slug
        const deckSlug = qardDeckSlug(deck)
        const fixedTopic = asText(fm["qard-topic"])
        const toSource = resolveRelative(deckSlug, slug)

        // a card is shown on the deck page, not on its note: rebase its links to that page
        const render = (nodes: ElementContent[]): string =>
          toHtml(
            nodes.map((node) => {
              if (node.type !== "element") return node
              const el = normalizeHastElement(node, deckSlug, slug)
              visit(el, "element", (child: Element) => {
                const href = child.properties?.href
                if (typeof href === "string" && href.startsWith("#")) {
                  child.properties.href = toSource + href
                }
              })
              return el
            }),
          )

        // image card: each SVG gets a twin with the labels hidden, shown until the card is turned
        const hideLabels = (nodes: ElementContent[], labels: string[]): ElementContent[] =>
          nodes.flatMap((node): ElementContent[] => {
            if (node.type !== "element") return [node]
            const src = node.properties?.src
            if (node.tagName !== "img" || typeof src !== "string" || !/\.svg$/i.test(src))
              return [{ ...node, children: hideLabels(node.children, labels) }]
            // an image link is relative to the folder of its note
            const asset = path.join(
              ctx.argv.directory,
              path.posix.join(path.posix.dirname(slug), decodeURI(src)),
            )
            if (!fs.existsSync(asset)) {
              console.warn(`qard-hide: ${file.data.relativePath}: cannot read ${src}`)
              return [node]
            }
            const { svg, missing } = hideSvgLabels(fs.readFileSync(asset, "utf8"), labels)
            for (const label of missing)
              console.warn(`qard-hide: ${file.data.relativePath}: no label "${label}" in ${src}`)
            const className = (node.properties.className as string[] | undefined) ?? []
            return [
              {
                ...node,
                properties: {
                  ...node.properties,
                  src: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
                  className: [...className, "qard-masked"],
                },
              },
              {
                ...node,
                properties: { ...node.properties, className: [...className, "qard-unmasked"] },
              },
            ]
          })

        const ids = new Set<string>()
        const uniqueId = (text: string): string => {
          let id = hash(`${slug}\n${text}`)
          for (let n = 2; ids.has(id); n++) id = hash(`${slug}\n${text}\n${n}`)
          ids.add(id)
          return id
        }

        const title = asText(fm.title) ?? file.stem ?? slug
        const cards: Qard[] = []
        const bridges: Qard[] = []
        let heading = "General"
        visit(tree, "element", (node: Element) => {
          if (/^h[1-6]$/.test(node.tagName)) {
            heading = toString(node).trim() || heading
            return
          }

          // `- [[Other Note]]: how it relates` under Key Connections
          if (node.tagName === "li" && heading === BRIDGES_HEADING) {
            let kids = node.children.filter((c) => !(c.type === "text" && c.value.trim() === ""))
            if (kids.length === 1 && kids[0].type === "element" && kids[0].tagName === "p")
              kids = kids[0].children
            const colon = kids.findIndex((c) => c.type === "text" && c.value.includes(":"))
            if (colon < 1) return
            const text = (kids[colon] as { value: string }).value
            const at = text.indexOf(":")
            const others: ElementContent[] = [
              ...kids.slice(0, colon),
              { type: "text", value: text.slice(0, at).trimEnd() },
            ]
            const relation: ElementContent[] = [
              { type: "text", value: text.slice(at + 1).trimStart() },
              ...kids.slice(colon + 1),
            ]
            if (!others.some((c) => hasClass(c, "internal"))) return
            if (toString({ type: "root", children: relation }).trim().length < 3) return
            bridges.push({
              id: uniqueId(`bridge\n${toString({ type: "root", children: others })}`),
              kind: "text",
              topic: asText(Array.isArray(fm.courses) ? fm.courses[0] : fm.courses) ?? "",
              front: render([
                { type: "text", value: "How does " },
                {
                  type: "element",
                  tagName: "strong",
                  properties: {},
                  children: [{ type: "text", value: title }],
                },
                { type: "text", value: " relate to " },
                ...others,
                { type: "text", value: "?" },
              ]),
              back: render([{ type: "element", tagName: "p", properties: {}, children: relation }]),
            })
            return
          }

          if (node.tagName !== "blockquote" || node.properties?.dataCallout !== "qard") return

          const calloutTitle = node.children.find((c) => hasClass(c, "callout-title")) as
            | Element
            | undefined
          const inner = calloutTitle?.children.find((c) => hasClass(c, "callout-title-inner")) as
            | Element
            | undefined
          const content = node.children.find((c) => hasClass(c, "callout-content")) as
            | Element
            | undefined
          if (!inner || !content) return // a card without a question or without an answer

          // drop the list number the notes put in front of each question ("3. Why ...")
          const question = structuredClone(inner.children)
          const first = question[0]?.type === "element" ? question[0].children[0] : question[0]
          if (first?.type === "text") first.value = first.value.replace(/^\s*\d+[.)]\s+/, "")
          const questionText = toString({ type: "root", children: question }).trim()

          const body = content.children
          const answerAt = findMarker(body, "qard-answer")
          const hideAt = findMarker(body, "qard-hide")
          const solutionAt = findMarker(body, "qard-solution")

          // the front ends at the answer marker; an image card may leave it out, then the front
          // ends with the paragraph that holds the image and the qard-hide comment
          const split = answerAt >= 0 ? answerAt : hideAt >= 0 ? hideAt + 1 : 0
          let frontBody = body.slice(0, split)
          const backEnd = solutionAt >= split ? solutionAt : body.length
          let back: ElementContent[] = body.slice(answerAt >= 0 ? answerAt + 1 : split, backEnd)

          if (hideAt >= 0) {
            let labels: string[] = []
            visit({ type: "root", children: body } as Root, "comment", (comment) => {
              const list = comment.value.match(/^\s*qard-hide\s*:([\s\S]*)$/)
              if (list)
                labels = list[1]
                  .split(";")
                  .map((l) => l.trim())
                  .filter(Boolean)
            })
            frontBody = hideLabels(frontBody, labels)
          }
          if (solutionAt >= split) {
            back = [
              ...back,
              {
                type: "element",
                tagName: "details",
                properties: { className: ["qard-solution"] },
                children: [
                  {
                    type: "element",
                    tagName: "summary",
                    properties: {},
                    children: [{ type: "text", value: "Worked solution" }],
                  },
                  ...body.slice(solutionAt + 1),
                ],
              },
            ]
          }

          const clean = (nodes: ElementContent[]) =>
            withoutComments(nodes).filter((n) => !isEmpty(n))
          cards.push({
            id: uniqueId(questionText),
            write: findMarker(body, "qard-write") >= 0,
            kind:
              hideAt >= 0
                ? "image"
                : solutionAt >= 0 || /^calculate\b/i.test(questionText)
                  ? "calc"
                  : "text",
            topic: fixedTopic ?? heading.replace(/^self[- ]?test\s*:\s*/i, ""),
            front: render([...question, ...clean(frontBody)]),
            back: render(clean(back)),
          })
        })

        if (cards.length > 0) {
          file.data.qardDeck = deck
          file.data.qards = cards
        }
        if (bridges.length > 0) file.data.qardBridges = bridges
      },
    ]
  },
})

declare module "vfile" {
  interface DataMap {
    qardDeck: string
    qards: Qard[]
    qardBridges: Qard[]
  }
}
