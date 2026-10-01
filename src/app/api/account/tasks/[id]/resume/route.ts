import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { isSameOriginRequest } from "@/lib/consumer-auth/request";
import { CoreHostRequestError } from "@/lib/consumer-auth/core-host-client";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const account = await currentConsumer();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  try {
    const { id } = await params;
    const task = await core.resumeTask(account.accountId, id);
    return NextResponse.json(
      { task },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const status =
      error instanceof CoreHostRequestError && error.status === 409 ? 409 : 502;
    return NextResponse.json(
      {
        error:
          "Task cannot continue yet. Resolve its current wait and refresh status.",
      },
      { status },
    );
  }
}
