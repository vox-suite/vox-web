import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Connection } from "@/lib/consumer-auth/core-host-client";
import { grantKeys } from "@/features/grants/queries";
import { disconnectConnection, listConnections } from "./api";

export const connectionKeys = {
  all: ["connections"] as const,
  list: () => [...connectionKeys.all, "list"] as const,
};

export const connectionQueries = {
  list: () =>
    queryOptions({
      queryKey: connectionKeys.list(),
      queryFn: ({ signal }) => listConnections(signal),
    }),
};

export function useConnections() {
  return useQuery(connectionQueries.list());
}

/** Authorized connections are the only ones an agent can be granted access through. */
export function useAuthorizedConnections() {
  return useQuery({
    ...connectionQueries.list(),
    select: (connections) =>
      connections.filter((c) => c.authorization_state === "authorized"),
  });
}

export function useDisconnectConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectConnection,
    onSuccess: ({ connection }) => {
      queryClient.setQueryData<Connection[]>(connectionKeys.list(), (current) =>
        current?.map((c) => (c.id === connection.id ? connection : c)),
      );
      // Core revokes grants that relied on this connection.
      void queryClient.invalidateQueries({ queryKey: grantKeys.all });
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: connectionKeys.list() }),
  });
}
