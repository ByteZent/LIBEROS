// /planner (private preview only): loads the board built from planner/ and mounts it into the
// frame PlannerContent rendered. The script is fetched once and survives SPA navigation.

interface Board {
  mount(el: HTMLElement, options: { api: string; base: string }): { destroy(): void }
}

function board(src: string): Promise<Board> {
  const loaded = (window as any).LiberosPlanner as Board | undefined
  if (loaded) return Promise.resolve(loaded)
  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = src
    script.onload = () => resolve((window as any).LiberosPlanner)
    script.onerror = () => reject(new Error(`could not load ${src}`))
    document.head.append(script)
  })
}

document.addEventListener("nav", async () => {
  const el = document.getElementById("liberos-planner")
  if (!el) return
  const base = el.dataset.base!
  try {
    const { mount } = await board(new URL(`${base}/static/planner.js`, window.location.href).href)
    const mounted = mount(el, { api: el.dataset.api!, base })
    window.addCleanup(() => mounted.destroy())
  } catch (error) {
    el.textContent = `The planner could not start: ${error instanceof Error ? error.message : error}`
  }
})
