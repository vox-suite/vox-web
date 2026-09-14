import { createServer } from "node:http";
createServer((request, response) => {
  if (request.url === "/health") {
    response.end("ok");
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
  if (key) {
    response.end(
      JSON.stringify({
        key,
        type: "string",
        ttl: 300,
        size: 54,
        truncated: false,
        value: JSON.stringify({
          name: "Fixture user",
          summary: "Planning a quiet morning.",
        }),
      }),
    );
    return;
  }
  const entries =
    match === "empty:*"
      ? []
      : [
          { key: "vox:user-context:fixture-001", type: "string", ttl: 300 },
          { key: "vox:user-context:fixture-002", type: "string", ttl: -1 },
        ];
  const cursor = url.searchParams.get("cursor") || "0";
  response.end(
    JSON.stringify({
      entries,
      cursor: match === "empty:*" || cursor !== "0" ? "0" : "128",
      match: match || "vox:*",
    }),
  );
}).listen(3101, "127.0.0.1");
