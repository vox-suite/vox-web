"use client";
import { useQuery } from "@tanstack/react-query";
import { getTask, isTaskTerminal } from "@/features/tasks/api";
import { taskKeys } from "@/features/tasks/queries";
import { useAppHref } from "@/components/app-shell/app-paths";
import { useState, type FormEvent } from "react";
import { useAgents } from "@/features/agents/queries";
import { useSelectedAgent } from "@/features/agents/selection";
import { Button, TextArea } from "@/components/ui";
import { Panel, Callout } from "@/components/app";
import { apiRequest, errorMessage } from "@/lib/api/http";
import { TaskConsentRequest } from "@/features/delegation/components/task-consent-request";
import type { DurableTask } from "@/lib/consumer-auth/core-host-client";
type Message = { role: "user" | "assistant"; text: string };
function Conversation({
  agentKey,
  agentName,
}: {
  agentKey: string;
  agentName: string;
}) {
  const [id] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<unknown>(null);
  const [task, setTask] = useState<DurableTask | null>(null);
  const href = useAppHref();
  const currentTask = useQuery({
    queryKey: [...taskKeys.all, "conversation", task?.id],
    enabled: !!task,
    queryFn: ({ signal }) => getTask(task!.id, signal),
    initialData: task ?? undefined,
    refetchInterval: (query) =>
      query.state.data && !isTaskTerminal(query.state.data) ? 5000 : false,
  });
  const displayedTask = currentTask.data ?? task;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || !text.trim()) return;
    const message = text.trim();
    setPending(true);
    setFailure(null);
    setMessages((current) => [...current, { role: "user", text: message }]);
    setText("");
    try {
      const response = await apiRequest<{ text: string; task?: DurableTask }>(
        "/api/account/conversations",
        {
          method: "POST",
          body: { agentKey, conversationId: id, text: message },
          fallbackError: "Could not receive a response",
        },
      );
      setMessages((current) => [
        ...current,
        { role: "assistant", text: response.text },
      ]);
      if (response.task) setTask(response.task);
    } catch (error) {
      setFailure(error);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-4">
      <div
        aria-live="polite"
        aria-busy={pending}
        className="max-h-96 space-y-3 overflow-auto"
      >
        {messages.map((message, index) => (
          <div key={index} className="rounded-md border border-border-edge p-3">
            <p className="mb-1 text-xs text-smoke">
              {message.role === "user" ? "You" : agentName}
            </p>
            <p className="whitespace-pre-wrap text-sm text-mist">
              {message.text}
            </p>
          </div>
        ))}
      </div>
      {displayedTask ? (
        <div className="rounded-md border border-border-edge p-3">
          <p className="mb-2 text-sm">
            {displayedTask.title} · {displayedTask.state}
          </p>
          {displayedTask.state === "waiting" &&
          displayedTask.result.checkpoint?.code ===
            "delegation_consent_required" ? (
            <TaskConsentRequest key={displayedTask.id} task={displayedTask} />
          ) : null}
          {currentTask.error ? (
            <Callout tone="danger" live="assertive">
              Current task status could not be refreshed. Open saved tasks to
              retry.
            </Callout>
          ) : null}
          <a className="text-sm underline" href={href("/tasks")}>
            View saved task and current status
          </a>
        </div>
      ) : null}
      <form onSubmit={submit} className="space-y-3">
        <TextArea
          id="library-message"
          label={`Ask ${agentName}`}
          rows={3}
          value={text}
          maxLength={16000}
          onChange={(event) => setText(event.target.value)}
          placeholder="Try an enabled skill, or ask about information from a granted connection."
          required
        />
        <Button type="submit" disabled={pending || !agentKey}>
          {pending ? "Thinking…" : "Send"}
        </Button>
      </form>
      {failure ? (
        <Callout tone="danger" live="assertive">
          {errorMessage(failure, "Could not receive a response")}
        </Callout>
      ) : null}
    </div>
  );
}
export function ConversationPanel() {
  const { agentKey, agent } = useSelectedAgent();
  return (
    <Panel
      title="Try your agent"
      description="Uses this agent’s enabled skills and current connection grants. External changes require a separate approval."
    >
      {agent ? (
        <Conversation
          key={agentKey}
          agentKey={agentKey}
          agentName={agent.display_name}
        />
      ) : (
        <p>Choose an available agent to start.</p>
      )}
    </Panel>
  );
}

/** Ordinary conversation always starts with the user's default Personal Assistant. */
export function PersonalAssistantConversationPanel() {
  const agents = useAgents();
  const assistant = agents.data?.find((agent) => agent.is_default);
  return (
    <Panel
      title="Personal Assistant"
      description="Ask naturally. Your assistant uses relevant enabled skills and permitted connections; specialist access and external changes require separate permission."
    >
      {assistant ? (
        <Conversation
          key={assistant.external_key}
          agentKey={assistant.external_key}
          agentName={assistant.display_name}
        />
      ) : agents.error ? (
        <Callout tone="danger" live="assertive">
          {errorMessage(agents.error, "Your assistant could not be loaded")}
          <Button variant="secondary" onClick={() => void agents.refetch()}>
            Try again
          </Button>
        </Callout>
      ) : (
        <p>
          {agents.isPending
            ? "Loading your assistant…"
            : "Your Personal Assistant is unavailable."}
        </p>
      )}
    </Panel>
  );
}
