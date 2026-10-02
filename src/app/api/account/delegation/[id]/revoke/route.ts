import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { isSameOriginRequest } from "@/lib/consumer-auth/request";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
  const { id } = await params;
  try {
    await core.revokeDelegationPermission(account.accountId, id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Permission could not be revoked. Refresh and try again." },
      { status: 409 },
    );
  }
}
