import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { pathToRoot } from "../../util/path"
// @ts-ignore
import script from "../scripts/planner.inline"
import style from "../styles/planner.scss"

// Body of /planner, the page Plugin.Planner() emits in the private preview: the frame the
// calendar board is mounted into by planner.inline.ts. The board itself lives in planner/.
export default (() => {
  const PlannerContent: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    return (
      <div
        id="liberos-planner"
        data-api={fileData.plannerApi}
        data-base={pathToRoot(fileData.slug!)}
      >
        <noscript>The planner needs JavaScript.</noscript>
      </div>
    )
  }

  PlannerContent.css = style
  PlannerContent.afterDOMLoaded = script

  return PlannerContent
}) satisfies QuartzComponentConstructor
