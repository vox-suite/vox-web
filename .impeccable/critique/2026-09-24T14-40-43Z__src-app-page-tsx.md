---
target: vox-web landing page
total_score: 17
max_score: 32
na_heuristics: 7,9
p0_count: 2
p1_count: 3
target_identity: "file:/Users/rahul/Documents/vox/vox-web/src/app/page.tsx"
target_fingerprint: "sha256:0db53b4c11e9ef81e07d6ab115f1d3e92b9cf70faa370e3e877b3f2c51090de9"
target_path: /Users/rahul/Documents/vox/vox-web/src/app/page.tsx
timestamp: 2026-09-24T14-40-43Z
slug: src-app-page-tsx
---
# Critique: vox-web landing page (src/app/page.tsx)
Method: dual-agent. Score 17/32 (n/a: 7, 9). Scores: H1 3, H2 2, H3 2, H4 2, H5 3, H6 2, H8 1, H10 2.

Verdict: Raycast clone (macOS window, ⌘ hints, #ff6363). Nothing phone/call/WhatsApp. Copy is strong and Vox-specific; visuals generic.
Detector: CLI clean (25 advisory design-system-font-size: 10/11/13px). Overlay 36: nested-cards 15, undersized-ui-text 6, line-length 6, tiny-text 4, thin-border-wide-shadow 2, dark-glow 1, pulsing-dot 1, overused-font 1.

## Priority issues
- [P0] globals.css:188-198 --spacing-N tokens override Tailwind scale (md:px-8=8px, mt-8=8px, pb-32=32px, py-16=16px, size-24=24px). Fix: delete lines. → layout
- [P0] Horizontal overflow: hero glow sections.tsx:410, section :403 lacks overflow clip. 1678px @1440, 477px @390, Sign in clipped. Fix: overflow-x-clip. → adapt
- [P1] Double borders: --shadow-subtle-3 / --shadow-key-window include 0 0 0 1px white/.25 ring stacked on border-border-edge; 22 elements doubled, 64 bordered total. Fix: drop ring + card borders, separate by fill + inset top highlight; ~8 hairlines total. → quieter, distill
- [P1] Hero mockup off-story (macOS/⌘ for a phone product) + accidental text-center from :415. Fix: phone-native call/WhatsApp/callback timeline. → shape, bolder
- [P1] Unbacked claims vs PRODUCT.md: 99.4% (:332), <180ms x4, v1.104.21, curl install.sh, hard-coded stale latestReleaseIds (:190). Fix: remove, derive from CHANGELOG_DATA. → clarify

## Personas
Mobile exec: sideways scroll, no nav <1024, 10,284px page, ⌘ hero, no "how do I get the number". Skeptic: unbacked numbers, version mismatch, "Rahul" test data. Mobile: pill strip overflow, 20px footer tap targets, demo persona card hidden <lg.

## Minor
Blue+coral glow reads maroon; move to crimson #b3262e–#d7373f w/ #e5484d→#8e1c22 specular, drop blue. H1 Inter 56/400 vs spec 64/600. Mono overuse. Uniform 120px sections. Green 3rd accent. Smoke token drift. Loop told 5x.
