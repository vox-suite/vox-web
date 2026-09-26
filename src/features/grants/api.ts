import { apiRequest } from "@/lib/api/http";
import type {
  CapabilityGrant,
  CreateGrantRequest,
} from "@/lib/consumer-auth/core-host-client";

export async function listGrants(agentKey: string, signal?: AbortSignal) {
  const { grants } = await apiRequest<{ grants: CapabilityGrant[] }>(
    "/api/account/grants",
    {
      query: { agentKey },
      signal,
      fallbackError: "Failed to load capability grants",
    },
  );
  return grants;
}

export async function createGrant(input: CreateGrantRequest) {
  const { grant } = await apiRequest<{ grant: CapabilityGrant }>(
    "/api/account/grants",
    {
      method: "POST",
      body: input,
      fallbackError: "Grant creation denied by Core policy",
    },
  );
  return grant;
}

export async function revokeGrant(input: CreateGrantRequest) {
  await apiRequest<null>("/api/account/grants", {
    method: "DELETE",
    body: input,
    fallbackError: "Grant revocation failed",
  });
}
