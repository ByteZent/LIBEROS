// The planner's settings: <planner folder>/planner.json, read by the Obsidian plugin and by the
// local server alike. The folder is private (gitignored), so feed addresses may live here.
import { Category, Config, Item } from "./types"
import { EXAM_CATEGORY } from "./deadlines"

export const CONFIG_FILE = "planner.json"
export const UNCATEGORISED = "Uncategorised"
export const VAULT_TASK = "Vault task"

// for categories nobody gave a colour: readable with white text, in light and dark themes
const PALETTE = [
  "#1f6f8b",
  "#8a5a14",
  "#5b7f3a",
  "#8b3a62",
  "#4f5fa8",
  "#a14a2f",
  "#2f7d6d",
  "#6b4fa0",
  "#7a7f2a",
  "#3f6f9f",
]

export const DEFAULTS: Config = {
  categories: [
    { name: EXAM_CATEGORY, color: "#b3261e" },
    { name: VAULT_TASK, color: "#5b6773" },
    { name: UNCATEGORISED, color: "#6f7780" },
  ],
  feeds: [],
  refreshMinutes: 240,
  weekStart: 1,
  dayStart: "05:00",
  dayEnd: "23:00",
  defaultView: "timeGridWeek",
  inlineTasks: true,
  exclude: ["_templates", "_dashboards"],
}

export function readConfig(text: string | null): Config {
  if (!text) return DEFAULTS
  try {
    const given = JSON.parse(text)
    const config: Config = { ...DEFAULTS, ...given }
    // the built-in categories stay unless the file gives them a colour of its own
    const named = new Set((given.categories ?? []).map((c: Category) => c.name))
    config.categories = [
      ...(given.categories ?? []),
      ...DEFAULTS.categories.filter((c) => !named.has(c.name)),
    ]
    return config
  } catch {
    return DEFAULTS
  }
}

export const categoryOf = (item: Item) =>
  item.category ?? (item.source === "inline" ? VAULT_TASK : UNCATEGORISED)

// the configured categories, then every other one in use with a colour from the palette.
// A name keeps its colour as long as the set of names does not change.
export function categories(config: Config, items: Item[]): Category[] {
  const known = new Map(config.categories.map((c) => [c.name, c]))
  const extra = [...new Set(items.map(categoryOf))].filter((name) => !known.has(name)).sort()
  return [
    ...config.categories,
    ...extra.map((name, i) => ({ name, color: PALETTE[i % PALETTE.length] })),
  ]
}
