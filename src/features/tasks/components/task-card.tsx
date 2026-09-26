"use client";

import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui";
import { Callout, ItemCard, StatusBadge } from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import { isTaskTerminal } from "../api";
import { useCancelTask, useTask } from "../queries";

export function TaskCard({ taskId }: { taskId: string }) {
  const { data: task, error, isFetching, refetch } = useTask(taskId);
  const cancel = useCancelTask();

  if (!task) return null;
  const failure = cancel.error ?? error;

  return (
    <ItemCard
      testId={`task-${task.id}`}
      title={task.title}
      subtitle={task.instruction}
      badges={<StatusBadge status={task.state} />}
      actions={
        <>
          <Button
            variant="secondary"
            size="sm"
            aria-label={`Check authoritative status for task: ${task.title}`}
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RotateCw
              aria-hidden="true"
              className={isFetching ? "animate-spin" : undefined}
            />
            {isFetching ? "Checking…" : "Refresh status"}
          </Button>
          {!isTaskTerminal(task) ? (
            <Button
              variant="danger"
              size="sm"
              aria-label={`Cancel task: ${task.title}`}
              disabled={cancel.isPending}
              onClick={() => cancel.mutate(task.id)}
            >
              {cancel.isPending ? "Cancelling…" : "Cancel"}
            </Button>
          ) : null}
        </>
      }
      footer={<span>Agent: {task.agent_external_key || "None"}</span>}
    >
      {task.wait_reason ? (
        <Callout tone="warning" title="Waiting">
          <p>{task.wait_reason}</p>
        </Callout>
      ) : null}
      {failure ? (
        <Callout tone="danger" live="assertive">
          <p>{errorMessage(failure)}</p>
        </Callout>
      ) : null}
    </ItemCard>
  );
}
