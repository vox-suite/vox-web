"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, TextArea } from "@/components/ui";
import { Callout } from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import { useStartTask } from "../queries";

/** Tasks from this surface run on the account's primary agent. */
const TASK_AGENT_KEY = "saathi";

export function StartTaskForm() {
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const startTask = useStartTask();

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !instruction.trim()) return;
    startTask.mutate(
      { title, instruction, agent_external_key: TASK_AGENT_KEY },
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
      <Button type="submit" disabled={startTask.isPending}>
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
