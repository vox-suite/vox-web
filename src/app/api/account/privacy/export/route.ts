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
    const body = await request.json().catch(() => ({}));
    const categories = body.categories || ["preferences", "config", "tasks"];

    const exportResult = await core.requestPortableExport(
      account.accountId,
      categories,
    );

    return NextResponse.json({
      export: exportResult,
      disclosure:
        "Portable export contains documented non-secret preferences, configurations, and task metadata. " +
        "Raw credentials, active approvals, and reusable action authority are strictly excluded. " +
        "Imported connections will require fresh authorization on any destination host.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate portable export",
      },
      { status: 400 },
    );
  }
}
