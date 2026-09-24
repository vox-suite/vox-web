"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Field,
  Notice,
  Stack,
  Text,
  Row,
} from "@/components/ui";
import type { DurableTask } from "@/lib/consumer-auth/core-host-client";

export function TasksView() {
  const [tasks, setTasks] = useState<DurableTask[]>([]);
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  async function handleStartTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !instruction.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/account/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          instruction,
          agent_external_key: "saathi",
        }),
      });
      if (!res.ok) throw new Error("Failed to submit task");
      const data = await res.json();
      setTasks((prev) => [data.task, ...prev]);
      setActiveTaskId(data.task.id);
      setTitle("");
      setInstruction("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start task");
    } finally {
      setLoading(false);
    }
  }

  async function handleReconnect(taskId: string) {
    try {
      setReconnecting(true);
      const res = await fetch(
        `/api/account/tasks?taskId=${encodeURIComponent(taskId)}`,
      );
      if (!res.ok) throw new Error("Failed to fetch authoritative task state");
      const data = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reconnect failed");
    } finally {
      setReconnecting(false);
    }
  }

  async function handleCancel(taskId: string) {
    try {
      const res = await fetch(
        `/api/account/tasks/${encodeURIComponent(taskId)}/cancel`,
        {
          method: "POST",
        },
      );
      if (!res.ok) throw new Error("Failed to cancel task");
      const data = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    }
  }

  function toneForState(
    state: DurableTask["state"],
  ): "neutral" | "positive" | "accent" | "warning" {
    switch (state) {
      case "completed":
        return "positive";
      case "running":
        return "accent";
      case "waiting_for_approval":
      case "waiting_for_clarification":
      case "waiting_for_connection":
        return "warning";
      case "cancelled":
      case "failed":
      case "queued":
      default:
        return "neutral";
    }
  }

  return (
    <Stack gap="normal">
      <Card
        title="Durable Tasks & Resumable Runs"
        description="Tasks survive browser restarts and client disconnection. Core authoritative state prevents false completions."
        tone="soft"
      >
        <Stack gap="normal">
          <form onSubmit={handleStartTask} className="space-y-3">
            <Field
              id="task-title"
              label="Task Title"
              name="title"
              placeholder="e.g. Schedule team sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Field
              id="task-instruction"
              label="Instruction"
              name="instruction"
              placeholder="Detailed instruction for the agent..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Submitting to Core..." : "Submit Durable Task"}
            </Button>
          </form>

          {error && (
            <Notice title="Error" tone="error">
              {error}
            </Notice>
          )}

          {tasks.length === 0 && (
            <Text muted>
              No active tasks. Submit an instruction above to begin a durable
              execution.
            </Text>
          )}

          <div className="space-y-4 pt-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border border-border-edge bg-ink rounded-lg space-y-2"
                data-testid={`task-${task.id}`}
              >
                <Row spread>
                  <div>
                    <h4 className="font-semibold text-pure-white">
                      {task.title}
                    </h4>
                    <p className="ui-text text-sm" data-muted="true">
                      {task.instruction}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={toneForState(task.state)}>
                      {task.state.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  </div>
                </Row>

                {task.wait_reason && (
                  <div className="p-2 bg-ember-hush/60 border border-coral-pulse/30 rounded text-xs text-mist">
                    <strong>Wait Reason:</strong> {task.wait_reason}
                  </div>
                )}

                <div className="border-t border-slate pt-2 text-xs text-smoke">
                  <Row spread>
                    <span>Agent: {task.agent_external_key || "None"}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="text-xs py-1 px-2"
                        disabled={reconnecting}
                        onClick={() => handleReconnect(task.id)}
                      >
                        {reconnecting ? "Checking..." : "Reconnect / Status"}
                      </Button>
                      {task.state !== "completed" &&
                        task.state !== "cancelled" &&
                        task.state !== "failed" && (
                          <Button
                            variant="danger"
                            className="text-xs py-1 px-2"
                            onClick={() => handleCancel(task.id)}
                          >
                            Cancel
                          </Button>
                        )}
                    </div>
                  </Row>
                </div>
              </div>
            ))}
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
