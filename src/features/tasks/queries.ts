import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { cancelTask, listTasks, resumeTask, startTask } from "./api";

export const taskKeys = {
  all: ["tasks"] as const,
  list: () => ["tasks", "list"] as const,
};

/** Only Core's scoped pages determine saved tasks; reloading never loses the task index. */
export function useTasks() {
  return useInfiniteQuery({
    queryKey: taskKeys.list(),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) => listTasks(pageParam, signal),
    getNextPageParam: (page) => page.next_cursor ?? undefined,
    refetchInterval: (query) =>
      query.state.data?.pages.some((page) =>
        page.tasks.some(
          (task) => task.state === "queued" || task.state === "running",
        ),
      )
        ? 15_000
        : false,
  });
}

export function useStartTask() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: startTask,
    onSuccess: () => client.invalidateQueries({ queryKey: taskKeys.list() }),
  });
}
export function useCancelTask() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: cancelTask,
    onSuccess: () => client.invalidateQueries({ queryKey: taskKeys.list() }),
  });
}

export function useResumeTask() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: resumeTask,
    onSuccess: () => client.invalidateQueries({ queryKey: taskKeys.list() }),
  });
}
