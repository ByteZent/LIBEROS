import { execFileSync } from "child_process"
import { QuartzEmitterPlugin } from "../types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { QuartzPluginData } from "../vfile"
import { FullPageLayout } from "../../cfg"
import { FilePath, FullSlug, slugifyFilePath } from "../../util/path"
import { defaultListPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { ArticleTitle, ChangelogContent } from "../../components"
import { emitPage } from "./flashcards"

// Emits /changelog from the git history: one entry per commit, with the published notes it added
// or changed. It relies on the commit message format that .githooks/commit-msg enforces:
//   <type>(<scope>): <subject>
// Older commits without a type are listed as plain updates. Housekeeping (type `chore`, merges,
// dependency bumps) is left out. Needs the full history: the deploy workflow checks out with
// fetch-depth 0.
export const CHANGELOG_SLUG = "changelog" as FullSlug

export type ChangeType = "note" | "edit" | "fix" | "site" | "tool" | "meta" | "update"

export interface ChangelogNote {
  slug: FullSlug
  title: string
}

export interface ChangelogEntry {
  hash: string
  date: string // YYYY-MM-DD
  type: ChangeType
  scope?: string
  subject: string
  added: ChangelogNote[]
  changed: ChangelogNote[]
}

interface Options {
  /** how many commits to read from the history */
  limit: number
}

const TYPED = /^(note|edit|fix|site|tool|meta|chore)(?:\(([^)]+)\))?: (.+)$/
const HIDDEN = /^(Merge |Revert |Bump |fixup! |squash! )/

function readHistory(
  contentDir: string,
  allFiles: QuartzPluginData[],
  limit: number,
): ChangelogEntry[] {
  let log: string
  try {
    log = execFileSync(
      "git",
      [
        "-c",
        "core.quotepath=false",
        "log",
        `--max-count=${limit}`,
        "--date=short",
        "--name-status",
        "--pretty=format:%x1e%h%x1f%ad%x1f%s",
      ],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] },
    )
  } catch {
    return [] // not a git checkout, or git is missing
  }

  // only notes that are on the site are linked: drafts and private notes stay out
  const published = new Map(allFiles.map((f) => [f.slug!, f.frontmatter?.title ?? f.slug!]))
  const prefix = contentDir.replace(/^\.\//, "").replace(/\/$/, "") + "/"

  const entries: ChangelogEntry[] = []
  for (const record of log.split("\x1e").slice(1)) {
    const [head, ...files] = record.trim().split("\n")
    const [hash, date, message] = head.split("\x1f")
    if (HIDDEN.test(message)) continue
    const typed = message.match(TYPED)
    if (typed?.[1] === "chore") continue

    const added = new Map<FullSlug, string>()
    const changed = new Map<FullSlug, string>()
    for (const line of files) {
      const [status, ...paths] = line.split("\t")
      const path = paths[paths.length - 1] // for a rename: the new path
      if (!path?.startsWith(prefix) || !path.endsWith(".md")) continue
      const slug = slugifyFilePath(path.slice(prefix.length) as FilePath)
      const title = published.get(slug)
      // section indexes and course tag pages are scaffolding, not notes
      if (!title || slug === "index" || slug.endsWith("/index") || slug.startsWith("tags/"))
        continue
      if (status === "A") added.set(slug, title)
      else if (!status.startsWith("D")) changed.set(slug, title)
    }

    const subject = typed ? typed[3] : message
    const notes = (m: Map<FullSlug, string>) =>
      [...m]
        .map(([slug, title]) => ({ slug, title }))
        .sort((a, b) => a.title.localeCompare(b.title))
    entries.push({
      hash,
      date,
      type: (typed?.[1] as ChangeType | undefined) ?? "update",
      scope: typed?.[2],
      subject: subject.charAt(0).toUpperCase() + subject.slice(1),
      added: notes(added),
      changed: notes(changed),
    })
  }
  return entries
}

export const Changelog: QuartzEmitterPlugin<Partial<Options>> = (userOpts) => {
  const limit = userOpts?.limit ?? 200
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    beforeBody: [ArticleTitle()],
    pageBody: ChangelogContent(),
    right: [],
  }

  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "Changelog",
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
      yield emitPage(
        ctx,
        {
          slug: CHANGELOG_SLUG,
          frontmatter: { title: "Changelog", tags: [] },
          description: "What changed on this site: new notes, revised notes and new features.",
          changelog: readHistory(ctx.argv.directory, allFiles, limit),
        },
        allFiles,
        opts,
        resources,
      )
    },
  }
}

declare module "vfile" {
  interface DataMap {
    changelog: ChangelogEntry[]
  }
}
