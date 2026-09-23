"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Notice, Stack, Text, Row } from "@/components/ui";
import type { CapabilityGrant, Connection } from "@/lib/consumer-auth/core-host-client";

export function GrantsManager() {
  const [agentKey, setAgentKey] = useState("saathi");
  const [grants, setGrants] = useState<CapabilityGrant[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [grantsRes, connRes] = await Promise.all([
        fetch(`/api/account/grants?agentKey=${encodeURIComponent(agentKey)}`),
        fetch("/api/account/connections"),
      ]);
      if (!grantsRes.ok || !connRes.ok) throw new Error("Failed to load grants or connections");
      const grantsData = await grantsRes.json();
      const connData = await connRes.json();
      setGrants(grantsData.grants || []);
      setConnections(connData.connections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [agentKey]);

  async function handleGrant(connectionId: string, capability: string) {
    try {
      const res = await fetch("/api/account/grants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_external_key: agentKey,
          connection_id: connectionId,
          capability_external_key: capability,
        }),
      });
      if (!res.ok) throw new Error("Grant creation denied by Core policy");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to grant capability");
    }
  }

  async function handleRevoke(connectionId: string, capability: string) {
    try {
      const res = await fetch("/api/account/grants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_external_key: agentKey,
          connection_id: connectionId,
          capability_external_key: capability,
        }),
      });
      if (!res.ok) throw new Error("Grant revocation failed");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke capability");
    }
  }

  const authorizedConnections = connections.filter((c) => c.authorization_state === "authorized");

  return (
    <Stack gap="normal">
      <Card
        title="Agent Capability Grants & Access Control"
        description="Inspect and govern which third-party capabilities each agent is permitted to execute on your behalf."
        tone="soft"
      >
        <Stack gap="normal">
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-300">
            <strong>Default-Deny Principle:</strong> New agents receive <strong>zero capability grants by default</strong>. Connecting an account does not authorize agents to act. You must explicitly grant capabilities per-agent here.
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-200">Select Agent:</span>
            {["saathi", "planner"].map((key) => (
              <Button
                key={key}
                variant={agentKey === key ? "primary" : "secondary"}
                className="text-xs"
                onClick={() => setAgentKey(key)}
              >
                {key.toUpperCase()}
              </Button>
            ))}
          </div>

          {loading && <Text muted>Loading capability grants...</Text>}
          {error && <Notice title="Error" tone="error">{error}</Notice>}

          {!loading && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-neutral-200">
                Active Grants for {agentKey.toUpperCase()} ({grants.length})
              </h4>

              {grants.length === 0 ? (
                <Text muted>No active capability grants for this agent. The agent cannot invoke external actions.</Text>
              ) : (
                <div className="space-y-2">
                  {grants.map((grant) => (
                    <div
                      key={grant.id}
                      className="p-3 border border-neutral-800 bg-neutral-950 rounded flex items-center justify-between"
                      data-testid={`grant-${grant.id}`}
                    >
                      <div>
                        <strong className="text-sm text-neutral-200">{grant.capability_external_key}</strong>
                        <p className="ui-text text-xs" data-muted="true">Connection ID: {grant.connection_id}</p>
                      </div>
                      <Button
                        variant="danger"
                        className="text-xs py-1"
                        onClick={() => handleRevoke(grant.connection_id, grant.capability_external_key)}
                      >
                        Revoke Grant
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <h4 className="text-sm font-semibold text-neutral-200 pt-3">
                Connected Services & Capabilities Matrix
              </h4>

              {authorizedConnections.length === 0 ? (
                <Text muted>No authorized connections available. Connect an account under Connected Accounts first.</Text>
              ) : (
                <div className="space-y-3">
                  {authorizedConnections.map((conn) => (
                    <div key={conn.id} className="p-3 border border-neutral-800 rounded bg-neutral-900/40 space-y-2">
                      <Row spread>
                        <span className="font-medium text-sm text-neutral-200">
                          {conn.integration_external_key.toUpperCase()} ({conn.account_display_id || conn.external_account_reference})
                        </span>
                        <Badge tone="positive">CONNECTED</Badge>
                      </Row>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {conn.authorized_capabilities.map((cap) => {
                          const hasGrant = grants.some(
                            (g) => g.connection_id === conn.id && g.capability_external_key === cap,
                          );
                          return (
                            <div key={cap} className="flex items-center gap-2 p-2 bg-neutral-950 rounded border border-neutral-800 text-xs">
                              <span>{cap}</span>
                              {hasGrant ? (
                                <Badge tone="positive">GRANTED</Badge>
                              ) : (
                                <Button
                                  variant="primary"
                                  className="text-xs py-0.5 px-2"
                                  onClick={() => handleGrant(conn.id, cap)}
                                >
                                  Grant
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
