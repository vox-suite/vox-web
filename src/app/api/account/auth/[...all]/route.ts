import { getConsumerAuthRuntime } from "@/lib/consumer-auth/runtime";
import { privateJson } from "@/lib/consumer-auth/request";
import { currentConsumer } from "@/lib/consumer-auth/session";

export const dynamic = "force-dynamic";

const sessionOnlyPaths = new Set([
  "/api/account/auth/get-session",
  "/api/account/auth/sign-out",
  "/api/account/auth/revoke-sessions",
  "/api/account/auth/revoke-other-sessions",
]);

async function handle(request: Request) {
  const runtime = getConsumerAuthRuntime();
  if (!runtime) {
    return Response.json(
      { error: "Consumer authentication is not configured" },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  if (
    !runtime.entryEnabled &&
    !sessionOnlyPaths.has(new URL(request.url).pathname)
  ) {
    return Response.json(
      { error: "Consumer sign-in is temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  if (
    request.method === "GET" &&
    new URL(request.url).pathname === "/api/account/auth/get-session"
  ) {
    return privateJson(await currentConsumer(request.headers));
  }
  return runtime.auth.handler(request);
}

export const GET = handle;
export const POST = handle;
