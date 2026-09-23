import assert from "node:assert/strict";
import test from "node:test";
import { buildConsumerAuthOptions } from "../src/lib/consumer-auth/auth-options";
import type { ConsumerAuthEnabledConfig } from "../src/lib/consumer-auth/config";

const config: ConsumerAuthEnabledConfig = {
  enabled: true,
  entryEnabled: true,
  appUrl: "https://app.voxagent.in",
  databaseUrl: "postgres://unused",
  authSecret: "s".repeat(48),
  googleClientId: "google-client",
  googleClientSecret: "google-secret",
  otpPepper: "p".repeat(48),
  smtpUrl: "smtp://unused",
  emailFrom: "Vox <hello@voxagent.in>",
  sessionMaxAgeSeconds: 28_800,
  otpExpiresInSeconds: 600,
  otpAllowedAttempts: 5,
  core: {
    baseUrl: "https://core.voxagent.in",
    hostCredential: {
      credentialId: "host-id",
      audience: "host-audience",
      secret: "host-secret",
    },
    identityAdapterKey: "vox-web",
    identityCredential: {
      issuer: "https://app.voxagent.in",
      audience: "vox-core",
      privateKeyPkcs8Base64: "unused-in-this-test",
    },
  },
};

test("consumer auth options preserve the independent security boundary", async () => {
  const established: string[] = [];
  const delivered: Array<{ email: string; code: string }> = [];
  const options = buildConsumerAuthOptions(config, {
    database: { dialect: {} as never, type: "postgres" },
    accountAuthority: {
      initialize: async () => ({ userContextId: "core-context" }),
      establish: async (accountId) => {
        established.push(accountId);
      },
    },
    emailSender: {
      sendOneTimeCode: async ({ email, code }) => {
        delivered.push({ email, code });
      },
    },
  });

  assert.equal(options.basePath, "/api/account/auth");
  assert.equal(options.session?.expiresIn, 28_800);
  assert.equal(options.account?.encryptOAuthTokens, true);
  assert.equal(options.account?.storeStateStrategy, "database");
  assert.equal(options.account?.accountLinking?.disableImplicitLinking, true);
  assert.equal(options.account?.accountLinking?.allowDifferentEmails, false);
  assert.equal(options.rateLimit?.storage, "database");
  const google = options.socialProviders?.google;
  assert.ok(google && typeof google !== "function");
  assert.deepEqual(google.scope, ["openid", "email", "profile"]);
  assert.equal(google.includeGrantedScopes, false);
  assert.equal(google.requireEmailVerification, true);
  assert.equal(options.advanced?.useSecureCookies, true);
  assert.equal(options.advanced?.crossSubDomainCookies?.enabled, false);

  const before = options.databaseHooks?.session?.create?.before;
  assert.ok(before);
  await before(
    {
      id: "session-id",
      userId: "account-id",
      token: "token",
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: null,
      userAgent: null,
    },
    null,
  );
  assert.deepEqual(established, ["account-id"]);

  const initialize = options.databaseHooks?.user?.create?.before;
  assert.ok(initialize);
  const initialized = await initialize(
    {
      id: "new-account",
      name: "New account",
      email: "new@example.test",
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    null,
  );
  assert.equal(
    typeof initialized === "object" && initialized
      ? initialized.data.coreUserContextId
      : null,
    "core-context",
  );

  const plugin = options.plugins?.find(
    (candidate) => candidate.id === "email-otp",
  );
  assert.ok(plugin);
  const send = (
    plugin as unknown as {
      options: {
        sendVerificationOTP: (data: {
          email: string;
          otp: string;
          type: "sign-in";
        }) => Promise<void>;
      };
    }
  ).options?.sendVerificationOTP;
  assert.ok(send);
  await send({
    email: "person@example.test",
    otp: "12345678",
    type: "sign-in",
  });
  assert.deepEqual(delivered, [
    { email: "person@example.test", code: "12345678" },
  ]);
});
