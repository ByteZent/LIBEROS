import fs from "fs"
import path from "path"
import { QuartzEmitterPlugin } from "../types"
import HeaderConstructor from "../../components/Header"
import BodyConstructor from "../../components/Body"
import { FullPageLayout } from "../../cfg"
import { FullSlug } from "../../util/path"
import { defaultListPageLayout, sharedPageComponents } from "../../../quartz.layout"
import { ArticleTitle, PlannerContent } from "../../components"
import { emitPage } from "./flashcards"
import { write } from "./helpers"

// Emits /planner: the calendar board for tasks, events and deadlines (see planner/README.md).
// Only part of the private preview: quartz.config.ts adds this emitter under LIBEROS_PRIVATE=1,
// so the deployed site has neither the page nor the script.
// The page itself is an empty frame. The board (planner/dist/web/planner.js, built by
// `make planner`) is copied to /static/planner.js and gets its data from the local planner
// server that `make serve-private` starts next to Quartz; that server also writes the changes
// made on the board back into the notes.

export const PLANNER_SLUG = "planner" as FullSlug
const BOARD = path.join("planner", "dist", "web", "planner.js")

export const Planner: QuartzEmitterPlugin = () => {
  const opts: FullPageLayout = {
    ...sharedPageComponents,
    ...defaultListPageLayout,
    beforeBody: [ArticleTitle()],
    pageBody: PlannerContent(),
    right: [],
  }

  const { head: Head, header, beforeBody, pageBody, afterBody, left, right, footer: Footer } = opts
  const Header = HeaderConstructor()
  const Body = BodyConstructor()

  return {
    name: "Planner",
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
      if (!fs.existsSync(BOARD)) {
        throw new Error(`${BOARD} is missing: run "make planner" (make serve-private does it)`)
      }
      yield write({
        ctx,
        slug: "static/planner" as FullSlug,
        ext: ".js",
        content: await fs.promises.readFile(BOARD),
      })
      yield emitPage(
        ctx,
        {
          slug: PLANNER_SLUG,
          frontmatter: { title: "Planner", tags: [] },
          description: "Tasks, schedule and deadlines on a calendar board.",
          plannerApi: `http://127.0.0.1:${process.env.LIBEROS_PLANNER_PORT ?? "8081"}`,
        },
        content.map((c) => c[1].data),
        opts,
        resources,
      )
    },
  }
}

declare module "vfile" {
  interface DataMap {
    plannerApi: string
  }
}
