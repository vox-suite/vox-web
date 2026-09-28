import { useMutation, useQuery } from "@tanstack/react-query";
import {
  approveProposal,
  rejectProposal,
  listProposals,
  executeApprovedProposal,
} from "./api";

export function useApproveProposal() {
  return useMutation({ mutationFn: approveProposal });
}

export function useRejectProposal() {
  return useMutation({ mutationFn: rejectProposal });
}

export function useProposals() {
  return useQuery({
    queryKey: ["proposals"],
    queryFn: ({ signal }) => listProposals(signal),
    refetchInterval: 15000,
  });
}
export function useExecuteProposal() {
  return useMutation({
    mutationFn: ({
      proposal,
      idempotencyKey,
    }: {
      proposal: import("@/lib/consumer-auth/core-host-client").ActionProposal;
      idempotencyKey: string;
    }) => executeApprovedProposal(proposal, idempotencyKey),
  });
}
