# Vox

**Your life, one call away.**

A responsive coming-soon landing page for Vox's vision: a personal AI assistant for everyday tasks, life patterns, connected devices, and financial organization, reached through a simple phone call.

## Development

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Vite prints the local URL (normally http://127.0.0.1:5173).

```sh
npm run lint
npm run build
npm run preview
```

## Stack and structure

- React 19, TypeScript, Vite 6, Tailwind CSS v4 via `@tailwindcss/vite`.
- Locally bundled Manrope variable font and Lucide icons.
- `src/App.tsx`: landing page and selectable capability examples.
- `src/components/VoiceOrb.tsx`: original, decorative CSS orb.
- `src/index.css`: Tailwind import, theme tokens, responsive styles, animation and reduced-motion behavior.
- `public/vox.svg`: brand favicon.

No API keys, backend, analytics, microphone access, or account connection. The examples are illustrative and no real calls or tasks are performed. Privacy statements describe design intentions.

## Deployment

Ready to import into Vercel as a Vite project:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci`
- No environment variables required.

Hosting and domain configuration are separate from repository creation. No production site has been deployed by this setup.

## Design references

The supplied orb-ui screenshot guides the dark surfaces, two-column hero, typography, and voice visual. The original orb implementation is visually informed by these 21st.dev references; no third-party component source was copied:

- [21st.dev voice orb collection](https://21st.dev/community/components/explore/voice-orb)
- [Siri Orb by Umair Waheed](https://21st.dev/@m.umairwaheedansari/components/siri-orb)
- [Voice Powered Orb by Isaiah](https://21st.dev/@isaiahbjork/components/voice-powered-orb)
- [Tailwind v4 with Vite](https://tailwindcss.com/docs/installation/using-vite)

## Verification

Production build and ESLint pass. Browser checks cover desktop (1440px), tablet (768px), mobile (390px), narrow mobile (320px), capability selection, keyboard activation, pause/resume, and reduced motion. An axe-core WCAG 2 A/AA and 2.1 AA scan found zero violations on the checked desktop and mobile states. Automated checks do not replace assistive-technology testing.

Local screenshots are kept in the ignored `artifacts/` directory.
