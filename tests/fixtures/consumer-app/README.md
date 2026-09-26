# Consumer app fixture

Runs the real consumer app (`/app`, `/api/account/**`) locally as a synthetic, signed-in consumer with realistic data. The app code has no bypass. Its own checks run unchanged:

- `currentConsumer()` calls Supabase `auth.getUser()` through `@supabase/ssr`. That call goes to a **fake Supabase Auth server** (`supabase-auth.mjs`, port 54321).
- Every `/api/account/*` route calls `getCoreHostClient()`, which sends signed requests to a **stateful mock Vox Core** (`core.mjs`, port 3201).
- `next dev` runs on `http://127.0.0.1:3200` with consumer auth enabled (`run.mjs`).

## Start

```sh
npm run dev:consumer-fixture
# same as: node tests/fixtures/consumer-app/run.mjs
```

Wait for Next to print `Ready`. Press Ctrl-C to stop everything; the launcher kills the `next dev` process group too.

You can override the ports with `CONSUMER_FIXTURE_APP_PORT`, `CONSUMER_FIXTURE_AUTH_PORT` and `CONSUMER_FIXTURE_CORE_PORT`. Set `CONSUMER_FIXTURE_QUIET=1` to hide the mock request logs. Keep the auth host `127.0.0.1`, because the cookie name is derived from it (see below).

## Sign in

The default synthetic user is **Asha Raman `<asha.raman@example.test>`**, id `5f0c8a4e-2b1d-4c3a-9e7f-1a2b3c4d5e6f`, provider `google`. Any other email also works: its id is derived deterministically from the email, and Core seeds that user's data on first use.

### Browser (manual)

- Open `http://127.0.0.1:54321/fixture/sign-in?next=/app`. You can add `&email=someone@example.test&name=Some%20One`. The fake auth server sets the session cookie for host `127.0.0.1` (cookies ignore ports) and redirects you to the app.
- Or use the real sign-in form at `http://127.0.0.1:3200/app/sign-in`: enter any email, then code `123456` (override with `CONSUMER_FIXTURE_OTP_CODE`).
- Google OAuth and identity linking are not implemented.

### Cookie details

`@supabase/ssr` 0.12.7 builds the cookie like this:

- **Name:** `sb-<first label of the Supabase URL hostname>-auth-token`. For `http://127.0.0.1:54321` that is `sb-127-auth-token`.
- **Value:** `"base64-" + base64url(JSON.stringify(session))`. The session is `{access_token, token_type, expires_in, expires_at, refresh_token, user}`.
- **Chunking:** a value longer than 3180 characters is split into `sb-127-auth-token.0`, `.1`, and so on. The fixture session is about 3.3 KB, so it arrives as **two chunks**. Always set every cookie the helper returns.
- **Tokens:** the access token is an HS256 JWT signed by the fixture, valid for 8 hours by default. It stays valid across fixture restarts. When it is within 90 s of expiry, `auth-js` refreshes it through `POST /auth/v1/token?grant_type=refresh_token`. Sign-out (`POST /auth/v1/logout`) revokes the token in memory, so `getUser()` fails and the app sees you as signed out.

To mint a cookie from the command line:

```sh
F=tests/fixtures/consumer-app/supabase-auth.mjs
node $F cookie                                # "Cookie:" header value (default user)
node $F cookie --email ravi@example.test --name "Ravi K" --provider email --ttl 3600
node $F cookie --format playwright            # JSON array for context.addCookies
node $F cookie --format json                  # cookies + user + raw session
```

To use it with curl:

```sh
C=$(node tests/fixtures/consumer-app/supabase-auth.mjs cookie)
curl -H "Cookie: $C" http://127.0.0.1:3200/api/account/reminders
curl -H "Cookie: $C" -H 'content-type: application/json' \
  -d '{"title":"Check tomorrow","instruction":"Summarise my calendar for tomorrow","agent_external_key":"saathi"}' \
  http://127.0.0.1:3200/api/account/tasks
```

### Playwright

```ts
import { test, expect } from "@playwright/test";
// @ts-expect-error -- plain ESM fixture module
import { playwrightCookies } from "../fixtures/consumer-app/supabase-auth.mjs";

test.use({ baseURL: "http://127.0.0.1:3200" });

test("signed-in consumer sees the app", async ({ context, page }) => {
  await context.addCookies(
    playwrightCookies({
      email: "asha.raman@example.test",
      fullName: "Asha Raman",
    }),
  );
  await page.goto("/app");
  await expect(page.getByText("asha.raman@example.test")).toBeVisible();
});
```

`playwrightCookies()` returns objects shaped `{name, value, domain: "127.0.0.1", path: "/", httpOnly: false, secure: false, sameSite: "Lax", expires}`. The module also exports these helpers:

