import { createServer as createHttpServer } from "node:http";
import { createServer as createSmtpServer } from "node:net";
import { readFile } from "node:fs/promises";
import { Pool } from "pg";

const databaseUrl = process.env.VOX_WEB_TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("VOX_WEB_TEST_DATABASE_URL is required");

const pool = new Pool({ connectionString: databaseUrl, max: 1 });
const schema = await pool.query(
  "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'vox_web_auth'",
);
if (schema.rowCount) {
  await pool.query(
    `TRUNCATE vox_web_auth."rateLimit", vox_web_auth.verification,
              vox_web_auth.session, vox_web_auth.account, vox_web_auth."user"
       RESTART IDENTITY CASCADE`,
  );
} else {
  const sql = await readFile(
    new URL("../../migrations/202609220001_consumer_auth.sql", import.meta.url),
    "utf8",
  );
  await pool.query(sql);
}
await pool.end();

const latest = new Map();
createSmtpServer((socket) => {
  socket.setEncoding("utf8");
  socket.write("220 vox-test ESMTP\r\n");
  let buffer = "";
  let dataMode = false;
  socket.on("data", (chunk) => {
    buffer += chunk;
    while (true) {
      if (dataMode) {
        const end = buffer.indexOf("\r\n.\r\n");
        if (end < 0) return;
        const message = buffer.slice(0, end);
        buffer = buffer.slice(end + 5);
        const recipient = /\r\nTo:\s*([^\r\n]+)/i
          .exec(`\r\n${message}`)?.[1]
          ?.trim();
        const code = /\b(\d{8})\b/.exec(message)?.[1];
        if (recipient && code) latest.set(recipient.toLowerCase(), code);
        dataMode = false;
        socket.write("250 queued\r\n");
        continue;
      }
      const end = buffer.indexOf("\r\n");
      if (end < 0) return;
      const line = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      if (/^(EHLO|HELO)/i.test(line))
        socket.write("250-vox-test\r\n250 PIPELINING\r\n");
      else if (/^DATA/i.test(line)) {
        dataMode = true;
        socket.write("354 end with .\r\n");
      } else if (/^QUIT/i.test(line)) {
        socket.end("221 bye\r\n");
      } else socket.write("250 ok\r\n");
    }
  });
}).listen(3102, "127.0.0.1");

createHttpServer((request, response) => {
  if (request.url === "/health") {
    response.end("ok");
    return;
  }
  const url = new URL(request.url ?? "/", "http://127.0.0.1:3103");
  if (url.pathname === "/latest") {
    const email = url.searchParams.get("email")?.toLowerCase();
    const code = email ? latest.get(email) : undefined;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ code: code ?? null }));
    return;
  }
  response.writeHead(404);
  response.end();
}).listen(3103, "127.0.0.1");
