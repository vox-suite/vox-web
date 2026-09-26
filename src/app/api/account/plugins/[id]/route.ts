import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const account = await currentConsumer(request.headers);
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Plugin ID or Extension ID is required" },
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
    const extensions = await core.listExtensions(account.accountId);
    const target = extensions.find(
      (ext) =>
        (ext.id === id || ext.external_key === id) &&
        ext.lifecycle_state !== "removed",
    );

    if (!target) {
      return NextResponse.json(
        { error: "Extension not found" },
        { status: 404 },
      );
    }

    const removed = await core.removeExtension(account.accountId, target.id);
    return NextResponse.json(
      { success: true, extension: removed },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove plugin extension",
      },
      { status: 400 },
    );
  }
}
