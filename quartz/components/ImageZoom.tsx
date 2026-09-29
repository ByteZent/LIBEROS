import { QuartzComponentConstructor } from "./types"
// @ts-ignore
import script from "./scripts/imagezoom.inline"
import style from "./styles/imageZoom.scss"

// Click-to-enlarge for images in notes. Renders nothing; only ships the script and styles.
export default (() => {
  function ImageZoom() {
    return null
  }

  ImageZoom.afterDOMLoaded = script
  ImageZoom.css = style

  return ImageZoom
}) satisfies QuartzComponentConstructor
