import { apiRequest } from "@/lib/api/http";
import type {
  DurableTask,
  DurableTaskPage,
  StartTaskRequest,
} from "@/lib/consumer-auth/core-host-client";

export async function startTask(input: StartTaskRequest) {
  const { task } = await apiRequest<{ task: DurableTask }>(
    "/api/account/tasks",
    { method: "POST", body: input, fallbackError: "Failed to submit task" },
  );
  return task;
}

export function listTasks(cursor?: string, signal?: AbortSignal) {
  return apiRequest<DurableTaskPage>("/api/account/tasks", {
    query: { cursor, limit: 20 },
    signal,
    fallbackError: "Failed to fetch saved tasks",
  });
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

export async function resumeTask({
  taskId,
  reply,
}: {
  taskId: string;
  reply?: string;
}) {
  const { task } = await apiRequest<{ task: DurableTask }>(
    `/api/account/tasks/${encodeURIComponent(taskId)}/resume`,
    {
      method: "POST",
      body: reply === undefined ? undefined : { reply },
      fallbackError: "Task cannot continue yet",
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

export function stopAllTasks() {
  return apiRequest<{ cancelled: number; undo: false }>(
    "/api/account/tasks/stop-all",
    { method: "POST", fallbackError: "Tasks could not be stopped" },
  );
}
