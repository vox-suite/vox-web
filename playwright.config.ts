import { defineConfig, devices } from "@playwright/test";
const consumerDatabaseUrl = process.env.VOX_WEB_TEST_DATABASE_URL;
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: [
    ...(consumerDatabaseUrl
      ? [
          {
            command: "node tests/fixtures/consumer-auth.mjs",
            url: "http://127.0.0.1:3103/health",
            reuseExistingServer: false,
            env: { VOX_WEB_TEST_DATABASE_URL: consumerDatabaseUrl },
          },
        ]
      : []),
    {
      command: "node tests/fixtures/core.mjs",
      url: "http://127.0.0.1:3101/health",
      reuseExistingServer: false,
    },
    {
      command: "npm run start -- --port 3100",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "fixture-anon-key",
        SUPERUSER_EMAILS: "admin@example.test",
        VOX_ADMIN_E2E_SECRET: "isolated-playwright-secret-not-for-production",
        VOX_ADMIN_ORIGIN: "https://admin.voxagent.in",
        VOX_CORE_ADMIN_URL: "http://127.0.0.1:3101",
        VOX_ADMIN_TOKEN: "fixture-admin-token",
        RATE_LIMIT_MAX: "1000",
        ...(consumerDatabaseUrl
          ? {
              VOX_CONSUMER_AUTH_ENABLED: "true",
              VOX_WEB_DATABASE_URL: consumerDatabaseUrl,
              VOX_CONSUMER_AUTH_SECRET:
                "K6sXq1P9wN3rT7vY2zB8dF4hJ5mL0cQaE6uI1oP3sR7",
              VOX_GOOGLE_CLIENT_ID: "fixture-consumer-google",
              VOX_GOOGLE_CLIENT_SECRET: "fixture-consumer-google-secret",
              VOX_AUTH_OTP_PEPPER:
                "m8Vq2Dk6Rz0Nw4Xc9Jp3Ts7Bh1Fy5Lu8Ae2Gi6Ko0Qw",
              VOX_AUTH_SMTP_URL: "smtp://127.0.0.1:3102",
              VOX_AUTH_EMAIL_FROM: "Vox <hello@voxagent.in>",
              VOX_CORE_URL: "http://127.0.0.1:3101",
              VOX_HOST_CREDENTIAL_ID: "fixture-host-credential",
              VOX_HOST_AUDIENCE: "vox-host:test:vox-web",
              VOX_HOST_SECRET: "fixture-host-secret-fixture-host-secret-0001",
              VOX_IDENTITY_ADAPTER_KEY: "vox-web-fixture",
              VOX_IDENTITY_ISSUER: "http://localhost:3100",
              VOX_IDENTITY_AUDIENCE: "vox-core:test",
              VOX_IDENTITY_SIGNING_PRIVATE_KEY:
                "MC4CAQAwBQYDK2VwBCIEIBERERERERERERERERERERERERERERERERERERERERER",
            }
          : {}),
      },
    },
  ],
});
