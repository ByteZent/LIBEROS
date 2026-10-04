---
title: Note Standards
type: meta
created: 2026-09-29
tags:
  - meta
---

> [!bluf]
> Conventions for naming, frontmatter, structure and callouts, so that all notes have the same shape and can be read, queried and linked the same way.

## Naming

- Title Case, singular, no prefixes: `Center of Gravity`, not `CoG concept`.
- People: full name (`Carl von Clausewitz`); works: title (`On War`). Use `aliases:` for acronyms and translations (`Vom Kriege`, `CoG`).

## Frontmatter

```yaml
type: concept | model | actor | thinker | work | case | judgment | norm | assessment | framework | synthesis | source | question | moc | idea
domain: [economics, policy]   # one or more: strategy · military · policy · economics · law · ir · security · intelligence · technology
courses: [PP-ECON-1]          # course codes this note serves (see Course Maps); shown as a COURSE badge
status: seedling | developing | evergreen
confidence: low | medium | high
created: YYYY-MM-DD
modified: YYYY-MM-DD
review: YYYY-MM-DD      # next spaced-review date
draft: false            # true = never published
```

## Three axes

| Axis | Answers | Where |
|---|---|---|
| **Folder** | What *kind* of note is this? | `01–09` sections |
| **`domain`** | Which discipline(s)? | frontmatter, can be several |
| **Maps of Content** | How does a field fit together, and what's still missing? | `09-Learning/91-Maps-of-Content` |

Disciplines are **not** folders. *Public Goods* is economics, but it explains alliance burden-sharing; *Rule of Law* is law, but it constrains every policy instrument. Filing by discipline would cut exactly those links.

| Discipline material | Template | Folder |
|---|---|---|
| Concept or principle | `T - Concept` | `02-Concepts/<discipline>` |
| Economic model / theory | `T - Model` | `02-Concepts/28-Economics` |
| Statute, constitutional article, treaty | `T - Legal Norm` | `08-Library/85-Legal-Sources` |
| Court decision | `T - Judgment` | `04-Case-Studies/44-Court-Cases` |
| Policy reform or decision | `T - Case Study` | `04-Case-Studies/42-Policy-Cases` |
| Analytical method (CBA, process tracing, …) | `T - Framework` | `06-Frameworks-and-Methods` |

**New course?** Pick a short code (e.g. `L1-HS26`) and use it in the Course Map's `course:` and in each note's `courses:`. Then create `content/tags/course/<code>.md` with the course name as `title`. That page lists every published note for the course, is found by searching the course name, and supplies the label of the COURSE badge.

## Structure

Every note opens with a `[!bluf]` callout. After that, each type follows its template in `_templates/`.

## Self-test and flashcards

Concept, model, framework and legal notes end with `## Self-Test: <short topic>`. Each question is a `> [!qard]- Question` callout with the answer in its body. The same card is used by the Qard plugin in Obsidian and by the site's flashcards (`/flashcards/`).

