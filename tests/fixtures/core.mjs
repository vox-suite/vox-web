import { createServer } from "node:http";
function fixtureStore() {
  return new Map([
    [
      "vox:user-context:fixture-001",
      {
        type: "string",
        ttl: 300,
        value: JSON.stringify({
          name: "Fixture user",
          summary: "Planning a quiet morning.",
        }),
      },
    ],
    [
      "vox:user-context:fixture-002",
      { type: "string", ttl: -1, value: "Second fixture" },
    ],
  ]);
}

let store = fixtureStore();
let reset = false;

async function jsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString());
}

createServer(async (request, response) => {
  if (request.url === "/health") {
    response.end("ok");
    return;
  }
  if (request.url === "/v1/identity/authentications" && request.method === "POST") {
    const body = await jsonBody(request);
    if (
      request.headers["x-vox-host-credential"] !== "fixture-host-credential" ||
      request.headers["x-vox-host-secret"] !==
        "fixture-host-secret-fixture-host-secret-0001" ||
      request.headers["x-vox-host-audience"] !== "vox-host:test:vox-web" ||
      body?.authentication?.adapter_external_key !== "vox-web-fixture" ||
      body?.authentication?.proof?.type !== "federated" ||
      !String(body?.host_context?.host_user_id ?? "").startsWith("vox-account:")
    ) {
      response.writeHead(401);
      response.end();
      return;
    }
    response.setHeader("Content-Type", "application/json");
    response.end(
      JSON.stringify({
        user_context_id: `fixture-context:${body.host_context.host_user_id}`,
        adapter_external_key: "vox-web-fixture",
        expires_at: new Date(Date.now() + 600_000).toISOString(),
        authentication_token: "fixture-token-that-web-must-discard",
      }),
    );
    return;
  }
  if (request.headers.authorization !== "Bearer fixture-admin-token") {
    response.writeHead(401);
    response.end();
    return;
  }
  const url = new URL(request.url, "http://localhost");
  const key = url.searchParams.get("key");
  const match = url.searchParams.get("match");
  response.setHeader("Content-Type", "application/json");
  if (match === "fail:*") {
    response.writeHead(503);
    response.end("{}");
    return;
  }
  if (request.method === "PUT") {
    const body = await jsonBody(request);
    const entry = store.get(body.key);
    if (!entry || entry.type !== body.type) {
      response.writeHead(entry ? 409 : 404);
      response.end("{}");
      return;
    }
    entry.value = body.value;
    response.end(JSON.stringify({ updated: true, key: body.key }));
    return;
  }
  if (request.method === "DELETE") {
    if (!key || !store.delete(key)) {
      response.writeHead(404);
      response.end("{}");
      return;
    }
    reset = true;
    response.end(JSON.stringify({ deleted: true, key }));
    return;
  }
  if (key) {
    const entry = store.get(key);
    if (!entry) {
      response.end(
        JSON.stringify({
          key,
          type: "none",
          ttl: -2,
          size: 0,
          truncated: false,
          value: null,
        }),
      );
      return;
    }
    response.end(
      JSON.stringify({
        key,
        type: entry.type,
        ttl: entry.ttl,
        size: entry.value.length,
        truncated: false,
        value: entry.value,
      }),
    );
    return;
  }
  const cursor = url.searchParams.get("cursor") || "0";
  if (reset === "ready" && match === "vox:*" && cursor === "0") {
    store = fixtureStore();
    reset = false;
  }
  const pageEntries =
    match === "empty:*"
      ? []
      : Array.from(store, ([key, entry]) => ({
          key,
          type: entry.type,
          ttl: entry.ttl,
        }));
  if (reset === true && match === "vox:*" && cursor === "0") reset = "ready";
  response.end(
    JSON.stringify({
      entries: pageEntries,
      cursor: match === "empty:*" || cursor !== "0" ? "0" : "128",
      match: match || "vox:*",
    }),
  );
}).listen(3101, "127.0.0.1");
