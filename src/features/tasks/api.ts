import { apiRequest } from "@/lib/api/http";
import type {
  DurableTask,
  StartTaskRequest,
} from "@/lib/consumer-auth/core-host-client";

export async function startTask(input: StartTaskRequest) {
  const { task } = await apiRequest<{ task: DurableTask }>(
    "/api/account/tasks",
    { method: "POST", body: input, fallbackError: "Failed to submit task" },
  );
  return task;
}

export async function getTask(taskId: string, signal?: AbortSignal) {
  const { task } = await apiRequest<{ task: DurableTask }>(
    "/api/account/tasks",
    {
      query: { taskId },
      signal,
      fallbackError: "Failed to fetch authoritative task state",
    },
  );
  return task;
}

export async function cancelTask(taskId: string) {
  const { task } = await apiRequest<{ task: DurableTask; disclosure: string }>(
    `/api/account/tasks/${encodeURIComponent(taskId)}/cancel`,
    { method: "POST", fallbackError: "Failed to cancel task" },
  );
  return task;
}

const TERMINAL_STATES: ReadonlySet<DurableTask["state"]> = new Set([
  "completed",
  "cancelled",
  "failed",
]);

export function isTaskTerminal(task: Pick<DurableTask, "state">) {
  return TERMINAL_STATES.has(task.state);
}
