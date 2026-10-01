import assert from "node:assert/strict";
import test from "node:test";
import { AuthApiError, type User } from "@supabase/supabase-js";
import { resolveConsumer } from "../src/lib/consumer-auth/session-authority";

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
};

test("consumer authority requires a service-verified user and retains only display fields", async () => {
  let verifications = 0;
  const session = await resolveConsumer({
    async getUser() {
      verifications += 1;
      return { data: { user }, error: null };
    },
  });
  assert.equal(verifications, 1);
  assert.deepEqual(session, {
    accountId: user.id,
    name: "Asha",
    email: user.email,
    image: user.user_metadata.avatar_url,
  });
  assert.equal(session && "coreUserContextId" in session, false);
  assert.equal(session && "recoveryEnabled" in session, false);
});

test("rejected, missing, anonymous or unavailable auth cannot access an account", async () => {
  assert.equal(
    await resolveConsumer({
      async getUser() {
        return {
          data: { user: null },
          error: new AuthApiError("revoked", 401, "session_not_found"),
        };
      },
    }),
    null,
  );
  assert.equal(
    await resolveConsumer({
      async getUser() {
        return { data: { user: { ...user, is_anonymous: true } }, error: null };
      },
    }),
    null,
  );
  assert.equal(
    await resolveConsumer({
      async getUser() {
        throw new Error("auth unavailable");
      },
    }),
    null,
  );
});

test("untrusted display metadata cannot change the verified account subject", async () => {
  const session = await resolveConsumer({
    async getUser() {
      return {
        data: {
          user: {
            ...user,
            user_metadata: {
              accountId: "other-account",
              full_name: {},
              avatar_url: [],
            },
          },
        },
        error: null,
      };
    },
  });
  assert.deepEqual(session, {
    accountId: user.id,
    name: "asha",
    email: user.email,
    image: null,
  });
});
