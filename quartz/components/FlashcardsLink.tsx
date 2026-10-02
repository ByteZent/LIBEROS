import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { resolveRelative, slugTag } from "../util/path"
import { COURSE_TAG_PREFIX } from "../plugins/transformers/courseTags"
import { qardDeckSlug } from "../plugins/transformers/qards"

// On a course page (/tags/course/<code>): a badge linking to the flashcard deck of that course,
// i.e. the deck whose `qard-deck` is the course code. Renders nothing on other pages or when the
// course has no cards. Styled like the NoteStatus strip, which links notes to their cards.
export default (() => {
  function FlashcardsLink({ fileData, allFiles, displayClass }: QuartzComponentProps) {
    const slug = fileData.slug!
    const cards = allFiles.filter(
      (f) => f.qardDeck && `tags/${slugTag(COURSE_TAG_PREFIX + f.qardDeck)}` === slug,
    )
    if (cards.length === 0) return null
    const count = cards.reduce((n, f) => n + f.qards!.length, 0)

    return (
      <div class={classNames(displayClass, "note-status")}>
        <a
          class="ns-item ns-course"
          href={resolveRelative(slug, qardDeckSlug(cards[0].qardDeck!))}
          title="Study this course's flashcards"
        >
          <span class="ns-key">FLASHCARDS</span>
          {count} {count === 1 ? "card" : "cards"}
        </a>
      </div>
    )
  }

  return FlashcardsLink
}) satisfies QuartzComponentConstructor
