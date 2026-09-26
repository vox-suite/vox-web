import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { RemoteExtension } from "@/lib/consumer-auth/core-host-client";
import { installExtension, listExtensions, removeExtension } from "./api";

export const extensionKeys = {
  all: ["extensions"] as const,
  list: () => [...extensionKeys.all, "list"] as const,
};

export const extensionQueries = {
  list: () =>
    queryOptions({
      queryKey: extensionKeys.list(),
      queryFn: ({ signal }) => listExtensions(signal),
    }),
};

export function useExtensions() {
  return useQuery(extensionQueries.list());
}

export function useInstallExtension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: installExtension,
    onSuccess: (extension) => {
      queryClient.setQueryData<RemoteExtension[]>(
        extensionKeys.list(),
        (current) => (current ? [...current, extension] : [extension]),
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: extensionKeys.list() }),
  });
}

export function useRemoveExtension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeExtension,
    onSuccess: (removed) => {
      queryClient.setQueryData<RemoteExtension[]>(
        extensionKeys.list(),
        (current) =>
          current?.map((ext) => (ext.id === removed.id ? removed : ext)),
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: extensionKeys.list() }),
  });
}
