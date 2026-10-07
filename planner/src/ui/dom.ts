// Small DOM helpers: the board is plain DOM so that the same code runs in Obsidian and on the site.
type Child = Node | string | false | null | undefined

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, unknown> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue
    if (key === "class") el.className = String(value)
    else if (key === "style") el.style.cssText = String(value)
    else if (key.startsWith("on")) el.addEventListener(key.slice(2), value as EventListener)
    else if (key === "dataset") Object.assign(el.dataset, value)
    else if (key in el && key !== "list") (el as any)[key] = value
    else el.setAttribute(key, String(value))
  }
  for (const child of children) if (child) el.append(child)
  return el
}

// black or white, whichever reads better on the colour
export function contrast(color: string): string {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color)
  if (!m) return "#fff"
  const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16))
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#16191c" : "#fff"
}

// A modal on the native <dialog>, which works the same in Obsidian's window and in a browser.
// Resolves with what `close` was called with, or undefined when dismissed.
export function dialog<T>(
  parent: HTMLElement,
  build: (close: (result?: T) => void) => HTMLElement,
): Promise<T | undefined> {
  return new Promise((resolve) => {
    let result: T | undefined
    let finished = false
    const el = h("dialog", { class: "lp-dialog" })
    // The browser reports a closed dialog with an event that comes later, and not at all while
    // the page is in the background: a choice made in the dialog must not wait for it.
    const finish = () => {
      if (finished) return
      finished = true
      el.remove()
      resolve(result)
    }
    const close = (value?: T) => {
      result = value
      el.close()
      finish()
    }
    el.append(build(close))
    el.addEventListener("close", finish) // Escape
    // a click on the backdrop lands on the dialog element itself
    el.addEventListener("mousedown", (e) => {
      if (e.target === el) close()
    })
    parent.append(el)
    el.showModal()
  })
}
