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
export const FLASHCARDS_SLUG = "flashcards"

export interface Qard {
  topic: string
  front: string // HTML, links already relative to the deck page
  back: string
}

export function qardDeckSlug(deck: string): FullSlug {
  return joinSegments(FLASHCARDS_SLUG, slugTag(deck)) as FullSlug
}

const hasClass = (node: ElementContent, name: string): node is Element =>
  node.type === "element" &&
  Array.isArray(node.properties?.className) &&
  node.properties.className.includes(name)

const isAnswerMarker = (node: ElementContent): boolean =>
  (node.type === "comment" && /^\s*qard-answer\s*$/.test(node.value)) ||
  (node.type === "element" && node.tagName === "p" && node.children.some(isAnswerMarker))

function asText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined
}

export const Qards: QuartzTransformerPlugin = () => ({
  name: "Qards",
  htmlPlugins() {
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

        const cards: Qard[] = []
        let heading = "General"
        visit(tree, "element", (node: Element) => {
          if (/^h[1-6]$/.test(node.tagName)) {
            heading = toString(node).trim() || heading
            return
          }
          if (node.tagName !== "blockquote" || node.properties?.dataCallout !== "qard") return

          const title = node.children.find((c) => hasClass(c, "callout-title")) as
            | Element
            | undefined
          const inner = title?.children.find((c) => hasClass(c, "callout-title-inner")) as
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

          const marker = content.children.findIndex(isAnswerMarker)
          const front = [...question, ...content.children.slice(0, Math.max(marker, 0))]
          const back = content.children.slice(marker + 1)

          cards.push({
            topic: fixedTopic ?? heading.replace(/^self[- ]?test\s*:\s*/i, ""),
            front: render(front),
            back: render(back),
          })
        })

        if (cards.length > 0) {
          file.data.qardDeck = deck
          file.data.qards = cards
        }
      },
    ]
  },
})

declare module "vfile" {
  interface DataMap {
    qardDeck: string
    qards: Qard[]
  }
}
