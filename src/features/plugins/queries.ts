import {
  queryOptions,
  useMutation,
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

export function useUninstallPlugin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => uninstallPlugin(id),
    onSuccess: (_data: UninstallPluginResponse, id: string) => {
      queryClient.setQueryData<RemoteExtension[]>(
        extensionKeys.list(),
        (current) =>
          current?.filter(
            (ext) => ext.id !== id && ext.external_key !== id,
          ),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: extensionKeys.all });
      queryClient.invalidateQueries({ queryKey: grantKeys.all });
    },
  });
}
