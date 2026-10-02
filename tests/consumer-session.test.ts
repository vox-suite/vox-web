import assert from "node:assert/strict";
import test from "node:test";
import { AuthApiError, type User } from "@supabase/supabase-js";
import { resolveConsumer } from "../src/lib/consumer-auth/session-authority";
const issuer = "https://vox.supabase.co/auth/v1";
const identityId = "11111111-1111-4111-8111-111111111111";
const user: User = {
  id: "verified-supabase-subject",
  app_metadata: { provider: "google" },
  user_metadata: {
    full_name: "Asha",
    avatar_url: "https://example.test/avatar",
  },
  aud: "authenticated",
  created_at: "2026-10-01T00:00:00Z",
  email: "asha@example.test",
  identities: [
    {
      id: "provider-subject",
      identity_id: identityId,
      user_id: "verified-supabase-subject",
      provider: "google",
    },
  ],
};
const claims = {
  iss: issuer,
  sub: user.id,
  aud: "authenticated",
  role: "authenticated",
  is_anonymous: false,
  session_id: "verified-session",
  amr: [{ method: "oauth", timestamp: 1 }],
  vox_identity: {
    version: 1,
    user_id: user.id,
    session_id: "verified-session",
    provider: "google",
    identity_id: identityId,
  },
};
function auth(value: User = user, overrides: Record<string, unknown> = {}) {
  return {
    async getUser() {
      return { data: { user: value }, error: null };
    },
    async getClaims() {
      return {
        data: {
          claims: { ...claims, ...overrides },
          header: { alg: "HS256", typ: "JWT" },
          signature: new Uint8Array(),
        },
        error: null,
      };
    },
  };
}

test("consumer authority uses verified session pin, never merged user UUID or display metadata", async () => {
  const session = await resolveConsumer(
    auth({
      ...user,
      user_metadata: {
        ...user.user_metadata,
        accountId: "other",
        vox_identity: { identity_id: "other" },
      },
    }),
    issuer,
  );
  assert.deepEqual(session, {
    accountId: `supabase:google:${identityId}`,
    name: "Asha",
    email: user.email,
    image: user.user_metadata.avatar_url,
  });
  assert.notEqual(session?.accountId, user.id);
});

test("standalone OTP identity retains access with a provider-bound pin", async () => {
  const emailUser = {
    ...user,
    identities: [{ ...user.identities![0], provider: "email" }],
  };
  const session = await resolveConsumer(
    auth(emailUser, {
      amr: [{ method: "otp", timestamp: 1 }],
      vox_identity: { ...claims.vox_identity, provider: "email" },
    }),
    issuer,
  );
  assert.equal(session?.accountId, `supabase:email:${identityId}`);
});

test("automatically linked identities cannot inherit either identity's Core authority", async () => {
  assert.equal(
    await resolveConsumer(
      auth({
        ...user,
        identities: [
          ...user.identities!,
          {
            ...user.identities![0],
            provider: "email",
            identity_id: "22222222-2222-4222-8222-222222222222",
          },
        ],
      }),
      issuer,
    ),
    null,
  );
});

test("unlinking and replacing an identity cannot reuse the old signed pin", async () => {
  const replacement = "22222222-2222-4222-8222-222222222222";
  const replacementUser = {
    ...user,
    identities: [{ ...user.identities![0], identity_id: replacement }],
  };
  assert.equal(await resolveConsumer(auth(replacementUser), issuer), null);
  const newSession = await resolveConsumer(
    auth(replacementUser, {
      vox_identity: { ...claims.vox_identity, identity_id: replacement },
    }),
    issuer,
  );
  assert.equal(newSession?.accountId, `supabase:google:${replacement}`);
});

test("missing pins, mismatched subjects/sessions/issuers, mixed methods and unsupported providers fail closed", async () => {
  for (const change of [
    { vox_identity: undefined },
    { sub: "other" },
    { iss: "https://other.test/auth/v1" },
    { role: "service_role" },
    { is_anonymous: true },
    { session_id: "other" },
    {
      session_id: undefined,
      vox_identity: { ...claims.vox_identity, session_id: undefined },
    },
    { amr: [] },
    { amr: [{ method: "otp", timestamp: 1 }] },
    {
      amr: [
        { method: "oauth", timestamp: 1 },
        { method: "otp", timestamp: 1 },
      ],
    },
  ]) {
    assert.equal(await resolveConsumer(auth(user, change), issuer), null);
  }
  assert.equal(
    await resolveConsumer(
      auth({
        ...user,
        identities: [{ ...user.identities![0], provider: "github" }],
      }),
      issuer,
    ),
    null,
  );
  assert.equal(
    await resolveConsumer(auth({ ...user, is_anonymous: true }), issuer),
    null,
  );
  assert.equal(
    await resolveConsumer(
      {
        ...auth(),
        async getUser() {
          return {
            data: { user: null },
            error: new AuthApiError("rejected", 401, "invalid_token"),
          };
        },
      },
      issuer,
    ),
    null,
  );
  assert.equal(
    await resolveConsumer(
      {
        ...auth(),
        async getClaims() {
          return {
            data: null,
            error: new AuthApiError("invalid signature", 401, "invalid_token"),
          };
        },
      },
      issuer,
    ),
    null,
  );
});
