import { currentSuperuser } from "@/lib/auth";
import { parseRedisQuery } from "@/lib/access";
import {
  CoreAdminError,
  deleteCoreRedis,
  readCoreRedis,
  updateCoreRedis,
} from "@/lib/core-admin";
import { editableRedisType } from "@/lib/redis";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

function validKey(key: unknown): key is string {
  return (
    typeof key === "string" &&
    key.length > 0 &&
    new TextEncoder().encode(key).length <= 1024 &&
    !/[\x00-\x1f]/.test(key)
  );
}

function failure(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof CoreAdminError
          ? error.message
          : "Redis is unavailable. Try again later.",
    },
    {
      status: error instanceof CoreAdminError ? error.status : 503,
      headers: responseHeaders,
    },
  );
}

async function unauthorized() {
  if (await currentSuperuser()) return null;
  return Response.json(
    { error: "Your session has ended. Sign in again to continue." },
    { status: 401, headers: responseHeaders },
  );
}

export async function GET(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;

  const input = new URL(request.url).searchParams;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(parseRedisQuery(input));
    const key = input.get("key");
    if (key !== null) {
      if (!validKey(key))
        throw new Error(
          "This key cannot be previewed. Keys must be 1–1,024 bytes without control characters.",
        );
      params.set("key", key);
    }
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400, headers: responseHeaders },
    );
  }

  try {
    return Response.json(await readCoreRedis(params), {
      headers: responseHeaders,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;
  let body: { key?: unknown; type?: unknown; value?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Enter a valid Redis value." },
      { status: 400, headers: responseHeaders },
    );
  }
  const valueSize = JSON.stringify(body.value)?.length;
  if (
    !validKey(body.key) ||
    typeof body.type !== "string" ||
    !editableRedisType(body.type) ||
    valueSize === undefined ||
    valueSize > 140_000
  )
    return Response.json(
      { error: "This Redis edit is not supported." },
      { status: 400, headers: responseHeaders },
    );
  try {
    return Response.json(await updateCoreRedis(body), {
      headers: responseHeaders,
    });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  const denied = await unauthorized();
  if (denied) return denied;
  const key = new URL(request.url).searchParams.get("key");
  if (!validKey(key))
    return Response.json(
      { error: "This Redis key cannot be deleted." },
      { status: 400, headers: responseHeaders },
    );
  try {
    return Response.json(await deleteCoreRedis(key), {
      headers: responseHeaders,
    });
  } catch (error) {
    return failure(error);
  }
}
