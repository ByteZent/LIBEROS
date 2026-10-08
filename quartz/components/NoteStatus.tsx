import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { FullSlug, resolveRelative, slugTag } from "../util/path"
import { COURSE_TAG_PREFIX } from "../plugins/transformers/courseTags"
import { qardDeckSlug } from "../plugins/transformers/qards"
import style from "./styles/noteStatus.scss"

// Renders the LIBEROS note metadata (type / maturity / confidence / domain / course) as a status strip.
// All fields are optional; the strip is omitted when a note declares none of them.

// COURSE badges link to the course page (/tags/course/<code>, see plugins/transformers/courseTags.ts)
// and take their label from that page's title (content/tags/course/<code>.md); otherwise the raw code.

// A note with [!qard] cards gets a FLASHCARDS badge that opens its deck on the note's own topic.

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
  model: "Model",
  norm: "Legal Norm",
  judgment: "Judgment",
  meta: "Meta",
  idea: "Idea",
  practice: "Practice Questions",
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
  function NoteStatus({ fileData, allFiles, displayClass }: QuartzComponentProps) {
    const fm: Record<string, unknown> = fileData.frontmatter ?? {}
    const type = asString(fm.type)
    const status = asString(fm.status)
    const confidence = asString(fm.confidence)
    // domain may be a single value or a list (a note can belong to several disciplines)
    const domain = (Array.isArray(fm.domain) ? fm.domain : [fm.domain])
      .map(asString)
      .filter((d): d is string => d !== undefined)
      .join(" · ")
    // course codes keep their original case (e.g. L1-HS26)
    const courses = (Array.isArray(fm.courses) ? fm.courses : [fm.courses]).filter(
      (c): c is string => typeof c === "string" && c.trim() !== "",
    )
    // ideas (type: idea): how far the idea has come, what it is meant to become, when it was captured
    const stage = asString(fm.stage)
    const output = asString(fm.output)
    const captured =
      fm.captured instanceof Date
        ? fm.captured.toISOString().slice(0, 16).replace("T", " ")
        : typeof fm.captured === "string"
          ? fm.captured.trim().replace("T", " ")
          : undefined
    const review = fm.review instanceof Date ? fm.review.toISOString().slice(0, 10) : fm.review

    const qards = fileData.qards ?? []
    const topics = [...new Set(qards.map((card) => card.topic))]

    if (!type && !status && !confidence && !domain && courses.length === 0 && qards.length === 0)
      return null

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
        {stage && (
          <span class={`ns-item ns-stage ns-stage-${stage}`}>
            <span class="ns-key">STAGE</span>
            {stage}
          </span>
        )}
        {output && (
          <span class="ns-item">
            <span class="ns-key">FOR</span>
            {output}
          </span>
        )}
        {captured && (
          <span class="ns-item">
            <span class="ns-key">CAPTURED</span>
            {captured}
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
        {courses.map((code) => {
          const slug = `tags/${slugTag(COURSE_TAG_PREFIX + code.trim())}` as FullSlug
          const label = allFiles.find((f) => f.slug === slug)?.frontmatter?.title ?? code.trim()
          return (
            <a
              class="ns-item ns-course internal"
              href={resolveRelative(fileData.slug!, slug)}
              title={`All notes for ${code.trim()}`}
            >
              <span class="ns-key">COURSE</span>
              {label}
            </a>
          )
        })}
        {qards.length > 0 && (
          <a
            class="ns-item ns-course"
            href={
              resolveRelative(fileData.slug!, qardDeckSlug(fileData.qardDeck!)) +
              (topics.length === 1 ? `?topic=${encodeURIComponent(topics[0])}` : "")
            }
            title="Study this note's flashcards"
            data-qard-ids={qards.map((card) => card.id).join(" ")}
          >
            <span class="ns-key">FLASHCARDS</span>
            {qards.length} {qards.length === 1 ? "card" : "cards"}
            <span class="qard-due"></span>
          </a>
        )}
        {qards.length > 0 &&
          (fileData.qardSets ?? []).map((set) => (
            <a
              class="ns-item ns-course"
              href={
                resolveRelative(fileData.slug!, qardDeckSlug(set)) +
                (topics.length === 1 ? `?topic=${encodeURIComponent(topics[0])}` : "")
              }
              title={`This note's cards in the set ${set}`}
            >
              <span class="ns-key">CARD SET</span>
              {set}
            </a>
          ))}
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
