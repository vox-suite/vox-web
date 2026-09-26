import { defineConfig, devices } from "@playwright/test";

const appPort = Number(process.env.CONSUMER_FIXTURE_APP_PORT ?? 3200);
const appUrl = `http://127.0.0.1:${appPort}`;

/**
 * Consumer app flows against the fixture harness: fake Supabase Auth plus a
 * stateful mock Core (tests/fixtures/consumer-app). No auth bypass exists in
 * app code; the synthetic session passes the real `currentConsumer` check.
 */
export default defineConfig({
  testDir: "./tests/consumer-browser",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: appUrl, trace: "retain-on-failure" },
  projects: [
    {
      name: "laptop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1366, height: 768 },
      },
    },
  ],
  webServer: {
    command: "node tests/fixtures/consumer-app/run.mjs",
    url: `${appUrl}/app/sign-in`,
    reuseExistingServer: true,
    timeout: 180_000,
    env: { CONSUMER_FIXTURE_QUIET: "1" },
  },
});
