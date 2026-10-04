// Study view for a flashcard deck (see pages/FlashcardsContent.tsx): shows one card at a time,
// question first. After the answer you rate yourself; the rating schedules the card's next review
// (qardStore.ts: spaced repetition, stored in this browser). A deck opens on the cards that are
// due today; "All cards" goes through everything. At the end of the deck the missed cards can be
// repeated until none are left.
// A written card (`<!-- qard-write -->` in the note), or every card while "Write answers" is on,
// asks for the answer in a text field first and shows it above the card's answer for comparison.
// `?topic=<name>` in the URL preselects a topic, so notes and course maps can link to their cards.
// On every page, links that carry `data-qard-ids` (deck overview, FLASHCARDS badges) get the
// number of due cards; the overview can also export and import the history as a file.
import {
  INTERVALS,
  Progress,
  day,
  isDue,
  isNew,
  loadProgress,
  mergeProgress,
  rateCard,
  saveProgress,
} from "./qardStore"

type Rating = "known" | "missed"
const WRITE_KEY = "liberos-qards-write" // "Write answers" stays on between visits

function shuffled<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function showDueCounts(progress: Progress) {
  for (const link of document.querySelectorAll<HTMLElement>("[data-qard-ids]")) {
    const ids = (link.dataset.qardIds ?? "").split(" ").filter(Boolean)
    const due = ids.filter((id) => isDue(progress, id)).length
    const fresh = ids.filter((id) => isNew(progress, id)).length
    const label = link.querySelector<HTMLElement>(".qard-due")
    if (!label) continue
    label.textContent =
      due === 0 ? " · none due" : fresh === due ? ` · ${due} new` : ` · ${due} due`
    link.classList.toggle("qard-has-due", due > 0)
  }
}

function setupBackup() {
  const exportButton = document.querySelector<HTMLButtonElement>(".qard-export")
  const importButton = document.querySelector<HTMLButtonElement>(".qard-import")
  const input = document.querySelector<HTMLInputElement>(".qard-import-file")
  const status = document.querySelector<HTMLElement>(".qard-backup-status")
  if (!exportButton || !importButton || !input || !status) return

  const onExport = () => {
    const progress = loadProgress()
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `liberos-flashcards-${day()}.json`
    link.click()
    URL.revokeObjectURL(link.href)
    status.textContent = `${Object.keys(progress).length} cards exported`
  }
  const onImport = () => input.click()
  const onFile = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const progress = loadProgress()
      const count = mergeProgress(progress, JSON.parse(await file.text()))
      saveProgress(progress)
      showDueCounts(progress)
      status.textContent = `${count} cards imported`
    } catch {
      status.textContent = "This file is not a progress export"
    }
    input.value = ""
  }

  exportButton.addEventListener("click", onExport)
  importButton.addEventListener("click", onImport)
  input.addEventListener("change", onFile)
  window.addCleanup(() => {
    exportButton.removeEventListener("click", onExport)
    importButton.removeEventListener("click", onImport)
    input.removeEventListener("change", onFile)
  })
}

