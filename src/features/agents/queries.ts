import { queryOptions, useQuery } from "@tanstack/react-query";
import { listAgents } from "./api";

export const agentKeys = {
  all: ["agents"] as const,
  selected: () => [...agentKeys.all, "selected"] as const,
};

export const agentQueries = {
  /** Owned assistants are cached briefly and invalidated after configuration changes. */
  selected: () =>
    queryOptions({
      queryKey: agentKeys.selected(),
      queryFn: ({ signal }) => listAgents(signal),
      staleTime: 5 * 60_000,
    }),
};

export function useAgents() {
  return useQuery(agentQueries.selected());
}
