import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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

  const { id: bookingId } = await context.params;

  try {
    const body = await request.json();
    if (!body.connection_id) {
      return NextResponse.json(
        { error: "connection_id is required" },
        { status: 400 },
      );
    }

    const cancelResult = await core.cancelLodgingBooking(
      account.accountId,
      bookingId,
      body.connection_id,
      body.reason,
      body.agent_external_key,
    );

    return NextResponse.json(cancelResult);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel lodging booking" },
      { status: 400 },
    );
  }
}
