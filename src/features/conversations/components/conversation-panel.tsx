"use client";
import { useState, type FormEvent } from "react";
import { useSelectedAgent } from "@/features/agents/selection";
import { Button, TextArea } from "@/components/ui";
import { Panel, Callout } from "@/components/app";
import { apiRequest, errorMessage } from "@/lib/api/http";
type Message = { role: "user" | "assistant"; text: string };
function Conversation({ agentKey }: { agentKey: string }) {
  const [id] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<unknown>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (pending || !text.trim()) return;
    const message = text.trim();
    setPending(true);
    setFailure(null);
    setMessages((current) => [...current, { role: "user", text: message }]);
    setText("");
    try {
      const response = await apiRequest<{ text: string }>(
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
              {message.role === "user" ? "You" : agentKey}
            </p>
            <p className="whitespace-pre-wrap text-sm text-mist">
              {message.text}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-3">
        <TextArea
          id="library-message"
          label={`Ask ${agentKey}`}
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
  const { agentKey } = useSelectedAgent();
  return (
    <Panel
      title="Try your agent"
      description="Uses this agent’s enabled skills and current connection grants. External changes require a separate approval."
    >
      {agentKey ? (
        <Conversation key={agentKey} agentKey={agentKey} />
      ) : (
        <p>Choose an available agent to start.</p>
      )}
    </Panel>
  );
}
