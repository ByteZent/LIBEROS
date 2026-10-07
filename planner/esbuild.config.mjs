// Builds the three things that share the planner's core:
//   dist/obsidian/      the Obsidian plugin (main.js, manifest.json, styles.css)
//   dist/web/planner.js the board for the private preview site (Plugin.Planner() emits it)
//   dist/server.cjs     the local server the site's board reads and writes through
// `--watch` rebuilds on change; `--install <dir>` copies the plugin into <dir>/liberos-planner
// (an .obsidian/plugins folder) after each build and may be given several times.
import esbuild from "esbuild"
import fs from "node:fs"
import path from "node:path"

const here = path.dirname(new URL(import.meta.url).pathname)
const args = process.argv.slice(2)
const watch = args.includes("--watch")
const installs = args.flatMap((a, i) => (a === "--install" && args[i + 1] ? [args[i + 1]] : []))
const out = (...p) => path.join(here, "dist", ...p)

const copyPlugin = {
  name: "copy-plugin",
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length > 0) return
      fs.copyFileSync(path.join(here, "manifest.json"), out("obsidian", "manifest.json"))
      fs.copyFileSync(path.join(here, "src/ui/styles.css"), out("obsidian", "styles.css"))
      for (const dir of installs) {
        const target = path.join(dir, "liberos-planner")
        fs.mkdirSync(target, { recursive: true })
        for (const file of ["main.js", "manifest.json", "styles.css"]) {
          fs.copyFileSync(out("obsidian", file), path.join(target, file))
        }
        console.log(`planner: plugin installed in ${target}`)
      }
    })
  },
}

const common = { bundle: true, logLevel: "info", absWorkingDir: here, minify: !watch }
const builds = [
  {
    ...common,
    entryPoints: ["src/obsidian/main.ts"],
    outfile: out("obsidian", "main.js"),
    format: "cjs",
    platform: "browser",
    target: "es2020",
    external: ["obsidian", "electron", "@codemirror/*", "@lezer/*"],
    plugins: [copyPlugin],
  },
  {
    ...common,
    entryPoints: ["src/web/main.ts"],
    outfile: out("web", "planner.js"),
    format: "iife",
    platform: "browser",
    target: "es2020",
    loader: { ".css": "text" },
  },
  {
    ...common,
    entryPoints: ["src/server/main.ts"],
    outfile: out("server.cjs"),
    format: "cjs",
    platform: "node",
    target: "node22",
    minify: false,
  },
]

if (watch) {
  for (const options of builds) await (await esbuild.context(options)).watch()
} else {
  await Promise.all(builds.map((options) => esbuild.build(options)))
}
