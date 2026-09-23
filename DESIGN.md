---
name: Vox
description: Your chief of staff, on speed dial.
colors:
  paper: "#ffffff"
  ink: "#111111"
  muted: "#656565"
  line: "#d8d8d8"
  soft: "#f7f7f7"
  subtle: "#eeeeee"
  contrast: "#dddddd"
  indigo: "#4f46e5"
  indigo-deep: "#4338ca"
  indigo-light: "#6366f1"
  violet: "#7c3aed"
  cyan: "#06b6d4"
  emerald: "#10b981"
  danger: "#9f1239"
  danger-surface: "#fff1f2"
typography:
  display:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "clamp(2.75rem, 5.2vw, 4.7rem)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-0.065em"
  headline:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.6rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "0.84rem"
    fontWeight: 600
rounded:
  none: "0"
  control: "6px"
  bubble: "0.75rem"
spacing:
  xs: "0.65rem"
  sm: "1rem"
  md: "1.75rem"
  lg: "2.75rem"
  section: "clamp(4.5rem, 10vw, 8rem)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0.65rem 1.45rem"
  button-primary-hover:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.65rem 1.45rem"
  button-secondary-hover:
    backgroundColor: "#faf5ff"
    textColor: "{colors.indigo}"
    rounded: "{rounded.control}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
  badge-neutral:
    backgroundColor: "#f1f1f1"
    textColor: "#595959"
    rounded: "{rounded.none}"
    padding: "0.28rem 0.65rem"
  badge-accent:
    backgroundColor: "#ede9fe"
    textColor: "#6d28d9"
    rounded: "{rounded.none}"
  badge-positive:
    backgroundColor: "#ecfdf5"
    textColor: "#047857"
    rounded: "{rounded.none}"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "{spacing.md}"
---

# Design System: Vox

## Overview

**Creative North Star: "The Signal in the Noise"**

Vox is a quiet system that comes alive. At rest, every surface is white or a step in a tightly controlled neutral scale — paper, soft, subtle, contrast, line. There is no ambient color, no decorative warmth, no visual noise. The system's formality is mathematical: square corners everywhere, borders at exactly 1px, content held inside a vertical rail of `border-inline` rules that frame the page like an editorial column.

The signal appears only when the system is alive. The indigo-violet-cyan spectral gradient animates the hero headline, illuminates hover states, pulses behind active badges, and fills the closing section's dark void. It is a reward for attention, not wallpaper. This restraint is deliberate: professionals using Vox need to read fast. Color carries meaning here because it is used rarely — a hover glow, an active indicator, a confirmed action in emerald green.

Density is medium. The spacing scale runs generous but not lavish — `1.75rem` card padding, `clamp(4.5rem, 10vw, 8rem)` between sections. Typography uses a single typeface family (Manrope Variable) for all text, reserving Space Grotesk for button labels and numeric displays to create a quiet instrumental hierarchy without switching families in prose.

**Key Characteristics:**

- White infrastructure; spectral energy is the signal, not the atmosphere
- Square corners by default — only interactive controls (6px) and conversation bubbles (12px) earn curves
- Single typeface (Manrope Variable), tightly tracked at −0.045em on headings
- Dot-grid texture marks structural backdrops (hero, auth, admin welcome)
- Vertical rail (`border-inline`) is the primary spatial organizing device
- Hover is when the world turns on: every transition moves from neutral to spectral

## Colors

A near-monochrome palette governed by neutral infrastructure, with a three-color spectral accent (indigo, violet, cyan) as the system's energy signal.

### Primary

