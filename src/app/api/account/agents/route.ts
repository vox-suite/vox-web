import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function GET(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  try {
    const agents = await core.selectedAgents(account.accountId);
    return NextResponse.json({ agents });
  } catch {
    return NextResponse.json(
      { error: "Unable to load agents" },
      { status: 502 },
    );
  }
}
