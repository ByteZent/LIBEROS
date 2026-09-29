import { QuartzTransformerPlugin } from "../types"
import { Element, ElementContent, Root, Text } from "hast"
import { SKIP, visit } from "unist-util-visit"

// Presentation for a note's sources. Must run after Plugin.Citations:
// - puts a "References" heading above the bibliography that rehype-citation appends (div#refs)
// - turns "[High confidence]" / "[Medium confidence: primary]" into a small rating badge
const CONFIDENCE = /\[(High|Medium|Low) confidence(?::\s*([^\]]+))?\]/g

function badge(level: string, detail?: string): Element {
  const children: ElementContent[] = [{ type: "text", value: level }]
  if (detail) {
    children.push({
      type: "element",
      tagName: "span",
      properties: { className: ["conf-detail"] },
      children: [{ type: "text", value: detail.trim() }],
    })
  }
  return {
    type: "element",
    tagName: "span",
    properties: {
      className: ["conf", `conf-${level.toLowerCase()}`],
      title: `${level} confidence${detail ? `: ${detail.trim()}` : ""}`,
    },
    children,
  }
}

export const SourceFormatting: QuartzTransformerPlugin = () => ({
  name: "SourceFormatting",
  htmlPlugins() {
    return [
      () => (tree: Root) => {
        visit(tree, "text", (node: Text, index, parent) => {
          CONFIDENCE.lastIndex = 0 // global regex: .test() keeps state between calls
          if (!parent || index === undefined || !CONFIDENCE.test(node.value)) return
          if (parent.type === "element" && ["code", "pre"].includes(parent.tagName)) return
          const parts: ElementContent[] = []
          let last = 0
          for (const m of node.value.matchAll(CONFIDENCE)) {
            if (m.index! > last)
              parts.push({ type: "text", value: node.value.slice(last, m.index) })
            parts.push(badge(m[1], m[2]))
            last = m.index! + m[0].length
          }
          if (last < node.value.length) parts.push({ type: "text", value: node.value.slice(last) })
          parent.children.splice(index, 1, ...parts)
          return [SKIP, index + parts.length]
        })

        visit(tree, "element", (node: Element, index, parent) => {
          if (node.properties?.id !== "refs" || !parent || index === undefined) return
          if (node.children.every((c) => c.type === "text")) return // empty bibliography
          const heading: Element = {
            type: "element",
            tagName: "h3",
            properties: { id: "references", className: ["references-heading"] },
            children: [{ type: "text", value: "References" }],
          }
          parent.children.splice(index, 0, heading)
          return [SKIP, index + 2]
        })
      },
    ]
  },
})
