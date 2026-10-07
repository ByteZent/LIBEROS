import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
// LIBEROS_PRIVATE=1 (make serve-private) also renders content/_private, content/_inbox and drafts,
// so unpublished notes and their flashcards can be studied locally, and adds the planner board.
// Local only: both folders are gitignored, so the deploy build never sees these files.
const showPrivate = process.env.LIBEROS_PRIVATE === "1"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "LIBEROS",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    // TODO: set to your domain or "<user>.github.io/<repo>" before deploying
    baseUrl: "bytezent.github.io/LIBEROS",
    // Everything that is part of the *learning process* but not publishable stays out of the build
    ignorePatterns: [
      ...(showPrivate ? [] : ["_inbox", "_private"]),
      "_templates",
      "_dashboards",
      ".obsidian",
      ".trash",
      "**/*.base",
      "**/*.canvas",
    ],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "JetBrains Mono",
        body: "IBM Plex Sans",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#f6f4ee",
          lightgray: "#dcd8cc",
          gray: "#8e8a7e",
          darkgray: "#3b3d3f",
          dark: "#16191c",
          secondary: "#1f4e5f",
          tertiary: "#9a6b1f",
          highlight: "rgba(31, 78, 95, 0.08)",
          textHighlight: "#e8c54755",
        },
        darkMode: {
          light: "#0d1117",
          lightgray: "#222a33",
          gray: "#5b6773",
          darkgray: "#c9d1d9",
          dark: "#e8edf2",
          secondary: "#7fb3c8",
          tertiary: "#d4a84b",
          highlight: "rgba(127, 179, 200, 0.10)",
          textHighlight: "#d4a84b44",
        },
        // between the two: warm paper, easier on the eyes than the light theme
        sepiaMode: {
          light: "#e9dfc9",
          lightgray: "#d2c5a8",
          gray: "#8c8067",
          darkgray: "#4a4132",
          dark: "#2a2318",
          secondary: "#1d5060",
          tertiary: "#8a5a14",
          highlight: "rgba(29, 80, 96, 0.09)",
          textHighlight: "#d9a93a55",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CourseTags(), // courses: [L1-HS26] → tag course/L1-HS26 → searchable course page
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      // [@citekey] citations, rendered from the Zotero-exported bibliography
      Plugin.Citations({
        bibliographyFile: "./bibliography/library.bib",
        linkCitations: true,
        csl: "apa",
      }),
      Plugin.SourceFormatting(), // "References" heading + confidence badges; after Citations
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.Qards(), // collects the [!qard] flashcards; after CrawlLinks and Latex
    ],
    filters: showPrivate ? [] : [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.Flashcards(), // /flashcards: one deck per qard-deck, from the cards Qards() collected
      Plugin.Changelog(), // /changelog: the git history, with links to the notes each commit touched
      // /planner: tasks, schedule and deadlines on a calendar board; private preview only
      ...(showPrivate ? [Plugin.Planner()] : []),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.Pwa(),
      Plugin.NotFoundPage(),
      // Social preview cards; comment out to speed up local builds
      Plugin.CustomOgImages({ colorScheme: "darkMode" }),
    ],
  },
}

export default config
