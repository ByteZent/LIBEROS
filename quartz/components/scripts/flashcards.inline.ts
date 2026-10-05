// Study view for a flashcard deck (see pages/FlashcardsContent.tsx): shows one card at a time,
// question first. After the answer you rate yourself; the rating schedules the card's next review
// (qardStore.ts: spaced repetition, stored in this browser). A deck opens on the cards that are
// due today; "All cards" goes through everything. At the end of the deck the missed cards can be
// repeated until none are left.
// A written card (`<!-- qard-write -->` in the note), or every card while "Write answers" is on,
// asks for the answer in a text field first and shows it above the card's answer for comparison.
// `?topic=<name>` in the URL preselects a topic, so notes and course maps can link to their cards.
// On every page, links that carry `data-qard-ids` (deck overview, FLASHCARDS badges) get the
// number of due cards and leeches; the overview can also export and import the history as a file.
//
// Three ratings: missed, hard, knew it. "Leeches" in the card selection lists the cards missed
// on three or more days. After the answer of a course card a follow-up question asks for more
// than recall. "Progress by topic" counts new, shaky and solid cards.
// Exam: ten cards of the chosen topic against the clock. Every answer is written, nothing is
// shown until the exam is handed in or the time is up; then each answer is rated next to the
// card's own.
import {
  INTERVALS,
  LEECH,
  Progress,
  Rating,
  day,
  isDue,
  isLeech,
  isNew,
  loadProgress,
  mergeProgress,
  rateCard,
  saveProgress,
} from "./qardStore"

