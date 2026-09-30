"use client";

import { useId, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Field, TextArea } from "@/components/ui";
import { manageAgent, type Agent } from "../api";
import { agentKeys } from "../queries";
import { errorMessage } from "@/lib/api/http";

export function AgentManager({ agents }: { agents: Agent[] }) {
  const id = useId();
  const cache = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const mutation = useMutation({
    mutationFn: manageAgent,
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: agentKeys.all });
      setEditing(null);
      setName("");
      setInstructions("");
      setOpen(false);
    },
  });
  function edit(agent: Agent | null) {
    mutation.reset();
    setEditing(agent);
    setName(agent?.display_name ?? "");
    setInstructions(agent?.purpose ?? "");
    setOpen(true);
  }
  return (
    <div className="w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          mutation.reset();
          setOpen(!open);
        }}
        aria-expanded={open}
      >
        Manage assistants
      </Button>
      {open && (
        <div className="mt-3 space-y-4 rounded-lg border border-graphite p-4">
          <p className="text-sm text-smoke">
            Each assistant has its own instructions, enabled skills and account
            permissions. New assistants start without account access.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={mutation.isPending}
              onClick={() => edit(null)}
            >
              New assistant
            </Button>
            {agents.map((agent) => (
              <Button
                key={agent.external_key}
                variant="ghost"
                size="sm"
                disabled={mutation.isPending}
                onClick={() => edit(agent)}
              >
                Edit {agent.display_name}
              </Button>
            ))}
          </div>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate(
                editing
                  ? {
                      operation: "update",
                      agent_key: editing.external_key,
                      name,
                      instructions,
                      expected_version: editing.instruction_version,
                    }
                  : { operation: "create", name, instructions },
              );
            }}
          >
            <Field
              id={`${id}-name`}
              label="Assistant name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              disabled={mutation.isPending}
            />
            <TextArea
              id={`${id}-instructions`}
              label="Instructions"
              hint="Describe its job and how it should help. Set account access and skills separately."
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              required
              maxLength={2048}
              disabled={mutation.isPending}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Create assistant"}
              </Button>
              {editing && !editing.is_default && (
                <Button
                  variant="danger"
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      operation: "archive",
                      agent_key: editing.external_key,
                    })
                  }
                >
                  Archive assistant
                </Button>
              )}
            </div>
            {mutation.error && (
              <p role="alert" className="text-sm text-smoke">
                {errorMessage(mutation.error)}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
