// Click an image in a note to view it full screen. Click the image again to zoom to 2x
// (pan by scrolling or dragging on touch), click the backdrop or press Esc to close.

let overlay: HTMLDivElement | null = null
let lastFocus: HTMLElement | null = null

function closeZoom() {
  if (!overlay) return
  overlay.remove()
  overlay = null
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

  const close = document.createElement("button")
  close.type = "button"
  close.className = "image-zoom-close"
  close.ariaLabel = "Close"
  close.textContent = "×"

  el.append(img, close)
  if (source.alt) {
    const caption = document.createElement("div")
    caption.className = "image-zoom-caption"
    caption.textContent = source.alt
    el.append(caption)
  }

  img.addEventListener("click", (e) => {
    e.stopPropagation()
    if (el.classList.contains("zoomed")) {
      el.classList.remove("zoomed")
      img.style.width = ""
      img.title = "Click to zoom"
    } else {
      // object-fit letterboxes the picture inside the <img> box: measure the visible picture,
      // double it, then scroll so the clicked point stays under the cursor
      const rect = img.getBoundingClientRect()
      const aspect = img.naturalWidth / img.naturalHeight || rect.width / rect.height
      const w = Math.min(rect.width, rect.height * aspect)
      const h = w / aspect
      const fx = Math.min(Math.max((e.clientX - rect.left - (rect.width - w) / 2) / w, 0), 1)
      const fy = Math.min(Math.max((e.clientY - rect.top - (rect.height - h) / 2) / h, 0), 1)
      el.classList.add("zoomed")
      img.style.width = `${w * 2}px`
      img.title = "Click to fit"
      el.scrollLeft = fx * img.offsetWidth - e.clientX
      el.scrollTop = fy * img.offsetHeight - e.clientY
    }
  })
  close.addEventListener("click", closeZoom)
  el.addEventListener("click", (e) => {
    if (e.target === el) closeZoom()
  })

  document.body.append(el)
  document.documentElement.classList.add("image-zoom-open")
  document.addEventListener("keydown", onKey)
  overlay = el
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
