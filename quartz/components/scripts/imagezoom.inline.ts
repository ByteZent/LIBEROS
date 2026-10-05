// Click an image in a note to view it full screen. Click the image again to zoom to 2x
// (pan by scrolling or dragging on touch), click the backdrop or press Esc to close.
// On a phone held upright a wide diagram would come out as small as it is in the note, so it is
// turned by a quarter and fills the screen: turn the phone to read it.

let overlay: HTMLDivElement | null = null
let lastFocus: HTMLElement | null = null
let stopResize: (() => void) | null = null

function closeZoom() {
  if (!overlay) return
  overlay.remove()
  overlay = null
  stopResize?.()
  stopResize = null
  document.documentElement.classList.remove("image-zoom-open")
  document.removeEventListener("keydown", onKey)
  lastFocus?.focus()
  lastFocus = null
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") closeZoom()
}

function openZoom(source: HTMLImageElement) {
  closeZoom()
  lastFocus = source

  const el = document.createElement("div")
  el.className = "image-zoom"
  el.setAttribute("role", "dialog")
  el.setAttribute("aria-modal", "true")
  el.setAttribute("aria-label", source.alt || "Image")

  const img = document.createElement("img")
  img.src = source.currentSrc || source.src
  img.alt = source.alt
  img.title = "Click to zoom"
  // the stage has the size of the picture as it is seen, so the overlay can scroll over it;
  // the picture lies inside it, turned or not
  const stage = document.createElement("div")
  stage.className = "image-zoom-stage"
  stage.append(img)

  const close = document.createElement("button")
  close.type = "button"
  close.className = "image-zoom-close"
  close.ariaLabel = "Close"
  close.textContent = "×"

  el.append(stage, close)
  if (source.alt) {
    const caption = document.createElement("div")
    caption.className = "image-zoom-caption"
    caption.textContent = source.alt
    el.append(caption)
  }

  let zoom = 1
  const box = source.getBoundingClientRect()
  const aspect = () => img.naturalWidth / img.naturalHeight || box.width / box.height || 1
  const size = () => {
    const style = getComputedStyle(el)
    const vw = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
    const vh = el.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
    const a = aspect()
    // upright: w × h. Turned: the picture's width runs down the screen.
    const w = Math.min(vw, vh * a)
    const long = Math.min(vh, vw * a)
    const turned = window.innerWidth <= 600 && vh > vw && long > w * 1.3
    const [sw, sh] = turned ? [long / a, long] : [w, w / a]
    el.classList.toggle("turned", turned)
    stage.style.width = `${sw * zoom}px`
    stage.style.height = `${sh * zoom}px`
    img.style.width = `${(turned ? sh : sw) * zoom}px`
    img.style.height = `${(turned ? sw : sh) * zoom}px`
    img.style.transform = turned ? `translateX(${sw * zoom}px) rotate(90deg)` : ""
  }
  const onResize = () => size()

  stage.addEventListener("click", (e) => {
    e.stopPropagation()
    // the clicked point stays under the cursor
    const rect = stage.getBoundingClientRect()
    const fx = (e.clientX - rect.left) / rect.width
    const fy = (e.clientY - rect.top) / rect.height
    zoom = zoom === 1 ? 2 : 1
    el.classList.toggle("zoomed", zoom > 1)
    img.title = zoom > 1 ? "Click to fit" : "Click to zoom"
    size()
    el.scrollLeft = stage.offsetLeft + fx * stage.offsetWidth - e.clientX
    el.scrollTop = stage.offsetTop + fy * stage.offsetHeight - e.clientY
  })
  close.addEventListener("click", closeZoom)
  el.addEventListener("click", (e) => {
    if (e.target === el) closeZoom()
  })
  window.addEventListener("resize", onResize)
  stopResize = () => window.removeEventListener("resize", onResize)

  document.body.append(el)
  document.documentElement.classList.add("image-zoom-open")
  document.addEventListener("keydown", onKey)
  overlay = el
  size()
  // an SVG only knows its proportions once it is loaded
  if (!img.complete) img.addEventListener("load", size, { once: true })
  close.focus()
}

document.addEventListener("nav", () => {
  closeZoom()
  // images inside links keep their link behaviour
  const imgs = document.querySelectorAll<HTMLImageElement>("article img:not(a img)")
  for (const img of imgs) {
    img.classList.add("zoomable")
    img.tabIndex = 0
    img.setAttribute("role", "button")
    img.setAttribute("aria-label", `Enlarge image${img.alt ? `: ${img.alt}` : ""}`)
    const onClick = () => openZoom(img)
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        openZoom(img)
      }
    }
    img.addEventListener("click", onClick)
    img.addEventListener("keydown", onKeydown)
    window.addCleanup(() => {
      img.removeEventListener("click", onClick)
      img.removeEventListener("keydown", onKeydown)
    })
  }
})
