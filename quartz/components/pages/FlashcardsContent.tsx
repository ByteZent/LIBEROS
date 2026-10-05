import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { FullSlug, resolveRelative } from "../../util/path"
import { FLASHCARDS_SLUG } from "../../plugins/transformers/qards"
import type { FlashcardDeck } from "../../plugins/emitters/flashcards"
// @ts-ignore
import script from "../scripts/flashcards.inline"
import style from "../styles/flashcards.scss"

// Body of the pages Plugin.Flashcards() emits: the deck overview (/flashcards/) and a single deck.
// A deck lists every card with its answer; flashcards.inline.ts then turns that list into a
// one-card-at-a-time study view (so the page still reads fine without JavaScript) and schedules
// each card by how you rated it (scripts/qardStore.ts).
// Notes and course pages link here through FlashcardsLink and the NoteStatus strip.
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

// the overview card of a deck names its topics: only the first words, so that a deck with many
// or long topics does not get a card several times the height of its neighbours
const DESC_WORDS = 14
const brief = (topics: string[]) => {
  const words = topics.join(" · ").split(" ")
  if (words.length <= DESC_WORDS) return words.join(" ")
  return `${words
    .slice(0, DESC_WORDS)
    .join(" ")
    .replace(/[\s·:,]+$/, "")} … (${plural(topics.length, "topic")})`
}

const FEATURED: Record<string, string> = {
  connections: "How does one note relate to another? Generated from Key Connections.",
  recall:
    "One topic, a blank page: write down everything you know, then compare with the note's BLUF.",
  glossary: "German term on the front, English term and definition on the back.",
  "glossary-reverse": "English term on the front, German term on the back.",
}

export default (() => {
  const FlashcardsContent: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const deck = fileData.flashcardDeck

    if (!deck) {
      const decks = fileData.flashcardDecks ?? []
      const featured = decks.filter((d) => d.mixed)
      // the script adds "· n due" to each deck from the review history in this browser
      const card = (d: FlashcardDeck, desc: string) => (
        <a
          class="section-card internal"
          href={resolveRelative(slug, d.slug)}
          data-qard-ids={d.cards.map((c) => c.id).join(" ")}
        >
          <span class="num">
            {plural(d.cards.length, "card")}
            <span class="qard-due"></span>
          </span>
          <span class="name">{d.title}</span>
          <span class="desc">{desc}</span>
        </a>
      )
      return (
        <div class="popover-hint flashcards">
          <p>
            Every self-test question in the notes is a flashcard. A card you knew comes back after
            1, 3, 7, 14, 30, 60 and 120 days; a card you missed comes back the next day; a card that
            was hard stays where it is and comes back in half the time. A card missed on three days
            is a leech: rewrite it or its note. The history is kept in this browser only.
          </p>
          {decks.length === 0 ? (
            <p>No flashcards yet.</p>
          ) : (
            <>
              {featured.length > 0 && (
                <div class="section-grid qard-featured">
                  {featured.map((d) =>
                    card(
                      d,
                      (d.kind && FEATURED[d.kind]) ?? "What is due today in every deck, shuffled.",
                    ),
                  )}
                </div>
              )}
              {featured.length > 0 && <p class="qard-divider">Decks by course</p>}
              <div class="section-grid">
                {decks.filter((d) => !d.mixed).map((d) => card(d, brief(d.topics)))}
              </div>
              <p class="qard-backup">
                <button type="button" class="qard-export">
                  Export progress
                </button>
                <button type="button" class="qard-import">
                  Import progress
                </button>
                <input
                  type="file"
                  class="qard-import-file"
                  accept="application/json,.json"
                  hidden
                />
                <span class="qard-backup-status" aria-live="polite"></span>
              </p>
            </>
          )}
        </div>
      )
    }

    const count = (topic: string) => deck.cards.filter((c) => c.topic === topic).length
    return (
      <div class="popover-hint flashcards qard-deck" data-kind={deck.kind ?? "course"}>
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
            <span class="qard-key">Cards</span>
            <select class="qard-mode-select">
              <option value="due">Due today</option>
              <option value="all">All cards</option>
              <option value="leeches">Leeches</option>
            </select>
          </label>
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
          <button
            type="button"
            class="qard-write-all"
            aria-pressed="false"
            title="Write the answer to every card before turning it"
          >
            Write answers
          </button>
          <button
            type="button"
            class="qard-exam-start"
            title="Ten cards against the clock, answers in writing, no answers shown until the end"
          >
            Exam
          </button>
          <span class="qard-progress" aria-live="polite"></span>
        </div>

        <p class="qard-exam-note">
          Exam: answer every card in writing, in German, as you would on paper. The answers are
          shown when you hand in or when the time is up.
        </p>

        <div class="qard-stage">
          {deck.cards.map((card) => (
            <article
              class={`qard-card qard-${card.kind}${card.write ? " qard-write" : ""}`}
              data-topic={card.topic}
              data-id={card.id}
            >
              <div class="qard-meta">
                <span class="qard-topic">
                  {card.topic}
                  <span class="qard-box"></span>
                </span>
                <a class="internal" href={resolveRelative(slug, card.source.slug)}>
                  {card.source.title}
                </a>
              </div>
              <div class="qard-front" dangerouslySetInnerHTML={{ __html: card.front }} />
              <label class="qard-written">
                <span class="qard-key">Your answer</span>
                <textarea rows={4} placeholder="Write your answer, then turn the card."></textarea>
              </label>
              <div class="qard-back" dangerouslySetInnerHTML={{ __html: card.back }} />
              <p class="qard-followup"></p>
            </article>
          ))}
          <div class="qard-exam-review"></div>
          <div class="qard-done">
            <p class="qard-done-title">Deck finished</p>
            <p class="qard-score"></p>
            <div class="qard-done-actions">
              <button type="button" class="qard-repeat">
                Repeat missed
              </button>
              <button type="button" class="qard-study-all">
                Study all cards
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
            <button type="button" class="qard-hard" title="Hard (2)">
              Hard
            </button>
            <button type="button" class="qard-known" title="Knew it (3)">
              Knew it
            </button>
          </div>
          <button type="button" class="qard-next">
            Next →
          </button>
        </div>
        <p class="qard-hint">
          Space or click the card: show the answer · 1: missed · 2: hard · 3: knew it · ← →:
          previous and next · while writing, Ctrl or ⌘ + Enter turns the card
        </p>

        <details class="qard-stats">
          <summary>Progress by topic</summary>
          <table>
            <thead>
              <tr>
                <th>Topic</th>
                <th title="Never rated">New</th>
                <th title="Box 1 or 2">Shaky</th>
                <th title="Box 3 or higher">Solid</th>
                <th title="Due today, new cards included">Due</th>
                <th title="Missed on three or more days">Leeches</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </details>
      </div>
    )
  }

  FlashcardsContent.css = style
  FlashcardsContent.afterDOMLoaded = script

  return FlashcardsContent
}) satisfies QuartzComponentConstructor