- `qard-deck:` in the frontmatter names the deck: the course code, normally the first entry of `courses`. The text after "Self-Test:" becomes the topic inside the deck.
- One fact or one distinction per card. Keep the answer under about 40 words, so I can grade myself honestly.
- Recall is not enough. Every self-test has at least one card that makes me **use** the idea: apply it to a case, compare it with a neighbouring concept, or name where it fails.
- The rows of a note's `## Glossary` table become cards by themselves: German term on the front, English term and definition on the back, in the deck `/flashcards/glossary`, grouped by course. A term keeps its review history when its note moves.
- The same rows give a second deck in the other direction, `/flashcards/glossary-reverse` (English to German).
- A definition I must reproduce word for word is a cloze card: `> [!cloze] Politics is ==social action== aimed at …`. The front blanks every highlighted part, the back shows the sentence in full.
- Every course note with a BLUF gives one blank-page card in `/flashcards/recall`: the title only, everything I know in writing, then the BLUF for comparison.
- Rating a card: *missed* sends it back to box 1, *hard* keeps it in its box and brings it back in half the time, *knew it* moves it up. A card missed on three days is a **leech** ("Leeches" in the deck's card selection): rewrite the card or the note.
- **Exam** in a deck: ten cards of the chosen topic against the clock (two minutes each), every answer in writing and in German, nothing shown until the end.
- `make lint` reports notes with cards but no `qard-deck`, and self-tests that only ask for recall.

### Spaced repetition

The site schedules every card by how I rated it. A card I knew when it was due moves up one box and comes back after 1, 3, 7, 14, 30, 60 and 120 days. A card I missed goes back to box 1 and comes back the next day. A deck opens on what is due today; *All cards* goes through everything without moving cards up early. The history is kept in the browser, per device: *Export progress* and *Import progress* on `/flashcards/` carry it to another one. Rewording a question resets that card.

### Card types

Three comments turn a card into more than text. Obsidian ignores them and shows the whole callout.

**Image card:** put an SVG diagram in the card and name the labels to hide, separated by `;`. On the site each label becomes (1), (2), … until the card is turned. A label is the exact text of one `<text>` element in the SVG. `make lint` reports a label that the diagram does not have.

```markdown
> [!qard]- Diagram: name the two lanes (1) and (2).
> ![[ooda-loop-boyd.svg]]
> <!-- qard-hide: IMPLICIT GUIDANCE & CONTROL; FEEDBACK · UNFOLDING INTERACTION WITH ENVIRONMENT -->
> (1) Implicit guidance and control. (2) Feedback.
```

**Calculation card:** start the question with *Calculate:*, give the result first and the steps after `<!-- qard-solution -->`. The site asks me to work on paper, shows the result when the card is turned and keeps the steps folded under *Worked solution*.

```markdown
> [!qard]- Calculate: $Q_D = 100 - 2P$ and $Q_S = 20 + 2P$. Find the equilibrium.
> $P^* = 20$, $Q^* = 60$.
> <!-- qard-solution -->
> 1. Set $Q_D = Q_S$: $4P = 80$, so $P^* = 20$.
> 2. Insert: $Q^* = 100 - 40 = 60$.
```

**Written card:** `<!-- qard-write -->` anywhere in the card. The site shows a text field under the question; I write the answer, turn the card (Ctrl or ⌘ + Enter) and see my text above the card's answer before I rate myself. Use it for *explain* and *apply* questions, where recognising the answer is easier than producing it. The *Write answers* button on a deck does the same for every card, without the comment. What I write is not stored.

```markdown
> [!qard]- Why is orientation the central element?
> <!-- qard-write -->
> It determines what is observed, which options are visible, and how risks are judged.
```

### Bridge cards

Every line under `## Key Connections` of the form `- [[Other Note]]: how it relates` becomes a card "How does *this note* relate to *Other Note*?" in the deck `/flashcards/connections`. So the text after the colon has to answer that question on its own. `make bridges` lists the opposite: notes that share tags but do not link to each other yet.

## Ideas

An idea for a paper, an essay or a page is a note of `type: idea` in `09-Learning/94-Ideas` (template `T - Idea`). `make idea TITLE="…" TEXT="…"` captures one from the terminal. It differs from a knowledge note in three fields:

```yaml
captured: 2026-10-04T11:01   # when the idea came, to the minute. Never changed afterwards
stage: spark                 # spark → exploring → outlined → drafting → written, or dropped
output: paper                # what it should become: paper · essay · page · synthesis
```

- The `[!question]` callout holds the idea as it came. Do not polish it later: sharpen it under *Working question* instead.
- Every later thought goes into the *Log* with its date and time, so the page shows how the idea developed.
- `make idea` suggests related notes from the words of the idea. They are guesses: delete what does not fit and say what each remaining note contributes.
- Unticked items under *Open Questions* appear on the open-questions page like those of any other note.
- `courses:` ties an idea to a course, for example the paper of a proseminar. `make course` lists it under *ideas*.
- `make ideas` shows the board: every idea by stage with its age. A spark untouched for two weeks needs a decision: explore it or drop it. A dropped idea stays, with the reason in the log.
- When the text is written, set `stage: written` and link the synthesis or paper.

## Sources

- Cite with citekeys: `[@osinga2007science]`, `[@weick1995sensemaking, p. 17]`. Keys come from Zotero (see `bibliography/README.md`). Never type a full reference by hand.
- Keep the confidence rating next to the citation in the *Sources* section: `- [@key]: why it matters. [High confidence]`
- Important sources get a **source note** named after the citekey (`citekey:` in frontmatter).
- `make sources` must report 0 problems before publishing.

## Callouts

| Callout | Use |
|---|---|
| `> [!bluf]` | Bottom line up front |
| `> [!assessment]` | My own judgement |
| `> [!counter]` | Strongest critique / counter-argument |
| `> [!source]` | Direct quotation from a primary source |
| `> [!question]` | Open question |
| `> [!qard]-` | Flashcard: question in the title, answer in the body |
| `> [!cloze]` | Cloze flashcard: one sentence, the parts to recall `==highlighted==` |
| `> [!event\|war key]` | One entry on a timeline: category and `key` after the bar, the date in bold starts the title, the body holds the notes and fields. See [[Britain 1780–1939 (Timeline)#How to add to the timeline]] |
| `> [!process\|economy]` | A development without a single date on a timeline, written like an event with a range |
| `> [!period]` | An era heading on a timeline, written like an event |

## Folders

| Folder | Published | Purpose |
|---|---|---|
| `01–09` | yes | The knowledge base |
| `_inbox` | no | Raw captures, processed weekly |
| `_private` | no | Never published |
| `_templates` | no | Note templates |
| `_dashboards` | no | Obsidian Bases: review queues |
| `assets` | yes | Images and attachments |
