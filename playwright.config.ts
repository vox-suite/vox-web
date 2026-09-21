import { defineConfig, devices } from "@playwright/test";
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
        NEXTAUTH_URL: "http://127.0.0.1:3100",
        NEXTAUTH_SECRET: "isolated-playwright-secret-not-for-production",
        GOOGLE_CLIENT_ID: "fixture-client",
        GOOGLE_CLIENT_SECRET: "fixture-client-secret",
        SUPERUSER_EMAILS: "admin@example.test",
        VOX_CORE_ADMIN_URL: "http://127.0.0.1:3101",
        VOX_ADMIN_TOKEN: "fixture-admin-token",
        RATE_LIMIT_MAX: "1000",
      },
    },
  ],
});
