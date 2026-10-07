// The local server behind the board on the private preview site (`make serve-private`): it reads
// the vault into planner items and writes the board's changes back into the Markdown files.
//
//   node planner/dist/server.cjs --root content --port 8081 --site-port 8080
//
// It listens on 127.0.0.1 only and answers only pages served from localhost on the site's port,
// so no other website open in the browser can read or change the vault through it.
import http from "node:http"
import fs from "node:fs"
import fsp from "node:fs/promises"
import path from "node:path"
import { FileSystem, Mutation, Store } from "../core"

const args = process.argv.slice(2)
const arg = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}
const ROOT = path.resolve(arg("root", "content"))
const PORT = Number(arg("port", "8081"))
const SITE_PORT = arg("site-port", "8080")
const FOLDER = arg("folder", "_private/Planner")
const HOSTS = [`127.0.0.1:${PORT}`, `localhost:${PORT}`]
const ORIGINS = [`http://localhost:${SITE_PORT}`, `http://127.0.0.1:${SITE_PORT}`]

// a path from the board, kept inside the vault
function inside(relative: string): string {
  const full = path.resolve(ROOT, relative)
  if (full !== ROOT && !full.startsWith(ROOT + path.sep))
    throw new Error(`outside the vault: ${relative}`)
  return full
}

const disk: FileSystem = {
  async list() {
    const out: { path: string; mtime: number }[] = []
    const walk = async (dir: string, prefix: string) => {
      for (const entry of await fsp.readdir(dir, { withFileTypes: true })) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue
        const relative = prefix + entry.name
        if (entry.isDirectory()) await walk(path.join(dir, entry.name), relative + "/")
        else if (entry.name.endsWith(".md")) {
          out.push({ path: relative, mtime: (await fsp.stat(path.join(dir, entry.name))).mtimeMs })
        }
      }
    }
    await walk(ROOT, "")
    return out
  },
  async read(file) {
    try {
      return await fsp.readFile(inside(file), "utf8")
    } catch (error: any) {
      if (error.code === "ENOENT") return null
      throw error
    }
  },
  async write(file, text) {
    const full = inside(file)
    await fsp.mkdir(path.dirname(full), { recursive: true })
    await fsp.writeFile(full, text, "utf8")
  },
  // into the vault's .trash, where Obsidian puts deleted notes too: nothing is lost
  async trash(file) {
    const bin = path.join(ROOT, ".trash")
    await fsp.mkdir(bin, { recursive: true })
    const { name, ext } = path.parse(file)
    let target = path.join(bin, name + ext)
    for (let n = 2; fs.existsSync(target); n++) target = path.join(bin, `${name} ${n}${ext}`)
    await fsp.rename(inside(file), target)
  },
}

const store = new Store(disk, FOLDER)

async function sync(): Promise<string> {
  return store.syncFeeds(async (url) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.text()
  })
}

// ── change notifications (server-sent events) ──────────────────────────────────
const clients = new Set<http.ServerResponse>()
let pending: ReturnType<typeof setTimeout> | undefined
fs.watch(ROOT, { recursive: true }, (_event, file) => {
  if (!file || /(^|[\\/])\.(obsidian|trash|git)([\\/]|$)/.test(file)) return
  clearTimeout(pending)
  pending = setTimeout(() => {
    for (const client of clients) client.write("event: change\ndata: {}\n\n")
  }, 150)
})

// ── HTTP ───────────────────────────────────────────────────────────────────────
async function body(req: http.IncomingMessage): Promise<any> {
  let text = ""
  for await (const chunk of req) {
    text += chunk
    if (text.length > 1_000_000) throw new Error("request too large")
  }
  return JSON.parse(text || "{}")
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin
  const send = (status: number, data: unknown) => {
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" })
    res.end(JSON.stringify(data))
  }
  // a foreign Host means the name was pointed here from outside (DNS rebinding);
  // a foreign Origin is another website calling
  if (
    !HOSTS.includes(req.headers.host ?? "") ||
    (origin !== undefined && !ORIGINS.includes(origin))
  ) {
    return send(403, { error: "forbidden" })
  }
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Vary", "Origin")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  }
  if (req.method === "OPTIONS") return void res.writeHead(204).end()
  // writes must come from the site's own page, as JSON (which a plain HTML form cannot send)
  const write = req.method === "POST"
  if (write && (!origin || !/^application\/json\b/.test(req.headers["content-type"] ?? ""))) {
    return send(403, { error: "forbidden" })
  }

  try {
    const route = `${req.method} ${new URL(req.url ?? "/", "http://localhost").pathname}`
    if (route === "GET /api/snapshot") return send(200, await store.snapshot())
    if (route === "POST /api/mutate") {
      const mutation = (await body(req)) as Mutation
      return send(200, { id: await store.apply(mutation) })
    }
    if (route === "POST /api/sync") return send(200, { report: await sync() })
    if (route === "GET /api/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      })
      res.write("retry: 3000\n\n")
      clients.add(res)
      req.on("close", () => clients.delete(res))
      return
    }
    send(404, { error: "not found" })
  } catch (error) {
    send(400, { error: error instanceof Error ? error.message : String(error) })
  }
})

server.on("error", (error: NodeJS.ErrnoException) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `planner: port ${PORT} is in use (set PLANNER_PORT to another one)`
      : `planner: ${error.message}`,
  )
  process.exit(1)
})

server.listen(PORT, "127.0.0.1", async () => {
  console.log(
    `planner: serving ${path.relative(process.cwd(), ROOT) || "."} on http://127.0.0.1:${PORT}`,
  )
  const refresh = async () => console.log(`planner: feeds: ${await sync()}`)
  await refresh()
  const { refreshMinutes } = await store.config()
  setInterval(refresh, Math.max(refreshMinutes, 5) * 60_000).unref()
})
