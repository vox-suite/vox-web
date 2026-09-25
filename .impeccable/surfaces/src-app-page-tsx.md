---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/components/marketing/sections.tsx","src/components/marketing/shell.tsx","src/components/marketing/demo.tsx","src/components/marketing/blueprint-frame.tsx"]
---

# Landing page (/) — surface brief

Mode: Persuade. Audience: founders/execs skimming on a phone between meetings. Action: Request access (/request-access). Proof: illustrative call transcript + changelog-derived releases; no benchmarks, no invented numbers, no fake customer logos.

## Direction contract

THESIS: Vox as a precision instrument you keep in your pocket, read through the site's dark Raycast/blueprint token system, but carrying the fuller pre-existing marketing information architecture (hero, proof line, follow-through steps, capability cards, live demo, story, principles, releases, closing, watermark footer) rather than a single compressed bento block. Refuses both the earlier crimson/machined-hardware direction and the intermediate Selecta-style 3-card bento reduction recorded here previously — both superseded by an explicit user-pinned brief: reuse the exact structure/copy that shipped at commit `ea265e7`, repainted in the site's current dark token system, with every sign-in/login affordance removed from the public marketing shell.

OWN-WORLD: Void Black canvas (#040506) with Ink/Obsidian/Graphite surfaces, Slate/Line hairlines (#2f3031 / #232427), Coral Pulse (#ff6363) reserved for live/voice/brand accents, Electric Sky and Success Green as the only other accent hues (no purple/amber/rainbow per-item tinting). Construction-grid framing: continuous vertical guide rules at the 1200px column edges (`BlueprintFrame`, now wrapping the whole `<main>`), diagonal-hatch gutters outside it, a faint dot-grid behind the hero, small `+` corner ticks where a section meets the guides. Sections that list parallel items (4-step follow-through, 6 capability cards) render as one hairline-bordered matrix, not a gapped card grid. Funnel Display headings, Inter body, Geist Mono for telemetry/labels only. No gradient text, no kicker badges where the ported structure didn't have one (follow-through/capabilities/story/principles use a plain heading, no eyebrow pill).

STORY: Call or message Vox → it acts on the spot → work keeps moving after hang-up, made concrete through the 4-step call path, 6 real capability cards, a 3-panel live demo, and a "the work continues after you hang up" story beat. Visitor believes the follow-through and requests access.

FIRST VIEWPORT: Two-part eyebrow (`VOX` pill + "the assistant you can call") → two-line headline "Your chief of staff, / on speed dial." (white / solid ash, no gradient) → subhead → dual CTA (`Request access` primary, `See how Vox follows through` secondary, anchors to #follow-through) → a bordered proof-line pill (3 capability phrases, one accent hue each) → the existing dithered dot-matrix ring asset (`public/artwork/signal-ring.svg`, already neutral grayscale, no recolor needed) as the hero graphic.

Below the fold, in order: capabilities proof line (4 items, no fake logos) → follow-through 4-step bordered grid (#follow-through) → 6-card capability grid (#capabilities) → 3-panel live demo (tabs / VoxLogo voice-orbit / transcript) → story split (copy + follow-up-card preview) → principles split (fingerprint art + 3 numbered principles, #principles) → changelog-driven releases → closing CTA → footer (Discover/Vox link columns only, no Sign In or Administration column) → giant lowercase "vox" watermark, near-black with a Coral Pulse hover gradient.

FORM: Ported information architecture from commit `ea265e7`'s marketing page (`vox-web/src/components/marketing/{sections,shell,demo}.tsx` as they existed then), rebuilt against the current dark token system and current Tailwind-in-JSX idiom rather than that commit's separate light-mode global CSS classes — shaped directly per new-work.md's narrow, precisely-specified-request exception, no concept-seed roll.

FINISH: shipped 2026-09-25 against two rounds of user-pinned direction (first: dark blueprint reskin of a competitor screenshot's layout; second, superseding it: restore the ea265e7 structure/copy with current colors, remove all sign-in surfaces). Verified in-browser at mobile/desktop widths, `npm run lint` and `npm run build` clean, and against the mechanical design detector (`impeccable detect`, zero findings) in an unattended single-pass build, not the full comp-led/finish-reviewer pipeline. A fresh-eyes finish review and structured screenshot diff have not run — treat this FINISH line as open if that formal pass is wanted later.
