# Vox administration implementation plan

**Goal:** Deliver the approved Next.js redesign and extensible, Google-protected administration UI.
**Architecture:** Shared semantic UI components compose public and protected management pages. Next.js authenticates Google users and proxies authorized Redis reads to a dedicated Core admin API on the backend private network.
**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, NextAuth, Rust/Axum/Redis.
**Spec:** docs/superpowers/specs/2026-09-14-admin-design-system.md

## Global constraints
- User requested autonomous completion. Execute inline in feature branches; leave reviewable working changes.
- Pages use shared components without page-specific styling.
- Google verified identity plus exact allowlist; fail closed when unconfigured.
- Read-only Redis access; bounded previews and cursor pagination; no browser-side secrets.

## Tasks
- [x] Migration and design system: replace Vite entry/config with App Router, PostCSS and Next configuration; define tokens and semantic defaults in src/app/globals.css, reusable primitives in src/components/ui, public shell and feature sections in src/components/marketing. Verify lint/build and public browser rendering.
- [x] Authentication: write tests for missing/unauthorized/unverified identities, exact email allowlisting, same-origin redirects and host routing; implement src/lib/access.ts, src/lib/auth.ts, src/proxy.ts and login route. Verify denied requests and redirects without credentials.
- [x] Redis boundary: write Core route tests for missing/wrong tokens, malformed cursors, unavailable Redis and actual bounded reads. Implement src/http/admin.rs and reusable Redis connection with a dedicated token; expose no mutation methods. Next.js data routes validate input and recheck sessions before forwarding with no-store and a timeout.
- [x] Management UI: overview, searchable cursor-based Redis explorer with detail/empty/error states, component reference and module registry. Build a generator for future pages and document one consistent composition pattern. Browser-test with isolated fixture data and never add an auth bypass to production.
- [x] Verification and operations: run npm tests/lint/build, Rust focused tests and available regression checks; inspect desktop/mobile screenshots and accessibility. Document environment variables, OAuth callback, domain setup and protected backend routing. Record exact external activation steps still outstanding.

## Verification record

- Next.js production build and ESLint pass. Seven unit tests pass, including exact authorization, callback routing, cursor validation and page generation.
- Ten desktop/mobile Playwright cases pass, including accessibility scans, signed-session denials, Redis search/pagination/detail/error recovery, sign-out and Google OAuth initiation. Real Google consent/callback completion requires owner credentials.
- Core regression tests pass with existing PostgreSQL integration tests remaining opt-in. Five dedicated admin tests pass against an isolated Redis 8 container, covering all supported native data types and bounded string reads.
- Inspected full-page screenshots of home, admin overview, Redis and component reference. Fixed decorative overflow and text contrast found by browser checks.
- Live activation is not performed: Google credentials, approved superuser identity, production admin token, HTTPS backend route and hosting/DNS mapping remain external configuration.
