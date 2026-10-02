import { spawnSync } from "node:child_process";
// Explicit test-only database destination. Never read DATABASE_URL or deployment secrets.
const database = process.env.VOX_IDENTITY_TEST_DATABASE_URL;
if (!database)
  throw new Error(
    "Set VOX_IDENTITY_TEST_DATABASE_URL to a disposable empty PostgreSQL database.",
  );
const result = spawnSync(
  "psql",
  [
    database,
    "-X",
    "-v",
    "ON_ERROR_STOP=1",
    "-f",
    "tests/sql/consumer-identity-hook.sql",
  ],
  { stdio: "inherit" },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
