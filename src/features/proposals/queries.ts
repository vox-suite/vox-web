import { useMutation } from "@tanstack/react-query";
import { approveProposal, rejectProposal } from "./api";

export function useApproveProposal() {
  return useMutation({ mutationFn: approveProposal });
}

export function useRejectProposal() {
  return useMutation({ mutationFn: rejectProposal });
}