- `mintSession(user)`
- `sessionCookies(session, supabaseUrl)`
- `cookieHeader(user)`
- `storageKeyFor(url)`
- `DEFAULT_USER`

The existing `playwright.config.ts` targets port 3100 and the older fixtures. For these tests, either start `npm run dev:consumer-fixture` yourself and point `baseURL` at `http://127.0.0.1:3200`, or add a `webServer` entry that runs `node tests/fixtures/consumer-app/run.mjs` with `url: "http://127.0.0.1:3200/app/sign-in"`.

## Seeded data (per user, lazily)

| Area        | Seed                                                                                                                                                                                                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agents      | `saathi` (default), `concierge`                                                                                                                                                                                                                                        |
| Connections | `conn_gcal_primary` google-calendar **authorized** (`calendar.events.read/write`), `conn_uber_rides` uber **authorized** (`uber.trips.read`, `uber.rides.request_handoff`), `conn_expedia_travel` expedia **expired**                                                  |
| Grants      | saathi → gcal `calendar.events.read`, saathi → uber `uber.trips.read`                                                                                                                                                                                                  |
| Reminders   | `rem_vitamin_d` scheduled for tomorrow 08:00 IST; `rem_call_landlord` scheduled 3 h in the past (shows as **missed**); `rem_water_plants` recurring `delivered_to_channel` (2 deliveries); `rem_pay_electricity` `failed` (1 failure delivery)                         |
| Preferences | `seat_preference`, `favourite_cuisines`, `reminder_channel`, and the sensitive, confirmed `allergies`                                                                                                                                                                  |
| Skills      | `skill_morning_brief` curated, installed v2, enabled; `skill_trip_planner` curated, installed v2 with v3 available; `skill_private_grocery` private, available (not installed). The concierge agent has morning-brief turned off                                       |
| Extensions  | `ext_notion_workspace` active, conformance passed, consented; `ext_splitwise_direct` quarantined, consent_required, conformance pending                                                                                                                                |
| Tasks       | `task_seed_weekend_plan` waiting_for_approval; `task_seed_calendar_digest` completed. New tasks move from queued to running after 2 s, then to completed after 8 s. If the instruction mentions book, buy, pay or order, the task goes to waiting_for_approval instead |
| Proposals   | `prop_seed_goa_stay` pending. Approval must echo the exact `details`, otherwise it returns 409                                                                                                                                                                         |
| Journeys    | 6 Uber trips; 5 lodging properties (Goa ×2, Jaipur, Bengaluru, Mumbai); existing booking `bk_seed_jaipur` (refundable)                                                                                                                                                 |

## Mock Core control routes (fixture-only)

```sh
curl http://127.0.0.1:3201/health
curl "http://127.0.0.1:3201/__fixture/state?host_user_id=vox-account:5f0c8a4e-2b1d-4c3a-9e7f-1a2b3c4d5e6f"
curl -X POST http://127.0.0.1:3201/__fixture/reset                    # drop all state; reseeds on next request
curl -X POST -d '{"authorization_state":"authorized"}' http://127.0.0.1:3201/__fixture/connections/conn_expedia_travel/state
curl -X POST -d '{"state":"failed","wait_reason":null}' http://127.0.0.1:3201/__fixture/tasks/<task id>/state
```

## Limitations

- **No Postgres.** `VOX_WEB_DATABASE_URL` points at `127.0.0.1:1`. The runtime constructs the `pg` Pool and Better Auth, but the pool connects lazily and no Core-backed `/api/account/*` route queries it. You will see one harmless log line at startup: `[Better Auth]: Could not validate the database schema`. These routes need the database and will fail:
  - `/api/account/recovery/start` and `/api/account/recovery/confirm`
  - `/api/account/auth/[...all]` (Better Auth)
  - anything that calls `ConsumerAccountAuthority`
- **Host assertions are not verified.** The mock Core only requires the `X-Vox-Host-Credential` header plus a `vox-account:` host user id. It does not check the HMAC signature or the federated proof.
- **Lodging accepts any authorized connection.** Search, book and cancel accept any _authorized_ connection the user owns, whatever its integration. The seeded Expedia connection is expired on purpose, so use `conn_uber_rides` or re-authorize Expedia through the control route. Uber reads require the uber connection **and** a `uber.trips.read` grant for the agent.
- **Connection setup never completes.** Starting a connection (`POST /api/account/connections`) creates a `pending` connection with a fake authorization URL. The app's callback route returns 503 by design.
- **State is in memory only.** Core state and sign-out revocations are lost on restart. Minted cookies survive restarts because the tokens are stateless JWTs.
- **Scope and dev-server limits.** Global sign-out revokes every token of that user minted up to that moment. `scope=others` is a no-op. Only one `next dev` can use this checkout's `.next` directory at a time, so stop other dev servers first.
