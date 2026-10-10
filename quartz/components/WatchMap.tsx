import { QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/watchmap.inline"
import style from "./styles/watchmap.scss"

// The Watch map: developments on a world map. Renders nothing; ships the script that draws the
// map into a [!map] callout and into the Developments block of a note, and its styles.
export default (() => {
  function WatchMap() {
    return null
  }

  WatchMap.afterDOMLoaded = script
  WatchMap.css = style

  return WatchMap
}) satisfies QuartzComponentConstructor
