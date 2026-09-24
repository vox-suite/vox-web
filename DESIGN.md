---
name: Vox
description: Your chief of staff, on speed dial.
colors:
  void-black: "#040506"
  plate: "#0d0d10"
  plate-raised: "#141417"
  bubble-you: "#1f1f23"
  bubble-vox: "#16161a"
  crimson: "#d7373f"
  crimson-hi: "#e5484d"
  crimson-mid: "#c52f37"
  crimson-lo: "#8e1c22"
  pure-white: "#ffffff"
  mist: "#e6e6e6"
  ash: "#9c9c9d"
  smoke: "#8b8c8d"
  hairline: "rgba(255, 255, 255, 0.06)"
typography:
  display:
    fontFamily: "Funnel Display, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 7vw, 5rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Funnel Display, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Funnel Display, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 600
    letterSpacing: "-0.02em"
  subtitle:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    fontFeature: "\"tnum\""
rounded:
  key-sm: "8px"
  key: "12px"
  bubble: "16px"
  card: "24px"
  plate: "28px"
  phone: "50px"
  full: "9999px"
spacing:
  gutter-mobile: "24px"
  gutter-desktop: "40px"
  section-sm: "64px"
  section-md: "96px"
  section-lg: "128px"
  container: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.crimson}"
    textColor: "{colors.pure-white}"
    typography: "{typography.subtitle}"
    rounded: "{rounded.key}"
    padding: "0 24px"
    height: "48px"
  button-primary-sm:
    backgroundColor: "{colors.crimson}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.key-sm}"
    padding: "0 14px"
    height: "36px"
  button-secondary:
    backgroundColor: "{colors.plate-raised}"
    textColor: "{colors.mist}"
    rounded: "{rounded.key}"
    padding: "0 20px"
    height: "44px"
  plate:
    backgroundColor: "{colors.plate}"
    rounded: "{rounded.plate}"
    padding: "56px"
  bubble-you:
    backgroundColor: "{colors.bubble-you}"
    textColor: "{colors.mist}"
    typography: "{typography.body}"
    rounded: "{rounded.bubble}"
    padding: "12px 16px"
  bubble-vox:
    backgroundColor: "{colors.bubble-vox}"
    textColor: "{colors.ash}"
    typography: "{typography.body}"
    rounded: "{rounded.bubble}"
    padding: "12px 16px"
  nav-bar:
    backgroundColor: "{colors.plate}"
    rounded: "{rounded.bubble}"
    padding: "8px 8px 8px 16px"
---

# Design System: Vox

## Overview

**Creative North Star: "Machined"**

Vox is a precision instrument you keep in your pocket, and the marketing surface is built like one: near-black anodised graphite, fills machined to slightly different depths, and a single crimson anodised key that means "press here" or "a call is live". Nothing is outlined. Surfaces read as separate parts because they are milled from different stock (a fill step plus a one-pixel top highlight), the way a phone's frame and glass read as separate without a drawn line between them.

Density is low and deliberate. Sections breathe at 64 to 128px, headlines are tight and heavy in Funnel Display, and body copy sits in quiet ash Inter. Colour is almost entirely absent; crimson is the one voice, and its scarcity is what makes the call button and the calling state legible at a glance. The retired Raycast world (neon glow, bordered keycaps, coral/blue/green accents) is explicitly rejected on the marketing surface.

**Key Characteristics:**
- Near-black ground with two graphite fill steps; depth by fill and inset highlight, never borders.
- One anodised crimson gradient (160°) reserved for the mark, primary key, calling state, and at most one low glow per section.
- Funnel Display 600 with negative tracking for headings; Inter for everything read; mono only for times and versions.
- Hardware objects (the machined phone frame, round anodised call keys) carry the story instead of illustration or iconography grids.

## Colors

A monochrome graphite system with a single anodised crimson accent.

### Primary
- **Anodised Crimson** (crimson; gradient crimson-hi → crimson-mid → crimson-lo at 160°): the Vox mark, the Request access key, round call buttons, the final "Vox calls you back" step, the ring-out pulse on the live call, and the section glows. Flat crimson appears only as a glow tint (16–18% alpha) or a 40% ring; the solid surface is always the gradient.
- **Crimson Highlight** (crimson-hi): the one inline accent allowed in content, used on the single queued action that closes the loop ("Vox calls you tomorrow").

