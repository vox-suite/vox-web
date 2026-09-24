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

  const { id: extensionId } = await params;
  if (!extensionId) {
    return NextResponse.json(
      { error: "Extension ID is required" },
      { status: 400 },
    );
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
    if (typeof body.enabled !== "boolean") {
      return NextResponse.json(
        { error: "Field 'enabled' (boolean) is required" },
        { status: 400 },
      );
    }

    const updated = await core.setExtensionEnabled(
      account.accountId,
      extensionId,
      body.enabled,
    );
    return NextResponse.json({ extension: updated });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle operator enablement",
      },
      { status: 400 },
    );
  }
}
