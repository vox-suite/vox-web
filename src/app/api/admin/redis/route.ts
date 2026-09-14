import { currentSuperuser } from "@/lib/auth";
import { parseRedisQuery } from "@/lib/access";
import { CoreAdminError, readCoreRedis } from "@/lib/core-admin";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const headers = {
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
  };
  if (!(await currentSuperuser()))
    return Response.json(
      { error: "Your session has ended. Sign in again to continue." },
      { status: 401, headers },
    );
  const input = new URL(request.url).searchParams;
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(parseRedisQuery(input));
    const key = input.get("key");
    if (key !== null) {
      if (
        !key ||
        new TextEncoder().encode(key).length > 1024 ||
        /[\x00-\x1f]/.test(key)
      )
        throw new Error(
          "This key cannot be previewed. Keys must be 1–1,024 bytes without control characters.",
        );
      params.set("key", key);
    }
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400, headers },
    );
  }
  try {
    return Response.json(await readCoreRedis(params), { headers });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof CoreAdminError
            ? error.message
            : "Redis is unavailable. Try again later.",
      },
      { status: error instanceof CoreAdminError ? error.status : 503, headers },
    );
  }
}
