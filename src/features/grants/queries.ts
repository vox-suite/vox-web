import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  CapabilityGrant,
  CreateGrantRequest,
} from "@/lib/consumer-auth/core-host-client";
import { createGrant, listGrants, revokeGrant } from "./api";

export const grantKeys = {
  all: ["grants"] as const,
  lists: () => [...grantKeys.all, "list"] as const,
  list: (agentKey: string) => [...grantKeys.lists(), agentKey] as const,
};

export const grantQueries = {
  list: (agentKey: string) =>
    queryOptions({
      queryKey: grantKeys.list(agentKey),
      queryFn: ({ signal }) => listGrants(agentKey, signal),
      enabled: Boolean(agentKey),
    }),
};

export function useGrants(agentKey: string) {
  return useQuery(grantQueries.list(agentKey));
}

export function isSameGrant(grant: CapabilityGrant, input: CreateGrantRequest) {
  return (
    grant.connection_id === input.connection_id &&
    grant.capability_external_key === input.capability_external_key
  );
}

/**
 * Grant and revoke update the agent's list optimistically, roll back on
 * failure, and always re-read Core's authoritative list afterwards.
 */
function useGrantMutation(
  mutationFn: (input: CreateGrantRequest) => Promise<unknown>,
  apply: (
    grants: CapabilityGrant[],
    input: CreateGrantRequest,
  ) => CapabilityGrant[],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (input) => {
      const key = grantKeys.list(input.agent_external_key);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<CapabilityGrant[]>(key);
      if (previous) queryClient.setQueryData(key, apply(previous, input));
      return { previous };
    },
    onError: (_error, input, context) => {
      if (context?.previous)
        queryClient.setQueryData(
          grantKeys.list(input.agent_external_key),
          context.previous,
        );
    },
    onSettled: (_data, _error, input) =>
      queryClient.invalidateQueries({
        queryKey: grantKeys.list(input.agent_external_key),
      }),
  });
}

export function useCreateGrant() {
  return useGrantMutation(createGrant, (grants, input) => [
    ...grants,
    {
      id: `pending:${input.connection_id}:${input.capability_external_key}`,
      ...input,
    },
  ]);
}

export function useRevokeGrant() {
  return useGrantMutation(revokeGrant, (grants, input) =>
    grants.filter((grant) => !isSameGrant(grant, input)),
  );
}
