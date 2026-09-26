#!/usr/bin/env node
// Launch the real consumer app against local fakes:
//   - fake Supabase Auth  (http://127.0.0.1:54321)  -> ./supabase-auth.mjs
//   - mock Vox Core       (http://127.0.0.1:3201)   -> ./core.mjs
//   - `next dev --hostname 127.0.0.1 --port 3200` with consumer auth enabled
//
// No app code is changed: the app's own Supabase getUser() and signed Core
// requests run unmodified; only the services behind them are fakes.
//
// Usage: npm run dev:consumer-fixture
// Env overrides: CONSUMER_FIXTURE_APP_PORT, CONSUMER_FIXTURE_AUTH_PORT,
//                CONSUMER_FIXTURE_CORE_PORT, CONSUMER_FIXTURE_QUIET=1

import { spawn } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { startCore } from "./core.mjs";
import {
  DEFAULT_USER,
  FIXTURE_ANON_KEY,
  cookieHeader,
  startSupabaseAuth,
  storageKeyFor,
} from "./supabase-auth.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");

const appPort = Number(process.env.CONSUMER_FIXTURE_APP_PORT ?? 3200);
const authPort = Number(process.env.CONSUMER_FIXTURE_AUTH_PORT ?? 54321);
const corePort = Number(process.env.CONSUMER_FIXTURE_CORE_PORT ?? 3201);
const appOrigin = `http://127.0.0.1:${appPort}`;
const supabaseUrl = `http://127.0.0.1:${authPort}`;
const coreUrl = `http://127.0.0.1:${corePort}`;

// Fresh Ed25519 identity key per run (config.ts requires a valid PKCS#8 key).
const identityKey = generateKeyPairSync("ed25519")
  .privateKey.export({ format: "der", type: "pkcs8" })
  .toString("base64");

export const fixtureEnv = {
  NEXT_TELEMETRY_DISABLED: "1",
  // Supabase (read by src/lib/supabase/{server,client}.ts)
  NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: FIXTURE_ANON_KEY,
  // Consumer auth (src/lib/consumer-auth/config.ts)
  VOX_CONSUMER_AUTH_ENABLED: "true",
  VOX_IDENTITY_ISSUER: appOrigin,
  // The pg Pool is constructed but only connects on first query. Core-backed
  // /api/account routes never query it. Port 1 makes any accidental use fail
  // fast (ECONNREFUSED) instead of hanging.
  VOX_WEB_DATABASE_URL:
    "postgresql://consumer_fixture:consumer_fixture@127.0.0.1:1/vox_web_consumer_fixture",
  VOX_CONSUMER_AUTH_SECRET: "consumer-fixture-auth-secret-0123456789abcdef",
  VOX_GOOGLE_CLIENT_ID: "consumer-fixture-google-client",
  VOX_GOOGLE_CLIENT_SECRET: "consumer-fixture-google-secret",
  VOX_AUTH_OTP_PEPPER: "consumer-fixture-otp-pepper-0123456789abcdef",
  VOX_AUTH_SMTP_URL: "smtp://127.0.0.1:1",
  VOX_AUTH_EMAIL_FROM: "Vox <hello@example.test>",
  VOX_CORE_URL: coreUrl,
  VOX_HOST_CREDENTIAL_ID: "consumer-fixture-host-credential",
  VOX_HOST_AUDIENCE: "vox-host:fixture:vox-web",
  VOX_HOST_SECRET: "consumer-fixture-host-secret-0123456789abcdef",
  VOX_IDENTITY_ADAPTER_KEY: "vox-web-consumer-fixture",
  VOX_IDENTITY_AUDIENCE: "vox-core:fixture",
  VOX_IDENTITY_SIGNING_PRIVATE_KEY: identityKey,
  // Keep the proxy rate limiter out of the way during UI work.
  RATE_LIMIT_MAX: "100000",
};

const children = new Set();
const servers = [];
let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    try {
      // next dev spawns worker processes; kill the whole process group.
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
  for (const server of servers) server.close();
  setTimeout(() => process.exit(code), 1500).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function main() {
  servers.push(await startSupabaseAuth({ port: authPort, appOrigin }));
  servers.push(await startCore({ port: corePort }));

  const env = { ...process.env, ...fixtureEnv };
  // Never let an ambient admin canonical origin redirect local requests.
  delete env.VOX_ADMIN_ORIGIN;

  const nextBin = resolve(repoRoot, "node_modules/.bin/next");
  const child = spawn(
    nextBin,
    ["dev", "--hostname", "127.0.0.1", "--port", String(appPort)],
    { cwd: repoRoot, env, stdio: "inherit", detached: true },
  );
  children.add(child);
  child.on("exit", (code, signal) => {
    children.delete(child);
    if (!shuttingDown) {
      console.error(`[consumer-fixture] next dev exited (${signal ?? code})`);
      shutdown(code ?? 1);
    }
  });

  const cookieName = storageKeyFor(supabaseUrl);
  console.log(`
[consumer-fixture] ready once Next prints "Ready":
  App           ${appOrigin}/app
  Sign in       ${supabaseUrl}/fixture/sign-in?next=/app   (browser; sets cookie ${cookieName})
  Email code    any email + code ${process.env.CONSUMER_FIXTURE_OTP_CODE ?? "123456"} on ${appOrigin}/app/sign-in
  Fake Auth     ${supabaseUrl}/auth/v1
  Mock Core     ${coreUrl}  (state: ${coreUrl}/__fixture/state?host_user_id=vox-account:${DEFAULT_USER.id})
  Default user  ${DEFAULT_USER.fullName} <${DEFAULT_USER.email}>
  curl cookie   node tests/fixtures/consumer-app/supabase-auth.mjs cookie
`);
  if (process.env.CONSUMER_FIXTURE_PRINT_COOKIE === "1") {
    console.log(`Cookie: ${cookieHeader({}, supabaseUrl)}\n`);
  }
}

main().catch((error) => {
  console.error("[consumer-fixture] failed to start:", error.message);
  shutdown(1);
});
