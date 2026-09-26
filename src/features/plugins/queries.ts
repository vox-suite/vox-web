import {
  queryOptions,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { RemoteExtension } from "@/lib/consumer-auth/core-host-client";
import { extensionKeys } from "@/features/extensions/queries";
import { grantKeys } from "@/features/grants/queries";
import {
  getPluginCatalog,
  installPlugin,
  uninstallPlugin,
  type InstallPluginResponse,
  type UninstallPluginResponse,
} from "./api";

export const pluginKeys = {
  all: ["plugins"] as const,
  catalog: () => [...pluginKeys.all, "catalog"] as const,
  install: () => [...pluginKeys.all, "install"] as const,
};

export const pluginQueries = {
  catalog: () =>
    queryOptions({
      queryKey: pluginKeys.catalog(),
      queryFn: ({ signal }) => getPluginCatalog(signal),
    }),
};

export function usePluginCatalog() {
  return useQuery(pluginQueries.catalog());
}

export function useInstallPlugin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: pluginKeys.install(),
    mutationFn: (input: string | { pluginId: string }) => installPlugin(input),
    onSuccess: (data: InstallPluginResponse) => {
      if (data?.extension) {
        queryClient.setQueryData<RemoteExtension[]>(
          extensionKeys.list(),
          (current) =>
            current
              ? [
                  ...current.filter(
                    (ext) =>
                      ext.id !== data.extension.id &&
                      ext.external_key !== data.extension.external_key,
                  ),
                  data.extension,
                ]
              : [data.extension],
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: extensionKeys.all });
      queryClient.invalidateQueries({ queryKey: grantKeys.all });
    },
  });
}

/**
 * True while any install of this plugin is running. A plugin can be listed in
 * several places (a card per category, the inspector), each with its own
 * mutation, so per-card pending state alone lets a second click overlap.
 */
export function useIsInstallingPlugin(pluginId: string) {
  const pending = useMutationState({
    filters: { mutationKey: pluginKeys.install(), status: "pending" },
    select: (mutation) => mutation.state.variables as unknown,
  });
  return pending.some(
    (variables) =>
      variables === pluginId ||
      (typeof variables === "object" &&
        variables !== null &&
        (variables as { pluginId?: string }).pluginId === pluginId),
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
      queryClient.invalidateQueries({ queryKey: grantKeys.all });
    },
  });
}
