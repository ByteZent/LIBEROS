import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { resolveRelative } from "../../util/path"
import { ChangeType, ChangelogNote } from "../../plugins/emitters/changelog"
import style from "../styles/changelog.scss"

// Body of /changelog (see plugins/emitters/changelog.tsx): the git history, newest first,
// grouped by month. Each entry shows what kind of change it was and links the notes it touched.
const LABELS: Record<ChangeType, string> = {
  note: "New",
  edit: "Revised",
  fix: "Fixed",
  site: "Site",
  tool: "Tooling",
  meta: "Meta",
  update: "Update",
}

// a commit that touches half the vault should not bury the page
const MAX_NOTES = 12

export default (() => {
  const ChangelogContent: QuartzComponent = ({ fileData, cfg }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const entries = fileData.changelog ?? []
    if (entries.length === 0) {
      return (
        <div class="popover-hint changelog">
          <p>No history available in this build.</p>
        </div>
      )
    }

    const month = (date: string) =>
      new Date(`${date}T00:00:00Z`).toLocaleDateString(cfg.locale, {
        year: "numeric",
        month: "long",
        timeZone: "UTC",
      })
    const months = [...new Set(entries.map((e) => month(e.date)))]

    const noteList = (label: string, notes: ChangelogNote[]) =>
      notes.length > 0 && (
        <p class="cl-notes">
          <span class="cl-key">{label}</span>
          {notes.slice(0, MAX_NOTES).map((note, i) => (
            <>
              {i > 0 && " · "}
              <a class="internal" href={resolveRelative(slug, note.slug)}>
                {note.title}
              </a>
            </>
          ))}
          {notes.length > MAX_NOTES && ` · and ${notes.length - MAX_NOTES} more`}
        </p>
      )

    return (
      <div class="popover-hint changelog">
        <p>
          What changed on this site, newest first: new notes, revised notes and new features. The
          list is built from the project's history, so each entry is one saved step of work.
        </p>
        {months.map((name) => (
          <section>
            <h2>{name}</h2>
            <ul class="cl-list">
              {entries
                .filter((e) => month(e.date) === name)
                .map((e) => (
                  <li class="cl-entry">
                    <div class="cl-head">
                      <time datetime={e.date}>{e.date}</time>
                      <span class={`cl-type cl-type-${e.type}`}>{LABELS[e.type]}</span>
                      {e.scope && <span class="cl-scope">{e.scope}</span>}
                    </div>
                    <p class="cl-subject">{e.subject}</p>
                    {noteList("New notes", e.added)}
                    {noteList("Changed", e.changed)}
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    )
  }

  ChangelogContent.css = style

  return ChangelogContent
}) satisfies QuartzComponentConstructor
