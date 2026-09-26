"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import {
  Callout,
  EmptyMessage,
  Panel,
  QueryContent,
  Tag,
} from "@/components/app";
import {
  AgentPicker,
  resolveAgentKey,
} from "@/features/agents/components/agent-picker";
import { useAgents } from "@/features/agents/queries";
import { useAuthorizedConnections } from "@/features/connections/queries";
import { errorMessage } from "@/lib/api/http";
import {
  isSameGrant,
  useCreateGrant,
  useGrants,
  useRevokeGrant,
} from "../queries";

export function GrantsPanel({ id }: { id?: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  const agents = useAgents();
  const agentKey = resolveAgentKey(picked, agents.data);
  const grants = useGrants(agentKey);
  const connections = useAuthorizedConnections();
  const createGrant = useCreateGrant();
  const revokeGrant = useRevokeGrant();
  const failure = createGrant.error ?? revokeGrant.error;

  return (
    <Panel
      id={id}
      title="Agent access"
      description="Govern which third-party capabilities each agent may execute on your behalf."
    >
      <Callout title="Default deny">
        <p>
          New agents receive <strong>zero capability grants by default</strong>.
          Connecting an account does not authorize agents to act; grant
          capabilities per agent here.
        </p>
      </Callout>
      <AgentPicker value={agentKey} onChange={setPicked} label="Select agent" />
      {failure ? (
        <Callout tone="danger" live="assertive">
          <p>{errorMessage(failure, "The grant could not be changed")}</p>
        </Callout>
      ) : null}
      {agentKey ? (
        <div className="grid gap-6 2xl:grid-cols-2">
          <section
            aria-labelledby="active-grants"
            className="min-w-0 space-y-3"
          >
            <h3
              id="active-grants"
              className="text-[13px] font-medium text-mist"
            >
              Active grants for {agentKey}
              {grants.data ? ` (${grants.data.length})` : ""}
            </h3>
            <QueryContent
              query={grants}
              loadingLabel="Loading capability grants"
              errorTitle="Grants could not be loaded"
              skeletonRows={2}
              isEmpty={(data) => data.length === 0}
              empty={
                <EmptyMessage title="No active grants">
                  This agent cannot invoke external actions.
                </EmptyMessage>
              }
            >
              {(data) => (
                <ul className="space-y-2">
                  {data.map((grant) => (
                    <li
                      key={grant.id}
                      data-testid={`grant-${grant.id}`}
                      className="flex items-center justify-between gap-3 rounded-md border border-border-edge bg-obsidian/50 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-mist">
                          {grant.capability_external_key}
                        </p>
                        <p className="truncate text-xs text-smoke">
                          Connection ID: {grant.connection_id}
                        </p>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        aria-label={`Revoke ${grant.capability_external_key} from ${agentKey}`}
                        disabled={grant.id.startsWith("pending:")}
                        onClick={() =>
                          revokeGrant.mutate({
                            agent_external_key: agentKey,
                            connection_id: grant.connection_id,
                            capability_external_key:
                              grant.capability_external_key,
                          })
                        }
                      >
                        Revoke
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </QueryContent>
          </section>
          <section
            aria-labelledby="capability-matrix"
            className="min-w-0 space-y-3"
          >
            <h3
              id="capability-matrix"
              className="text-[13px] font-medium text-mist"
            >
              Connected services &amp; capabilities
            </h3>
            <QueryContent
              query={connections}
              loadingLabel="Loading connections"
              errorTitle="Connections could not be loaded"
              skeletonRows={2}
              isEmpty={(data) => data.length === 0}
              empty={
                <EmptyMessage title="No authorized connections">
                  Connect an account under Connected accounts first.
                </EmptyMessage>
              }
            >
              {(data) => (
                <ul className="space-y-2">
                  {data.map((connection) => (
                    <li
                      key={connection.id}
                      className="space-y-2 rounded-md border border-border-edge bg-obsidian/50 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="min-w-0 break-words text-[13px] font-medium text-mist">
                          {connection.integration_external_key.toUpperCase()} (
                          {connection.account_display_id ||
                            connection.external_account_reference}
                          )
                        </span>
                        <Tag tone="positive">Connected</Tag>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {connection.authorized_capabilities.map(
                          (capability) => {
                            const input = {
                              agent_external_key: agentKey,
                              connection_id: connection.id,
                              capability_external_key: capability,
                            };
                            const granted = grants.data?.some((g) =>
                              isSameGrant(g, input),
                            );
                            return (
                              <span
                                key={capability}
                                className="flex items-center gap-2 rounded-md border border-border-edge bg-ink py-1 pr-1 pl-2.5 text-xs text-mist"
                              >
                                {capability}
                                {granted ? (
                                  <Tag tone="positive">Granted</Tag>
                                ) : (
                                  <Button
                                    size="xs"
                                    aria-label={`Grant ${capability} to ${agentKey}`}
                                    disabled={!grants.data}
                                    onClick={() => createGrant.mutate(input)}
                                  >
                                    Grant
                                  </Button>
                                )}
                              </span>
                            );
                          },
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </QueryContent>
          </section>
        </div>
      ) : null}
    </Panel>
  );
}
