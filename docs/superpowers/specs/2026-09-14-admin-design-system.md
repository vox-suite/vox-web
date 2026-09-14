# Vox web and administration

Approved in conversation on 2026-09-14. Execute autonomously; no further approval gates.

Migrate the existing single-page Vite site to Next.js App Router and Tailwind CSS v4. Preserve Vox's phone-assistant positioning with honest illustrative examples. Match the supplied Sarvam reference through airy white surfaces, an orange/lavender hero wash, centered editorial headings, rounded panels and dark pill actions. Do not copy Sarvam claims, assets or customers.

Use semantic theme tokens, global element defaults, typed reusable layout and control components. Page files compose components without className or inline style. Provide a component reference and page generator that creates a consistently styled admin page and navigation registration. Admin modules share a protected route-group layout; every data endpoint independently checks authorization.

Google OAuth uses verified Google identity, encrypted session cookies, an explicit server-only superuser email allowlist and per-request authorization. Empty configuration denies access. No inferred administrator identity. admin.voxagent.in routes to the administration surface; localhost supports /admin. Redis is read-only with cursor-based SCAN, key metadata, bounded previews, timeouts, no caching and explicit errors. Browser requests go through authenticated Next.js endpoints; a separately authenticated Core endpoint reads Redis over its private network. No Redis credentials or backend service credentials go to browsers. Other management modules can reuse this boundary.

Public routes: home, privacy. Admin routes: login, overview, Redis, design system. Shared loading, missing-page and error views. Future modules register in one navigation definition; server authorization remains mandatory.

Production activation needs Google OAuth client credentials, session secret, an explicit superuser allowlist, a dedicated Core admin token, HTTPS routing to Core admin endpoints and DNS/Vercel mapping for admin.voxagent.in. Never expose Redis publicly. Implementation does not imply live deployment.

Verify production build, lint, security tests, Core endpoint tests with an isolated Redis process where available, browser layouts at desktop and mobile, keyboard/form interactions and unauthenticated API denial.
