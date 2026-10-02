import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listPermissions,
  readScopes,
  createPermission,
  revokePermission,
} from "./api";
export const delegationKeys = { all: ["delegation"] as const };
export function usePermissions() {
  return useQuery({
    queryKey: [...delegationKeys.all, "permissions"],
    queryFn: ({ signal }) => listPermissions(signal),
  });
}
export function useScopes(requester: string, specialist: string) {
  return useQuery({
    queryKey: [...delegationKeys.all, "scopes", requester, specialist],
    enabled: !!requester && !!specialist && requester !== specialist,
    queryFn: ({ signal }) => readScopes(requester, specialist, signal),
  });
}
export function useCreatePermission() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: createPermission,
    onSuccess: () => cache.invalidateQueries({ queryKey: delegationKeys.all }),
  });
}
export function useRevokePermission() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: revokePermission,
    onSuccess: () => cache.invalidateQueries({ queryKey: delegationKeys.all }),
  });
}
