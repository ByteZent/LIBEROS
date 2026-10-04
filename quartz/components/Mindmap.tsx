import { QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/mindmap.inline"
import style from "./styles/mindmap.scss"

// Mind maps written as a nested list inside a [!mindmap] callout. Renders nothing; ships the
// script that draws the list as a map with filters, and its styles.
export default (() => {
  function Mindmap() {
    return null
  }

  Mindmap.afterDOMLoaded = script
  Mindmap.css = style

  return Mindmap
}) satisfies QuartzComponentConstructor
