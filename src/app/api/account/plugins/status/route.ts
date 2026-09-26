import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function GET(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const core = getCoreHostClient();
  if (!core) {
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  }
  try {
    const status = await core.connectedAppsStatus(account.accountId);
    return NextResponse.json({ connected: status.connected });
  } catch {
    return NextResponse.json(
      { error: "Couldn't load connected apps" },
      { status: 502 },
    );
  }
}
