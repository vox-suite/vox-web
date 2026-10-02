"use client";

import { useAgents } from "@/features/agents/queries";
import { Button } from "@/components/ui";
import { errorMessage } from "@/lib/api/http";
import { Callout, EmptyMessage, PageHeader, Panel } from "@/components/app";
import { DelegationPanel } from "@/features/delegation/components/delegation-panel";
import { useStopAllTasks, useTasks } from "../queries";
import { StartTaskForm } from "./start-task-form";
import { TaskCard } from "./task-card";

export function TasksScreen() {
  const query = useTasks();
  const agents = useAgents();
  const stopAll = useStopAllTasks();
  const tasks = query.data?.pages.flatMap((page) => page.tasks) ?? [];
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  const assistantNames = new Map(
    agents.data?.map((agent) => [agent.external_key, agent.display_name]),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Durable tasks"
        description="Tasks survive browser restarts and client disconnection. Core authoritative state prevents false completions."
      />
      <Panel
        title="Specialist activity"
        description="View current tasks and specialist work. Stop all ends future work across this account; completed external actions are not undone."
      >
        <p>
          {query.isPending
            ? "Loading specialist activity…"
            : query.error
              ? "Specialist activity could not be refreshed."
              : `${tasks.filter((task) => !!task.parent_task_id && !["completed", "cancelled", "failed"].includes(task.state)).length} active specialist tasks in the loaded task pages.`}
        </p>
        <Button
          variant="danger"
          disabled={stopAll.isPending || query.isPending}
          onClick={() => stopAll.mutate()}
        >
          {stopAll.isPending ? "Stopping…" : "Stop all tasks"}
        </Button>
        {stopAll.isSuccess ? (
          <Callout live="polite" title="Future task work stopped">
            {stopAll.data.cancelled} tasks stopped. Completed external actions
            were not undone.
          </Callout>
        ) : null}
        {stopAll.error ? (
          <Callout tone="danger" live="assertive">
            {errorMessage(stopAll.error)}
          </Callout>
        ) : null}
      </Panel>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Start a task" className="xl:order-2">
          <StartTaskForm />
        </Panel>
        <Panel
          title="Saved tasks"
          description="Read current state from Core, including tasks started before this browser opened."
          className="xl:order-1"
        >
          <Button
            variant="secondary"
            disabled={query.isFetching}
            onClick={() => void query.refetch()}
          >
            {query.isFetching ? "Checking…" : "Refresh tasks"}
          </Button>
          {query.error ? (
            <Callout tone="danger" live="assertive">
              <p>{errorMessage(query.error)}</p>
            </Callout>
          ) : null}
          {query.isPending ? (
            <p>Loading saved tasks…</p>
          ) : !query.error && tasks.length === 0 ? (
            <EmptyMessage title="No saved tasks">
              Submit an instruction to begin a task.
            </EmptyMessage>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  lineage={
                    task.parent_task_id
                      ? `Specialist work for ${tasksById.get(task.parent_task_id)?.title ?? "a saved parent task"}`
                      : "Requested task"
                  }
                  assistantName={
                    assistantNames.get(task.agent_external_key ?? "") ??
                    "Assistant unavailable"
                  }
                  isFetching={query.isFetching}
                  onRefresh={() => void query.refetch()}
                />
              ))}
            </div>
          )}
          {query.hasNextPage ? (
            <Button
              variant="secondary"
              disabled={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              {query.isFetchingNextPage ? "Loading…" : "Load more tasks"}
            </Button>
          ) : null}
        </Panel>
      </div>
      <DelegationPanel tasks={tasks} />
    </div>
  );
}
