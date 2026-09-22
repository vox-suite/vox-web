# Consumer authentication operations

Vox consumer authentication is an independent trust boundary from the
administrator login. Better Auth owns consumer users and database-backed
sessions in the `vox_web_auth` PostgreSQL schema. NextAuth continues to own the
administrator session. Their secrets, Google clients, callback paths, cookie
names, and authorization helpers are deliberately separate.

The accepted Core contract is pinned to revision
`6f4d2636deeb608a9c00f15fbe355b9ab63d7b0b`. Web uses only its public host-trust
and federated-identity endpoints.

## Activation order

1. Provision a dedicated PostgreSQL database and set `VOX_WEB_DATABASE_URL`.
2. Run `npm ci`, then `npm run db:migrate:consumer-auth`. Deployment must run
   the committed migration; it must not run an unpinned Better Auth migration.
3. Create a separate Google OAuth web client. Its production redirect URI is
   `https://app.voxagent.in/api/account/auth/callback/google`. Request only
   `openid email profile`.
4. Generate a consumer auth secret and OTP pepper with at least 32 random
   bytes each. Configure SMTP through a secret URL and a verified from address.
5. Register the Web host in Core with an operator bearer credential:

   ```json
   {
     "deployment_external_key": "production",
     "host_app_external_key": "vox-web",
     "allowed_origins": ["https://app.voxagent.in"]
   }
   ```

   Store the returned credential ID, audience, and one-time raw secret as
   `VOX_HOST_CREDENTIAL_ID`, `VOX_HOST_AUDIENCE`, and `VOX_HOST_SECRET`.

6. Generate an Ed25519 keypair. Register the public key through
   `POST /v1/identity-adapters` with the operator bearer credential:

   ```json
   {
     "deployment_external_key": "production",
     "external_key": "vox-web-primary",
     "configuration": {
       "kind": "federated_ed25519",
       "issuer": "https://app.voxagent.in",
       "audience": "vox-core:production",
       "public_key": "LOWERCASE_HEX_RAW_32_BYTE_PUBLIC_KEY"
     }
   }
   ```

   Store the PKCS#8 DER private key as base64 in
   `VOX_IDENTITY_SIGNING_PRIVATE_KEY`; it never enters browser code or the Web
   database.

7. Add `app.voxagent.in` to the existing Vercel project, apply the exact DNS
   record Vercel supplies, verify TLS, and set every variable below in the
   production environment.
8. Deploy with `VOX_CONSUMER_AUTH_ENABLED=false`. Verify migration, Core host
   registration, adapter registration, SMTP delivery, and the Google callback.
   Set the switch to `true` only after those checks pass.

## Required server-only configuration

| Variable                                                         | Meaning                                                                                                     |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `VOX_CONSUMER_AUTH_ENABLED`                                      | `true` admits new sign-ins; `false` preserves session reads, sign-out, and revocation but rejects new entry |
| `VOX_WEB_DATABASE_URL`                                           | Dedicated PostgreSQL connection string                                                                      |
| `VOX_CONSUMER_AUTH_SECRET`                                       | Consumer cookie and token secret, independent of `NEXTAUTH_SECRET`                                          |
| `VOX_GOOGLE_CLIENT_ID`, `VOX_GOOGLE_CLIENT_SECRET`               | Consumer-only Google OAuth client                                                                           |
| `VOX_AUTH_OTP_PEPPER`                                            | HMAC key for stored one-time codes                                                                          |
| `VOX_AUTH_SMTP_URL`, `VOX_AUTH_EMAIL_FROM`                       | SMTP custody and verified sender                                                                            |
| `VOX_CORE_URL`                                                   | Core HTTPS origin                                                                                           |
| `VOX_HOST_CREDENTIAL_ID`, `VOX_HOST_AUDIENCE`, `VOX_HOST_SECRET` | Core-issued Web host credential                                                                             |
| `VOX_IDENTITY_ADAPTER_KEY`                                       | Registered Core federated adapter external key                                                              |
| `VOX_IDENTITY_ISSUER`                                            | `https://app.voxagent.in` in production; also the consumer auth origin                                      |
| `VOX_IDENTITY_AUDIENCE`                                          | Exact registered Core adapter audience                                                                      |
| `VOX_IDENTITY_SIGNING_PRIVATE_KEY`                               | Base64 PKCS#8 Ed25519 private key                                                                           |

None may use a `NEXT_PUBLIC_` prefix.

## Security behavior

- Sessions expire after eight hours, are database backed and revocable, and
  use host-only secure cookies. Proxy rewrites are routing only; every
  protected page and custom route revalidates the database session and active
  account.
- Email codes contain eight digits, expire after ten minutes, allow five
  failed attempts, rotate on resend, are single-use under concurrency, and are
  stored only as a peppered HMAC.
- Equal email addresses never imply account ownership. A Google identity can
  be linked only from an active signed-in account, and Better Auth rejects an
  identity already attached elsewhere or a different email.
- A Google account cannot use email recovery until the signed-in user proves
  the account email and explicitly enables recovery.
- Every completed login calls Core with a fresh host assertion and a fresh
  Ed25519 proof for `vox-account:<uuid>`. Web persists only the returned context
  ID. A changed context fails closed; Core's one-time authentication token is
  discarded.

## Rotation and incident response

Rotate a host credential by issuing a replacement in Core, deploying its ID
and secret, validating sign-in, then revoking the old credential. Rotation does
not remap Web accounts. Rotate the Ed25519 adapter additively: register a new
adapter key/public key, deploy the new external key and private key, validate,
then disable the old adapter. A suspected consumer session compromise is
handled with all-session revocation; a global incident can rotate
`VOX_CONSUMER_AUTH_SECRET` to invalidate every consumer session.

If Core or SMTP is unavailable, sign-in fails without partial authority. Set
the rollout switch to `false`; existing users can still sign out or revoke
sessions. Database rollback uses the application release rollback only—the
auth schema migration is forward-only and must not be dropped while sessions
or accounts exist.

## Verification

Run `VOX_WEB_TEST_DATABASE_URL=... npm test`, `npm run lint`, `npm run build`,
and `npm run test:e2e`. Test with desktop and mobile viewports, keyboard-only
navigation, a screen reader, an expired code, resend rotation, concurrent code
verification, revoked sessions, a disabled account, a revoked Core host
credential, and Core downtime. Search build output and repository content for
credential values before release.
