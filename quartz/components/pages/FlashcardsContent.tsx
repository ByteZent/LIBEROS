import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { FullSlug, resolveRelative } from "../../util/path"
import { FLASHCARDS_SLUG } from "../../plugins/transformers/qards"
// @ts-ignore
import script from "../scripts/flashcards.inline"
import style from "../styles/flashcards.scss"

// Body of the pages Plugin.Flashcards() emits: the deck overview (/flashcards/) and a single deck.
// A deck lists every card with its answer; flashcards.inline.ts then turns that list into a
// one-card-at-a-time study view (so the page still reads fine without JavaScript).
// Notes and course pages link here through FlashcardsLink and the NoteStatus strip.
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

export default (() => {
  const FlashcardsContent: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const deck = fileData.flashcardDeck

    if (!deck) {
      const decks = fileData.flashcardDecks ?? []
      const mixed = decks.find((d) => d.mixed)
      return (
        <div class="popover-hint flashcards">
          <p>
            Every self-test question in the notes is a flashcard. Pick a deck to go through its
            cards; nothing is tracked or scored.
          </p>
          {decks.length === 0 ? (
            <p>No flashcards yet.</p>
          ) : (
            <>
              {mixed && (
                <div class="section-grid qard-featured">
                  <a class="section-card internal" href={resolveRelative(slug, mixed.slug)}>
                    <span class="num">{plural(mixed.cards.length, "card")}</span>
                    <span class="name">{mixed.title}</span>
                    <span class="desc">Cards from every deck, shuffled.</span>
                  </a>
                </div>
              )}
              {mixed && <p class="qard-divider">Decks by course</p>}
              <div class="section-grid">
                {decks
                  .filter((d) => !d.mixed)
                  .map((d) => (
                    <a class="section-card internal" href={resolveRelative(slug, d.slug)}>
                      <span class="num">{plural(d.cards.length, "card")}</span>
                      <span class="name">{d.title}</span>
                      <span class="desc">{d.topics.join(" · ")}</span>
                    </a>
                  ))}
              </div>
            </>
          )}
        </div>
      )
    }

    const count = (topic: string) => deck.cards.filter((c) => c.topic === topic).length
    return (
      <div class="popover-hint flashcards qard-deck">
        <p class="qard-summary">
          <a class="internal" href={resolveRelative(slug, `${FLASHCARDS_SLUG}/index` as FullSlug)}>
            ← All decks
          </a>
          <span>
            {plural(deck.cards.length, "card")} · {plural(deck.topics.length, "topic")}
          </span>
        </p>

        <div class="qard-toolbar">
          <label>
            <span class="qard-key">Topic</span>
            <select class="qard-topic-select">
              <option value="">All topics ({deck.cards.length})</option>
              {deck.topics.map((topic) => (
                <option value={topic}>
                  {topic} ({count(topic)})
                </option>
              ))}
            </select>
          </label>
          <button type="button" class="qard-shuffle" aria-pressed={deck.mixed ? "true" : "false"}>
            Shuffle
          </button>
          <span class="qard-progress" aria-live="polite"></span>
        </div>

        <div class="qard-stage">
          {deck.cards.map((card) => (
            <article class="qard-card" data-topic={card.topic}>
              <div class="qard-meta">
                <span class="qard-topic">{card.topic}</span>
                <a class="internal" href={resolveRelative(slug, card.source.slug)}>
                  {card.source.title}
                </a>
              </div>
              <div class="qard-front" dangerouslySetInnerHTML={{ __html: card.front }} />
              <div class="qard-back" dangerouslySetInnerHTML={{ __html: card.back }} />
            </article>
          ))}
          <div class="qard-done">
            <p class="qard-done-title">Deck finished</p>
            <p class="qard-score"></p>
            <div class="qard-done-actions">
              <button type="button" class="qard-repeat">
                Repeat missed
              </button>
              <button type="button" class="qard-restart">
                Start over
              </button>
            </div>
          </div>
        </div>

        <div class="qard-nav">
          <button type="button" class="qard-prev">
            ← Previous
          </button>
          <div class="qard-middle">
            <button type="button" class="qard-flip">
              Show answer
            </button>
            <button type="button" class="qard-missed" title="Missed (1)">
              Missed
            </button>
            <button type="button" class="qard-known" title="Knew it (2)">
              Knew it
            </button>
          </div>
          <button type="button" class="qard-next">
            Next →
          </button>
        </div>
        <p class="qard-hint">
          Space or click the card: show the answer · 1: missed · 2: knew it · ← →: previous and next
        </p>
      </div>
    )
  }

  FlashcardsContent.css = style
  FlashcardsContent.afterDOMLoaded = script

  return FlashcardsContent
}) satisfies QuartzComponentConstructor
