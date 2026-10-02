import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { isAgentKey } from "@/features/delegation/validation";
export async function GET(request: NextRequest) {
  const account = await currentConsumer();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  const requester = request.nextUrl.searchParams.get("requester");
  const specialist = request.nextUrl.searchParams.get("specialist");
  if (
    !isAgentKey(requester) ||
    !isAgentKey(specialist) ||
    requester === specialist
  )
    return NextResponse.json(
      { error: "Choose different assistants" },
      { status: 400 },
    );
  try {
    return NextResponse.json(
      await core.delegationScopes(account.accountId, requester, specialist),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Specialist account access could not be loaded" },
      { status: 502 },
    );
  }
}
