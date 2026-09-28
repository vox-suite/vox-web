import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (
    !/^[a-f0-9-]{36}$/.test(id) ||
    !/^[a-f0-9-]{36}$/.test(body?.approvalId ?? "") ||
    !/^[a-f0-9-]{36}$/.test(body?.idempotencyKey ?? "")
  )
    return NextResponse.json(
      { error: "Invalid approved execution" },
      { status: 400 },
    );
  try {
    const proposals = await core.listProposals(account.accountId);
    if (
      !proposals.some(
        (proposal) =>
          proposal.id === id && proposal.approval_id === body.approvalId,
      )
    )
      return NextResponse.json(
        { error: "Approval is unavailable" },
        { status: 409 },
      );
    return NextResponse.json({
      execution: await core.executeApprovedTool(
        account.accountId,
        body.approvalId,
        body.idempotencyKey,
      ),
    });
  } catch {
    return NextResponse.json(
      { error: "Execution state is uncertain. Refresh before trying again." },
      { status: 502 },
    );
  }
}
