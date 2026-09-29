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
type: concept | actor | thinker | work | case | assessment | framework | synthesis | source | question | moc
domain: strategy | military | policy | ir | security | intelligence | technology
status: seedling | developing | evergreen
confidence: low | medium | high
created: YYYY-MM-DD
modified: YYYY-MM-DD
review: YYYY-MM-DD      # next spaced-review date
draft: false            # true = never published
```

## Structure

Every note opens with a `[!bluf]` callout. After that, each type follows its template in `_templates/`.

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
