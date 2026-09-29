# Bibliography

One source of truth for sources: **Zotero** with the **Better BibTeX** plugin. Every source exists once, has
one citekey, and every bibliography is an automatic export from Zotero.

```
Zotero (all sources, PDFs, annotations, duplicate merging)
 ├── auto-export: whole library     → ~/spaces/eth/bibliography/master.bib → LaTeX course summaries
 └── auto-export: "LIBEROS" coll.   → LIBEROS/bibliography/library.bib   → this site ([@citekey])
```

Only the **LIBEROS collection** reaches this repo. Lecture slides, course notes and anything private stay in the
full library and never become public.

## One-time setup

1. Install **Zotero 7** (zotero.org) and the **Zotero Connector** browser extension. One click saves a
   book, article or web page with full metadata (DOI/ISBN lookup).
2. Install **Better BibTeX**: download the latest `.xpi` from github.com/retorquere/zotero-better-bibtex/releases,
   then in Zotero go to _Tools → Plugins → ⚙ → Install Plugin From File…_.
3. Citekey style (_Settings → Better BibTeX → Citation keys → Citation key formula_):
   `auth.lower + year + shorttitle(1,0)`, which gives keys like `osinga2007science`.
4. **Import the existing sources:**
   - _File → Import… →_ `bibliography/import/courses.bib`: all course bibliographies, merged and de-duplicated
     (28 entries). Your LaTeX projects cite these keys, so check the imported keys are kept:
     _Citation Key_ column, pinned keys show in the item's _Extra_ field.
   - Create a collection **LIBEROS**, then _File → Import… →_ `bibliography/library.bib` into it.
     **Do this before step 5**, which overwrites the file.
5. **Auto-exports** (right-click → _Export…_, format **Better BibTeX**, tick **Keep updated**):
   - collection **LIBEROS** → `LIBEROS/bibliography/library.bib`
   - _My Library_ → e.g. `~/spaces/eth/bibliography/master.bib` (format Better BibLaTeX for LaTeX)
6. In a LaTeX summary, replace the local `references.bib` with
   `\addbibresource{/Users/flugel/spaces/eth/bibliography/master.bib}`, whenever you're ready.
   The course files keep working until then.

## Daily use

- **New source:** save it with the Connector. If you cite it in LIBEROS, also add it to the _LIBEROS_ collection.
- **Cite in a note:** `[@osinga2007science]` or `[@weick1995sensemaking, p. 17]`. The site renders "(Osinga, 2007)"
  and an APA reference list at the bottom of the page.
- **Important source?** Give it a source note (`T - Source Note`), named after the citekey, with `citekey:` set.
  Its backlinks show every note that relies on it.
- **Duplicates:** Zotero's _Duplicate Items_ view merges them. `make sources` also checks the exported library
  and flags citations to keys that don't exist.