### Neutral
- **Void Black** (void-black): the page ground, shared with the rest of the site.
- **Plate Graphite** (plate): primary raised surface: the demo plate, the story plate, the nav bar (at 72% with blur).
- **Raised Graphite** (plate-raised): the bottom stop of graphite keys; the next depth up from a plate.
- **Transcript Graphite** (bubble-you / bubble-vox): the two speech-bubble fills; the caller's bubble is a step lighter than Vox's.
- **Pure White** (pure-white): headings and the active state of links.
- **Mist** (mist): secondary emphasis: graphite key labels, capability titles, version numbers, the caller's words.
- **Ash** (ash): body copy, nav links, Vox's words.
- **Smoke** (smoke): captions, "Illustrative" disclosures, dates, footer small print.
- **Hairline** (hairline): the only line in the system, used as a divider between list rows.

### Named Rules
**The One Voice Rule.** Crimson is the only hue on the marketing surface. No blue, no green, no coral. If a second colour seems necessary, use a graphite step or a white weight instead.

**The One Glow Rule.** At most one crimson radial glow per section (0.14–0.18 alpha, falling to transparent by 70–75%). The glow sits behind the crimson object it belongs to, never as ambient decoration.

## Typography

**Display Font:** Funnel Display (with Inter, system sans fallback)
**Body Font:** Inter (with system sans fallback)
**Label/Mono Font:** Geist Mono, restricted to timestamps and version numbers

**Character:** Funnel Display at 600 with tight negative tracking gives engineered, slightly compressed headings; Inter underneath stays neutral and legible so the display face carries all the personality.

### Hierarchy
- **Display** (600, clamp(2.75rem, 7vw, 5rem), 0.98, -0.04em): the hero headline only. The closing headline is a sibling step (clamp(2.25rem, 5.5vw, 4rem), 1.02, -0.035em, max 16ch).
- **Headline** (600, clamp(2rem, 4.2vw, 3rem), 1.05, -0.03em, balanced wrap): every section heading, max width 34rem.
- **Title** (Funnel Display 600, 20–24px, -0.02em): group headings, the phone's caller name, "Vox is calling".
- **Subtitle** (Inter 500, 17–19px, -0.01em): list item and step titles.
- **Body** (Inter 400, 15px, relaxed 1.625): all descriptive copy; 17–18px for section descriptions and the hero subhead. Keep measure at 30–36rem.
- **Label** (Inter 400–500, 13px): captions, transcript meta, footer column titles.
- **Mono** (Geist Mono 13px, tabular numerals): call timers, release versions and dates. Nothing else.

### Named Rules
**The Mono Is A Clock Rule.** Monospace means a time or a version number. It is never used for labels, headings, or decoration.

## Layout

Single centred container (1200px) with 24px gutters on mobile and 40px from md. Tailwind's default 4px spacing scale is the rhythm; there are no custom spacing tokens. Section padding alternates between two cadences so the page does not march: large sections at 96px mobile / 128px desktop, interludes at 64px / 96px. The hero opens at 128–160px top to clear the floating nav.

Two-column compositions use asymmetric fractional grids (1.1fr / 0.9fr in the hero, 0.8fr / 1.2fr for heading-plus-list sections), collapsing to a single stack below lg with the object (phone, plate) below the copy. Section headings in split layouts stick at 128px from the top on desktop. Anchored sections carry a 96px scroll margin.

## Elevation & Depth

