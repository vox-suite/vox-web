---
target: /pipeline
total_score: 22
max_score: 36
na_heuristics: 9
p0_count: 0
p1_count: 2
p2_count: 2
p3_count: 1
target_identity: "file:/Users/rahul/Documents/vox/vox-web/src/app/pipeline/page.tsx"
target_fingerprint: "sha256:e61cec43ed133b25e4301ee4dfc8a341cfd0f396ac3bbad05dff756edf224aad"
target_path: /Users/rahul/Documents/vox/vox-web/src/app/pipeline/page.tsx
timestamp: 2026-09-22T23-35-09Z
slug: src-app-pipeline-page-tsx
closed: true
---
## Pipeline Page — Design Critique

**Method:** Inline sequential. Assessment A: full source review of `flow-canvas.tsx`, `pipeline-view.tsx`, `toolbar.tsx`, `inspector-drawer.tsx`, `simulation-hud.tsx`, `public-pipeline-page.tsx`. Assessment B: `impeccable detect --json src/components/pipeline` (exit 2, advisory findings).

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Trace HUD has step counter + elapsed ms + progress bar; selected node is ringed. Minor gap: no loading indicator on initial render. |
| 2 | Match System / Real World | 3 | G.711/Twilio/barge-in terms match the engineering audience. Edge routing semantics (loop-back, top-highway) are implicit. |
| 3 | User Control and Freedom | 3 | Esc deselects, Cmd+0 resets, fit-view works. Missing: no keyboard shortcut to close simulation HUD; simulation toggle not documented. |
| 4 | Consistency and Standards | 2 | The canvas uses a fundamentally different visual grammar than the rest of the Vox system. |
| 5 | Error Prevention | 2 | No confirmation before SVG export. No "zoomed too far out" indicator. |
| 6 | Recognition Rather Than Recall | 2 | No edge-type legend. Users must know dashed-violet=speculative, dashed-emerald=async, amber=barge-in from prior knowledge. |
| 7 | Flexibility and Efficiency | 3 | Keyboard zoom + Esc exist. No shortcut to trigger simulation. |
| 8 | Aesthetic and Minimalist Design | 2 | Six resting node-tint colors + four edge-stroke colors create continuous multi-hue noise. |
| 9 | Error Recovery | n/a | No user input paths that produce recoverable errors. |
| 10 | Help and Documentation | 2 | No edge legend. Hover tooltip on nodes helpful but not discoverable. |
| **Total** | | **22/36** | **Acceptable** |

### Design Specificity Verdict

The canvas does not feel authored for Vox. The "Signal in the Noise" identity is completely absent from the canvas. Six-color subsystem coding actively fights the Vox system.

**Deterministic scan:** 3 undocumented colors in `data.ts` (`#f59e0b` at lines 17/83, `#ec4899` at line 39). 15+ font-size advisories in `design-system-modal.tsx`.

### Overall Impression

The canvas is a technical diagramming tool dropped into an editorial design system. The wiring is solid but visually it looks like a Miro embed.

### What's Working

1. Offset shadow `shadow-[4px_4px_0px_#111111]` on nodes matches the system card language.
2. Dot-grid canvas background using `fill="#d8d8d8"` is a faithful adaptation of the DESIGN.md signature.
3. Inspector drawer reads as Vox — `border-l border-[#111111]`, ink typography, `bg-[#111111] text-emerald-400` code block.

### Priority Issues

**[P1] Six off-palette resting tints violate the color rule — two colors not in system**
- `bg-amber-50/70`, `bg-pink-50/70` applied as permanent node backgrounds. `#f59e0b` (amber) and `#ec4899` (pink) absent from DESIGN.md.
- Fix: Replace all six tints with `bg-white` at rest. Use subsystem color only on badge chip text. Restrict subsystem palette to indigo/violet/cyan/emerald.
- Command: `/impeccable colorize`

**[P1] `rounded-md` on node cards breaks the Square Frame Rule**
- Every pipeline node uses `rounded-md`. Edge label pills use `rx={6}`. Stage regions use `rx={12}`.
- Fix: Remove `rounded-md` from node containers. Set `rx={0}` on SVG edge label rects and stage region rects.
- Command: `/impeccable polish`

**[P2] No edge-type legend — users must already know the encoding**
- Four edge types rendered with no key anywhere on the page.
- Fix: Add compact legend in toolbar area — four rows with sample line + color + label.
- Command: `/impeccable clarify`

**[P2] Spectral gradient absent from the canvas entirely**
- The system's activation signal doesn't appear in the most interactive surface on the page.
- Fix: Apply spectral gradient to trace-active state (animated dot, edge glow, ping ring) instead of flat `#4f46e5`.
- Command: `/impeccable animate`

**[P3] Stage region corners use `rx={12}`**
- Structural containers should use `rx={0}`.
- Command: `/impeccable polish`

### Persona Red Flags

**Alex (Power User):** No edge legend, no keyboard shortcut for simulation, 6-color tiling competes for attention while tracing latency paths.

**Sam (Accessibility):** Subsystem differentiation is color-only. Animated trace dot has no aria-label. Canvas has no aria announcement for simulation state changes.

**Vox Technical Evaluator:** Six competing colors read as chaotic rather than "we have this under control." Pink/amber feel unplanned against the rest of the page's clinical precision.

### Minor Observations

- `bg-gray-50` and `bg-gray-200` in toolbar are not system tokens; use `bg-[#f7f7f7]` / `bg-[#eeeeee]`.
- HUD quotes caller utterance in `font-serif` — system uses no serif fonts.
- Inspector close button uses `rounded` — should be `rounded-none`.
- SIMULATE button uses `bg-emerald-50` at rest — should use standard secondary button style at rest.
