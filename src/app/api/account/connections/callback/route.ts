import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const connection = await core.verifyConnectionCallback(account.accountId, {
      session_id: body.session_id,
      state_token: body.state_token,
      authorization: body.authorization,
    });
    return NextResponse.json({ connection });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify connection callback" },
      { status: 400 },
    );
  }
}
