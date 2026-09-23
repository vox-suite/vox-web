import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const account = await currentConsumer(request.headers);
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const core = getCoreHostClient();
  if (!core) {
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  }

  try {
    const task = await core.cancelTask(account.accountId, id);
    return NextResponse.json({
      task,
      disclosure: "Task cancellation halts future work without claiming undo of completed steps.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel task" },
      { status: 400 },
    );
  }
}
