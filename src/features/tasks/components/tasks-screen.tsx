"use client";

import { Button } from "@/components/ui";
import { errorMessage } from "@/lib/api/http";
import { Callout, EmptyMessage, PageHeader, Panel } from "@/components/app";
import { useTasks } from "../queries";
import { StartTaskForm } from "./start-task-form";
import { TaskCard } from "./task-card";

export function TasksScreen() {
  const query = useTasks();
  const tasks = query.data?.pages.flatMap((page) => page.tasks) ?? [];

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
    </div>
  );
}
