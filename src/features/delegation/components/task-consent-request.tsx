"use client";
import { useState } from "react";
import { useAgents } from "@/features/agents/queries";
import { useResumeTask } from "@/features/tasks/queries";
import { Button } from "@/components/ui";
import { Callout } from "@/components/app";
import type { DurableTask } from "@/lib/consumer-auth/core-host-client";
import { errorMessage } from "@/lib/api/http";
import { DelegationConsentForm } from "./delegation-panel";
export function TaskConsentRequest({ task }: { task: DurableTask }) {
  const request = task.result.checkpoint?.delegation_request;
  const agents = useAgents();
  const resume = useResumeTask();
  const [saved, setSaved] = useState(false);
  if (!request || !task.agent_external_key) return null;
  const name = (key: string) =>
    agents.data?.find((agent) => agent.external_key === key)?.display_name ??
    "Unavailable assistant";
  const continueTask = () =>
    resume.mutate({
      taskId: task.id,
      reply: "Continue with the specialist permission I saved.",
    });
  return (
    <div className="space-y-3" aria-label="Review requested specialist work">
      <p>
        {name(task.agent_external_key)} wants help from{" "}
        {name(request.specialist_agent_key)}.
      </p>
      <p>Requested work: {request.brief}</p>
      {saved ? (
        <Button disabled={resume.isPending} onClick={continueTask}>
          {resume.isPending ? "Continuing…" : "Continue saved task"}
        </Button>
      ) : (
        <DelegationConsentForm
          key={task.id}
          requester={task.agent_external_key}
          specialist={request.specialist_agent_key}
          tasks={[task]}
          boundTask={task}
          requested={request.scope.capabilities}
          continuing={resume.isPending}
          onSaved={() => {
            setSaved(true);
            continueTask();
          }}
        />
      )}
      {resume.error ? (
        <Callout tone="danger" live="assertive">
          {errorMessage(
            resume.error,
            "Permission saved; the task could not continue yet.",
          )}
        </Callout>
      ) : null}
    </div>
  );
}
