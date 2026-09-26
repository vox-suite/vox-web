"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Notice, Stack, Text, Row } from "@/components/ui";
import type { Connection } from "@/lib/consumer-auth/core-host-client";
import { getAccessibleStatusIndicator } from "@/lib/global-formatting";

type DisconnectDisclosure = { message: string } | null;

export function ConnectionsManager() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [disclosure, setDisclosure] = useState<DisconnectDisclosure>(null);

  async function loadConnections() {
    try {
      const res = await fetch("/api/account/connections");
      if (!res.ok) throw new Error("Failed to load connections");
      const data = await res.json();
      setConnections(data.connections || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load connections",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadConnections);
  }, []);

  async function handleDisconnect(connectionId: string) {
    try {
      setDisconnectingId(connectionId);
      const res = await fetch(
        `/api/account/connections/${encodeURIComponent(connectionId)}/disconnect`,
        {
          method: "POST",
        },
      );
      if (!res.ok) throw new Error("Disconnect failed");
      const data = await res.json();
      setDisclosure({
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
        title="Connected accounts"
        description="Review account access and remove connections you no longer use."
        tone="soft"
      >
        <Stack gap="normal">
          <div className="p-3 bg-obsidian border border-border-edge rounded-lg text-sm text-mist">
            <strong>Important Boundary:</strong> Connecting an external account
            allows Vox to access the provider, but does <em>not</em> grant any
            agent permission to perform actions or side-effects. Agent
            capability grants must be explicitly configured separately.
          </div>

          {loading && <Text muted>Loading connections...</Text>}
          {error && (
            <div role="alert" aria-live="assertive">
              <Notice title="Error" tone="error">
                {error}
              </Notice>
            </div>
          )}

          {disclosure && (
            <div
              className="p-3 bg-ember-hush border border-coral-pulse/30 rounded-lg text-sm text-mist"
              role="alert"
              aria-live="polite"
            >
              <strong>Disconnect Notice:</strong> {disclosure.message}
            </div>
          )}

          {!loading && connections.length === 0 && (
            <Text muted>
              No connected accounts. Connection setup will appear here when a
              provider-verified authorization flow is available.
            </Text>
          )}

          <div className="space-y-4">
            {connections.map((conn) => {
              const isPlatformHeld =
                conn.credential_custody === "platform_held";
              const isAuthorized = conn.authorization_state === "authorized";
              const statusIndicator = getAccessibleStatusIndicator(
                isAuthorized ? "confirmed" : conn.authorization_state,
              );

              return (
                <div
                  key={conn.id}
                  role="region"
                  aria-labelledby={`connection-title-${conn.id}`}
                  className="p-4 border border-border-edge bg-ink rounded-lg space-y-3"
                  data-testid={`connection-${conn.id}`}
                >
                  <Row spread>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong
                          id={`connection-title-${conn.id}`}
                          className="text-base text-pure-white"
                        >
                          {conn.integration_external_key.toUpperCase()}
                        </strong>
                        <Badge
                          tone={statusIndicator.badgeTone}
                          aria-label={statusIndicator.ariaLabel}
                          className="flex items-center gap-1.5"
                        >
                          <span aria-hidden="true">
                            {statusIndicator.symbol}
                          </span>
                          <span>{statusIndicator.text}</span>
                        </Badge>
                      </div>
                      <p className="ui-text text-sm" data-muted="true">
                        Account:{" "}
                        <strong>
                          {conn.account_display_id || "Account identity unavailable"}
                        </strong>
                      </p>
                    </div>

                    {isAuthorized && (
                      <Button
                        variant="danger"
                        aria-label={`Disconnect ${conn.integration_external_key.toUpperCase()} integration`}
                        disabled={disconnectingId === conn.id}
                        onClick={() => handleDisconnect(conn.id)}
                      >
                        {disconnectingId === conn.id
                          ? "Disconnecting..."
                          : "Disconnect"}
                      </Button>
                    )}
                  </Row>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-ash border-t border-slate pt-2">
                    <div>
                      <span className="text-smoke">Custody Model:</span>{" "}
                      <strong>
                        {isPlatformHeld
                          ? "Recorded as platform-held"
                          : "Recorded as external operator"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-smoke">
                        Authorized Capabilities:
                      </span>{" "}
                      {conn.authorized_capabilities &&
                      conn.authorized_capabilities.length > 0 ? (
                        <span>{conn.authorized_capabilities.join(", ")}</span>
                      ) : (
                        <span className="text-smoke">None</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </Stack>
      </Card>
    </Stack>
  );
}
