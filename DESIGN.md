---
name: Vox
description: Your chief of staff, on speed dial.
colors:
  void-black: "#040506"
  ink: "#07080a"
  obsidian: "#111214"
  graphite: "#1b1c1e"
  smoke: "#6a6b6c"
  ash: "#9c9c9d"
  mist: "#e6e6e6"
  iron: "#454647"
  slate: "#2f3031"
  pure-white: "#ffffff"
  coral-pulse: "#ff6363"
  ember-hush: "#452324"
  electric-sky: "#63a1ff"
  cobalt-edge: "#143ca3"
  deep-space: "#02193b"
  info-blue: "#56c2ff"
  success-green: "#59d499"
  border-edge: "#363739"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "64px"
    fontWeight: 600
    lineHeight: 1.1
  heading-lg:
    fontFamily: "Inter, sans-serif"
    fontSize: "56px"
    fontWeight: 400
    lineHeight: 1.17
    letterSpacing: "0.22px"
  heading:
    fontFamily: "Inter, sans-serif"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.15
  subheading:
    fontFamily: "Inter, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: 1.2
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.15
  mono:
    fontFamily: "Geist Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
rounded:
  buttons: "8px"
  inputs: "8px"
  badges: "6px"
  cards: "16px"
  largeCards: "20px"
  pills: "9999px"
spacing:
  unit: "8px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.iron}"
    rounded: "{rounded.buttons}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ash}"
    border: "{colors.border-edge}"
    rounded: "{rounded.buttons}"
  card:
    backgroundColor: "{colors.ink}"
    shadow: "key"
    rounded: "{rounded.cards}"
  nav:
    backgroundColor: "transparent"
    blur: "48px"
    border: "{colors.border-edge}"
    rounded: "{rounded.buttons}"
---

# Vox Design System

Midnight command center inspired by Raycast: almost-black canvas, Mist neutral actions, Coral Pulse only for brand and hero atmosphere.

## Principles

- Dark-only. Canvas is always `#040506`.
- Primary CTAs are Mist on dark, never coral or chromatic fills.
- Coral Pulse is brand punctuation (logo diamond, hero artwork, AI badges).
- Elevation uses the keyboard-key inset shadow stack, not floating drop shadows.
- Inter for UI; Geist Mono for technical metadata and version strings.

## Surfaces

| Level | Token | Value |
| ----- | ----- | ----- |
| Canvas | void-black | `#040506` |
| Card | ink | `#07080a` |
| Recessed | obsidian | `#111214` |
| Badge | graphite | `#1b1c1e` |
| Accent tint | ember-hush | `#452324` |

## Implementation

- Tokens: `src/app/globals.css` (`@theme`)
- Primitives + composition: `src/components/ui`
- Docs: `docs/design-system.md`
