import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { CoreHostRequestError } from "@/lib/consumer-auth/core-host-client";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import type { Connection } from "@/lib/consumer-auth/core-host-client";

export async function POST(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  const body = await request.json().catch(() => null);
  if (
    typeof body?.npsso !== "string" ||
    !/^[A-Za-z0-9_-]{64}$/.test(body.npsso) ||
    typeof body.capture_enabled !== "boolean"
  ) {
    return NextResponse.json(
      {
        error:
          "Enter a valid Sony session token and choose whether to capture activity.",
      },
      { status: 400 },
    );
  }
  try {
    const connection = await core.playStation<Connection>(
      account.accountId,
      "link",
      { npsso: body.npsso, capture_enabled: body.capture_enabled },
    );
    return NextResponse.json(
      { connection },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const status = error instanceof CoreHostRequestError ? error.status : 502;
    const message =
      status === 503
        ? "PlayStation capture is not configured on the server."
        : status === 429
          ? "Sony has limited requests. Vox will retry later."
          : status === 401
            ? "PlayStation access expired. Reconnect with a fresh Sony session token."
            : "PlayStation request failed. Check the session token or try again later.";
    return NextResponse.json({ error: message }, { status });
  }
}
