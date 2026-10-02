"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui";
import { Callout, ItemCard, Tag } from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import { isTaskTerminal } from "../api";
import type { DurableTask } from "@/lib/consumer-auth/core-host-client";
import { useCancelTask, useResumeTask } from "../queries";

export function TaskCard({
  task,
  isFetching,
  onRefresh,
}: {
  task: DurableTask;
  isFetching: boolean;
  onRefresh: () => void;
}) {
  const cancel = useCancelTask();
  const resume = useResumeTask();
  const [reply, setReply] = useState("");

  const failure = cancel.error ?? resume.error;

  return (
    <ItemCard
      testId={`task-${task.id}`}
      title={task.title}
      subtitle={task.result.summary ?? `Run ${task.run_id}`}
      badges={<Tag label={`Task status: ${task.state}`}>{task.state}</Tag>}
      actions={
        <>
          <Button
            variant="secondary"
            size="sm"
            aria-label={`Check authoritative status for task: ${task.title}`}
            disabled={isFetching}
            onClick={onRefresh}
          >
            <RotateCw
              aria-hidden="true"
              className={isFetching ? "animate-spin" : undefined}
            />
            {isFetching ? "Checking…" : "Refresh status"}
          </Button>
          {task.state === "waiting" && task.wait_reason !== "budget" ? (
            <Button
              variant="secondary"
              size="sm"
              disabled={
                resume.isPending ||
                (task.wait_reason === "clarification" &&
                  (!reply.trim() ||
                    new TextEncoder().encode(reply).length > 8192))
              }
              onClick={() =>
                resume.mutate({
                  taskId: task.id,
                  ...(task.wait_reason === "clarification" ? { reply } : {}),
                })
              }
            >
              {resume.isPending ? "Continuing…" : "Check and continue"}
            </Button>
          ) : null}
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
      footer={
        <span>
          Assistant: {task.agent_external_key || "None"}
          {task.instruction_version !== null
            ? ` · instructions v${task.instruction_version}`
            : ""}
        </span>
      }
    >
      {task.state === "waiting" && task.wait_reason === "clarification" ? (
        <label>
          Answer this assistant
          <textarea
            aria-label={`Answer for task: ${task.title}`}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            disabled={resume.isPending}
          />
        </label>
      ) : null}
      {task.wait_reason ? (
        <Callout tone="warning" title="Waiting">
          <p>{task.result.checkpoint?.question ?? task.wait_reason}</p>
          {task.result.checkpoint?.proposal_id ? (
            <p>Review the exact action in Approvals before continuing.</p>
          ) : null}
        </Callout>
      ) : null}
      {task.state === "failed" && task.result.code ? (
        <Callout tone="danger" title="Task failed">
          <p>{task.result.code}</p>
        </Callout>
      ) : null}
      {task.state === "cancelled" ? (
        <p>Future work stopped. Completed actions have not been undone.</p>
      ) : null}
      {failure ? (
        <Callout tone="danger" live="assertive">
          <p>{errorMessage(failure)}</p>
        </Callout>
      ) : null}
    </ItemCard>
  );
}
