import { useMutation } from "@tanstack/react-query";
import { confirmRecoveryEnrollment, startRecoveryEnrollment } from "./api";

export function useStartRecovery() {
  return useMutation({ mutationFn: startRecoveryEnrollment });
}

export function useConfirmRecovery() {
  return useMutation({ mutationFn: confirmRecoveryEnrollment });
}
