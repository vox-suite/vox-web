import {
  queryOptions,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { RemoteExtension } from "@/lib/consumer-auth/core-host-client";
import { extensionKeys } from "@/features/extensions/queries";
import {
  connectPlugin,
  getConnectedApps,
  getPluginCatalog,
  uninstallPlugin,
  type ConnectPluginResponse,
  type UninstallPluginResponse,
} from "./api";

export const pluginKeys = {
  all: ["plugins"] as const,
  catalog: () => [...pluginKeys.all, "catalog"] as const,
  connected: () => [...pluginKeys.all, "connected"] as const,
  connect: () => [...pluginKeys.all, "connect"] as const,
};

export const pluginQueries = {
  catalog: () =>
    queryOptions({
      queryKey: pluginKeys.catalog(),
      queryFn: ({ signal }) => getPluginCatalog(signal),
    }),
  connected: () =>
    queryOptions({
      queryKey: pluginKeys.connected(),
      queryFn: ({ signal }) => getConnectedApps(signal),
    }),
};

export function usePluginCatalog() {
  return useQuery(pluginQueries.catalog());
}

export function useConnectedApps() {
  return useQuery(pluginQueries.connected());
}

/**
 * Start connecting an app. When the provider needs a sign-in, the browser
 * leaves for the provider's login page and comes back to the OAuth callback.
 */
export function useConnectPlugin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: pluginKeys.connect(),
    mutationFn: (pluginId: string) => connectPlugin(pluginId),
    onSuccess: (data: ConnectPluginResponse) => {
      if (data.status === "authorize") {
        window.location.assign(data.authorizationUrl);
        return;
      }
      queryClient.invalidateQueries({ queryKey: extensionKeys.all });
      queryClient.invalidateQueries({ queryKey: pluginKeys.connected() });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: extensionKeys.all });
    },
  });
}

/**
 * True while any connect of this app is running (or the browser is leaving
 * for its sign-in page). An app can be listed in several places, each with
 * its own mutation, so per-card pending state alone lets a second click in.
 */
export function useIsConnectingPlugin(pluginId: string) {
  const states = useMutationState({
    filters: { mutationKey: pluginKeys.connect() },
    select: (mutation) => ({
      variables: mutation.state.variables as unknown,
      status: mutation.state.status,
      data: mutation.state.data as ConnectPluginResponse | undefined,
    }),
  });
  return states.some(
    (s) =>
      s.variables === pluginId &&
      (s.status === "pending" ||
        (s.status === "success" && s.data?.status === "authorize")),
  );
}

export function useUninstallPlugin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => uninstallPlugin(id),
    onSuccess: (_data: UninstallPluginResponse, id: string) => {
      queryClient.setQueryData<RemoteExtension[]>(
        extensionKeys.list(),
        (current) =>
          current?.filter((ext) => ext.id !== id && ext.external_key !== id),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: extensionKeys.all });
      queryClient.invalidateQueries({ queryKey: pluginKeys.connected() });
    },
  });
}
