import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { UserPreference } from "@/lib/consumer-auth/core-host-client";
import { deletePreference, listPreferences, savePreference } from "./api";

export const preferenceKeys = {
  all: ["preferences"] as const,
  list: () => [...preferenceKeys.all, "list"] as const,
};

export const preferenceQueries = {
  list: () =>
    queryOptions({
      queryKey: preferenceKeys.list(),
      queryFn: ({ signal }) => listPreferences(signal),
    }),
};

export function usePreferences() {
  return useQuery(preferenceQueries.list());
}

export function useSavePreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: savePreference,
    onSuccess: (saved) => {
      queryClient.setQueryData<UserPreference[]>(
        preferenceKeys.list(),
        (current = []) => [
          saved,
          ...current.filter((p) => p.preference_key !== saved.preference_key),
        ],
      );
    },
  });
}

export function useDeletePreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePreference,
    onMutate: async (key) => {
      await queryClient.cancelQueries({ queryKey: preferenceKeys.list() });
      const previous = queryClient.getQueryData<UserPreference[]>(
        preferenceKeys.list(),
      );
      queryClient.setQueryData<UserPreference[]>(
        preferenceKeys.list(),
        (current) => current?.filter((p) => p.preference_key !== key),
      );
      return { previous };
    },
    onError: (_error, _key, context) => {
      if (context?.previous)
        queryClient.setQueryData(preferenceKeys.list(), context.previous);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: preferenceKeys.list() }),
  });
}
