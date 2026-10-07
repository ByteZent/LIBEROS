# LIBEROS Planner

Tasks, events and recurring schedules on a calendar board, stored as plain Markdown in the vault. The same board runs in two places:

- in **Obsidian**, as the plugin `liberos-planner` (ribbon icon or command "Open planner")
- on the **private preview site**, at `/planner` (`make serve-private`), where a local server writes the changes back into the notes

The public site never contains the board: `quartz.config.ts` adds `Plugin.Planner()` only under `LIBEROS_PRIVATE=1`, and the planner's own data lives in the gitignored `content/_private/Planner`.

## Use

```bash
make planner         # build, and install the plugin into content/.obsidian/plugins
make serve-private   # private site with the board at http://localhost:8080/planner
make planner-check   # type-check and run the tests
```

In Obsidian the plugin has to be switched on once: Settings → Community plugins → LIBEROS Planner.

On the board:

- drag an item to move it, drag its lower edge to change its length
- drag across empty slots (or click one) to create an item
- drag a task from the side panel onto the calendar to schedule it
- tick a task's box to complete it; "Done" in the bar shows finished items again
- the coloured chips switch categories on and off; the filter field takes text, `#tag` or a category
- moving one occurrence of a series asks whether the change is for that occurrence or the whole series

## Where items are stored

| Source      | Stored as                                                              | A change on the board writes                  |
| ----------- | ---------------------------------------------------------------------- | --------------------------------------------- |
| Event, task | A note with `type: event` or `type: task` in `_private/Planner/`       | The note's frontmatter                        |
| Vault task  | A `- [ ]` line in any note                                             | Markers at the end of that line               |
| Feed event  | An event of a subscribed `.ics` calendar, cached in `feeds/<name>.ics` | A local override in `feeds/<name>.local.json` |
| Deadline    | A row of a course map's `## Assessment` table with a `dd.mm.yyyy` date | Nothing: read-only, edit the course map       |

### Notes

```yaml
---
title: Seminar paper outline
type: task # or event
status: open # open | done | cancelled
start: 2026-10-12T14:00 # a bare date is a whole day
end: 2026-10-12T15:30
due: 2026-10-20
rrule: FREQ=WEEKLY;BYDAY=MO;UNTIL=20261218T235959
category: Selbststudium
tags: [course/PS1-HS26]
priority: high # high | medium | low
---
```

Times are local wall-clock times without a zone. A series keeps its exceptions in the same note: `exdates` (skipped occurrences), `overrides` (moved ones) and, for a recurring task, `completed` (the occurrences that are done). A note that is deleted on the board goes to the vault's trash.

### Checkbox lines

```markdown
- [ ] Read chapter 3 #course/MilPsy-HS26 ⏫ 🔁 every week ⏳ 2026-10-12 14:00 ⏱ 45m 📅 2026-10-20
```

`📅` due, `⏳` scheduled, `🔁` recurrence, `✅` done and the priority arrows follow the Tasks plugin. The clock time after `⏳` and `⏱` (a length in minutes) are the planner's own. Completing a recurring line ticks it and puts its successor above it. `inlineTasks: false` in the settings hides these lines from the board.

A note that is published carries these markers onto the public site, like any other text of the note.

### Calendar feeds

A feed is fetched when Obsidian or the server starts, and again every `refreshMinutes`. Its events can be moved, recoloured and hidden; these changes stay in the vault and are never sent back to the calendar. A local change to an event wins until it is removed from `feeds/<name>.local.json`.

## Settings

`content/_private/Planner/planner.json`, read by the plugin and the server alike (the plugin's settings tab edits it):

```json
{
  "feeds": [
    {
      "name": "ETH",
      "url": "https://…/calendar.ics",
      "categoryField": "Kategorie",
      "rules": [{ "match": "PRÜFUNG|ABGABE", "category": "Exam" }]
    }
  ],
  "categories": [{ "name": "Vorlesung", "color": "#1f4e5f" }],
  "refreshMinutes": 240,
  "weekStart": 1,
  "dayStart": "05:00",
  "dayEnd": "23:00",
  "defaultView": "timeGridWeek",
  "inlineTasks": true,
  "exclude": ["_templates", "_dashboards"]
}
```

An event's category is the value of the line `<categoryField>: …` in its description, else that of the first rule whose pattern matches its title, else the feed's name. A category without a colour gets one from a built-in palette. The feed address is a secret: it belongs in this file and nowhere in the repository.

## Code

```
src/core      data model, recurrence (rrule), .ics reader, reading and writing notes; no DOM, no Node
src/ui        the board (FullCalendar) and its dialogs, plain DOM
src/obsidian  the plugin: the view, commands, settings, the vault as file system
src/web       the board for the site, talking to the server
src/server    the local server: node:fs as file system, HTTP API, change notifications
test          tests of the core (node:test)
```

`esbuild.config.mjs` builds `dist/obsidian/` (the plugin), `dist/web/planner.js` (emitted by `quartz/plugins/emitters/planner.tsx` as `/static/planner.js`) and `dist/server.cjs`.

The server listens on `127.0.0.1` only (`PLANNER_PORT`, default 8081). It rejects requests whose `Host` is not that address and whose `Origin` is not the preview site on localhost, and it only reads and writes inside `content/`.
