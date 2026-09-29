# LIBEROS brand

The mark: a **diamond** with compass **bearing ticks** (strategy, orientation) framing a three-node
**knowledge graph** that forms an **L**. The brass node at the corner is the pivot, the point where
linked ideas turn into insight.

| File                                  | Use                                                        |
| ------------------------------------- | ---------------------------------------------------------- |
| `logo-mark-dark.svg` / `-light.svg`   | Mark alone, for dark / light backgrounds                   |
| `logo-lockup-dark.svg` / `-light.svg` | Mark + wordmark (JetBrains Mono Bold)                      |
| `icon.svg`                            | App icon / favicon: solid tile, simplified for small sizes |
| `og-image.svg`                        | Social preview card 1200×630                               |

The site renders the mark inline (`quartz/components/SiteLogo.tsx`) with theme colours, so it
switches with light/dark mode.

## Palette

| Token             | Dark      | Light     |
| ----------------- | --------- | --------- |
| Frame (secondary) | `#7fb3c8` | `#1f4e5f` |
| Nodes (dark)      | `#e8edf2` | `#16191c` |
| Pivot (tertiary)  | `#d4a84b` | `#9a6b1f` |
| Background        | `#0d1117` | `#f6f4ee` |

Regenerate the PNGs after editing an SVG: `make logo`.
