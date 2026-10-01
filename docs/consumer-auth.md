# Consumer authentication operations

Supabase Auth is the consumer identity and session provider. The Web server verifies
cookies with `auth.getUser()` for every protected page and account route. Cookie
claims, browser-supplied user IDs and matching email addresses never determine the
Core subject. Anonymous Supabase users do not receive consumer access.

## Configuration

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public project
  configuration. Never supply a service-role key to the browser.
- Configure Google OAuth, email OTP delivery, redirect allowlists and session
  policy in Supabase. The Web callback is `/auth/callback`; register the exact
  production origin `https://app.voxagent.in` with the provider.
- Register Web as a Core host in `vox.standalone.deployment`. Store only these
  server variables: `VOX_CORE_URL`, `VOX_HOST_CREDENTIAL_ID`, `VOX_HOST_AUDIENCE`,
  `VOX_HOST_SECRET`. The expected host audience is
  `vox-host:vox.standalone.deployment:vox-web`.
- Every Core request signs `vox-account:<verified Supabase user UUID>` as the
  host user. Core resolves its own isolated user context; a Supabase UUID is not
  a Core context ID. No Web-owned auth database, SMTP client, Ed25519 signing
  key or separate recovery-enrollment API is required.

## Identity and session behavior

Google sign-in, email OTP verification, explicit identity linking and local/global
sign-out use the Supabase SDK. Supabase owns identity-linking and email-recovery
policy, token lifetime, revocation and delivery limits. Web does not claim a
separate recovery enrollment or enforce a distinct provider identity policy.
Supabase documents automatic same-email OAuth identity linking. That conflicts
with Vox's accepted explicit dual-proof linking requirement and remains a launch
architecture gate; the manual-linking setting does not establish that automatic
linking is disabled. Resolve and test the provider boundary before public sign-in.
See [Supabase identity linking](https://supabase.com/docs/guides/auth/auth-identity-linking).

Consumer access does not grant administrator access. Administrator routes
independently require a verified superuser. Login identity linking grants no
external-service connection, assistant access or approval authority. Core enforces
these independently at its signed host boundary.

## Verification and release

Run `npm test`, `npm run lint`, `npm run build` and
`npm run test:e2e:consumer`. The consumer fixture uses the real Supabase client
against a local fake authentication service and a stateful Core fixture; it is
not evidence of production provider availability or Core host readiness.

Before releasing a new account-feature UI, verify an actual signed-in account
can retrieve its owned assistants, reviewed catalog and agent memory through
Web and the deployed Core. Verify revoked sessions, rejected host credentials,
Core downtime and foreign-origin mutation rejection. Live OAuth install,
consent, grants, read and revoke need separate provider evidence.

Removing the former Better Auth implementation does not delete an existing
`vox_web_auth` database schema or revoke its historical data automatically.
No live database mutation or credential rotation is part of this code change.
