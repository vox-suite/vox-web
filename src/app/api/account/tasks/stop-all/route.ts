import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { isSameOriginRequest } from "@/lib/consumer-auth/request";
export async function POST(request: NextRequest) {
  const account = await currentConsumer();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  try {
    return NextResponse.json(await core.stopAllTasks(account.accountId));
  } catch {
    return NextResponse.json(
      {
        error:
          "Tasks could not be stopped. Check their current status before trying again.",
      },
      { status: 502 },
    );
  }
}
