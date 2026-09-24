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

  const { id: proposalId } = await params;
  if (!proposalId) {
    return NextResponse.json(
      { error: "Proposal ID is required" },
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
    if (!body.details || typeof body.details !== "object") {
      return NextResponse.json(
        { error: "Exact proposal details are required for approval" },
        { status: 400 },
      );
    }

    const approved = await core.approveProposal(
      account.accountId,
      proposalId,
      body.details,
    );
    return NextResponse.json({ proposal: approved });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to approve proposal",
      },
      { status: 409 },
    );
  }
}
