"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Notice, Stack, Text, Row } from "@/components/ui";
import type { Connection } from "@/lib/consumer-auth/core-host-client";

type DisconnectDisclosure = {
  connectionId: string;
  message: string;
} | null;

export function ConnectionsManager() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [disclosure, setDisclosure] = useState<DisconnectDisclosure>(null);

  async function loadConnections() {
    try {
      setLoading(true);
      const res = await fetch("/api/account/connections");
      if (!res.ok) throw new Error("Failed to load connections");
      const data = await res.json();
      setConnections(data.connections || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load connections");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConnections();
  }, []);

  async function handleDisconnect(connectionId: string) {
    try {
      setDisconnectingId(connectionId);
      const res = await fetch(`/api/account/connections/${encodeURIComponent(connectionId)}/disconnect`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Disconnect failed");
      const data = await res.json();
      setDisclosure({
        connectionId,
        message: data.disclosure || "Connection revoked.",
      });
      await loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect");
    } finally {
      setDisconnectingId(null);
    }
  }

  return (
    <Stack gap="normal">
      <Card
        title="Connected Accounts & Service Custody"
        description="Connect third-party accounts for calendar, ride, and messaging providers. Credentials remain securely bounded."
        tone="soft"
      >
        <Stack gap="normal">
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-300">
            <strong>Important Boundary:</strong> Connecting an external account allows Vox to access the provider, but does <em>not</em> grant any agent permission to perform actions or side-effects. Agent capability grants must be explicitly configured separately.
          </div>

          {loading && <Text muted>Loading connections...</Text>}
          {error && <Notice title="Error" tone="error">{error}</Notice>}

          {disclosure && (
            <div className="p-3 bg-amber-950 border border-amber-800 rounded-lg text-sm text-amber-200" role="alert">
              <strong>Disconnect Notice:</strong> {disclosure.message}
            </div>
          )}

          {!loading && connections.length === 0 && (
            <Text muted>No connected accounts. Authorize an integration below to enable external capabilities.</Text>
          )}

          <div className="space-y-4">
            {connections.map((conn) => {
              const isPlatformHeld = conn.credential_custody === "platform_held";
              const isAuthorized = conn.authorization_state === "authorized";
              return (
                <div
                  key={conn.id}
                  className="p-4 border border-neutral-800 bg-neutral-950 rounded-lg space-y-3"
                  data-testid={`connection-${conn.id}`}
                >
                  <Row spread>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-base text-neutral-100">
                          {conn.integration_external_key.toUpperCase()}
                        </strong>
                        <Badge tone={isAuthorized ? "positive" : "warning"}>
                          {conn.authorization_state.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="ui-text text-sm" data-muted="true">
                        Account: <strong>{conn.account_display_id || conn.external_account_reference}</strong>
                      </p>
                    </div>

                    {isAuthorized && (
                      <Button
                        variant="danger"
                        disabled={disconnectingId === conn.id}
                        onClick={() => handleDisconnect(conn.id)}
                      >
                        {disconnectingId === conn.id ? "Disconnecting..." : "Disconnect"}
                      </Button>
                    )}
                  </Row>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-neutral-400 border-t border-neutral-900 pt-2">
                    <div>
                      <span className="text-neutral-500">Custody Model:</span>{" "}
                      <strong>
                        {isPlatformHeld ? "Platform-held credentials" : "External operator authorization"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-neutral-500">Authorized Capabilities:</span>{" "}
                      {conn.authorized_capabilities && conn.authorized_capabilities.length > 0 ? (
                        <span>{conn.authorized_capabilities.join(", ")}</span>
                      ) : (
                        <span className="text-neutral-600">None</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <h4 className="text-sm font-medium text-neutral-200 mb-2">Available Integrations</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "google-calendar", name: "Google Calendar", operator: "Google LLC", custody: "External operator authorization", scope: "calendar.read, calendar.write" },
                { key: "uber", name: "Uber Rides", operator: "Uber Technologies", custody: "External operator authorization", scope: "rides.estimate, rides.request" },
              ].map((provider) => (
                <div key={provider.key} className="p-3 border border-neutral-800 rounded-lg space-y-2 bg-neutral-900/50">
                  <div className="font-medium text-neutral-200">{provider.name}</div>
                  <p className="ui-text text-xs" data-muted="true">Operator: {provider.operator}</p>
                  <p className="ui-text text-xs" data-muted="true">Custody: {provider.custody}</p>
                  <Button
                    variant="primary"
                    className="w-full text-xs"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/account/connections", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            integration_external_key: provider.key,
                            credential_custody: "external_operator",
                            requested_capabilities: provider.scope.split(", "),
                          }),
                        });
                        const init = await res.json();
                        if (init.authorization_url) {
                          window.location.href = init.authorization_url;
                        }
                      } catch (e) {
                        setError("Failed to initiate connection");
                      }
                    }}
                  >
                    Connect {provider.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
}