document.addEventListener("nav", () => {
  const progress = loadProgress()
  showDueCounts(progress)
  setupBackup()

  const deck = document.querySelector<HTMLElement>(".qard-deck")
  if (!deck) return

  const all = [...deck.querySelectorAll<HTMLElement>(".qard-card")]
  const mode = deck.querySelector<HTMLSelectElement>(".qard-mode-select")!
  const select = deck.querySelector<HTMLSelectElement>(".qard-topic-select")!
  const shuffle = deck.querySelector<HTMLButtonElement>(".qard-shuffle")!
  const writeAll = deck.querySelector<HTMLButtonElement>(".qard-write-all")!
  const progressLabel = deck.querySelector<HTMLElement>(".qard-progress")!
  const prev = deck.querySelector<HTMLButtonElement>(".qard-prev")!
  const flip = deck.querySelector<HTMLButtonElement>(".qard-flip")!
  const next = deck.querySelector<HTMLButtonElement>(".qard-next")!
  const missed = deck.querySelector<HTMLButtonElement>(".qard-missed")!
  const known = deck.querySelector<HTMLButtonElement>(".qard-known")!
  const doneTitle = deck.querySelector<HTMLElement>(".qard-done-title")!
  const score = deck.querySelector<HTMLElement>(".qard-score")!
  const repeat = deck.querySelector<HTMLButtonElement>(".qard-repeat")!
  const studyAll = deck.querySelector<HTMLButtonElement>(".qard-study-all")!
  const restart = deck.querySelector<HTMLButtonElement>(".qard-restart")!

  let cards = all
  let session = all // what "Start over" goes through again
  let index = 0
  let done = false
  const ratings = new Map<HTMLElement, Rating>()
  const rated = (rating: Rating) => cards.filter((card) => ratings.get(card) === rating)
  const idOf = (card: HTMLElement) => card.dataset.id ?? ""
  const inTopic = () =>
    all.filter((card) => select.value === "" || card.dataset.topic === select.value)

  // the text field of a card whose answer is written first, if this is such a card
  const field = (card?: HTMLElement) =>
    card && (card.classList.contains("qard-write") || deck.classList.contains("qard-writing"))
      ? card.querySelector<HTMLTextAreaElement>(".qard-written textarea")
      : null

  // "new", or the card's box and the day it comes back
  const describe = (card: HTMLElement) => {
    const state = progress[idOf(card)]
    const label = card.querySelector<HTMLElement>(".qard-box")
    if (!label) return
    label.textContent = !state
      ? " · new"
      : ` · box ${state.box}/${INTERVALS.length} · ${state.due <= day() ? "due" : `back ${state.due}`}`
  }

  const show = (i: number, revealed = false) => {
    done = false
    index = Math.min(Math.max(i, 0), cards.length - 1)
    for (const card of all) card.classList.remove("current", "revealed")
    const card = cards[index]
    card?.classList.add("current")
    card?.classList.toggle("revealed", revealed)
    if (card) describe(card)
    // a worked solution stays folded until it is asked for
    if (!revealed)
      card?.querySelector<HTMLDetailsElement>(".qard-solution")?.removeAttribute("open")
    // write first, then compare: the field takes the keyboard until the card is turned
    const input = field(card)
    if (input) {
      input.readOnly = revealed
      if (revealed) input.blur()
      else input.focus({ preventScroll: true })
    }
    deck.classList.toggle("qard-revealed", revealed)
    deck.classList.remove("qard-finished")
    progressLabel.textContent = cards.length > 0 ? `${index + 1} / ${cards.length}` : "0 / 0"
    prev.disabled = index === 0
    next.disabled = cards.length === 0
    next.textContent = index >= cards.length - 1 ? "Finish →" : "Next →"
  }

  // the earliest day on which a card of the current topic comes back
  const nextReview = () => {
    const later = inTopic()
      .map((card) => progress[idOf(card)]?.due)
      .filter((due): due is string => due !== undefined && due > day())
      .sort()
    if (later.length === 0) return ""
    const count = later.filter((due) => due === later[0]).length
    return `Next review: ${later[0]} (${count} ${count === 1 ? "card" : "cards"})`
  }

  const finish = () => {
    done = true
    for (const card of all) card.classList.remove("current", "revealed")
    deck.classList.remove("qard-revealed")
    deck.classList.add("qard-finished")
    const nMissed = rated("missed").length
    const nKnown = rated("known").length
    const nSkipped = cards.length - nMissed - nKnown
    const empty = cards.length === 0
    doneTitle.textContent = empty ? "Nothing due" : "Deck finished"
    score.textContent = [
      empty
        ? ""
        : `Knew ${nKnown} · Missed ${nMissed}` + (nSkipped > 0 ? ` · Not rated ${nSkipped}` : ""),
      nextReview(),
    ]
      .filter(Boolean)
      .join(" · ")
    repeat.textContent = `Repeat missed (${nMissed})`
    repeat.hidden = nMissed === 0
    studyAll.hidden = mode.value === "all"
    restart.hidden = empty
    progressLabel.textContent = `${cards.length} / ${cards.length}`
    prev.disabled = cards.length === 0
    next.disabled = true
    updateCounts()
    showDueCounts(progress)
  }

  const updateCounts = () => {
    const pool = inTopic()
    const due = pool.filter((card) => isDue(progress, idOf(card))).length
    mode.options[0].textContent = `Due today (${due})`
    mode.options[1].textContent = `All cards (${pool.length})`
  }

  const start = (pool: HTMLElement[]) => {
    cards = shuffle.getAttribute("aria-pressed") === "true" ? shuffled(pool) : pool
    ratings.clear()
    for (const input of deck.querySelectorAll<HTMLTextAreaElement>(".qard-written textarea"))
      input.value = ""
    if (cards.length === 0) finish()
    else show(0)
  }
  const rebuild = () => {
    updateCounts()
    const pool = inTopic()
    session = mode.value === "due" ? pool.filter((card) => isDue(progress, idOf(card))) : pool
    start(session)
  }
  const onRestart = () => start(session)

  const toggle = () => {
    if (!done) show(index, !cards[index]?.classList.contains("revealed"))
  }
  const onPrev = () => {
    if (cards.length > 0) show(done ? cards.length - 1 : index - 1)
  }
  const onNext = () => {
    if (done) return
    if (index >= cards.length - 1) finish()
    else show(index + 1)
  }
  const rate = (rating: Rating) => {
    if (done || !cards[index]) return
    ratings.set(cards[index], rating)
    rateCard(progress, idOf(cards[index]), rating === "known")
    saveProgress(progress)
    updateCounts()
    onNext()
  }
  const onMissed = () => rate("missed")
  const onKnown = () => rate("known")
  const onRepeat = () => start(rated("missed"))
  const onStudyAll = () => {
    mode.value = "all"
    rebuild()
  }
  const onShuffle = () => {
    const on = shuffle.getAttribute("aria-pressed") !== "true"
    shuffle.setAttribute("aria-pressed", String(on))
    rebuild()
  }
  const setWriteAll = (on: boolean) => {
    writeAll.setAttribute("aria-pressed", String(on))
    deck.classList.toggle("qard-writing", on)
  }
  const onWriteAll = () => {
    const on = writeAll.getAttribute("aria-pressed") !== "true"
    setWriteAll(on)
    try {
      localStorage.setItem(WRITE_KEY, on ? "1" : "")
    } catch {
      // not remembered, still works
    }
    if (!done) show(index)
  }
  const onTopic = () => {
    // keep the URL in step so the current topic can be linked or reloaded
    const url = new URL(window.location.href)
    if (select.value) url.searchParams.set("topic", select.value)
    else url.searchParams.delete("topic")
    history.replaceState(history.state, "", url)
    rebuild()
  }
  const onCardClick = (e: MouseEvent) => {
    // links work as links, a diagram opens full screen, a worked solution unfolds,
    // and selecting text on a card does not flip it
    if ((e.target as HTMLElement).closest("a, button, details, img, .qard-written")) return
    if (window.getSelection()?.toString()) return
    toggle()
  }
  const onKey = (e: KeyboardEvent) => {
    const target = e.target
    // in the answer field every key types, except Ctrl/⌘ + Enter, which turns the card
    if (target instanceof HTMLTextAreaElement && target.closest(".qard-written")) {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !target.readOnly) {
        e.preventDefault()
        toggle()
      }
      return
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (
      target instanceof Element &&
      target.closest("input, textarea, select, button, a, summary, [contenteditable]")
    )
      return
    if (document.querySelector(".search-container.active, .image-zoom")) return
    const revealed = deck.classList.contains("qard-revealed")
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      toggle()
    } else if (e.key === "ArrowRight") {
      onNext()
    } else if (e.key === "ArrowLeft") {
      onPrev()
    } else if (e.key === "1" && revealed) {
      onMissed()
    } else if (e.key === "2" && revealed) {
      onKnown()
    }
  }

  const stage = deck.querySelector<HTMLElement>(".qard-stage")!
  const listeners: [Element | Document, string, EventListener][] = [
    [mode, "change", rebuild],
    [select, "change", onTopic],
    [shuffle, "click", onShuffle],
    [writeAll, "click", onWriteAll],
    [prev, "click", onPrev],
    [flip, "click", toggle],
    [next, "click", onNext],
    [missed, "click", onMissed],
    [known, "click", onKnown],
    [repeat, "click", onRepeat],
    [studyAll, "click", onStudyAll],
    [restart, "click", onRestart],
    [stage, "click", onCardClick as EventListener],
    [document, "keydown", onKey as EventListener],
  ]
  for (const [target, type, fn] of listeners) target.addEventListener(type, fn)
  window.addCleanup(() => {
    for (const [target, type, fn] of listeners) target.removeEventListener(type, fn)
  })

  const topic = new URLSearchParams(window.location.search).get("topic")
  if (topic && [...select.options].some((option) => option.value === topic)) select.value = topic

  try {
    setWriteAll(localStorage.getItem(WRITE_KEY) === "1")
  } catch {
    // no storage: the button still works for this visit
  }

  deck.classList.add("qard-ready")
  rebuild()
})
