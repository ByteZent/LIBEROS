import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import style from "./styles/noteStatus.scss"

// Renders the LIBEROS note metadata (type / maturity / confidence / domain) as a status strip.
// All fields are optional; the strip is omitted when a note declares none of them.

const TYPE_LABELS: Record<string, string> = {
  concept: "Concept",
  actor: "Actor Profile",
  thinker: "Thinker",
  work: "Key Work",
  case: "Case Study",
  assessment: "Assessment",
  framework: "Framework",
  synthesis: "Synthesis",
  source: "Source Note",
  moc: "Map of Content",
  question: "Open Question",
  meta: "Meta",
}

const STATUS_LABELS: Record<string, string> = {
  seedling: "Seedling",
  developing: "Developing",
  evergreen: "Evergreen",
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim() !== "") return value.trim().toLowerCase()
  return undefined
}

export default (() => {
  function NoteStatus({ fileData, displayClass }: QuartzComponentProps) {
    const fm: Record<string, unknown> = fileData.frontmatter ?? {}
    const type = asString(fm.type)
    const status = asString(fm.status)
    const confidence = asString(fm.confidence)
    const domain = asString(fm.domain)
    const review = fm.review instanceof Date ? fm.review.toISOString().slice(0, 10) : fm.review

    if (!type && !status && !confidence && !domain) return null

    return (
      <div class={classNames(displayClass, "note-status")}>
        {type && (
          <span class="ns-item ns-type">
            <span class="ns-key">TYPE</span>
            {TYPE_LABELS[type] ?? type}
          </span>
        )}
        {status && (
          <span class={`ns-item ns-status ns-status-${status}`}>
            <span class="ns-key">MATURITY</span>
            {STATUS_LABELS[status] ?? status}
          </span>
        )}
        {confidence && (
          <span class={`ns-item ns-confidence ns-confidence-${confidence}`}>
            <span class="ns-key">CONFIDENCE</span>
            {confidence}
          </span>
        )}
        {domain && (
          <span class="ns-item ns-domain">
            <span class="ns-key">DOMAIN</span>
            {domain}
          </span>
        )}
        {typeof review === "string" && review !== "" && (
          <span class="ns-item ns-review">
            <span class="ns-key">NEXT REVIEW</span>
            {review}
          </span>
        )}
      </div>
    )
  }

  NoteStatus.css = style

  return NoteStatus
}) satisfies QuartzComponentConstructor
