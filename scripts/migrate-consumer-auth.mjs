import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const databaseUrl = process.env.VOX_WEB_DATABASE_URL?.trim();
if (!databaseUrl) throw new Error("VOX_WEB_DATABASE_URL is required");

const migrationUrl = new URL(
  "../migrations/202609220001_consumer_auth.sql",
  import.meta.url,
);
const sql = await readFile(fileURLToPath(migrationUrl), "utf8");
const pool = new Pool({ connectionString: databaseUrl, max: 1 });
try {
  await pool.query(sql);
  console.log("Applied 202609220001_consumer_auth.sql");
} finally {
  await pool.end();
}
