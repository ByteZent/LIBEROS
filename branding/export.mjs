// Rasterise the brand SVGs into the PNGs Quartz and GitHub use.  Run via `make logo`.
// Text in the lockups/og image is rendered with locally installed fonts (JetBrains Mono, IBM Plex Sans).
import sharp from "sharp"
import { copyFile } from "fs/promises"

const exports = [
  // [source svg, output png, width]
  ["branding/icon.svg", "quartz/static/icon.png", 512], // favicon + per-page OG icon
  ["branding/icon.svg", "quartz/static/icon-192.png", 192], // PWA
  ["branding/icon.svg", "quartz/static/icon-512.png", 512], // PWA
  ["branding/icon-maskable.svg", "quartz/static/icon-maskable-512.png", 512], // PWA (Android adaptive)
  ["branding/icon-maskable.svg", "quartz/static/apple-touch-icon.png", 180], // iOS / Safari "Add to Dock"
  ["branding/og-image.svg", "quartz/static/og-image.png", 1200], // default social preview
  ["branding/logo-lockup-dark.svg", "branding/logo-lockup-dark.png", 990],
  ["branding/logo-lockup-light.svg", "branding/logo-lockup-light.png", 990],
  ["branding/logo-mark-dark.svg", "branding/logo-mark-dark.png", 512],
  ["branding/logo-mark-light.svg", "branding/logo-mark-light.png", 512],
]

await copyFile("branding/icon.svg", "quartz/static/icon.svg") // crisp vector favicon
console.log("branding/icon.svg → quartz/static/icon.svg")

for (const [src, out, width] of exports) {
  await sharp(src, { density: 600 }).resize({ width }).png().toFile(out)
  console.log(`${src} → ${out} (${width}px)`)
}
