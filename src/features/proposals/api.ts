import { apiRequest } from "@/lib/api/http";
import type { ActionProposal } from "@/lib/consumer-auth/core-host-client";

export async function approveProposal(proposal: ActionProposal) {
  const { proposal: approved } = await apiRequest<{ proposal: ActionProposal }>(
    `/api/account/proposals/${encodeURIComponent(proposal.id)}/approve`,
    {
      method: "POST",
      body: { details: proposal.details },
      fallbackError: "Approval rejected by Core validation",
    },
  );
  return approved;
}

export async function rejectProposal(proposalId: string) {
  await apiRequest<{
    status: "rejected";
    proposal_id: string;
    message: string;
  }>(`/api/account/proposals/${encodeURIComponent(proposalId)}/reject`, {
    method: "POST",
    fallbackError: "Rejection failed",
  });
}

export type ProposalStatus = "pending" | "approved" | "superseded" | "expired";

export function proposalStatus(
  proposal: ActionProposal,
  now: number,
): ProposalStatus {
  if (
    proposal.state === "expired" ||
    new Date(proposal.expires_at).getTime() <= now
  )
    return "expired";
  if (proposal.state === "superseded") return "superseded";
  if (proposal.state === "approved") return "approved";
  return "pending";
}
