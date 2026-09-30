"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { errorMessage } from "@/lib/api/http";
import { readAgentMemory, changeAgentMemory, type Agent } from "../api";
import type { AgentMemoryChange } from "@/lib/consumer-auth/core-host-client";

export function AgentMemory({ agent }: { agent: Agent }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [pendingRetention, setPendingRetention] = useState<boolean | null>(
    null,
  );
  const cache = useQueryClient();
  const queryKey = ["agents", "memory", agent.id];
  const memory = useQuery({
    queryKey,
    queryFn: ({ signal }) => readAgentMemory(agent.external_key, signal),
    staleTime: 0,
  });
  const mutation = useMutation({
    mutationFn: (change: Exclude<AgentMemoryChange, { operation: "read" }>) =>
      changeAgentMemory(agent.external_key, change),
    onError: () => setPendingRetention(null),
    onSuccess: (view) => {
      cache.setQueryData(queryKey, view);
      setConfirmClear(false);
      setPendingRetention(null);
    },
  });
  const data = memory.data;
  return (
    <section
      aria-label={`${agent.display_name} memory`}
      className="space-y-3 border-t border-graphite pt-4"
    >
      <h3 className="text-sm font-medium">Memory</h3>
      <p className="text-sm text-smoke">
        Only this assistant uses this memory. Clearing it keeps your
        conversation history and action records. Turning retention off clears
        retained memory and stops this assistant from saving new facts.
      </p>
      {memory.isPending && (
        <p className="text-sm text-smoke">Loading memory…</p>
      )}
      {memory.error && (
        <p role="alert" className="text-sm text-smoke">
          {errorMessage(memory.error)}
        </p>
      )}
      {data && (
        <>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={pendingRetention ?? data.retention_enabled}
              disabled={mutation.isPending}
              onChange={(event) => {
                const enabled = event.target.checked;
                setPendingRetention(enabled);
                mutation.mutate({ operation: "set_retention", enabled });
              }}
            />
            Retain memory for this assistant
          </label>
          {Object.keys(data.retained.facts).length > 0 && (
            <dl className="space-y-2 text-sm">
              {Object.entries(data.retained.facts).map(([key, value]) => (
                <div key={key}>
                  <dt className="font-medium">{key}</dt>
                  <dd className="whitespace-pre-wrap break-words text-smoke">
                    {typeof value === "string" ? value : JSON.stringify(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {[
            ...data.retained.commitments,
            ...data.retained.decisions,
            ...data.retained.recent_recaps,
          ].length > 0 && (
            <ul className="list-disc space-y-2 pl-4 text-sm text-smoke">
              {[
                ...data.retained.commitments,
                ...data.retained.decisions,
                ...data.retained.recent_recaps,
              ].map((text, index) => (
                <li key={index}>{text}</li>
              ))}
            </ul>
          )}
          {Object.keys(data.retained.facts).length === 0 &&
            data.retained.commitments.length === 0 &&
            data.retained.decisions.length === 0 &&
            data.retained.recent_recaps.length === 0 && (
              <p className="text-sm text-smoke">No retained memory.</p>
            )}
          {confirmClear ? (
            <div className="space-y-2">
              <p className="text-sm">Clear this assistant’s retained memory?</p>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ operation: "clear" })}
                >
                  Confirm clear memory
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={mutation.isPending}
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              disabled={mutation.isPending}
              onClick={() => setConfirmClear(true)}
            >
              Clear memory
            </Button>
          )}
        </>
      )}
      {mutation.error && (
        <p role="alert" className="text-sm text-smoke">
          {errorMessage(mutation.error)}
        </p>
      )}
    </section>
  );
}
