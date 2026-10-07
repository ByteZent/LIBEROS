// The Obsidian side: a "Planner" view with the board, working on the vault directly.
import {
  App,
  ItemView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  WorkspaceLeaf,
  normalizePath,
  requestUrl,
} from "obsidian"
import { Config, FileSystem, Store } from "../core"
import { mountBoard } from "../ui/board"
import { Host } from "../ui/host"

const VIEW = "liberos-planner"
const SYNCED_KEY = "liberos-planner-synced"

interface Settings {
  // Where the notes live inside the vault. Empty: the vault itself. "content": the repository
  // was opened as the vault, and the notes are in its content folder. "auto" finds out.
  root: string
  folder: string // the planner's own folder, inside the root
}

const DEFAULT_SETTINGS: Settings = { root: "auto", folder: "_private/Planner" }

class VaultFs implements FileSystem {
  constructor(
    private app: App,
    private root: () => string,
  ) {}

  private full = (path: string) => normalizePath(this.root() ? `${this.root()}/${path}` : path)

  async list() {
    const prefix = this.root() ? `${this.root()}/` : ""
    return this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(prefix))
      .map((file) => ({ path: file.path.slice(prefix.length), mtime: file.stat.mtime }))
  }

  async read(path: string) {
    const file = this.app.vault.getAbstractFileByPath(this.full(path))
    if (file instanceof TFile) return this.app.vault.read(file)
    const { adapter } = this.app.vault
    return (await adapter.exists(this.full(path))) ? adapter.read(this.full(path)) : null
  }

  async write(path: string, text: string) {
    const full = this.full(path)
    const file = this.app.vault.getAbstractFileByPath(full)
    if (file instanceof TFile) return this.app.vault.modify(file, text)
    const folders = full.split("/").slice(0, -1)
    for (let i = 1; i <= folders.length; i++) {
      const dir = folders.slice(0, i).join("/")
      if (!this.app.vault.getAbstractFileByPath(dir)) {
        await this.app.vault.createFolder(dir).catch(() => undefined) // made in the meantime
      }
    }
    await this.app.vault.create(full, text)
  }

  async trash(path: string) {
    const file = this.app.vault.getAbstractFileByPath(this.full(path))
    if (file) await this.app.fileManager.trashFile(file)
  }
}

class PlannerView extends ItemView {
  private board?: { destroy(): void }

  constructor(
    leaf: WorkspaceLeaf,
    private plugin: PlannerPlugin,
  ) {
    super(leaf)
  }

  getViewType = () => VIEW
  getDisplayText = () => "Planner"
  getIcon = () => "calendar-check"

  async onOpen() {
    this.contentEl.empty()
    this.board = mountBoard(this.contentEl.createDiv(), this.plugin.host())
  }

  async onClose() {
    this.board?.destroy()
  }
}

class TaskModal extends Modal {
  constructor(
    app: App,
    private submit: (title: string) => void,
  ) {
    super(app)
  }

  onOpen() {
    this.setTitle("New task")
    const input = this.contentEl.createEl("input", { type: "text", placeholder: "What is to do?" })
    input.style.width = "100%"
    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.isComposing) return
      const title = input.value.trim()
      if (title) this.submit(title)
      this.close()
    })
    input.focus()
  }
}

export default class PlannerPlugin extends Plugin {
  settings: Settings = DEFAULT_SETTINGS
  store!: Store
  private root = ""
  private listeners = new Set<() => void>()

  async onload() {
    this.settings = { ...DEFAULT_SETTINGS, ...(await this.loadData()) }
    await this.connect()

    this.registerView(VIEW, (leaf) => new PlannerView(leaf, this))
    this.addRibbonIcon("calendar-check", "Open planner", () => this.open())
    this.addCommand({ id: "open", name: "Open planner", callback: () => this.open() })
    this.addCommand({
      id: "new-task",
      name: "New task",
      callback: () =>
        new TaskModal(this.app, async (title) => {
          await this.store.apply({ op: "create", item: { kind: "task", title } })
          new Notice(`Task added: ${title}`)
        }).open(),
    })
    this.addCommand({
      id: "sync",
      name: "Sync calendar feeds",
      callback: async () => new Notice(await this.sync()),
    })
    this.addSettingTab(new PlannerSettings(this.app, this))

    const changed = () => this.listeners.forEach((listener) => listener())
    for (const event of ["modify", "create", "delete", "rename"] as const) {
      this.registerEvent(this.app.vault.on(event as "modify", changed))
    }
    // the feeds are fetched again when the last answer is older than the configured interval
    const refresh = async () => {
      const { feeds, refreshMinutes } = await this.store.config()
      const last = Number(this.app.loadLocalStorage(SYNCED_KEY) ?? 0)
      if (feeds.length > 0 && Date.now() - last > refreshMinutes * 60_000) await this.sync()
    }
    this.app.workspace.onLayoutReady(refresh)
    this.registerInterval(window.setInterval(refresh, 15 * 60_000))
  }

  // (re)builds the store after the root or the folder changed
  async connect() {
    this.root = this.settings.root.replace(/^\/+|\/+$/g, "")
    if (this.root === "auto") {
      const { adapter } = this.app.vault
      const repository =
        (await adapter.exists("quartz.config.ts")) && (await adapter.exists("content"))
      this.root = repository ? "content" : ""
    }
    this.store = new Store(new VaultFs(this.app, () => this.root), this.settings.folder)
    this.listeners.forEach((listener) => listener())
  }

