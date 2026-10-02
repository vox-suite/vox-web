import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
export async function GET(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Supabase reads the request cookie store.
  request: NextRequest,
) {
  const account = await currentConsumer();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  try {
    return NextResponse.json({
      proposals: await core.listProposals(account.accountId),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load proposals" },
      { status: 502 },
    );
  }
}
