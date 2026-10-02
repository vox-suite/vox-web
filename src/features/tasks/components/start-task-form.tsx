"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, TextArea } from "@/components/ui";
import { Callout } from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import { useStartTask } from "../queries";
import { useAgents } from "@/features/agents/queries";
import { resolveAgentKey } from "@/features/agents/components/agent-picker";

export function StartTaskForm() {
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const startTask = useStartTask();
  const agents = useAgents();
  const agentKey = resolveAgentKey(null, agents.data);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !instruction.trim() || !agentKey) return;
    startTask.mutate(
      { title, instruction, agent_external_key: agentKey },
      {
        onSuccess: () => {
          setTitle("");
          setInstruction("");
        },
      },
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field
        id="task-title"
        label="Task title"
        name="title"
        placeholder="e.g. Schedule team sync"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />
      <TextArea
        id="task-instruction"
        label="Instruction"
        name="instruction"
        placeholder="Detailed instruction for the agent…"
        rows={4}
        value={instruction}
        onChange={(event) => setInstruction(event.target.value)}
        required
      />
      <Button type="submit" disabled={startTask.isPending || !agentKey}>
        {startTask.isPending ? "Submitting to Core…" : "Submit durable task"}
      </Button>
      {startTask.isError ? (
        <Callout tone="danger" title="Task was not started" live="assertive">
          <p>{errorMessage(startTask.error, "Failed to start task")}</p>
        </Callout>
      ) : null}
    </form>
  );
}
