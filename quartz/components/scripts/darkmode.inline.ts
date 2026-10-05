type Theme = "light" | "sepia" | "dark"
const THEMES: Theme[] = ["light", "sepia", "dark"]

const userPref: Theme = window.matchMedia("(prefers-color-scheme: light)").matches
  ? "light"
  : "dark"
const saved = localStorage.getItem("theme") as Theme | null
const currentTheme: Theme = saved && THEMES.includes(saved) ? saved : userPref
document.documentElement.setAttribute("saved-theme", currentTheme)

const emitThemeChangeEvent = (theme: Theme) => {
  const event: CustomEventMap["themechange"] = new CustomEvent("themechange", {
    detail: { theme },
  })
  document.dispatchEvent(event)
}

document.addEventListener("nav", () => {
  const selectors = [...document.querySelectorAll<HTMLElement>(".darkmode")]

  // the menus show which theme is on
  const mark = () => {
    const theme = document.documentElement.getAttribute("saved-theme")
    for (const item of document.querySelectorAll<HTMLElement>(".theme-menu [data-theme]"))
      item.setAttribute("aria-checked", String(item.dataset.theme === theme))
  }
  const setTheme = (theme: Theme) => {
    document.documentElement.setAttribute("saved-theme", theme)
    localStorage.setItem("theme", theme)
    mark()
    emitThemeChangeEvent(theme)
  }

  const close = () => {
    for (const selector of selectors) {
      selector.querySelector<HTMLElement>(".theme-menu")!.hidden = true
      selector.querySelector(".theme-button")!.setAttribute("aria-expanded", "false")
    }
  }
  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const selector = target.closest<HTMLElement>(".darkmode")
    if (!selector) return close()
    const menu = selector.querySelector<HTMLElement>(".theme-menu")!
    const button = selector.querySelector<HTMLElement>(".theme-button")!
    const item = target.closest<HTMLElement>(".theme-menu [data-theme]")
    if (item) {
      setTheme(item.dataset.theme as Theme)
      close()
      button.focus()
    } else if (target.closest(".theme-button")) {
      const open = menu.hidden
      close()
      menu.hidden = !open
      button.setAttribute("aria-expanded", String(open))
    }
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") close()
  }

  // the system switches between light and dark: follow it
  const themeChange = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light")

  mark()
  document.addEventListener("click", onClick)
  document.addEventListener("keydown", onKey)
  const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  colorSchemeMediaQuery.addEventListener("change", themeChange)
  window.addCleanup(() => {
    document.removeEventListener("click", onClick)
    document.removeEventListener("keydown", onKey)
    colorSchemeMediaQuery.removeEventListener("change", themeChange)
  })
})
