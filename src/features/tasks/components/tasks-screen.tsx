"use client";

import { EmptyMessage, PageHeader, Panel } from "@/components/app";
import { useStartedTaskIds } from "../queries";
import { StartTaskForm } from "./start-task-form";
import { TaskCard } from "./task-card";

export function TasksScreen() {
  const taskIds = useStartedTaskIds();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Durable tasks"
        description="Tasks survive browser restarts and client disconnection. Core authoritative state prevents false completions."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Start a task" className="xl:order-2">
          <StartTaskForm />
        </Panel>
        <Panel
          title="Tasks in this session"
          description="Refresh a task to read its authoritative state from Core."
          className="xl:order-1"
        >
          {taskIds.length === 0 ? (
            <EmptyMessage title="No active tasks">
              Submit an instruction to begin a durable execution.
            </EmptyMessage>
          ) : (
            <div className="space-y-3">
              {taskIds.map((id) => (
                <TaskCard key={id} taskId={id} />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
