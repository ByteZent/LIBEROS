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
type: concept | model | actor | thinker | work | case | judgment | norm | assessment | development | brief | framework | synthesis | source | question | moc | idea | practice
domain: [economics, policy]   # one or more: strategy · military · policy · economics · law · ir · security · intelligence · technology · psychology · sociology
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
| One current event | `T - Development` | `05-Assessments/51-Current-Affairs` |
| Analytical method (CBA, process tracing, …) | `T - Framework` | `06-Frameworks-and-Methods` |

**New course?** Pick a short code (e.g. `L1-HS26`) and use it in the Course Map's `course:` and in each note's `courses:`. Then create `content/tags/course/<code>.md` with the course name as `title`. That page lists every published note for the course, is found by searching the course name, and supplies the label of the COURSE badge. Add `exam-language: en` there if the course is examined in English (see [[#Self-test and flashcards]]).

## Structure

Every note opens with a `[!bluf]` callout. After that, each type follows its template in `_templates/`.

## Self-test and flashcards

Concept, model, framework and legal notes end with `## Self-Test: <short topic>`. Each question is a `> [!qard]- Question` callout with the answer in its body. The same card is used by the Qard plugin in Obsidian and by the site's flashcards (`/flashcards/`).

- `qard-deck:` in the frontmatter names the deck: the course code, normally the first entry of `courses`. The text after "Self-Test:" becomes the topic inside the deck.
- `qard-sets:` puts the note's cards into further decks as well, a **card set**: `qard-sets: ["MikroEcon Test 1"]` on every note of a test gives one deck with everything for that test, with the notes as its topics. They are the same cards, not copies: a rating in one deck counts in the other, and `/flashcards/all` shows each card once. Card sets are listed under *Test preparation* on the flashcards overview.
- One fact or one distinction per card. Keep the answer under about 40 words, so I can grade myself honestly.
- Recall is not enough. Every self-test has at least one card that makes me **use** the idea: apply it to a case, compare it with a neighbouring concept, or name where it fails.
- The rows of a note's `## Glossary` table marked **apply** or **define** become cards by themselves: German term on the front, English term and definition on the back, in the deck `/flashcards/glossary`, grouped by course. A term keeps its review history when its note moves.
- A row marked **translate**, or without a level, gives no card: it is vocabulary to look up in the [[Glossary]]. A term that one note marks *translate* and another *define* still gets its card.
- Each term is asked in one direction only, the one the exam needs. Exams are in German, so that is German to English. A course examined in English has `exam-language: en` on its page `content/tags/course/<code>.md`: its terms go to `/flashcards/glossary-reverse` (English to German) instead.
- A definition I must reproduce word for word is a cloze card: `> [!cloze] Politics is ==social action== aimed at …`. The front blanks every highlighted part, the back shows the sentence in full.
- Every course note with a BLUF gives one blank-page card in `/flashcards/recall`: the title only, everything I know in writing, then the BLUF for comparison.
- Rating a card: *missed* sends it back to box 1, *hard* keeps it in its box and brings it back in half the time, *knew it* moves it up. A card missed on three days is a **leech** ("Leeches" in the deck's card selection): rewrite the card or the note.
- **Exam** in a deck: ten cards of the chosen topic against the clock (two minutes each), every answer in writing and in German, nothing shown until the end.
- The practice questions of a course are notes of `type: practice` in `09-Learning/96-Practice-Questions`, one page per textbook chapter, in the language of the exam. They have decks of their own, one per assessment (`qard-deck:` the name of the question set and the test, e.g. `Bernauer Leitfragen Test 1`), and `qard-topic:` names the chapter. These decks are listed under *Test preparation* on the flashcards overview. Link each page to the book's source note and to the course map, but not from the map's Sessions table: that would pull every question into the booklet.
- `make lint` reports notes with cards but no `qard-deck`, and self-tests that only ask for recall.

### Spaced repetition

The site schedules every card by how I rated it. A card I knew when it was due moves up one box and comes back after 1, 3, 7, 14, 30, 60 and 120 days. A card I missed goes back to box 1 and comes back the next day. A deck opens on what is due today; *All cards* goes through everything without moving cards up early. The history is kept in the browser, per device: *Export progress* and *Import progress* on `/flashcards/` carry it to another one. Rewording a question resets that card.

### Card types

Five comments turn a card into more than text. Obsidian ignores them and shows the whole callout. Every card carries a label with its kind, in the deck and on its note: *Question*, *Cloze*, *Diagram labels*, *Calculation*, *Drawing*, and for the generated cards *Term*, *Connection* and *Blank page*; *written* and the number of variants are added to it.

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

**Calculation card with variants:** a calculation card always shows the same numbers, so after a few reviews I remember the result instead of working it out. `<!-- qard-variant -->` on a line of its own starts the same task with other numbers. The task goes in the title, and each variant has its givens, `<!-- qard-answer -->`, its result and its steps. The site shows one variant at a time and moves to the next after each rating. All variants share one review history, because the id comes from the title. Write three, and let one of them be the odd case (a price floor that does not bind, a bundle that is already optimal). `make lint` reports a variant without `<!-- qard-answer -->`.

```markdown
> [!qard]- Calculate: find the equilibrium of the market.
> $Q_D = 100 - 2P$ and $Q_S = 20 + 2P$.
> <!-- qard-answer -->
> $P^* = 20$, $Q^* = 60$.
> <!-- qard-solution -->
> 1. $4P = 80$, so $P^* = 20$ and $Q^* = 100 - 40 = 60$.
> <!-- qard-variant -->
> $Q_D = 120 - 2P$ and $Q_S = 4P$.
> <!-- qard-answer -->
> $P^* = 20$, $Q^* = 80$.
> <!-- qard-solution -->
> 1. $6P = 120$, so $P^* = 20$ and $Q^* = 4 \cdot 20 = 80$.
```

**Drawing card:** start the question with *Draw:*, or put `<!-- qard-draw -->` in the card. The site asks me to sketch on paper; the back shows the diagram and a checklist (`- [ ] …`) that I tick off against my sketch before I rate myself. An image card asks me to recognise labels, a drawing card to produce the diagram: use it for every diagram the exam can ask for.

```markdown
> [!qard]- Draw: a market in equilibrium, with a surplus and a shortage.
> <!-- qard-draw -->
> ![[supply-demand-equilibrium.svg]]
>
> - [ ] Price on the vertical axis, quantity on the horizontal axis
> - [ ] Surplus above the equilibrium price, shortage below it
```

**Written card:** `<!-- qard-write -->` anywhere in the card. The site shows a text field under the question; I write the answer, turn the card (Ctrl or ⌘ + Enter) and see my text above the card's answer before I rate myself. Use it for *explain* and *apply* questions, where recognising the answer is easier than producing it. The *Write answers* button on a deck does the same for every card, without the comment. What I write is not stored.

```markdown
> [!qard]- Why is orientation the central element?
> <!-- qard-write -->
> It determines what is observed, which options are visible, and how risks are judged.
```

### Important questions

`<!-- qard-important -->` anywhere in a card marks a question that matters more than the others: one the lecturer stressed, an old exam question, or one that a whole chapter hangs on. The site puts a star on it, on the note and in the deck, and **★ Important** in a deck narrows everything to these cards: the selection, the counts and the exam. Marking a card later does not reset its history. Mark few, about one question in five: if everything is important, nothing is.

```markdown
> [!qard]- Welches ist das wichtigste Merkmal von Demokratien gegenüber Nicht-Demokratien?
> <!-- qard-important -->
> Die Besetzung politischer Ämter durch freie und faire Wahlen.
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

## Developments and places

A development is one current event that matters for something in the vault: a note of `type: development` in `05-Assessments/51-Current-Affairs` (template `T - Development`). An assessment judges a situation; a development records one event and what it changes. It has no `status` and no `review`: it is a record, not a note that matures.

```yaml
event_date: 2026-10-10        # when it happened, not when I wrote the note
domain: [military]            # at least one
actors: ["Russia", "NATO"]    # the notes of the actors involved
location: UKR                 # optional, see below
source: https://…             # the report's URL, or a citekey from the library
indicator:                    # the assessment indicator this bears on, if any
```

**Places.** The map takes a development's place from the vault, not from a geocoding service:

- A state's note carries `iso:`, its ISO 3166-1 alpha-3 code (`iso: CHE`). The whole country is the place.
- A note of anything with one place (a strait, a base, a city, a headquarters) carries `geo: [lat, lon]`.
- A development without `location:` takes the places of the notes in its `actors:`.
- `location:` overrides that, when the event is somewhere other than where its actors sit. It takes a note (`"[[Suwałki Gap]]"`), an ISO code (`UKR`, which needs no note), a point (`[54.1, 23.0]`), a list of these, or `global` for an event without a place.
- Be only as exact as the report: a country code when the report says "in eastern Ukraine", a point only for a known site.

`make lint` reports a development without `event_date`, `domain`, `source` or a place, and an `iso` or `geo` it cannot read. A name in `actors:` without a note is a warning: either a typo or a note the vault is missing.

**The map.** Every development with a place is on the map of [[05-Assessments/51-Current-Affairs/index|Current Affairs]], together with the stream of headlines (see below): countries shaded by how much there is, a symbol for each kind of thing at a place, filters by time, domain and text, and the list underneath. The symbol is a badge in the colour of the domain with its icon (the filter buttons are the legend), larger the more there is, and outlined where I have written a note. From afar a country has one symbol, of its commonest kind; zooming in splits it into one per kind, and a click on one narrows the list to that kind in that place. On a campaign map the timeline categories `war`, `political` and `economy` get the symbols of military, policy and economics. A note with a place, or with developments that concern it, gets a small map and the list of its developments next to its backlinks. A callout puts a map into a note:

| Callout | Shows |
|---|---|
| `> [!map\|all]` | Every development, with the filters and the list |
| `> [!map]` | The developments that concern this note, and its own place |
| `> [!map\|events]` | The `[!event]` and `[!process]` entries of this page that have a line `**Place:** …`: a note, an ISO code or `lat, lon`, several with `;`. For a campaign or a war: the timeline's entries on a map |

The borders are Natural Earth's, which draws them as they are controlled. The map does not take that as a statement: disputed areas are hatched and take no country's shade (see [[Methodology#Borders on the map|Methodology]]).

**Indicators.** An assessment says in its frontmatter what would change its judgement, and a development names the indicator it fires:

```yaml
# the assessment
as_of: 2026-10-05
indicators:
  grid-strikes: Strikes on the power grid resume before winter
  third-state: A third state enters the war

# the development
indicator: grid-strikes
```

- A key is unique in the vault; `make lint` reports one declared twice, and a development naming one that no assessment declares.
- The assessment's page lists its indicators with the developments that fired them.
- When such a development is newer than the assessment's `as_of`, the assessment is to **re-assess**: `make review` lists it, its page says so, and its countries are outlined on the map. Re-read it, change what has to change and set `as_of` to today.

**Weekly brief.** `make brief` writes `05-Assessments/53-Weekly-Briefs/Weekly Brief 2026-W41.md` (`type: brief`): the week's developments by place, the indicators they fired, the assessments to re-assess and the indicators still waiting. `WEEK=last` or `WEEK=2026-W40` picks another week. Everything is written anew on each run, except what I wrote under *Assessment of the week*.

**The stream.** `make watch` reads the feeds in `watch/sources.yml` and puts every headline on the map and into the stream under it, by itself: nothing has to be promoted. The map with the stream is the overview; a note is for the few things I want to keep and judge.

- An item is placed in the countries its headline names, or else the first two its summary names. The names are in `watch/gazetteer.json` (countries and capitals in English and German, written by `make worldmap`) and `watch/places.yml` (my additions: adjectives, leaders, cities, and names to ignore). This is matching by name, so it errs: "Georgia" the US state, a country named only in passing. A wrong place is a reason to edit `places.yml`, not the item.
- Its domain is the one whose words the headline and summary use most, or else the `domain:` of its source in `sources.yml`.
- Of an item are kept its headline, link, date and source, and the summary its feed gives, cut to 500 characters: never the text of the article. The headline links out to the source; *Summary* under it opens the feed's summary, and the *summaries* button opens them all. Not every feed gives one. Items stay for `keep:` days (14).
- The stream is part of the private preview (`make serve-private`). The public site shows only my notes, unless `public: true` is set in `sources.yml` and the deployment runs `make watch` before the build.
- The **＋** next to a headline copies `make promote ID=…`, which turns the item into a development note in `_inbox` with date, source and actors filled in. `make drop ID="… …"` takes items out of the stream.
- An item also links to the notes it names: an actor or case study by its title and `aliases`, any other note only with `watch:` in its frontmatter (`watch: ["hybrid warfare", "grey zone"]`, or `watch: true` for title and aliases; `watch: false` takes an actor out). `terms:` in `sources.yml` lists words to watch that have no note yet. An actor's note shows the stream of its country next to its backlinks.
- `make watch OFFLINE=1` places and links the stored items again, after a change to notes, terms or place names. `_private/watch/Watch.md` lists the same items for Obsidian.

## Sources

- Cite with citekeys: `[@osinga2007science]`, `[@weick1995sensemaking, p. 17]`. Keys come from Zotero (see `bibliography/README.md`). Never type a full reference by hand.
- Keep the confidence rating next to the citation in the *Sources* section: `- [@key]: why it matters. [High confidence]`
- Important sources get a **source note** named after the citekey (`citekey:` in frontmatter).
- `make sources` must report 0 problems before publishing.
- A development's `source:` may be the URL of the report instead of a citekey: news reports and press releases do not go through Zotero. Anything I cite twice does.

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
| `> [!mindmap] Topic` | A mind map: the nested list inside is drawn as a map. Links of any kind in a node, words in backticks are tags to filter by. Template: `T - Mind Map`, folder `09-Learning/95-Mind-Maps` |
| `> [!period]` | An era heading on a timeline, written like an event |
| `> [!map]` | A world map of developments or of the page's timeline entries. See [[#Developments and places]] |

## Folders

| Folder | Published | Purpose |
|---|---|---|
| `01–09` | yes | The knowledge base |
| `_inbox` | no | Raw captures, processed weekly |
| `_private` | no | Never published |
| `_templates` | no | Note templates |
| `_dashboards` | no | Obsidian Bases: review queues |
| `assets` | yes | Images and attachments |
