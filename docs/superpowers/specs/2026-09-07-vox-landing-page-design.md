# Vox landing page design

## Purpose

Create a public landing page for Vox, an AI assistant that people can reach through a simple phone call. The page should communicate the long-term vision clearly without implying that unfinished capabilities are already available.

## Product story

Vox is envisioned as a single conversational interface for everyday life. A person calls Vox and asks it to complete tasks, understand useful patterns in their life, control connected devices, or help organize financial activity.

The central promise is:

> Your life, one call away.

Supporting copy will describe Vox as an assistant that can eventually coordinate the tools and services a person already uses. Financial language will emphasize organization, analysis, and assistance rather than autonomous investment decisions or guaranteed outcomes.

## Audience

The initial audience is curious early adopters encountering Vox for the first time. The page must explain the idea in plain language within a few seconds and establish a sense of trust.

## Information architecture

The site is a single responsive page containing:

1. A compact navigation header with the Vox wordmark.
2. A hero built around the headline “Your life, one call away,” a concise explanation, and a voice-orbit visual.
3. A vision section explaining why a phone call is the interface.
4. Four capability areas: everyday tasks, life patterns, connected devices, and financial organization.
5. A short three-step explanation: call, speak naturally, and let Vox coordinate the work.
6. A privacy statement emphasizing user control and careful handling of personal context.
7. A restrained “Coming soon” closing section and footer.

There will be no signup form, pricing table, testimonials, fake customer metrics, or buttons that pretend to perform unavailable actions.

## Visual direction

The design should feel like a calm, dependable companion rather than a conventional SaaS template or a dramatic science-fiction interface.

### Color system

- Midnight: `#07111F` — primary background
- Deep navy: `#0D1B2E` — layered surfaces
- Signal blue: `#5AA9FF` — active voice and focus accent
- Mist: `#DCEBFA` — primary text
- Slate: `#8FA6BE` — supporting text
- Clear white: `#F7FBFF` — high-emphasis details

### Typography

Use a characterful, contemporary sans-serif for display text and a highly legible sans-serif for body copy. Font files should be loaded efficiently, with system fallbacks and minimal weight variants. Headlines will remain sentence case and left-aligned.

### Signature element

The hero’s memorable element is a restrained voice-orbit visualization: concentric paths and a responsive signal line suggesting that a spoken request can reach different parts of a person’s life. It should be built with lightweight HTML/CSS or SVG, not a large animation library.

### Layout

The desktop hero uses an asymmetric two-column composition, with the story on the left and the voice-orbit visual on the right. Later sections use varied editorial layouts rather than repeated identical cards. On mobile, content collapses into a clear single-column reading order.

## Interaction and motion

Motion is limited to one coordinated hero entrance and subtle signal movement in the voice visualization. All animation must stop or simplify when the user prefers reduced motion. Keyboard focus must be clearly visible.

## Technical architecture

- React with TypeScript and Vite
- A small component structure organized around meaningful page sections
- Plain CSS with design tokens; no component library or animation dependency
- Static deployment on Vercel
- Semantic HTML, responsive images only if imagery is introduced, accessible contrast, and descriptive labels for decorative visuals
- Metadata for title, description, social sharing, favicon, and theme color

The repository will be created at `/Users/rahul/Documents/vox-web` and published as the private GitHub repository `vox-suite/vox-web`.

## Quality and verification

Before publishing:

- Install dependencies from a lockfile.
- Run the production build and lint checks.
- Inspect the rendered page at desktop and mobile widths.
- Check keyboard navigation, reduced-motion behavior, overflow, and contrast.
- Confirm that the GitHub repository contains no secrets or local environment files.
- Confirm that the repository default branch is pushed and ready for Vercel import.

## Out of scope

- Authentication or user accounts
- A working voice call interface
- Agent dashboard
- Backend or Oracle integration
- Payments or financial transactions
- Analytics and tracking
- Blog, documentation, or CMS
