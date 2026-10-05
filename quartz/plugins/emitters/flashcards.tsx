import { QuartzEmitterPlugin } from "../types"
import { QuartzComponentProps } from "../../components/types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { pageResources, renderPage } from "../../components/renderPage"
import { QuartzPluginData, defaultProcessedContent } from "../vfile"
import { FullPageLayout } from "../../cfg"
import { FullSlug, joinSegments, pathToRoot, slugTag } from "../../util/path"
import { defaultListPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { ArticleTitle, FlashcardsContent } from "../../components"
import { write } from "./helpers"
import { BuildCtx } from "../../util/ctx"
import { StaticResources } from "../../util/resources"
import { COURSE_TAG_PREFIX } from "../transformers/courseTags"
import { FLASHCARDS_SLUG, Qard, qardDeckSlug } from "../transformers/qards"

// Emits the flashcard pages from the cards Plugin.Qards() collected:
//   /flashcards/        all decks
//   /flashcards/<deck>  one deck to click through, optionally narrowed to a topic
//   /flashcards/all     every deck mixed and shuffled (interleaved practice)
//   /flashcards/connections  the bridge cards generated from the notes' Key Connections,
//                            by course; kept out of the mixed deck
//   /flashcards/glossary     the German terms of the notes' Glossary tables, by course
//   /flashcards/glossary-reverse  the terms of courses examined in English, English to German
// A term is in one of the two only: `exam-language: en` on the course's tag page
// (tags/course/<code>.md) moves the course's terms to the reverse deck.
//   /flashcards/recall       one blank-page card per course note: write everything, compare
//                            with the BLUF
//   The generated decks are kept out of the mixed deck.
// A deck named like a course code takes its title from the course page
// (content/tags/course/<code>.md), as the COURSE badge does.

export interface FlashcardSource {
  slug: FullSlug
  title: string
}

export interface FlashcardDeck {
  name: string
  slug: FullSlug
  title: string
  topics: string[]
  practice?: boolean // a set of practice questions (notes of `type: practice`): listed under test preparation
  mixed?: boolean // not a course deck: starts shuffled, and is featured on the overview
  bridges?: boolean // the generated "how does X relate to Y?" deck
  // what a generated deck is made of; a course deck has none
  kind?: "connections" | "glossary" | "glossary-reverse" | "recall"
  cards: (Qard & { source: FlashcardSource })[]
}

function collectDecks(allFiles: QuartzPluginData[]): FlashcardDeck[] {
  const decks = new Map<string, FlashcardDeck>()
  const files = allFiles
    .filter((f) => f.qards && f.qardDeck)
    .sort((a, b) => (a.relativePath ?? "").localeCompare(b.relativePath ?? ""))

  for (const file of files) {
    const name = file.qardDeck!
    if (!decks.has(name)) {
      const coursePage = `tags/${slugTag(COURSE_TAG_PREFIX + name)}`
      decks.set(name, {
        name,
        slug: qardDeckSlug(name),
        title: allFiles.find((f) => f.slug === coursePage)?.frontmatter?.title ?? name,
        topics: [],
        cards: [],
      })
    }
    const deck = decks.get(name)!
    if (file.frontmatter?.type === "practice") deck.practice = true
    const source = { slug: file.slug!, title: file.frontmatter?.title ?? file.slug! }
    for (const card of file.qards!) {
      if (!deck.topics.includes(card.topic)) deck.topics.push(card.topic)
      deck.cards.push({ ...card, source })
    }
  }

  return [...decks.values()].sort((a, b) => a.title.localeCompare(b.title))
}

const NO_COURSE = "Not tied to a course"

function collectBridges(allFiles: QuartzPluginData[]): FlashcardDeck | undefined {
  const courseTitle = (code: string) =>
    allFiles.find((f) => f.slug === `tags/${slugTag(COURSE_TAG_PREFIX + code)}`)?.frontmatter
      ?.title ?? code
  const cards = allFiles
    .filter((f) => f.qardBridges)
    .sort((a, b) => (a.relativePath ?? "").localeCompare(b.relativePath ?? ""))
    .flatMap((file) => {
      const source = { slug: file.slug!, title: file.frontmatter?.title ?? file.slug! }
      return file.qardBridges!.map((card) => ({
        ...card,
        topic: card.topic ? courseTitle(card.topic) : NO_COURSE,
        source,
      }))
    })
  if (cards.length === 0) return undefined
  return {
    name: "connections",
    slug: joinSegments(FLASHCARDS_SLUG, "connections") as FullSlug,
    title: "Connections between notes",
    topics: [...new Set(cards.map((card) => card.topic))].sort(
      (a, b) => Number(a === NO_COURSE) - Number(b === NO_COURSE) || a.localeCompare(b),
    ),
    cards,
    bridges: true,
    kind: "connections",
    mixed: true,
  }
}

type Generated = "qardGlossary" | "qardGlossaryReverse" | "qardRecall"

// A deck of generated cards, grouped by course. One card per id: a term that several notes list
// is taken from the first note that defines it. `examLanguage` keeps only the cards of courses
// examined in that language (German unless the course's tag page says otherwise).
function collectGenerated(
  allFiles: QuartzPluginData[],
  key: Generated,
  deck: Pick<FlashcardDeck, "name" | "title" | "kind">,
  examLanguage?: "de" | "en",
): FlashcardDeck | undefined {
  const coursePage = (code: string) =>
    allFiles.find((f) => f.slug === `tags/${slugTag(COURSE_TAG_PREFIX + code)}`)?.frontmatter
  const courseTitle = (code: string) => coursePage(code)?.title ?? code
  const examinedIn = (code: string) =>
    String(coursePage(code)?.["exam-language"] ?? "de").toLowerCase() === "en" ? "en" : "de"
  const found = new Map<string, FlashcardDeck["cards"][number]>()
  const files = allFiles
    .filter((f) => f[key])
    .sort((a, b) => (a.relativePath ?? "").localeCompare(b.relativePath ?? ""))
  for (const file of files) {
    const source = { slug: file.slug!, title: file.frontmatter?.title ?? file.slug! }
    for (const card of file[key]!) {
      if (examLanguage && examinedIn(card.topic) !== examLanguage) continue
      const known = found.get(card.id)
      // the back of a glossary card with a definition has a second paragraph
      const defined = (c: Qard) => c.back.split("<p").length > 2
      if (known && (defined(known) || !defined(card))) continue
      found.set(card.id, {
        ...card,
        topic: card.topic ? courseTitle(card.topic) : NO_COURSE,
        source,
      })
    }
  }
  if (found.size === 0) return undefined
  const cards = [...found.values()].sort((a, b) => a.topic.localeCompare(b.topic))
  return {
    ...deck,
    slug: joinSegments(FLASHCARDS_SLUG, deck.name) as FullSlug,
    topics: [...new Set(cards.map((card) => card.topic))].sort(
      (a, b) => Number(a === NO_COURSE) - Number(b === NO_COURSE) || a.localeCompare(b),
    ),
    cards,
    mixed: true,
  }
}

export function emitPage(
  ctx: BuildCtx,
  data: Partial<QuartzPluginData> & { slug: FullSlug },
  allFiles: QuartzPluginData[],
  opts: FullPageLayout,
  resources: StaticResources,
) {
  const cfg = ctx.cfg.configuration
  const [tree, file] = defaultProcessedContent(data)
  const externalResources = pageResources(pathToRoot(data.slug), resources)
  const componentData: QuartzComponentProps = {
    ctx,
    fileData: file.data,
    externalResources,
    cfg,
    children: [],
    tree,
    allFiles,
  }

  return write({
    ctx,
    content: renderPage(cfg, data.slug, componentData, opts, externalResources),
    slug: data.slug,
    ext: ".html",
  })
}

export const Flashcards: QuartzEmitterPlugin = () => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    beforeBody: [ArticleTitle()],
    pageBody: FlashcardsContent(),
    right: [],
  }

  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "Flashcards",
    getQuartzComponents() {
      return [
        Head,
        Header,
        Body,
        ...header,
        ...beforeBody,
        pageBody,
        ...afterBody,
        ...left,
        ...right,
        Footer,
      ]
    },
    async *emit(ctx, content, resources) {
      const allFiles = content.map((c) => c[1].data)
      const decks = collectDecks(allFiles)
      const total = decks.reduce((n, deck) => n + deck.cards.length, 0)
      if (decks.length > 1) {
        decks.unshift({
          name: "all",
          slug: joinSegments(FLASHCARDS_SLUG, "all") as FullSlug,
          title: "All decks, mixed",
          topics: [...new Set(decks.flatMap((deck) => deck.topics))],
          cards: decks.flatMap((deck) => deck.cards),
          mixed: true,
        })
      }
      const bridges = collectBridges(allFiles)
      if (bridges) decks.push(bridges)
      const generated = [
        collectGenerated(allFiles, "qardRecall", {
          name: "recall",
          title: "Blank page: free recall",
          kind: "recall",
        }),
        collectGenerated(
          allFiles,
          "qardGlossary",
          {
            name: "glossary",
            title: "Glossary: German to English",
            kind: "glossary",
          },
          "de",
        ),
        collectGenerated(
          allFiles,
          "qardGlossaryReverse",
          {
            name: "glossary-reverse",
            title: "Glossary: English to German",
            kind: "glossary-reverse",
          },
          "en",
        ),
      ]
      for (const deck of generated) if (deck) decks.push(deck)

      yield emitPage(
        ctx,
        {
          slug: joinSegments(FLASHCARDS_SLUG, "index") as FullSlug,
          frontmatter: { title: "Flashcards", tags: [] },
          description: `${total} flashcards in ${decks.filter((d) => !d.mixed).length} decks, collected from the notes' self-tests and the practice questions.`,
          flashcardDecks: decks,
        },
        allFiles,
        opts,
        resources,
      )

      for (const deck of decks) {
        yield emitPage(
          ctx,
          {
            slug: deck.slug,
            frontmatter: { title: `Flashcards: ${deck.title}`, tags: [] },
            description: `${deck.cards.length} flashcards on ${deck.title}.`,
            flashcardDeck: deck,
          },
          allFiles,
          opts,
          resources,
        )
      }
    },
  }
}

declare module "vfile" {
  interface DataMap {
    flashcardDecks: FlashcardDeck[]
    flashcardDeck: FlashcardDeck
  }
}
