import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { resolveRelative, simplifySlug } from "../util/path"
import { developmentsFor, streamFor, watchData } from "../util/watch"
import style from "./styles/developments.scss"

// The Watch block of a note, next to its backlinks (see util/watch.ts):
//   - a small map, when the note has a place (`iso`, `geo`) or developments that have one
//   - an assessment's indicators (`indicators:` in its frontmatter) with the developments that
//     fired them, marked "re-assess" when one is newer than `as_of`
//   - the latest developments that concern the note
//   - the latest items of the stream that name the note or are in its country (where the build
//     has the stream: see util/watch.ts)
// The map itself is drawn in the browser (scripts/watchmap.inline.ts, shipped by WatchMap.tsx).

interface Options {
  /** how many developments to list */
  limit: number
}

export default ((opts?: Partial<Options>) => {
  const limit = opts?.limit ?? 6

  const Developments: QuartzComponent = ({
    fileData,
    allFiles,
    displayClass,
  }: QuartzComponentProps) => {
    if (!fileData.slug) return null
    const slug = fileData.slug
    const data = watchData(allFiles)
    const own = data.developments.find((d) => d.slug === slug)
    const developments = developmentsFor(data, slug)
    const assessment = data.assessments.find((a) => a.slug === slug)
    // the stream of a country, not of every note that happens to be named
    const items = fileData.frontmatter?.type === "actor" ? streamFor(data, slug) : []
    const placed =
      data.notes[simplifySlug(slug)] !== undefined ||
      (own?.places.length ?? 0) > 0 ||
      (assessment?.places.length ?? 0) > 0 ||
      developments.some((d) => d.places.length > 0)
    if (!placed && developments.length === 0 && items.length === 0 && !assessment) return null

    const title = new Map(data.developments.map((d) => [d.slug, d]))
    return (
      <div class={classNames(displayClass, "developments")}>
        {placed && <div class="watch-map" data-watch-map="note"></div>}
        {assessment && (
          <>
            <h3>
              Indicators
              {assessment.reassess && <span class="dev-reassess">re-assess</span>}
            </h3>
            <ul class="dev-indicators">
              {assessment.indicators.map((indicator) => (
                <li
                  class={
                    indicator.open ? "dev-open" : indicator.fired.length > 0 ? "dev-fired" : ""
                  }
                >
                  <span class="dev-indicator">{indicator.text}</span>
                  {indicator.fired.map((fired) => (
                    <a href={resolveRelative(slug, fired)} class="internal">
                      <span class="dev-date">{title.get(fired)?.date}</span>
                      {title.get(fired)?.title}
                    </a>
                  ))}
                </li>
              ))}
            </ul>
          </>
        )}
        {developments.length > 0 && (
          <>
            <h3>Developments</h3>
            <ul class="dev-list">
              {developments.slice(0, limit).map((d) => (
                <li>
                  <a href={resolveRelative(slug, d.slug)} class="internal">
                    <span class="dev-date">{d.date}</span>
                    {d.title}
                  </a>
                </li>
              ))}
            </ul>
            {developments.length > limit && (
              <p class="dev-more">and {developments.length - limit} earlier</p>
            )}
          </>
        )}
        {items.length > 0 && (
          <>
            <h3>In the stream</h3>
            <ul class="dev-list">
              {items.slice(0, limit).map((item) => (
                <li>
                  <a href={item.link} class="external" target="_blank" rel="noopener noreferrer">
                    <span class="dev-date">
                      {item.date} · {item.source}
                    </span>
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
            {items.length > limit && <p class="dev-more">and {items.length - limit} more</p>}
          </>
        )}
      </div>
    )
  }

  Developments.css = style
  return Developments
}) satisfies QuartzComponentConstructor
