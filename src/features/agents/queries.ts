import { queryOptions, useQuery } from "@tanstack/react-query";
import { listAgents } from "./api";

export const agentKeys = {
  all: ["agents"] as const,
  selected: () => [...agentKeys.all, "selected"] as const,
};

export const agentQueries = {
  /** The agents selected for this deployment rarely change during a session. */
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
