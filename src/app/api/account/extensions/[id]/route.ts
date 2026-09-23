import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const account = await currentConsumer(request.headers);
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: extensionId } = await params;
  if (!extensionId) {
    return NextResponse.json({ error: "Extension ID is required" }, { status: 400 });
  }

  const core = getCoreHostClient();
  if (!core) {
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  }

  try {
    const extension = await core.getExtension(account.accountId, extensionId);
    return NextResponse.json({ extension });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get extension" },
      { status: 404 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const account = await currentConsumer(request.headers);
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: extensionId } = await params;
  if (!extensionId) {
    return NextResponse.json({ error: "Extension ID is required" }, { status: 400 });
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
    const updated = await core.updateExtension(account.accountId, extensionId, {
      endpoint_url: body.endpoint_url,
      operator: body.operator,
      capabilities: body.capabilities,
    });
    return NextResponse.json({ extension: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update extension" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const account = await currentConsumer(request.headers);
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: extensionId } = await params;
  if (!extensionId) {
    return NextResponse.json({ error: "Extension ID is required" }, { status: 400 });
  }

  const core = getCoreHostClient();
  if (!core) {
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  }

  try {
    const removed = await core.removeExtension(account.accountId, extensionId);
    return NextResponse.json({ extension: removed });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove extension" },
      { status: 400 },
    );
  }
}
