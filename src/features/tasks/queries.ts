import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { DurableTask } from "@/lib/consumer-auth/core-host-client";
import { cancelTask, getTask, startTask } from "./api";

export const taskKeys = {
  all: ["tasks"] as const,
  /**
   * Core exposes no task listing, so the app remembers the IDs of tasks
   * started in this browser session. Each task's state is still read from
   * Core through `detail`.
   */
  started: () => [...taskKeys.all, "started"] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (taskId: string) => [...taskKeys.details(), taskId] as const,
};

export const taskQueries = {
  started: () =>
    queryOptions({
      queryKey: taskKeys.started(),
      queryFn: () => [] as string[],
      initialData: [] as string[],
      staleTime: Infinity,
      gcTime: Infinity,
    }),
  detail: (taskId: string) =>
    queryOptions({
      queryKey: taskKeys.detail(taskId),
      queryFn: ({ signal }) => getTask(taskId, signal),
    }),
};

export function useStartedTaskIds() {
  return useQuery(taskQueries.started()).data;
}

export function useTask(taskId: string) {
  return useQuery(taskQueries.detail(taskId));
}

export function useStartTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startTask,
    onSuccess: (task) => {
      queryClient.setQueryData(taskKeys.detail(task.id), task);
      queryClient.setQueryData<string[]>(taskKeys.started(), (ids = []) => [
        task.id,
        ...ids.filter((id) => id !== task.id),
      ]);
    },
  });
}

export function useCancelTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelTask,
    onSuccess: (task) => {
      queryClient.setQueryData<DurableTask>(taskKeys.detail(task.id), task);
    },
  });
}