Depth is tonal and specular, not shadowed. Each surface is a fill one step lighter than what it sits on, finished with a 1px white inset at the top edge (4.5–7% alpha) and a tight 1–2px dark contact shadow. Large soft drop shadows appear only under physical objects (the phone frame, the floating nav, the story's call card) to make them read as things held above the page.

### Shadow Vocabulary
- **Plate** (`inset 0 1px 0 rgba(255,255,255,0.045), 0 1px 2px rgba(0,0,0,0.4)`): demo and story plates, the mobile menu.
- **Graphite key** (`inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.5)`): secondary keys, selected tabs, step markers.
- **Crimson key** (`inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -1px 0 rgba(0,0,0,0.3), 0 10px 24px -10px rgba(142,28,34,0.75), 0 1px 2px rgba(0,0,0,0.5)`): the primary key; the coloured under-shadow is the key's own light, not a glow.
- **Floating nav** (`inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 32px -16px rgba(0,0,0,0.8)` plus 24px backdrop blur).
- **Machined frame** (145° gunmetal gradient, bright inset top edge, `0 40px 80px -30px rgba(0,0,0,0.9)`): the phone bezel only.

### Named Rules
**The No-Outline Rule.** Surfaces are separated by fill and the top-edge highlight, never by a border or 1px ring. The only lines are white/6% hairline dividers between rows of a list (principles, releases, and the footer's top edge).

## Shapes

Rounded but not soft: every corner is a machined radius scaled to the object's size. Small keys 8px, standard keys 12px, speech bubbles and the nav 16px (bubbles cut to 6px on the speaker's tail corner), cards 24px, plates 28px, the phone 50px with concentric inner radii (47px, 40px). Call buttons and step markers are full circles. The brand mark is an 8px-radius anodised square carrying a white V chevron.

## Components

### Buttons
Keys, not buttons: they look pressable because they are lit from above and sink 1px on press.
- **Shape:** gently rounded (12px; 8px at the 36px small size).
- **Primary (crimson key):** anodised crimson gradient, white Inter 500 15px, 48px tall, 24px horizontal padding. Small variant 36px / 13px for the nav.
- **Hover / Active:** brightness 1.08 on hover; on press, translate 1px down and swap to a recessed inset shadow. 160ms expo-out.
- **Secondary (graphite key):** vertical graphite gradient (#1d1d21 → plate-raised), mist label, 44px tall; hover lifts both stops one shade and turns the label white.
- **Text link:** mist 15px with a 16px arrow that nudges 2px right on hover; turns white.

### Cards / Containers
- **Corner Style:** plates 28px; inner cards 24px.
- **Background:** plate, with inner cards darker than their plate (#08080a) so they read as recessed glass.
- **Shadow Strategy:** Plate shadow (see Elevation).
- **Border:** none.
- **Internal Padding:** 32px mobile, 56px desktop.

### Navigation
Floating bar 16px from the top, max 1040px, plate at 72% with backdrop blur and the floating-nav shadow. Brand left, centred ash 14px links (white on hover), Sign in text link and small crimson key right. Below lg the links collapse into a graphite-key menu toggle opening a plate panel of 44px-tall rows.

### Transcript
Speech bubbles in two graphite steps: the caller's (bubble-you, mist text) aligned right with a cut bottom-right corner, Vox's (bubble-vox, ash text) aligned left with a cut bottom-left corner. Lines enter with the rise motion (700ms, 8px up, 4px blur clearing), staggered 500ms. Every transcript is captioned as illustrative in smoke.

### Machined Phone (signature)
A 340px phone in a gunmetal machined frame, black bezel, and a #070708 screen. It holds a live call: anodised round call key with a crimson ring-out pulse (2.4s), mono call timer, transcript, and a "Call ended · N actions queued" tray whose final item is crimson-hi. This is the page's hero object; one low crimson glow sits behind it.

### Step Path
Four circular 40px markers joined by a 1px line that fades from white/10% to crimson/60%. The first three are graphite keys; only the last, the callback, is anodised.

## Do's and Don'ts

### Do:
- **Do** separate every surface by fill step plus a 1px top inset highlight (4.5–7% white).
- **Do** reserve the anodised crimson gradient (160°, crimson-hi → crimson-lo) for the mark, the primary key, the calling state, and the closing step of a sequence.
- **Do** keep crimson glows to one per section, behind a crimson object, at 0.14–0.18 alpha.
- **Do** set headings in Funnel Display 600 with -0.02em to -0.04em tracking, tighter as size grows.
- **Do** label every simulated call or conversation as illustrative in smoke 13px.
- **Do** vary section padding between the 64/96px and 96/128px cadences.

### Don't:
- **Don't** draw borders or 1px rings around cards, keys, or plates; the only lines are white/6% row dividers.
- **Don't** use blue, green, or coral on the marketing surface, and don't use flat crimson as a fill.
- **Don't** use monospace for anything other than times and version numbers.
- **Don't** add neon or ambient glows that are not attached to a crimson object.
- **Don't** reintroduce the retired Raycast keycap ring shadow (white/25% 1px ring) on marketing surfaces.