const EXAM_CARDS = 10
const EXAM_SECONDS_PER_CARD = 120
// asked after the answer of a course card: recall is not understanding
const FOLLOW_UPS = [
  "Why is that so?",
  "Give an example of your own.",
  "What would be a counter-example?",
  "Where does this stop being true?",
  "How would you explain it to someone outside the field?",
  "What follows from it for security or defence?",
]
const RATING_LABELS: [Rating, string][] = [
  ["missed", "Missed"],
  ["hard", "Hard"],
  ["known", "Knew it"],
]
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
    const leeches = ids.filter((id) => isLeech(progress, id)).length
    const label = link.querySelector<HTMLElement>(".qard-due")
    if (!label) continue
    label.textContent =
      (due === 0 ? " · none due" : fresh === due ? ` · ${due} new` : ` · ${due} due`) +
      (leeches > 0 ? ` · ${leeches} ${leeches === 1 ? "leech" : "leeches"}` : "")
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
  const hard = deck.querySelector<HTMLButtonElement>(".qard-hard")!
  const known = deck.querySelector<HTMLButtonElement>(".qard-known")!
  const examStart = deck.querySelector<HTMLButtonElement>(".qard-exam-start")!
  const review = deck.querySelector<HTMLElement>(".qard-exam-review")!
  const statsBody = deck.querySelector<HTMLElement>(".qard-stats tbody")!
  const asksFollowUp = ["course", "connections"].includes(deck.dataset.kind ?? "course")
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
  // a running exam, or one that is handed in and being rated
  let exam: { deadline: number; timer: number; reviewing: boolean; wroteBefore: boolean } | null =
    null
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
      : ` · box ${state.box}/${INTERVALS.length} · ${state.due <= day() ? "due" : `back ${state.due}`}` +
        (state.missed >= LEECH
          ? ` · leech, missed ${state.missed}×`
          : state.missed > 0
            ? ` · missed ${state.missed}×`
            : "")
  }

  // the same card asks the same follow-up all day, another one tomorrow
  const followUp = (card: HTMLElement) => {
    const seed = [...idOf(card)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
    return FOLLOW_UPS[(seed + new Date().getDate()) % FOLLOW_UPS.length]
  }

  const clock = () => {
    if (!exam) return ""
    const left = Math.max(0, Math.ceil((exam.deadline - Date.now()) / 1000))
    return ` · ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`
  }
  const position = () => (cards.length > 0 ? `${index + 1} / ${cards.length}` : "0 / 0") + clock()

  const show = (i: number, revealed = false) => {
    done = false
    index = Math.min(Math.max(i, 0), cards.length - 1)
    for (const card of all) card.classList.remove("current", "revealed")
    const card = cards[index]
    card?.classList.add("current")
    card?.classList.toggle("revealed", revealed)
    if (card) describe(card)
    const ask = card?.querySelector<HTMLElement>(".qard-followup")
    if (ask && card) ask.textContent = revealed && asksFollowUp && !exam ? followUp(card) : ""
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
    progressLabel.textContent = position()
    prev.disabled = index === 0
    next.disabled = cards.length === 0
    next.textContent = index < cards.length - 1 ? "Next →" : exam ? "Hand in →" : "Finish →"
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
    const nHard = rated("hard").length
    const nKnown = rated("known").length
    const nSkipped = cards.length - nMissed - nHard - nKnown
    const empty = cards.length === 0
    doneTitle.textContent = !empty
      ? "Deck finished"
      : mode.value === "leeches"
        ? "No leeches"
        : mode.value === "due"
          ? "Nothing due"
          : "No cards"
    score.textContent = [
      empty
        ? ""
        : `Knew ${nKnown} · Hard ${nHard} · Missed ${nMissed}` +
          (nSkipped > 0 ? ` · Not rated ${nSkipped}` : ""),
      nextReview(),
    ]
      .filter(Boolean)
      .join(" · ")
    repeat.textContent = `Repeat missed (${nMissed})`
    repeat.hidden = nMissed === 0
    studyAll.hidden = mode.value !== "due"
    restart.hidden = empty
    progressLabel.textContent = `${cards.length} / ${cards.length}`
    prev.disabled = cards.length === 0
    next.disabled = true
    updateCounts()
    showDueCounts(progress)
  }

  // one row per topic: how many cards are new, shaky (box 1–2), solid (box 3+), due, leeches
  const renderStats = () => {
    const topics = [...new Set(all.map((card) => card.dataset.topic ?? ""))]
    const row = (name: string, pool: HTMLElement[], total = false) => {
      const states = pool.map((card) => progress[idOf(card)])
      const counts = [
        states.filter((st) => !st).length,
        states.filter((st) => st && st.box <= 2).length,
        states.filter((st) => st && st.box >= 3).length,
        pool.filter((card) => isDue(progress, idOf(card))).length,
        pool.filter((card) => isLeech(progress, idOf(card))).length,
      ]
      const tr = document.createElement("tr")
      if (total) tr.className = "qard-stats-total"
      const th = document.createElement("th")
      th.scope = "row"
      th.textContent = `${name} (${pool.length})`
      tr.appendChild(th)
      for (const n of counts) {
        const td = document.createElement("td")
        td.textContent = n === 0 ? "–" : String(n)
        tr.appendChild(td)
      }
      return tr
    }
    statsBody.replaceChildren(
      ...topics.map((topic) =>
        row(
          topic,
          all.filter((card) => card.dataset.topic === topic),
        ),
      ),
      ...(topics.length > 1 ? [row("All topics", all, true)] : []),
    )
  }

  const updateCounts = () => {
    const pool = inTopic()
    const due = pool.filter((card) => isDue(progress, idOf(card))).length
    const leeches = pool.filter((card) => isLeech(progress, idOf(card))).length
    mode.options[0].textContent = `Due today (${due})`
    mode.options[1].textContent = `All cards (${pool.length})`
    mode.options[2].textContent = `Leeches (${leeches})`
    renderStats()
  }

  const start = (pool: HTMLElement[]) => {
    cards = shuffle.getAttribute("aria-pressed") === "true" ? shuffled(pool) : pool
    ratings.clear()
    for (const input of deck.querySelectorAll<HTMLTextAreaElement>(".qard-written textarea"))
      input.value = ""
    if (cards.length === 0) finish()
    else show(0)
  }
  const endExam = () => {
    if (!exam) return
    window.clearInterval(exam.timer)
    deck.classList.remove("qard-exam", "qard-exam-reviewing")
    deck.classList.toggle("qard-writing", exam.wroteBefore)
    review.replaceChildren()
    examStart.textContent = "Exam"
    examStart.setAttribute("aria-pressed", "false")
    exam = null
  }
  const rebuild = () => {
    endExam()
    updateCounts()
    const pool = inTopic()
    session =
      mode.value === "due"
        ? pool.filter((card) => isDue(progress, idOf(card)))
        : mode.value === "leeches"
          ? pool.filter((card) => isLeech(progress, idOf(card)))
          : pool
    start(session)
  }
  const onRestart = () => start(session)

  // the exam is over: every question with my answer and the card's answer, to be rated
  const handIn = () => {
    if (!exam || exam.reviewing) return
    window.clearInterval(exam.timer)
    exam.reviewing = true
    done = true
    for (const card of all) card.classList.remove("current", "revealed")
    deck.classList.remove("qard-exam", "qard-revealed")
    deck.classList.add("qard-exam-reviewing")
    const node = (tag: string, className: string, text?: string) => {
      const el = document.createElement(tag)
      el.className = className
      if (text !== undefined) el.textContent = text
      return el
    }
    const answered = cards.filter((card) => field(card)?.value.trim()).length
    const head = node("div", "qard-exam-head")
    head.append(
      node("p", "qard-done-title", "Exam handed in"),
      node(
        "p",
        "qard-score",
        `${answered} of ${cards.length} answered. Rate each answer against the card's own.`,
      ),
    )
    const items = cards.map((card, n) => {
      const item = node("section", "qard-exam-item")
      item.dataset.card = String(n)
      const question = node("div", "qard-front")
      question.innerHTML = card.querySelector(".qard-front")?.innerHTML ?? ""
      const mine = field(card)?.value.trim() ?? ""
      const yours = node("div", "qard-exam-yours")
      yours.append(
        node("span", "qard-key", "Your answer"),
        node("p", mine ? "" : "qard-exam-empty", mine || "No answer"),
      )
      const model = node("div", "qard-exam-model")
      const answer = node("div", "qard-back")
      answer.innerHTML = card.querySelector(".qard-back")?.innerHTML ?? ""
      model.append(node("span", "qard-key", "Card's answer"), answer)
      const buttons = node("div", "qard-exam-rate")
      for (const [rating, label] of RATING_LABELS) {
        const button = node("button", `qard-${rating}`, label) as HTMLButtonElement
        button.type = "button"
        button.dataset.rating = rating
        button.setAttribute("aria-pressed", "false")
        buttons.appendChild(button)
      }
      item.append(question, yours, model, buttons)
      return item
    })
    const close = node("button", "qard-exam-close", "Close exam") as HTMLButtonElement
    close.type = "button"
    review.replaceChildren(head, ...items, close)
    progressLabel.textContent = `${cards.length} / ${cards.length}`
    review.scrollIntoView({ block: "start", behavior: "smooth" })
  }
  const onReviewClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest(".qard-exam-close")) {
      rebuild()
      return
    }
    const button = target.closest<HTMLButtonElement>("button[data-rating]")
    const item = button?.closest<HTMLElement>(".qard-exam-item")
    const card = item ? cards[Number(item.dataset.card)] : undefined
    if (!button || !item || !card) return
    const rating = button.dataset.rating as Rating
    ratings.set(card, rating)
    rateCard(progress, idOf(card), rating)
    saveProgress(progress)
    for (const other of item.querySelectorAll("button[data-rating]"))
      other.setAttribute("aria-pressed", String(other === button))
    updateCounts()
    showDueCounts(progress)
  }
  const onExam = () => {
    if (exam) {
      rebuild()
      return
    }
    const pool = shuffled(inTopic()).slice(0, EXAM_CARDS)
    if (pool.length === 0) return
    exam = {
      deadline: Date.now() + pool.length * EXAM_SECONDS_PER_CARD * 1000,
      reviewing: false,
      wroteBefore: deck.classList.contains("qard-writing"),
      timer: window.setInterval(() => {
        if (!exam || exam.reviewing) return
        if (Date.now() >= exam.deadline) handIn()
        else progressLabel.textContent = position()
      }, 1000),
    }
    deck.classList.add("qard-exam", "qard-writing")
    examStart.textContent = "Cancel exam"
    examStart.setAttribute("aria-pressed", "true")
    cards = pool
    ratings.clear()
    for (const input of deck.querySelectorAll<HTMLTextAreaElement>(".qard-written textarea"))
      input.value = ""
    show(0)
  }

  const toggle = () => {
    if (!done && !exam) show(index, !cards[index]?.classList.contains("revealed"))
  }
  const onPrev = () => {
    if (exam?.reviewing) return
    if (cards.length > 0) show(done ? cards.length - 1 : index - 1)
  }
  const onNext = () => {
    if (done) return
    if (index < cards.length - 1) show(index + 1)
    else if (exam) handIn()
    else finish()
  }
  const rate = (rating: Rating) => {
    if (done || exam || !cards[index]) return
    ratings.set(cards[index], rating)
    rateCard(progress, idOf(cards[index]), rating)
    saveProgress(progress)
    updateCounts()
    onNext()
  }
  const onMissed = () => rate("missed")
  const onHard = () => rate("hard")
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
        if (exam) onNext()
        else toggle()
      } else if (!target.value && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        // an empty field has no text to move through: the arrows change the card.
        // The last card of an exam is handed in on purpose, not by an arrow.
        if (e.key === "ArrowLeft") onPrev()
        else if (e.key === "ArrowRight" && !(exam && index === cards.length - 1)) onNext()
      }
      return
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (target instanceof Element && target.closest("input, textarea, select, [contenteditable]"))
      return
    if (document.querySelector(".search-container.active, .image-zoom")) return
    const revealed = deck.classList.contains("qard-revealed")
    // a button or link that was clicked keeps the focus: Space and Enter are its own keys,
    // the arrows and the rating keys still work
    const onControl = target instanceof Element && !!target.closest("button, a, summary")
    if (e.key === " " || e.key === "Enter") {
      if (onControl) return
      e.preventDefault()
      toggle()
    } else if (e.key === "ArrowRight") {
      onNext()
    } else if (e.key === "ArrowLeft") {
      onPrev()
    } else if (e.key === "1" && revealed) {
      onMissed()
    } else if (e.key === "2" && revealed) {
      onHard()
    } else if (e.key === "3" && revealed) {
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
    [hard, "click", onHard],
    [known, "click", onKnown],
    [examStart, "click", onExam],
    [review, "click", onReviewClick as EventListener],
    [repeat, "click", onRepeat],
    [studyAll, "click", onStudyAll],
    [restart, "click", onRestart],
    [stage, "click", onCardClick as EventListener],
    [document, "keydown", onKey as EventListener],
  ]
  for (const [target, type, fn] of listeners) target.addEventListener(type, fn)
  window.addCleanup(() => {
    for (const [target, type, fn] of listeners) target.removeEventListener(type, fn)
    if (exam) window.clearInterval(exam.timer)
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
