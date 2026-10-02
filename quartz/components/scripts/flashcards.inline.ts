// Study view for a flashcard deck (see pages/FlashcardsContent.tsx): shows one card at a time,
// question first. After the answer you can rate yourself; at the end of the deck the missed cards
// can be repeated until none are left. Nothing is stored: reloading the page starts again.
// `?topic=<name>` in the URL preselects a topic, so notes and course maps can link to their cards.

type Rating = "known" | "missed"

function shuffled<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

document.addEventListener("nav", () => {
  const deck = document.querySelector<HTMLElement>(".qard-deck")
  if (!deck) return

  const all = [...deck.querySelectorAll<HTMLElement>(".qard-card")]
  const select = deck.querySelector<HTMLSelectElement>(".qard-topic-select")!
  const shuffle = deck.querySelector<HTMLButtonElement>(".qard-shuffle")!
  const progress = deck.querySelector<HTMLElement>(".qard-progress")!
  const prev = deck.querySelector<HTMLButtonElement>(".qard-prev")!
  const flip = deck.querySelector<HTMLButtonElement>(".qard-flip")!
  const next = deck.querySelector<HTMLButtonElement>(".qard-next")!
  const missed = deck.querySelector<HTMLButtonElement>(".qard-missed")!
  const known = deck.querySelector<HTMLButtonElement>(".qard-known")!
  const score = deck.querySelector<HTMLElement>(".qard-score")!
  const repeat = deck.querySelector<HTMLButtonElement>(".qard-repeat")!
  const restart = deck.querySelector<HTMLButtonElement>(".qard-restart")!

  let cards = all
  let index = 0
  let done = false
  const ratings = new Map<HTMLElement, Rating>()
  const rated = (rating: Rating) => cards.filter((card) => ratings.get(card) === rating)

  const show = (i: number, revealed = false) => {
    done = false
    index = Math.min(Math.max(i, 0), cards.length - 1)
    for (const card of all) card.classList.remove("current", "revealed")
    const card = cards[index]
    card?.classList.add("current")
    card?.classList.toggle("revealed", revealed)
    deck.classList.toggle("qard-revealed", revealed)
    deck.classList.remove("qard-finished")
    progress.textContent = cards.length > 0 ? `${index + 1} / ${cards.length}` : "0 / 0"
    prev.disabled = index === 0
    next.disabled = cards.length === 0
    next.textContent = index >= cards.length - 1 ? "Finish →" : "Next →"
  }

  const finish = () => {
    done = true
    for (const card of all) card.classList.remove("current", "revealed")
    deck.classList.remove("qard-revealed")
    deck.classList.add("qard-finished")
    const nMissed = rated("missed").length
    const nKnown = rated("known").length
    const nSkipped = cards.length - nMissed - nKnown
    score.textContent =
      `Knew ${nKnown} · Missed ${nMissed}` + (nSkipped > 0 ? ` · Not rated ${nSkipped}` : "")
    repeat.textContent = `Repeat missed (${nMissed})`
    repeat.hidden = nMissed === 0
    progress.textContent = `${cards.length} / ${cards.length}`
    prev.disabled = cards.length === 0
    next.disabled = true
  }

  const start = (pool: HTMLElement[]) => {
    cards = shuffle.getAttribute("aria-pressed") === "true" ? shuffled(pool) : pool
    ratings.clear()
    show(0)
  }
  const rebuild = () => {
    const topic = select.value
    start(all.filter((card) => topic === "" || card.dataset.topic === topic))
  }

  const toggle = () => {
    if (!done) show(index, !cards[index]?.classList.contains("revealed"))
  }
  const onPrev = () => show(done ? cards.length - 1 : index - 1)
  const onNext = () => {
    if (done) return
    if (index >= cards.length - 1) finish()
    else show(index + 1)
  }
  const rate = (rating: Rating) => {
    if (done || !cards[index]) return
    ratings.set(cards[index], rating)
    onNext()
  }
  const onMissed = () => rate("missed")
  const onKnown = () => rate("known")
  const onRepeat = () => start(rated("missed"))
  const onShuffle = () => {
    const on = shuffle.getAttribute("aria-pressed") !== "true"
    shuffle.setAttribute("aria-pressed", String(on))
    rebuild()
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
    // links work as links, and selecting text on a card does not flip it
    if ((e.target as HTMLElement).closest("a, button, summary")) return
    if (window.getSelection()?.toString()) return
    toggle()
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    const target = e.target
    if (
      target instanceof Element &&
      target.closest("input, textarea, select, button, a, [contenteditable]")
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
    [select, "change", onTopic],
    [shuffle, "click", onShuffle],
    [prev, "click", onPrev],
    [flip, "click", toggle],
    [next, "click", onNext],
    [missed, "click", onMissed],
    [known, "click", onKnown],
    [repeat, "click", onRepeat],
    [restart, "click", rebuild],
    [stage, "click", onCardClick as EventListener],
    [document, "keydown", onKey as EventListener],
  ]
  for (const [target, type, fn] of listeners) target.addEventListener(type, fn)
  window.addCleanup(() => {
    for (const [target, type, fn] of listeners) target.removeEventListener(type, fn)
  })

  const topic = new URLSearchParams(window.location.search).get("topic")
  if (topic && [...select.options].some((option) => option.value === topic)) select.value = topic

  deck.classList.add("qard-ready")
  rebuild()
})
