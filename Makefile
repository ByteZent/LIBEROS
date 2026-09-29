# LIBEROS — common operations.  Run `make` or `make help` for the list.

SHELL   := /bin/bash
VAULT   := content
PORT    ?= 8080
TODAY   := $(shell date +%F)
MSG     ?= Update notes $(TODAY)
# knowledge notes only: no section indexes, templates, meta docs or dashboards
NOTES   := find $(VAULT)/0[1-9]-* -name '*.md' ! -name index.md -print0

.DEFAULT_GOAL := help
.PHONY: help install serve serve-pwa build clean check format typecheck logo new review stats inbox open publish update

help: ## Show this help
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo
	@echo "  make new TYPE=concept TITLE=\"Escalation Dominance\""
	@echo "  types: concept actor thinker key-work case-study assessment framework synthesis source-note open-question course-map"

## ── Setup & site ────────────────────────────────────────────────────────────

install: ## Install dependencies (npm ci)
	npm ci

serve: ## Build and serve locally with live reload (PORT=8080)
	npx quartz build --serve --port $(PORT)

serve-pwa: ## Like serve, but with the service worker enabled (to test offline/install)
	LIBEROS_PWA=1 npx quartz build --serve --port $(PORT) --wsPort 3002 --output public-pwa

build: ## Build the static site into ./public
	npx quartz build

clean: ## Remove build output and cache
	rm -rf public public-pwa .quartz-cache

## ── Quality ─────────────────────────────────────────────────────────────────

typecheck: ## Type-check Quartz config and components
	npx tsc --noEmit

format: ## Format code with Prettier
	npx prettier --write .

check: typecheck ## Type-check, verify formatting and do a test build
	npx prettier --check .
	npx quartz build

logo: ## Re-export favicon, social image and logo PNGs from branding/*.svg
	node branding/export.mjs

## ── Writing & learning ──────────────────────────────────────────────────────

new: ## Create a note from a template in _inbox (TYPE=… TITLE="…")
	@test -n "$(TITLE)" || { echo "usage: make new TYPE=concept TITLE=\"Note Title\""; exit 1; }
	@tpl=$$(ls "$(VAULT)/_templates/" | grep -i "^T - $$(echo '$(or $(TYPE),concept)' | tr '-' ' ')\.md$$"); \
	 test -n "$$tpl" || { echo "unknown TYPE '$(TYPE)' (see make help)"; exit 1; }; \
	 out="$(VAULT)/_inbox/$(TITLE).md"; \
	 test ! -e "$$out" || { echo "exists: $$out"; exit 1; }; \
	 sed -e 's/{{title}}/$(TITLE)/g' -e 's/{{date}}/$(TODAY)/g' "$(VAULT)/_templates/$$tpl" > "$$out"; \
	 echo "created $$out"

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

publish: check ## Check, commit everything and push to main (MSG="…") → GitHub Pages deploy
	git add -A
	git diff --cached --quiet || git commit -m "$(MSG)"
	git push origin main

update: ## Update the Quartz engine from upstream
	npx quartz update
