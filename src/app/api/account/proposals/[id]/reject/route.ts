import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
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
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id))
    return NextResponse.json({ error: "Invalid proposal" }, { status: 400 });
  try {
    await core.rejectProposal(account.accountId, id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "The proposal could not be rejected" },
      { status: 409 },
    );
  }
}
