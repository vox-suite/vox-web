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
    const body = await request.json();
    const proposal = await core.createProposal(account.accountId, {
      task_id: body.task_id,
      task_run_id: body.task_run_id,
      agent_external_key: body.agent_external_key,
      capability_external_key: body.capability_external_key,
      details: body.details,
      expires_at: body.expires_at,
      replaces_proposal_id: body.replaces_proposal_id || null,
    });
    return NextResponse.json({ proposal }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create proposal",
      },
      { status: 400 },
    );
  }
}
