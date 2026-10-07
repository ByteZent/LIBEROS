// The site's side: the board in a page of the private preview, talking to the local server
// (src/server) that reads and writes the vault. Loaded by quartz/components/scripts/planner.inline.ts.
import { mountBoard } from "../ui/board"
import { Host } from "../ui/host"
import { Item } from "../core"
import css from "../ui/styles.css"

interface Options {
  api: string // the local server, e.g. http://127.0.0.1:8081
  base: string // path from the page to the site root
}

// the note's page, named as Quartz names it (quartz/util/path.ts, sluggify)
const slug = (path: string) =>
  path
    .replace(/\.md$/, "")
    .split("/")
    .map((segment) =>
      segment
        .replace(/\s/g, "-")
        .replace(/&/g, "-and-")
        .replace(/%/g, "-percent")
        .replace(/\?/g, "")
        .replace(/#/g, ""),
    )
    .join("/")

function mount(el: HTMLElement, options: Options) {
  if (!document.getElementById("liberos-planner-style")) {
    const style = document.createElement("style")
    style.id = "liberos-planner-style"
    style.textContent = css
    document.head.append(style)
  }

  const toast = document.createElement("div")
  toast.className = "lp-toast"
  let hide: ReturnType<typeof setTimeout> | undefined
  const notify = (message: string) => {
    toast.textContent = message
    document.body.append(toast)
    clearTimeout(hide)
    hide = setTimeout(() => toast.remove(), 5000)
  }

  async function call<T>(path: string, body?: unknown): Promise<T> {
    let response: Response
    try {
      response = await fetch(options.api + path, {
        method: body === undefined ? "GET" : "POST",
        headers: body === undefined ? {} : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    } catch {
      throw new Error(
        `The planner server at ${options.api} does not answer. Start it with “make serve-private”.`,
      )
    }
    const answer = await response.json()
    if (!response.ok) throw new Error(answer.error ?? response.statusText)
    return answer as T
  }

  let source: EventSource | undefined
  const host: Host = {
    load: () => call("/api/snapshot"),
    apply: async (mutation) => void (await call("/api/mutate", mutation)),
    sync: async () => (await call<{ report: string }>("/api/sync", {})).report,
    open: (item: Item) => {
      if (item.path)
        window.location.assign(new URL(`${options.base}/${slug(item.path)}`, window.location.href))
    },
    onChange: (listener) => {
      source = new EventSource(`${options.api}/api/events`)
      source.addEventListener("change", listener)
      return () => source?.close()
    },
    notify,
    storage: {
      get: (key) => {
        try {
          return window.localStorage.getItem(key)
        } catch {
          return null
        }
      },
      set: (key, value) => {
        try {
          window.localStorage.setItem(key, value)
        } catch {
          // private mode: the view is simply not remembered
        }
      },
    },
  }

  const board = mountBoard(el, host)
  return {
    destroy() {
      board.destroy()
      toast.remove()
    },
  }
}

;(window as any).LiberosPlanner = { mount }
