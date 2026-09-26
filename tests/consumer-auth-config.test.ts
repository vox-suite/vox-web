import assert from "node:assert/strict";
import test from "node:test";
import { readConsumerAuthConfig } from "../src/lib/consumer-auth/config";

const complete = {
  VOX_CONSUMER_AUTH_ENABLED: "true",
  VOX_WEB_DATABASE_URL: "postgres://vox:test@127.0.0.1:5432/vox_web",
  VOX_CONSUMER_AUTH_SECRET: "s".repeat(48),
  VOX_GOOGLE_CLIENT_ID: "google-client",
  VOX_GOOGLE_CLIENT_SECRET: "google-secret",
  VOX_AUTH_OTP_PEPPER: "p".repeat(48),
  VOX_AUTH_SMTP_URL: "smtp://mailer.example.test:2525",
  VOX_AUTH_EMAIL_FROM: "Vox <hello@voxagent.in>",
  VOX_CORE_URL: "https://core.voxagent.in",
  VOX_HOST_CREDENTIAL_ID: "11111111-2222-4333-8444-555555555555",
  VOX_HOST_AUDIENCE: "vox-host:production:vox-web",
  VOX_HOST_SECRET: "h".repeat(48),
  VOX_IDENTITY_ADAPTER_KEY: "vox-web-primary",
  VOX_IDENTITY_ISSUER: "https://app.voxagent.in",
  VOX_IDENTITY_AUDIENCE: "vox-core:production",
  VOX_IDENTITY_SIGNING_PRIVATE_KEY:
    "MC4CAQAwBQYDK2VwBCIEIBERERERERERERERERERERERERERERERERERERERERER",
};

test("consumer authentication stays disabled unless every secret is configured", () => {
  assert.deepEqual(readConsumerAuthConfig({}), { enabled: false });
  assert.throws(
    () =>
      readConsumerAuthConfig({
        ...complete,
        VOX_HOST_SECRET: "",
      }),
    /VOX_HOST_SECRET is required/,
  );
});

test("consumer configuration normalizes origins and keeps credentials server-side", () => {
  const config = readConsumerAuthConfig(complete);
  assert.equal(config.enabled, true);
  if (!config.enabled) assert.fail("expected enabled configuration");
  assert.equal(config.appUrl, "https://app.voxagent.in");
  assert.equal(config.entryEnabled, true);
  assert.equal(config.core.baseUrl, "https://core.voxagent.in");
  assert.equal(config.sessionMaxAgeSeconds, 8 * 60 * 60);
  assert.equal(config.otpExpiresInSeconds, 10 * 60);
  assert.equal(config.otpAllowedAttempts, 5);
  assert.equal("public" in config, false);
});

test("the rollout switch blocks entry without destroying session configuration", () => {
  const config = readConsumerAuthConfig({
    ...complete,
    VOX_CONSUMER_AUTH_ENABLED: "false",
  });
  assert.equal(config.enabled, true);
  if (!config.enabled) assert.fail("expected configured authentication");
  assert.equal(config.entryEnabled, false);
});

test("Core features need only the Core URL and the host credential", async () => {
  const { readCoreHostConfig } = await import("../src/lib/consumer-auth/config");
  assert.equal(readCoreHostConfig({}), null);
  const config = readCoreHostConfig({
    VOX_CORE_URL: "https://api.voxagent.in",
    VOX_HOST_CREDENTIAL_ID: "11111111-2222-4333-8444-555555555555",
    VOX_HOST_AUDIENCE: "vox-host:vox.production:vox-web",
    VOX_HOST_SECRET: "s".repeat(32),
  });
  assert.equal(config?.baseUrl, "https://api.voxagent.in");
  assert.equal(config?.identityCredential, undefined);
});
