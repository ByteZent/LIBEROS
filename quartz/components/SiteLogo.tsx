import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import style from "./styles/siteLogo.scss"

// Replaces PageTitle: the LIBEROS mark (see branding/) drawn inline with theme colours,
// so it follows light/dark mode, next to the site title.
const SiteLogo: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  return (
    <h2 class={classNames(displayClass, "page-title", "site-logo")}>
      <a href={baseDir} aria-label={title}>
        <svg class="site-logo-mark" viewBox="0 0 64 64" aria-hidden="true">
          <g class="slm-ticks">
            <line x1="32" y1="1.5" x2="32" y2="5" />
            <line x1="32" y1="59" x2="32" y2="62.5" />
            <line x1="1.5" y1="32" x2="5" y2="32" />
            <line x1="59" y1="32" x2="62.5" y2="32" />
          </g>
          <path class="slm-frame" d="M32 8 L56 32 L32 56 L8 32 Z" />
          <g class="slm-edges">
            <line x1="27" y1="21" x2="27" y2="38" />
            <line x1="27" y1="38" x2="43" y2="38" />
            <line class="slm-diag" x1="27" y1="21" x2="43" y2="38" />
          </g>
          <circle class="slm-node" cx="27" cy="21" r="3.6" />
          <circle class="slm-node" cx="43" cy="38" r="3.6" />
          <circle class="slm-pivot" cx="27" cy="38" r="5.1" />
        </svg>
        <span class="site-logo-text">{title}</span>
      </a>
    </h2>
  )
}

SiteLogo.css = style

export default (() => SiteLogo) satisfies QuartzComponentConstructor