- **Ink** (#111111): Default body text, borders on interactive elements, primary button background at rest, admin active-nav background. Near-black rather than absolute black — prevents harshness against paper.
- **Indigo** (#4f46e5): The primary interactive signal. Active button hover gradient start, focus rings, changelog dots, sidebar active-nav border, footer link hover, `.ui-module-link` text. The most saturated color in the system visible at rest.
- **Indigo Deep** (#4338ca): Button hover gradient terminus. Always paired with Indigo as the downward gradient endpoint.

### Secondary

- **Indigo Light** (#6366f1): Focus outline color, lighter active states, changelog bullet markers (→), changelog dots at rest, notice left-accent border. The softer expression of the indigo signal.
- **Violet** (#7c3aed): The gradient's midpoint. Present in the hero headline gradient, closing section glow, and footer wordmark hover. Never used alone in UI components.
- **Cyan** (#06b6d4): The gradient's cool terminus. Always the final stop in spectral gradients. Never used alone in components.

### Tertiary

- **Emerald** (#10b981): Success and confirmation signal. Status dots, completed-action indicators, positive demo outcomes. Strictly semantic — never decorative.
- **Danger** (#9f1239): Destructive actions and error states. Uses `#fff1f2` as its surface pair.

### Neutral

- **Paper** (#ffffff): Page background and all card surfaces at rest.
- **Muted** (#656565): Secondary text, supporting copy, placeholder text. Meets AA contrast on white.
- **Line** (#d8d8d8): All borders and dividers, including the vertical rail.
- **Soft** (#f7f7f7): Card hover surfaces, code blocks, table headers, select backgrounds.
- **Subtle** (#eeeeee): Avatar backgrounds, deeper structural recesses.
- **Contrast** (#dddddd): Maximum neutral contrast step before shadows.

**The Signal Rule.** The spectral indigo-violet-cyan gradient is reserved for moments of activation: hero text span, interactive hover glows, and the closing dark section background. It does not appear as ambient decoration on resting surfaces. Its rarity is its meaning.

## Typography

**Display Font:** Manrope Variable (with sans-serif fallback)
**Body Font:** Manrope Variable (with sans-serif fallback)
**Label / Numeric Font:** Space Grotesk (with system sans-serif fallback)

**Character:** A single-typeface system that earns variety through weight and size rather than family changes. Manrope's tight, humanist letterforms work at both headline scale (weight 650, −0.065em tracking) and body reading size (weight 400, 1.65 line-height). Space Grotesk is a deliberate intruder — its geometric personality marks button labels and numeric displays as interactive or data elements.

### Hierarchy

- **Display** (weight 650, `clamp(2.75rem, 5.2vw, 4.7rem)`, line-height 1.02, tracking −0.065em): Hero headline only. The `<span>` within carries the spectral gradient. Never used on interior pages.
- **Headline** (weight 600, `clamp(1.7rem, 3vw, 2.6rem)`, line-height 1.15, tracking −0.045em): Section titles on marketing and changelog pages.
- **Title** (weight 600, `1.2rem`, line-height 1.3, tracking −0.025em): Card headings, admin page sub-headings, component titles.
- **Body** (weight 400, `15px`, line-height 1.65): All running prose. Max line length 65–72ch in reading contexts; `text-wrap: pretty`.
- **Label** (weight 600, `0.84rem`, Space Grotesk): Form labels, button text, stat values, changelog dates, uppercase-tracked metadata. Space Grotesk signals "this is a data or control element."

**The Single-Family Rule.** All text is Manrope Variable. Space Grotesk appears only on button labels, numeric stat values, and changelog dates. Do not import additional typefaces.

## Layout

The page container uses a maximum width of 1160px (`--page-width`), centered with `width: min(var(--page-width), calc(100% - 3rem))`. The container draws `border-inline: 1px solid var(--color-line)` on both sides — creating a vertical rail that frames content like a printed broadsheet column. Sections never bleed outside this rail; the empty gutter is intentional whitespace.

Section vertical rhythm uses `padding-block: clamp(4.5rem, 10vw, 8rem)`, scaling fluidly with viewport. Card and grid gaps use `1rem` at their densest. The admin layout is a 230px fixed sidebar with a fluid content column.

**Breakpoints:**

- `1000px` — Grid columns collapse; demo hides context panel; 4-column grids become 2-column; sidebar narrows to 195px
- `720px` — Site navigation links hide; hero reduces padding; most multi-column grids stack; card padding reduces to `1.25rem`

**The Rail Rule.** Every page-level container carries `border-inline: 1px solid var(--color-line)`. This vertical frame is the primary spatial organizing device. Do not fill the area outside the rail with full-width backgrounds — the gutter is the design.

## Elevation & Depth

Vox uses tonal layering as its primary depth language. Cards and panels sit flat at `#ffffff`; the admin page background and table headers use `#f7f7f7` or `#f8f8f8` to establish the content surface above the structural ground. No persistent ambient shadows decorate containers at rest (`--shadow-panel: none`).

Interactive elevation is spectral: buttons carry a hairline `0 1px 3px rgba(0,0,0,0.12)` structural shadow at rest, which blooms to a `0 6px 20px rgba(79, 70, 229, 0.35)` indigo glow on hover. Module cards gain `0 8px 30px rgba(99, 102, 241, 0.12)` on hover. The featured follow-up card on the story section uses `0 18px 55px rgba(79, 70, 229, 0.12)` as a permanently elevated artifact — the exception that proves the rule.

**The Flat-at-Rest Rule.** Surfaces have no ambient elevation shadow. Shadows appear only as interaction feedback — hover, focus, or intentional visual lift of a featured element. A card with a shadow at rest signals a permanently elevated artifact; use it sparingly.

## Shapes

Square corners (radius: 0) are the system default. Cards, badges, containers, code blocks, admin panels, input fields, and the demo frame all use `border-radius: 0`. This is the system's most formal gesture — a professional tool that does not soften its edges.

Two exceptions are precisely scoped:

- **Interactive controls** (buttons): `6px` radius. Enough curve to distinguish a pressable element from a structural container without breaking the system's formality.
- **Conversational elements** (`.bubble`, chat messages): `0.75rem` (12px) radius. Signals "this came from a person, not the system."

**The Square Frame Rule.** All containers and information elements use radius: 0. Only things a person presses or things a person said get curved corners. Rounding must be earned by function, not aesthetic preference.

## Components

### Buttons

Restrained and confident. The primary button at rest is near-black with a subtle gradient from `#27272a` to `#18181b`. On hover, it transforms entirely — becoming an indigo gradient with a deep spectral glow. This transformation is intentional: hovering a primary button is the moment the system announces itself.

- **Shape:** `border-radius: 6px`; `min-height: 44px` (touch compliance)
- **Font:** Space Grotesk at `0.82rem` / weight 600 / tracking −0.015em
- **Primary at rest:** Dark zinc gradient + `0 1px 3px rgba(0,0,0,0.12)` + inset highlight; `border: 1px solid #18181b`
- **Primary hover:** Indigo gradient (`#4f46e5` → `#4338ca`) + `0 6px 20px rgba(79, 70, 229, 0.35)` glow + `translateY(-1px)` lift
- **Secondary at rest:** White gradient, `#d1d5db` border
- **Secondary hover:** Pale violet surface (`#faf5ff` → `#f3e8ff`), indigo text (`#4f46e5`), `#c4b5fd` border
- **Ghost:** Transparent; `var(--color-muted)` text. Hover: pale violet surface + indigo text, no border shift
- **Danger:** Flat `#9f1239` background; no shadow, no hover lift. For destructive actions only.

### Chips / Badges

Square-cornered, monospace, uppercase. Badges use a monospace font stack at `0.65rem` with `0.045em` letter-spacing — this puts badge labels in the same visual register as code, signaling metadata rather than prose.

- **Neutral:** `#f1f1f1` background / `#595959` text / `#d8d8d8` border
- **Accent (indigo):** `#ede9fe` background / `#6d28d9` text / `#ddd6fe` border — product labels, feature tags, "new" indicators
- **Positive (emerald):** `#ecfdf5` background / `#047857` text / `#a7f3d0` border — "live," "completed," confirmation states
- **Warning (amber):** `#fef3c7` background / `#b45309` text / `#fde68a` border — caution states

### Cards / Containers

Deliberately static at rest: `1px solid var(--color-line)`, no shadow, no radius. Depth appears on interaction — feature cards reveal a tonal hover surface (`#fafafa`), module cards gain an indigo border and ambient glow.

- **Corner:** radius: 0
- **Background:** `#ffffff`
- **Border:** `1px solid var(--color-line)` (#d8d8d8)
- **Internal padding:** `1.75rem` standard; `1.5rem` in dense grids
- **Hover (module card):** `border-color: #818cf8`; `box-shadow: 0 8px 30px rgba(99, 102, 241, 0.12)`

### Inputs / Fields

Full-width, square-cornered, `1px solid #a8a8a8` at rest. The border is intentionally warmer/darker than the neutral `#d8d8d8` line token to provide contrast against the white background.

- **Style:** radius: 0; `min-height: 2.75rem`; border `1px solid #a8a8a8`
- **Focus:** `outline: 3px solid #6366f1`; `outline-offset: 4px`
- **Label:** Manrope / `0.84rem` / weight 600 above the field
- **Error:** Border shifts to `#4d4d4d` (darkens, does not add red — error color is reserved for the notice component)
- **Monospace textarea:** `font-family: ui-monospace` when `data-monospace="true"`

### Navigation

**Site nav:** Borderless links in Manrope `0.78rem`. Hover color: `#4f46e5`. Navigation hides entirely at 720px — only the CTA button and brand survive.

**Admin sidebar nav:** `0.82rem` links with 16px left padding. Active state is inverted: `#111111` background / white text / weight 600. This binary inversion signals "current location" with maximum clarity — no half-states, no underlines.

### Notice / Alert

An editorial notification component. The 3px left accent border is its signature — a typographic mark borrowed from editorial annotation, not a full-bleed color fill.

- **Default:** `#f8fafc` background / `#dedede` border / 3px left accent `#6366f1`
- **Error:** `#fff1f2` background / `#fecdd3` border / 3px left `#e11d48` / text `#9f1239`
- **Success:** `#f0fdf4` background / `#bbf7d0` border / 3px left `#16a34a` / text `#14532d`

### Dot-Grid Texture (Signature Background)

`radial-gradient(#dedede 0.65px, transparent 0.8px) 0 0 / 8px 8px` — applied on hero, auth screens, and admin welcome panels to signal "structural backdrop." The dots are tight enough to read as texture, loose enough not to compete with content. The hero applies a radial mask on top to fade the grid toward the center, preventing it from fighting the headline.

Never apply the dot-grid to interactive surfaces, cards, or text-heavy containers.

## Do's and Don'ts

### Do:

- **Do** use the spectral gradient (`linear-gradient(135deg, #4f46e5, #7c3aed, #06b6d4)`) only for hero text highlights, interactive hover glows, and the closing dark section. One significant instance per view.
- **Do** apply `border-inline: 1px solid var(--color-line)` to every page-level content container to maintain the vertical rail.
- **Do** use radius: 0 for all containers, cards, badges, and information displays.
- **Do** use Space Grotesk only on button labels, numeric stat values, and changelog dates.
- **Do** mark structural backdrops (hero, auth, admin welcome) with the `radial-gradient` dot-grid texture.
- **Do** use the inverted black/white treatment (`background: #111; color: white`) for the active admin sidebar link.
- **Do** keep badge text in monospace to maintain its metadata-versus-prose distinction.

### Don't:

- **Don't** add ambient shadows to cards or containers at rest — shadows are hover and interaction feedback only.
- **Don't** use the spectral gradient as a background pattern, texture, or repeated element.
- **Don't** round cards, containers, badges, or admin panels — only interactive controls (6px) and conversation bubbles (12px) earn curves.
- **Don't** introduce a second display typeface. Manrope Variable and Space Grotesk are the complete set.
- **Don't** add color to resting states of cards or navigation links — color signals activation, not categorization.
- **Don't** apply the dot-grid texture behind interactive surfaces, dense text, or content cards.
- **Don't** invent testimonials, customer logos, or metrics not present in the changelog record.
