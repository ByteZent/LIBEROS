import { QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/timeline.inline"
import style from "./styles/timeline.scss"

// Timeline (Zeitstrahl) built from [!event] and [!period] callouts. Renders nothing; ships the
// styles and the script that adds the category legend and the links between events.
export default (() => {
  function Timeline() {
    return null
  }

  Timeline.afterDOMLoaded = script
  Timeline.css = style

  return Timeline
}) satisfies QuartzComponentConstructor
