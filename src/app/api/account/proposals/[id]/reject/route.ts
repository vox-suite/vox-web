import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";

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
    return NextResponse.json({ error: "Proposal ID is required" }, { status: 400 });
  }

  // Rejecting proposal marks it explicitly rejected for the client session
  return NextResponse.json({
    status: "rejected",
    proposal_id: proposalId,
    message: "Action proposal has been rejected by user. The agent will not execute this action.",
  });
}
