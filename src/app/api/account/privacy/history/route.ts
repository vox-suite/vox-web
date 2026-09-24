import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { DELETION_DISCLOSURE } from "@/lib/consumer-auth/constants";

export async function DELETE(request: NextRequest) {
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
    const url = new URL(request.url);
    const deleteConversations =
      url.searchParams.get("delete_conversations") !== "false";

    const result = await core.deleteTaskHistory(
      account.accountId,
      deleteConversations,
    );

    return NextResponse.json({
      deleted_tasks_count: result.deleted_tasks_count,
      deleted_conversations_count: result.deleted_conversations_count,
      disclosure: DELETION_DISCLOSURE,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete task history",
      },
      { status: 400 },
    );
  }
}
