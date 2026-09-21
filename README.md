# Vox web

Next.js App Router application for the Vox public website and Google-authenticated superuser workspace. Tailwind CSS v4 provides the semantic theme; reusable components provide the page design.

## Develop

Node.js 22.12+ is required.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

The website is at http://localhost:3000. Local administration is at `/admin`. Without authentication configuration, the login page explains that setup is incomplete and every management data request is denied.

```sh
npm test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser tests start isolated servers on 3100 and 3101 with synthetic identities and data. They exercise encrypted sessions through the real authentication boundary. No production authentication bypass exists. Tests do not complete a real Google OAuth exchange.

## Application structure

- `src/app`: routes and layouts. Page files compose components; lint rejects `className` and inline `style` in pages.
- `src/app/globals.css`: Tailwind theme variables, native element defaults, component styling and responsive behavior.
- `src/components/ui`: shared layout, controls, feedback, cards, tables and typography.
- `src/components/marketing`: public website sections and illustrative conversation preview.
- `src/components/admin`: navigation, management features and sign-in controls.
- `src/lib/admin-modules.ts`: management navigation registry.
- `src/lib/auth.ts`: Google authentication and per-request superuser authorization.
- `src/lib/core-admin.ts`: server-only connection to the protected Core admin API.
- `src/proxy.ts`: admin subdomain routing and private/no-store response headers. It is not the authorization boundary.

## Add a management page

```sh
npm run generate:page -- schedules "Schedules"
```

This creates a protected page and registers navigation. Every management module lives inside `src/app/admin/(console)` and inherits `AdminShell`. Compose `Page`, `Card`, `Stack`, `Grid`, `Field`, `DataTable`, `Notice`, and `EmptyState`; see `docs/design-system.md`. New modules should add domain-specific components below this layer only when needed. Do not build new navigation, permission checks, spacing scales or button styles per page.

Call `requireSuperuser()` in server pages that retrieve data. Every new API handler or server action must independently authorize the current session, even though the layout is protected. Keep backend credentials in server-only modules. Add resource-specific authorization if non-superuser roles are introduced later.

## Production activation

See `docs/deployment.md` for exact Google callback, domain mapping and backend routing. This source change alone does not provision a domain or enable production sign-in.

| Variable               | Purpose                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| `NEXTAUTH_URL`         | `https://admin.voxagent.in` in production; `http://localhost:3000` locally                         |
| `NEXTAUTH_SECRET`      | Cryptographically random session secret, at least 32 bytes; identical across web instances         |
| `GOOGLE_CLIENT_ID`     | Google OAuth web application client ID                                                             |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret, server-only                                                            |
| `SUPERUSER_EMAILS`     | Comma-separated exact email allowlist; no domain wildcards; empty denies everyone                  |
| `VOX_CORE_ADMIN_URL`   | HTTPS origin routing `/v1/admin/redis` to Core; loopback HTTP is accepted locally                  |
| `VOX_ADMIN_TOKEN`      | Dedicated shared admin credential, also configured in Core; separate from the normal service token |

Redis stays on the backend private network. Web instances are stateless; there is no local session database or in-memory authorization cache. Changes to the allowlist apply on subsequent requests after environment configuration is rolled out. Signing out clears the browser cookie; rotate the shared secret to invalidate all sessions immediately.

## Redis explorer behavior and limits

The Core API uses `SCAN` with a count hint of 100, a reused/reconnecting multiplexed Redis connection, eight concurrent admin requests per Core instance and a four-second request timeout. The web proxy has a six-second timeout. The explorer does not call `KEYS`, load the complete keyspace, offer arbitrary Redis commands, or mutate entries.

`SCAN` is not a snapshot and count is a hint: pages may be empty, duplicate keys can appear across pages, and entries may disappear between listing and inspection. The UI preserves the cursor as a string to avoid JavaScript integer rounding. Previous pages are rescanned. Refresh starts from cursor zero. Searches use Redis glob patterns.

Previews are atomic read-only Lua scripts (`EVAL_RO`, Redis 7+). Strings are limited to 64 KiB. Collection previews use bounded samples with a total raw string budget of 64 KiB and a 2 KiB per-value limit. Hashes/sets sample their first scan batch, lists/sorted sets show their first 40 members, and streams show their first 20 entries. JSON formatting is best-effort, and truncated content is explicitly marked. Keys must be UTF-8; detail requests accept 1–1,024 bytes without control characters. Binary value bytes are displayed lossily. Redis Cluster is not supported by this standalone-Redis reader.

Authorization is checked server-side for every management request. Redis responses and admin pages are private/no-store. Data is not persisted to browser storage. The application does not log Redis values, keys or tokens; configure reverse-proxy access logging to omit query strings on admin endpoints as described in the deployment guide.
