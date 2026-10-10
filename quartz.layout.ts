import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    // click an image to view it full screen
    Component.ImageZoom(),
    // timeline notes: category legend and links between [!event] callouts
    Component.Timeline(),
    // mind maps: a nested list in a [!mindmap] callout, drawn as a filterable map
    Component.Mindmap(),
    // the Watch map: developments on a world map, in a [!map] callout and in a note's Developments block
    Component.WatchMap(),
  ],
  footer: Component.Footer({
    links: {
      // TODO: replace with your own links
      About: "/00-Meta/About",
      Methodology: "/00-Meta/Methodology",
      Changelog: "/changelog",
      RSS: "/index.xml",
      // the planner exists in the private preview only (make serve-private)
      ...(process.env.LIBEROS_PRIVATE === "1" ? { Planner: "/planner" } : {}),
    },
  }),
}

// Explorer: hide the tag index, the attachments folder and folders without any note
// (only their index page, or only empty subfolders) from the sidebar tree.
// A folder whose index page is the content itself (the podcast list) is named in `standalone`
// and always shown.
// NB: filterFn is serialised to the client, so it must be self-contained.
const explorer = Component.Explorer({
  title: "Knowledge Base",
  folderDefaultState: "collapsed",
  filterFn: (node) => {
    if (node.slugSegment === "tags" || node.slugSegment === "assets") return false
    if (!node.isFolder) return true
    const standalone = ["86-Podcasts"]
    if (standalone.includes(node.slugSegment)) return true
    // the filter runs top-down, so look through the whole subtree for a note
    // (a loop, not a recursive helper: see the __name() remark at sortFn)
    const todo = [...node.children]
    while (todo.length > 0) {
      const child = todo.pop()!
      if (!child.isFolder || standalone.includes(child.slugSegment)) return true
      todo.push(...child.children)
    }
    return false
  },
  // Folders keep their numbered order (01-Actors, 02-Concepts, …) even though they display
  // their index title; notes sort alphabetically by title.
  sortFn: (a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
    // no named helpers here: esbuild would wrap them in __name(), which is undefined client-side
    const ka = a.isFolder ? a.slugSegment : a.displayName
    const kb = b.isFolder ? b.slugSegment : b.displayName
    return ka.localeCompare(kb, undefined, { numeric: true, sensitivity: "base" })
  },
})

// Graph: a note is drawn in the colour of its course, by the place of the course in this list.
// Add a new course at the end, so the others keep their colours. There are eight colours:
// a ninth course stays grey.
const courseOrder = [
  "PolSci-HS26",
  "MikroEcon-HS26",
  "MilPsy-HS26",
  "L1-HS26",
  "MilSoc-HS26",
  "PrivLawI-HS26",
  "PS1-HS26",
  "Hist1-HS26",
]

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.NoteStatus(),
    Component.BookletLinks(), // course maps: the printable booklet for each assessment
    Component.TagList(),
  ],
  left: [
    Component.SiteLogo(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    explorer,
  ],
  right: [
    Component.Graph({
      localGraph: { depth: 2, showTags: false, courseOrder },
      globalGraph: { showTags: false, enableRadial: true, courseOrder },
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    // a note's place on the map, an assessment's indicators and the developments that concern the note
    Component.Developments(),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [
    Component.Breadcrumbs(),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.FlashcardsLink(), // course pages: link to the course's flashcard deck
  ],
  left: [
    Component.SiteLogo(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    explorer,
  ],
  right: [
    // tag and course pages: graph of the notes carrying the tag (see graph.inline.ts)
    Component.ConditionalRender({
      component: Component.Graph({
        localGraph: { showTags: false, courseOrder },
        globalGraph: { showTags: false, enableRadial: true, courseOrder },
      }),
      condition: (page) => page.fileData.slug?.startsWith("tags/") ?? false,
    }),
  ],
}
