<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="branding/logo-lockup-dark.png">
    <img src="branding/logo-lockup-light.png" alt="LIBEROS" width="330">
  </picture>
</p>

# LIBEROS

A public, structured knowledge base on **strategy, military affairs and public policy**, written in [Obsidian](https://obsidian.md) and published with [Quartz 4](https://quartz.jzhao.xyz).

It is deliberately **separate from my study notes**: the study vault holds lecture and reading notes; LIBEROS holds only ideas I have _understood_, rewritten as atomic, sourced, linked notes. See `content/00-Meta/Learning System.md`.

## Layout

```
LIBEROS/
├── content/                 ← THE OBSIDIAN VAULT (open this folder in Obsidian)
│   ├── .obsidian/           vault config: templates, CSS snippet, graph colours
│   ├── index.md             landing page
│   ├── 00-Meta/             about, methodology, note standards, learning system
│   ├── 01-Actors/           states, alliances/IOs, forces & agencies, non-state, leaders
│   ├── 02-Concepts/         strategic theory, doctrine, policy, IR, security, intel, tech
│   ├── 03-Thinkers-and-Works/
│   ├── 04-Case-Studies/
│   ├── 05-Assessments/
│   ├── 06-Frameworks-and-Methods/
│   ├── 07-Syntheses/
│   ├── 08-Library/
│   ├── 09-Learning/         maps of content, open questions, course maps
│   ├── assets/              images & attachments (published)
│   ├── _inbox/              raw captures        (NOT published, NOT in git)
│   ├── _private/            private material    (NOT published, NOT in git)
│   ├── _templates/          note templates      (NOT published)
│   └── _dashboards/         Obsidian Bases      (NOT published)
├── quartz/                  Quartz engine (+ custom NoteStatus component)
├── quartz.config.ts         site config: title, baseUrl, theme, ignore patterns
├── quartz.layout.ts         page layout: explorer, graph, backlinks, status strip
└── .github/workflows/deploy.yml   build & deploy to GitHub Pages on push
```

## Daily use

Everything runs through `make` (`make help` lists all targets):

| Command                                     | What it does                                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `make install`                              | Install dependencies                                                                      |
| `make serve`                                | Local preview with live reload → http://localhost:8080                                    |
| `make serve-pwa`                            | Same, with the service worker on (offline / install testing, port 8080 → use `PORT=8090`) |
| `make new TYPE=concept TITLE="Escalation"`  | New note from a template in `_inbox/`                                                     |
| `make inbox`                                | List unprocessed captures                                                                 |
| `make course`                               | Exam readiness for every course: days to the next assessment, notes, objectives covered   |
| `make course COURSE=PP-ECON-1`              | One course: open items before each assessment, objectives, notes (`SYNC=1`: update map)   |
| `make bridges`                              | Bridge prompts: unlinked notes that share tags (`INBOX=1`, `N=15`)                        |
| `make review`                               | Notes whose `review:` date is due                                                         |
| `make sources`                              | Check the bibliography: duplicates, unknown `[@citekeys]`                                 |
| `make bib-merge`                            | Merge all course `.bib` files from the study vault for Zotero import                      |
| `make stats`                                | Note counts by type and maturity                                                          |
| `make open`                                 | Open the vault in Obsidian                                                                |
| `make check`                                | Type-check, format check, test build                                                      |
| `make publish MSG="note: add deterrence"`   | Check → commit → push → GitHub Pages deploys automatically                                |
| `make hooks`                                | Enable the commit message check for this clone (also run by `make install`)               |
| `make update`                               | Update the Quartz engine from upstream                                                    |
| `make logo`                                 | Re-export favicon / social image / logo PNGs from `branding/`                             |
| `make build` / `make clean` / `make format` | Build to `public/`, remove build output, format code                                      |

Template types for `make new`: `concept model actor thinker key-work case-study judgment legal-norm assessment framework synthesis source-note open-question course-map`.

In Obsidian: open `LIBEROS/content` as the vault. New notes land in `_inbox/`; insert a template via _Templates: Insert template_. The **Learning Dashboard** (`_dashboards/Learning Dashboard.base`) shows review queues, seedlings, low-confidence notes and the inbox.

## Commit messages

Every commit message has the form `<type>(<scope>): <subject>`. The scope is optional. A git hook (`.githooks/commit-msg`, enabled by `make hooks` or `make install`) rejects anything else, and the site's `/changelog` page is built from these messages.

| Type    | Use for                                                     | Example                                               |
| ------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| `note`  | New notes                                                   | `note(MikroEcon): add Elasticity and Consumer Choice` |
| `edit`  | Changes to existing notes: content, cards, glossary         | `edit(L1): add application cards to OODA Loop`        |
| `fix`   | Corrections: wrong fact, typo, broken link, bug             | `fix: use ounces in the farmer and rancher example`   |
| `site`  | What visitors see: components, layout, styles               | `site(flashcards): add missed pile and mixed deck`    |
| `tool`  | Scripts, Makefile, templates, lint, hooks                   | `tool: add note lint to make check`                   |
| `meta`  | Vault documentation, standards, course maps                 | `meta: add course maps for HS26`                      |
| `chore` | Dependencies, config, housekeeping. Hidden in the changelog | `chore: update Quartz`                                |

The first line is at most 72 characters, says what changed in the imperative ("add", not "added") and has no full stop. One kind of change per commit: a commit that adds notes _and_ changes the site is two commits. Merge commits, reverts and dependency bumps are exempt.

## Frontmatter

| Field        | Values                                                                                                                           | Rendered                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `type`       | concept · model · actor · thinker · work · case · judgment · norm · assessment · framework · synthesis · source · question · moc | status strip             |
| `status`     | seedling · developing · evergreen                                                                                                | status strip             |
| `confidence` | low · medium · high                                                                                                              | status strip             |
| `domain`     | one or more of: strategy · military · policy · economics · law · ir · security · intelligence · technology                       | status strip             |
| `courses`    | course codes, e.g. `[PP-ECON-1]`, used by `make course` and the dashboard                                                        | –                        |
| `review`     | `YYYY-MM-DD`                                                                                                                     | status strip + dashboard |
| `draft`      | `true` → excluded from the site                                                                                                  | –                        |

## Flashcards

Every `> [!qard]- Question` callout is a card on `/flashcards/`. The site schedules each card by how you rated it (spaced repetition, stored in the browser; export and import on the overview page). `<!-- qard-hide: Label; Label -->` under an SVG makes an image card with hidden labels, `<!-- qard-solution -->` a calculation card with a folded worked solution, `<!-- qard-write -->` a card whose answer you write first and then compare (the _Write answers_ button does that for a whole deck), and each `## Key Connections` line becomes a bridge card in `/flashcards/connections`. Details: `content/00-Meta/Note Standards.md`.

Custom callouts (styled identically in Obsidian and on the site): `[!bluf]`, `[!assessment]`, `[!counter]`, `[!source]`.

## TODO

- [ ] `content/00-Meta/About.md`: name, programme, links
- [ ] `quartz.config.ts`: `baseUrl`
- [ ] `quartz.layout.ts`: footer links
