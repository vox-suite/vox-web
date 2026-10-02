import { apiRequest } from "@/lib/api/http";
import type {
  DelegationPermission,
  DelegationPermissionRequest,
  DelegationScopes,
} from "@/lib/consumer-auth/core-host-client";
export async function listPermissions(signal?: AbortSignal) {
  return (
    await apiRequest<{ permissions: DelegationPermission[] }>(
      "/api/account/delegation",
      { signal },
    )
  ).permissions;
}
export function readScopes(
  requester: string,
  specialist: string,
  signal?: AbortSignal,
) {
  return apiRequest<DelegationScopes>("/api/account/delegation/scopes", {
    query: { requester, specialist },
    signal,
  });
}
export function createPermission(permission: DelegationPermissionRequest) {
  return apiRequest<{ id: string }>("/api/account/delegation", {
    method: "POST",
    body: permission,
    fallbackError: "Specialist permission could not be saved",
  });
}
export function revokePermission(id: string) {
  return apiRequest<void>(
    `/api/account/delegation/${encodeURIComponent(id)}/revoke`,
    {
      method: "POST",
      fallbackError: "Specialist permission could not be revoked",
    },
  );
}
