import { Item, Mutation, Snapshot } from "../core"

// What the board needs from where it runs: the Obsidian plugin talks to the vault directly,
// the page on the site talks to the local server.
export interface Host {
  load(): Promise<Snapshot>
  apply(mutation: Mutation & { raw?: string }): Promise<void>
  sync?(): Promise<string> // fetch the calendar feeds again; returns a line to show
  open(item: Item): void // show the note behind an item
  onChange(listener: () => void): () => void // the vault changed; returns how to unsubscribe
  notify(message: string): void
  storage: { get(key: string): string | null; set(key: string, value: string): void }
}