  async sync(): Promise<string> {
    const report = await this.store.syncFeeds(async (url) => (await requestUrl({ url })).text)
    this.app.saveLocalStorage(SYNCED_KEY, String(Date.now()))
    return report
  }

  async open() {
    const { workspace } = this.app
    const leaf = workspace.getLeavesOfType(VIEW)[0] ?? workspace.getLeaf("tab")
    await leaf.setViewState({ type: VIEW, active: true })
    workspace.revealLeaf(leaf)
  }

  host(): Host {
    return {
      load: () => this.store.snapshot(),
      apply: async (mutation) => void (await this.store.apply(mutation)),
      sync: () => this.sync(),
      open: async (item) => {
        if (!item.path) return
        const path = normalizePath(this.root ? `${this.root}/${item.path}` : item.path)
        const file = this.app.vault.getAbstractFileByPath(path)
        if (!(file instanceof TFile)) return void new Notice(`Not found: ${path}`)
        const state = item.line !== undefined ? { eState: { line: item.line } } : undefined
        await this.app.workspace.getLeaf("tab").openFile(file, state)
      },
      onChange: (listener) => {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
      },
      notify: (message) => void new Notice(message),
      storage: {
        get: (key) => this.app.loadLocalStorage(key),
        set: (key, value) => this.app.saveLocalStorage(key, value),
      },
    }
  }
}

class PlannerSettings extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: PlannerPlugin,
  ) {
    super(app, plugin)
  }

  async display() {
    const { containerEl: el, plugin } = this
    el.empty()

    const reconnect = async () => {
      await plugin.saveData(plugin.settings)
      await plugin.connect()
    }
    new Setting(el)
      .setName("Content root")
      .setDesc(
        "The folder that holds the notes. “auto” uses content/ when the vault is the repository, otherwise the vault itself.",
      )
      .addText((text) =>
        text.setValue(plugin.settings.root).onChange(async (value) => {
          plugin.settings.root = value.trim()
          await reconnect()
        }),
      )
    new Setting(el)
      .setName("Planner folder")
      .setDesc(
        "Inside the content root. Holds the tasks and events, the settings (planner.json) and the fetched feeds. Keep it in a folder that is not published.",
      )
      .addText((text) =>
        text.setValue(plugin.settings.folder).onChange(async (value) => {
          plugin.settings.folder = value.trim().replace(/^\/+|\/+$/g, "") || DEFAULT_SETTINGS.folder
          await reconnect()
        }),
      )

    // everything below is stored in planner.json, which the site's board reads as well
    const config = await plugin.store.config()
    const save = async (change: Partial<Config>) => {
      Object.assign(config, change)
      await plugin.store.saveConfig(config)
    }
    new Setting(el)
      .setName("Tasks from notes")
      .setDesc("Also show the “- [ ]” checkboxes of all notes.")
      .addToggle((toggle) =>
        toggle.setValue(config.inlineTasks).onChange((value) => save({ inlineTasks: value })),
      )
    new Setting(el)
      .setName("Day")
      .setDesc("First and last hour of the week and day views.")
      .addText((text) =>
        text.setValue(config.dayStart).onChange((value) => {
          if (/^\d{2}:\d{2}$/.test(value)) save({ dayStart: value })
        }),
      )
      .addText((text) =>
        text.setValue(config.dayEnd).onChange((value) => {
          if (/^\d{2}:\d{2}$/.test(value)) save({ dayEnd: value })
        }),
      )

    new Setting(el).setName("Calendar feeds").setHeading()
    el.createEl("p", {
      cls: "setting-item-description",
      text: "Published .ics calendars. Their events can be moved and recoloured here; the changes stay in the vault and never go back to the calendar.",
    })
    config.feeds.forEach((feed, i) => {
      new Setting(el)
        .addText((text) =>
          text
            .setPlaceholder("Name")
            .setValue(feed.name)
            .onChange((value) => {
              feed.name = value.trim()
              save({})
            }),
        )
        .addText((text) =>
          text
            .setPlaceholder("https://…/calendar.ics")
            .setValue(feed.url)
            .onChange((value) => {
              feed.url = value.trim()
              save({})
            }),
        )
        .addText((text) =>
          text
            .setPlaceholder("Category field")
            .setValue(feed.categoryField ?? "")
            .onChange((value) => {
              feed.categoryField = value.trim() || undefined
              save({})
            }),
        )
        .addExtraButton((button) =>
          button
            .setIcon("trash")
            .setTooltip("Remove this feed")
            .onClick(async () => {
              config.feeds.splice(i, 1)
              await save({})
              this.display()
            }),
        )
    })
    new Setting(el)
      .addButton((button) =>
        button.setButtonText("Add feed").onClick(async () => {
          config.feeds.push({ name: "", url: "" })
          await save({})
          this.display()
        }),
      )
      .addButton((button) =>
        button
          .setButtonText("Sync now")
          .setCta()
          .onClick(async () => new Notice(await plugin.sync())),
      )

    new Setting(el).setName("Category colours").setHeading()
    const { categories } = await plugin.store.snapshot()
    for (const category of categories) {
      new Setting(el).setName(category.name).addColorPicker((picker) =>
        picker.setValue(category.color).onChange((color) => {
          const others = config.categories.filter((c) => c.name !== category.name)
          save({ categories: [...others, { name: category.name, color }] })
        }),
      )
    }
  }
}
