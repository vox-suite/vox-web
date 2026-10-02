import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { CoreHostRequestError } from "@/lib/consumer-auth/core-host-client";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> },
) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const { id, action } = await params;
  if (
    !/^[0-9a-f-]{36}$/i.test(id) ||
    !["status", "capture", "sync"].includes(action)
  )
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  let input: Record<string, unknown> = {};
  if (action === "capture") {
    const body = await request.json().catch(() => null);
    if (typeof body?.capture_enabled !== "boolean")
      return NextResponse.json(
        { error: "Choose whether to capture gaming activity." },
        { status: 400 },
      );
    input = { capture_enabled: body.capture_enabled };
  }
  try {
    const result = await core.playStation(
      account.accountId,
      `${encodeURIComponent(id)}/${action}`,
      input,
    );
    return NextResponse.json(result ?? { saved: true }, {
      headers: { "Cache-Control": "no-store" },
    });
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
