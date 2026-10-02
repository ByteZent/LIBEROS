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
  mixed?: boolean // the "all decks" deck: starts shuffled
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
    const source = { slug: file.slug!, title: file.frontmatter?.title ?? file.slug! }
    for (const card of file.qards!) {
      if (!deck.topics.includes(card.topic)) deck.topics.push(card.topic)
      deck.cards.push({ ...card, source })
    }
  }

  return [...decks.values()].sort((a, b) => a.title.localeCompare(b.title))
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

      yield emitPage(
        ctx,
        {
          slug: joinSegments(FLASHCARDS_SLUG, "index") as FullSlug,
          frontmatter: { title: "Flashcards", tags: [] },
          description: `${total} flashcards in ${decks.filter((d) => !d.mixed).length} decks, collected from the notes' self-tests.`,
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
