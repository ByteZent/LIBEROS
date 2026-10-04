# LIBEROS — common operations.  Run `make` or `make help` for the list.

SHELL   := /bin/bash
VAULT   := content
PORT    ?= 8080
TODAY   := $(shell date +%F)
# commit messages follow .githooks/commit-msg: <type>(<scope>): <subject>
MSG     ?= edit: update notes $(TODAY)
# knowledge notes only: no section indexes, templates, meta docs or dashboards
NOTES   := find $(VAULT)/0[1-9]-* -name '*.md' ! -name index.md -print0

.DEFAULT_GOAL := help
.PHONY: help install hooks serve serve-pwa serve-private build booklet booklets clean check lint format typecheck logo sources bib-merge new course glossary questions bridges idea ideas review stats inbox open publish update

help: ## Show this help
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo
	@echo "  make new TYPE=concept TITLE=\"Escalation Dominance\""
	@echo "  types: concept model actor thinker key-work case-study judgment legal-norm assessment framework synthesis source open-question course-map idea mind-map"
	@echo "  make booklet COURSE=MikroEcon-HS26 TEST=1"
	@echo "  make idea TITLE=\"Working title\" TEXT=\"The idea in a sentence or two\""

## ── Setup & site ────────────────────────────────────────────────────────────

install: hooks ## Install dependencies (npm ci) and the git hooks
	npm ci

hooks: ## Enable the commit message check (.githooks/commit-msg) for this clone
	git config core.hooksPath .githooks

serve: ## Build and serve locally with live reload (PORT=8080)
	npx quartz build --serve --port $(PORT)

serve-pwa: ## Like serve, but with the service worker enabled (to test offline/install)
	LIBEROS_PWA=1 npx quartz build --serve --port $(PORT) --wsPort 3002 --output public-pwa

serve-private: ## Like serve, but also renders _private, _inbox and drafts (local only, never deployed)
	LIBEROS_PRIVATE=1 npx quartz build --serve --port $(PORT) --output public-private

build: ## Build the static site into ./public, with the booklets
	npx quartz build
	node scripts/booklet.mjs --all

clean: ## Remove build output and cache
	rm -rf public public-pwa public-private booklets .quartz-cache

## ── Quality ─────────────────────────────────────────────────────────────────

typecheck: ## Type-check Quartz config and components
	npx tsc --noEmit

format: ## Format code with Prettier
	npx prettier --write .

lint: ## Check notes: cards without qard-deck, Self-Test headings, recall-only self-tests
	@node scripts/lint.mjs

check: typecheck lint ## Type-check, lint notes, verify formatting, check sources and do a test build
	npx prettier --check .
	node scripts/bib.mjs check
	npx quartz build

logo: ## Re-export favicon, social image and logo PNGs from branding/*.svg
	node branding/export.mjs

## ── Sources ─────────────────────────────────────────────────────────────────

sources: ## Check bibliography: duplicates, [@citekeys] not in library.bib, source notes
	@node scripts/bib.mjs check

STUDY_BIBS ?= $(wildcard /Users/flugel/spaces/eth/PARA\ BELLUM/04_Subjects/*/*/zusammenfassung-*/references.bib)
bib-merge: ## Merge the study vault's course .bib files into bibliography/import/ (for Zotero import)
	@node scripts/bib.mjs merge bibliography/import/courses.bib "/Users/flugel/spaces/eth/PARA BELLUM/04_Subjects/"*/*/zusammenfassung-*/references.bib

## ── Writing & learning ──────────────────────────────────────────────────────

new: ## Create a note from a template in _inbox (TYPE=… TITLE="…")
	@test -n "$(TITLE)" || { echo "usage: make new TYPE=concept TITLE=\"Note Title\""; exit 1; }
	@tpl=$$(ls "$(VAULT)/_templates/" | grep -i "^T - $$(echo '$(or $(TYPE),concept)' | tr '-' ' ')\.md$$"); \
	 test -n "$$tpl" || { echo "unknown TYPE '$(TYPE)' (see make help)"; exit 1; }; \
	 out="$(VAULT)/_inbox/$(TITLE).md"; \
	 test ! -e "$$out" || { echo "exists: $$out"; exit 1; }; \
	 sed -e 's/{{title}}/$(TITLE)/g' -e 's/{{date}}/$(TODAY)/g' -e '/^````/d' "$(VAULT)/_templates/$$tpl" > "$$out"; \
	 echo "created $$out"

course: ## Exam readiness: days left, open items, objectives, notes (COURSE=L1-HS26; omit: all courses; SYNC=1: update the map's Ready? column)
	@node scripts/course.mjs $(COURSE) $(if $(SYNC),--sync)

booklet: ## Printable A5 booklet of a course's notes up to an assessment, from the built site (COURSE=… TEST=1; omit TEST: the next one; or NOTES="A,B" TITLE="…"; SITE=public-private: incl. _inbox)
	@node scripts/booklet.mjs $(COURSE) $(TEST) $(if $(NOTES),--notes "$(NOTES)") $(if $(TITLE),--title "$(TITLE)") $(if $(SITE),--site $(SITE))

booklets: ## Build the booklets the course maps list (booklets: ["Test 1"]) and link to, into ./public/booklets (needs make build or a running make serve)
	@node scripts/booklet.mjs --all

glossary: ## Build the central glossary from the notes' Glossary tables (INBOX=1: preview incl. _inbox; CHECK=1: list gaps)
	@node scripts/glossary.mjs $(if $(INBOX),--inbox) $(if $(CHECK),--check)

questions: ## Build the open-questions page from the notes' Open Questions sections (INBOX=1: preview incl. _inbox)
	@node scripts/questions.mjs $(if $(INBOX),--inbox)

bridges: ## Bridge prompts: unlinked note pairs that share tags (INBOX=1: incl. _inbox; N=15)
	@node scripts/bridges.mjs $(if $(INBOX),--inbox) $(N)

idea: ## Capture an idea for a paper or page, timestamped, in 09-Learning/94-Ideas (TITLE="…" TEXT="…")
	@node scripts/ideas.mjs new "$(TITLE)" "$(TEXT)"

ideas: ## The idea board: every idea by stage, with its age
	@node scripts/ideas.mjs

review: ## List notes whose review date is due (today or earlier)
	@grep -rl --include='*.md' '^review: [0-9]' $(VAULT) | grep -v '/_templates/' | while read -r f; do \
	   d=$$(sed -n 's/^review: \([0-9-]*\).*/\1/p' "$$f" | head -1); \
	   [[ "$$d" < "$(TODAY)" || "$$d" == "$(TODAY)" ]] && echo "$$d  $${f#$(VAULT)/}"; \
	 done | sort || true

stats: ## Count notes by type and maturity
	@echo "── by type";   $(NOTES) | xargs -0 grep -h '^type:'   | sort | uniq -c | sort -rn
	@echo "── by status"; $(NOTES) | xargs -0 grep -h '^status:' | sort | uniq -c | sort -rn
	@echo "── inbox";     ls $(VAULT)/_inbox | grep -v README | wc -l | xargs echo "items:"

inbox: ## List unprocessed inbox items
	@ls -1t $(VAULT)/_inbox | grep -v README || echo "inbox empty"

open: ## Open the vault in Obsidian
	open "obsidian://open?path=$(abspath $(VAULT))"

## ── Publishing & maintenance ────────────────────────────────────────────────

publish: check ## Check, commit everything and push to main (MSG="type: subject") → GitHub Pages deploy
	git add -A
	git diff --cached --quiet || git commit -m "$(MSG)"
	git push origin main

update: ## Update the Quartz engine from upstream
	npx quartz update
