---
title: Note Standards
type: meta
created: 2026-09-29
tags:
  - meta
---

> [!bluf]
> Conventions for naming, frontmatter, structure and callouts, so that all notes have the same shape and can be read, queried and linked the same way.

## Naming

- Title Case, singular, no prefixes: `Center of Gravity`, not `CoG concept`.
- People: full name (`Carl von Clausewitz`); works: title (`On War`). Use `aliases:` for acronyms and translations (`Vom Kriege`, `CoG`).

## Frontmatter

```yaml
type: concept | model | actor | thinker | work | case | judgment | norm | assessment | framework | synthesis | source | question | moc
domain: [economics, policy]   # one or more: strategy · military · policy · economics · law · ir · security · intelligence · technology
courses: [PP-ECON-1]          # course codes this note serves (see Course Maps); shown as a COURSE badge
status: seedling | developing | evergreen
confidence: low | medium | high
created: YYYY-MM-DD
modified: YYYY-MM-DD
review: YYYY-MM-DD      # next spaced-review date
draft: false            # true = never published
```

## Three axes

| Axis | Answers | Where |
|---|---|---|
| **Folder** | What *kind* of note is this? | `01–09` sections |
| **`domain`** | Which discipline(s)? | frontmatter, can be several |
| **Maps of Content** | How does a field fit together, and what's still missing? | `09-Learning/91-Maps-of-Content` |

Disciplines are **not** folders. *Public Goods* is economics, but it explains alliance burden-sharing; *Rule of Law* is law, but it constrains every policy instrument. Filing by discipline would cut exactly those links.

| Discipline material | Template | Folder |
|---|---|---|
| Concept or principle | `T - Concept` | `02-Concepts/<discipline>` |
| Economic model / theory | `T - Model` | `02-Concepts/28-Economics` |
| Statute, constitutional article, treaty | `T - Legal Norm` | `08-Library/85-Legal-Sources` |
| Court decision | `T - Judgment` | `04-Case-Studies/44-Court-Cases` |
| Policy reform or decision | `T - Case Study` | `04-Case-Studies/42-Policy-Cases` |
| Analytical method (CBA, process tracing, …) | `T - Framework` | `06-Frameworks-and-Methods` |

**New course?** Pick a short code (e.g. `L1-HS26`) and use it in the Course Map's `course:` and in each note's `courses:`. Then create `content/tags/course/<code>.md` with the course name as `title`. That page lists every published note for the course, is found by searching the course name, and supplies the label of the COURSE badge.

## Structure

Every note opens with a `[!bluf]` callout. After that, each type follows its template in `_templates/`.

## Sources

- Cite with citekeys: `[@osinga2007science]`, `[@weick1995sensemaking, p. 17]`. Keys come from Zotero (see `bibliography/README.md`). Never type a full reference by hand.
- Keep the confidence rating next to the citation in the *Sources* section: `- [@key]: why it matters. [High confidence]`
- Important sources get a **source note** named after the citekey (`citekey:` in frontmatter).
- `make sources` must report 0 problems before publishing.

## Callouts

| Callout | Use |
|---|---|
| `> [!bluf]` | Bottom line up front |
| `> [!assessment]` | My own judgement |
| `> [!counter]` | Strongest critique / counter-argument |
| `> [!source]` | Direct quotation from a primary source |
| `> [!question]` | Open question |

## Folders

| Folder | Published | Purpose |
|---|---|---|
| `01–09` | yes | The knowledge base |
| `_inbox` | no | Raw captures, processed weekly |
| `_private` | no | Never published |
| `_templates` | no | Note templates |
| `_dashboards` | no | Obsidian Bases: review queues |
| `assets` | yes | Images and attachments |
