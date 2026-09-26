import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "@/features/tasks/queries";
import { deleteTaskHistory, requestPortableExport } from "./api";

export function useDeleteTaskHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTaskHistory,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: taskKeys.details() }),
  });
}

export function usePortableExport() {
  return useMutation({ mutationFn: () => requestPortableExport() });
}
