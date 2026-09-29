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
| `make review`                               | Notes whose `review:` date is due                                                         |
| `make stats`                                | Note counts by type and maturity                                                          |
| `make open`                                 | Open the vault in Obsidian                                                                |
| `make check`                                | Type-check, format check, test build                                                      |
| `make publish MSG="Add deterrence notes"`   | Check → commit → push → GitHub Pages deploys automatically                                |
| `make update`                               | Update the Quartz engine from upstream                                                    |
| `make logo`                                 | Re-export favicon / social image / logo PNGs from `branding/`                             |
| `make build` / `make clean` / `make format` | Build to `public/`, remove build output, format code                                      |

Template types for `make new`: `concept actor thinker key-work case-study assessment framework synthesis source-note open-question course-map`.

In Obsidian: open `LIBEROS/content` as the vault. New notes land in `_inbox/`; insert a template via _Templates: Insert template_. The **Learning Dashboard** (`_dashboards/Learning Dashboard.base`) shows review queues, seedlings, low-confidence notes and the inbox.

## Frontmatter

| Field        | Values                                                                                                 | Rendered                 |
| ------------ | ------------------------------------------------------------------------------------------------------ | ------------------------ |
| `type`       | concept · actor · thinker · work · case · assessment · framework · synthesis · source · question · moc | status strip             |
| `status`     | seedling · developing · evergreen                                                                      | status strip             |
| `confidence` | low · medium · high                                                                                    | status strip             |
| `domain`     | strategy · military · policy · ir · security · intelligence · technology                               | status strip             |
| `review`     | `YYYY-MM-DD`                                                                                           | status strip + dashboard |
| `draft`      | `true` → excluded from the site                                                                        | –                        |

Custom callouts (styled identically in Obsidian and on the site): `[!bluf]`, `[!assessment]`, `[!counter]`, `[!source]`.

## TODO

- [ ] `content/00-Meta/About.md`: name, programme, links
- [ ] `quartz.config.ts`: `baseUrl`
- [ ] `quartz.layout.ts`: footer links
