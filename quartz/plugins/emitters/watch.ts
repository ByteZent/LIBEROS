import { QuartzEmitterPlugin } from "../types"
import { FullSlug } from "../../util/path"
import { watchData } from "../../util/watch"
import { write } from "./helpers"

// Emits /static/watch.json: the developments with their places, the assessments with their
// indicators, and the places of the notes (see util/watch.ts). The map reads it in the browser
// (components/scripts/watchmap.inline.ts); the borders are in /static/world.json.
export const Watch: QuartzEmitterPlugin = () => ({
  name: "Watch",
  async *emit(ctx, content) {
    yield write({
      ctx,
      slug: "static/watch" as FullSlug,
      ext: ".json",
      content: JSON.stringify(watchData(content.map(([, file]) => file.data))),
    })
  },
})
