# Vox landing page implementation plan

Goal: Build and publish a responsive, coming-soon Vox landing page.
Architecture: Static React page with an isolated decorative orb and interactive example selector. Tailwind v4 through the official Vite plugin, local fonts, CSS animation, no backend.
Spec: ../specs/2026-09-07-vox-landing-page-design.md

The user's latest direction supersedes plain CSS and the earlier navy palette: use Tailwind v4 and the supplied orb-ui screenshot, with 21st.dev components as visual references. Preserve the existing product story and coming-soon boundaries.

- [x] Build: package.json, Vite/TypeScript/ESLint configuration, src/main.tsx, src/App.tsx, src/components/VoiceOrb.tsx, src/index.css, public/vox.svg, index.html. Hero, vision, capability example selector, three steps, privacy principles, coming soon. Use semantic buttons and anchors, local fonts, reduced motion and a motion toggle.
- [x] Verify: production build and lint; browser desktop/mobile/320px overflow; keyboard navigation and example selection; reduced motion; automated accessibility audit. Fix identified issues before publishing.
- [x] Publish: README with local commands and reference links; commit app; create private vox-suite/vox-web and push main; verify visibility, branch and clean working tree; open local preview.

Design tokens: Ink #080a0c, Surface #101317, White #f4f6fa, Muted #a1a7b0, Signal #a9ceff, Line #24282e. Manrope variable for all text; restrained mono for example metadata. Left-aligned asymmetric hero; one unified example panel instead of a grid of feature cards. Orb is the sole ambient motion. Financial and privacy capabilities are stated as intentions, not existing guarantees.
