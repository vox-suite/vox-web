# Vox web

Next.js App Router application for the Vox public website and standalone consumer account. Tailwind CSS v4 provides the semantic theme; reusable components provide the page design.

## Develop

Node.js 22.12+ is required.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

The website is at http://localhost:3000.
Local consumer sign-in is at `/app/sign-in`. See `docs/consumer-auth.md` for the
database migration, Core registration, callback, rollout, and rotation runbook.

```sh
npm test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:e2e:consumer   # consumer app happy paths on the fixture harness (tests/fixtures/consumer-app)
```

Browser tests start isolated servers on 3100 and 3101 with synthetic identities and data. They exercise encrypted sessions through the real authentication boundary. No production authentication bypass exists. Tests do not complete a real Google OAuth exchange.

## Application structure

- `src/app`: routes and layouts. Page files compose components; lint rejects `className` and inline `style` in pages.
- `src/app/globals.css`: Tailwind theme variables, native element defaults, component styling and responsive behavior.
- `src/components/ui`: shared layout, controls, feedback, cards, tables and typography.
- `src/components/marketing`: public website sections and illustrative conversation preview.
- `src/app/app/(workspace)`: the signed-in consumer app (app.voxagent.in). One layout resolves the session and renders the sidebar shell; each page renders a feature screen.
- `src/features/<domain>`: consumer features. `api.ts` holds typed calls to `/api/account/*`, `queries.ts` holds TanStack Query keys, queries and mutations, and `components/` holds the UI.
- `src/components/app`, `src/components/app-shell`: consumer app primitives and the responsive sidebar shell. They are kept separate from `src/components/ui`, which the public website also uses.
- `src/lib/api/http.ts`, `src/lib/query`: the single HTTP client (error normalization) and the QueryClient defaults (a 401 returns the user to sign-in).
- `src/lib/consumer-auth`: the server-only consumer auth, Core host, account authority, email, and session boundary.
- `src/proxy.ts`: consumer host routing, rate limiting and private/no-store response headers. It is not the authorization boundary.

## Production activation

See `docs/deployment.md` for exact Google callback, domain mapping and backend routing. This source change alone does not provision a domain or enable production sign-in.

| Variable                        | Purpose                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                                                                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for browser/server auth                                                  |

Web instances are stateless; there is no local session database. Signing out clears the Supabase session cookies.
