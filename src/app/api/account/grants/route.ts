import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function GET(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const agentKey = searchParams.get("agentKey") || "saathi";

  const core = getCoreHostClient();
  if (!core) {
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  }

  try {
    const grants = await core.listEffectiveGrants(account.accountId, agentKey);
    return NextResponse.json({ grants });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list effective grants" },
      { status: 400 },
    );
  }
}

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
    const body = await request.json();
    const grant = await core.createGrant(account.accountId, {
      agent_external_key: body.agent_external_key,
      connection_id: body.connection_id,
      capability_external_key: body.capability_external_key,
    });
    return NextResponse.json({ grant }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create capability grant" },
      { status: 400 },
    );
  }
}

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
    const body = await request.json();
    await core.revokeGrant(account.accountId, {
      agent_external_key: body.agent_external_key,
      connection_id: body.connection_id,
      capability_external_key: body.capability_external_key,
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to revoke capability grant" },
      { status: 400 },
    );
  }
}
