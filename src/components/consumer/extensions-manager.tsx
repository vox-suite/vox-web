"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Field,
  Notice,
  Row,
  Select,
  Stack,
  Text,
} from "@/components/ui";
import type { ExtensionEffect, ExtensionProtocol, RemoteExtension } from "@/lib/consumer-auth/core-host-client";

export function ExtensionsManager() {
  const [extensions, setExtensions] = useState<RemoteExtension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Install Form State
  const [showInstallForm, setShowInstallForm] = useState(false);
  const [externalKey, setExternalKey] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [protocol, setProtocol] = useState<ExtensionProtocol>("mcp");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [termsUrl, setTermsUrl] = useState("");
  const [capabilityKey, setCapabilityKey] = useState("");
  const [capabilityName, setCapabilityName] = useState("");
  const [capabilityEffect, setCapabilityEffect] = useState<ExtensionEffect>("read");

  async function loadExtensions() {
    try {
      const res = await fetch("/api/account/extensions");
      if (!res.ok) throw new Error("Failed to load extensions");
      const data = await res.json();
      setExtensions(data.extensions || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load extensions",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadExtensions);
  }, []);

  async function handleInstall(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      setActionSuccess(null);
      const res = await fetch("/api/account/extensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          external_key: externalKey,
          display_name: displayName,
          protocol,
          endpoint_url: endpointUrl,
          operator: {
            operator_id: operatorId,
            operator_name: operatorName,
            support_email: supportEmail || null,
            terms_url: termsUrl || null,
          },
          capabilities: [{
            external_key: capabilityKey,
            display_name: capabilityName,
            effect: capabilityEffect,
            consequential: capabilityEffect !== "read",
            data_recipients: [operatorName],
            access_needs: [],
          }],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Extension installation failed");
      }

      setActionSuccess(
        `Extension "${displayName}" registered successfully (default-denied, no authority granted).`,
      );
      setShowInstallForm(false);
      await loadExtensions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to install extension",
      );
    }
  }

  async function handleRemove(id: string) {
    try {
      setError(null);
      setActionSuccess(null);
      const res = await fetch(
        `/api/account/extensions/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove extension");
      }
      setActionSuccess("Extension removed from active state.");
      await loadExtensions();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove extension",
      );
    }
  }

  return (
    <Stack gap="normal">
      <Card
        title="Apps you added"
        description="Inspect remote app operators, recipients, and status. Registration does not grant access."
        tone="soft"
      >
        <Stack gap="normal">
          {/* Default-Deny & Remote-Only Notice */}
          <div className="p-3 bg-obsidian border border-border-edge rounded-lg text-sm text-mist">
            <p className="font-semibold text-pure-white mb-1">
              Remote integration status:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-ash">
              <li>
                <strong>Remote-Only Execution:</strong> Integration code runs at the remote operator endpoint, outside Core.
              </li>
              <li>
                <strong>Default-Deny Authority:</strong> Installation grants{" "}
                <strong>zero</strong> connection, context, capability, or action
                authority automatically.
              </li>
              <li>
                <strong>Consequential Fail-Closed:</strong> Consequential
                  actions also require conformance, operator enablement, a
                  connected account, an agent grant, and exact approval.
              </li>
              <li>
                <strong>Renewed Consent Requirement:</strong> Any material
                change (operator transfer or expanded data recipients)
                suspends affected actions. Version changes need a reviewable
                disclosure before consent can be renewed.
              </li>
            </ul>
          </div>

          {error && (
            <Notice title="Governance Error" tone="error">
              {error}
            </Notice>
          )}

          {actionSuccess && (
            <Notice title="Status Update" tone="success">
              <span aria-live="polite">{actionSuccess}</span>
            </Notice>
          )}

          {/* Action Row */}
          <Row spread>
            <span className="text-sm font-medium text-mist">
              Installed Remote Extensions ({extensions.length})
            </span>
            <Button
              variant={showInstallForm ? "secondary" : "primary"}
              onClick={() => setShowInstallForm(!showInstallForm)}
              aria-label={
                showInstallForm
                  ? "Close installation form"
                  : "Install new remote extension"
              }
            >
              {showInstallForm
                ? "Cancel Installation"
                : "+ Register Remote Extension"}
            </Button>
          </Row>

          {/* Install Form */}
          {showInstallForm && (
            <form
              onSubmit={handleInstall}
              className="p-4 bg-ink border border-border-edge rounded-lg space-y-4"
              aria-label="Register remote extension form"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-pure-white">
                  Register Remote Extension
                </h3>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  id="ext-key"
                  label="External Key"
                  value={externalKey}
                  onChange={(e) => setExternalKey(e.target.value)}
                  required
                />
                <Field
                  id="ext-name"
                  label="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
                <Select
                  id="ext-proto"
                  label="Protocol Adapter"
                  value={protocol}
                  onChange={(e) =>
                    setProtocol(e.target.value as ExtensionProtocol)
                  }
                >
                  <option value="mcp">
                    Model Context Protocol (MCP)
                  </option>
                  <option value="direct">Direct HTTP / REST Service</option>
                </Select>
                <Field
                  id="ext-url"
                  label="Remote Endpoint URL"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  hint="Use a public HTTPS endpoint. Local addresses are reserved for isolated tests."
                  required
                />
                <Field
                  id="op-id"
                  label="Operator ID"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  required
                />
                <Field
                  id="op-name"
                  label="Operator Legal Name"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  required
                />
                <Field
                  id="op-email"
                  label="Support Contact Email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                />
                <Field
                  id="op-terms"
                  label="Terms of Service URL"
                  value={termsUrl}
                  onChange={(e) => setTermsUrl(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  id="capability-key"
                  label="Tool key"
                  value={capabilityKey}
                  onChange={(event) => setCapabilityKey(event.target.value)}
                  required
                />
                <Field
                  id="capability-name"
                  label="What the tool does"
                  value={capabilityName}
                  onChange={(event) => setCapabilityName(event.target.value)}
                  required
                />
                <Select
                  id="capability-effect"
                  label="Effect"
                  value={capabilityEffect}
                  onChange={(event) => setCapabilityEffect(event.target.value as ExtensionEffect)}
                >
                  <option value="read">Reads information</option>
                  <option value="write">Changes external state</option>
                  <option value="mixed">Can read or change state</option>
                </Select>
              </div>

              <div className="p-2 bg-ember-hush text-xs text-coral-pulse rounded border border-coral-pulse/30">
                Registration stores a declaration only. This does not connect
                an account or enable the server for agent use.
              </div>

              <Row>
                <Button
                  type="submit"
                  variant="primary"
                  aria-label="Confirm extension registration"
                >
                  Register Extension
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowInstallForm(false)}
                >
                  Cancel
                </Button>
              </Row>
            </form>
          )}

          {/* Installed Extensions List */}
          {loading && <Text muted>Loading extension registry...</Text>}

          {!loading && extensions.length === 0 && (
            <div className="p-6 text-center border border-dashed border-border-edge rounded-lg text-ash text-sm">
              No remote extensions installed yet. Use the button above to
              register a remote MCP or Direct service.
            </div>
          )}

          {!loading &&
            extensions.map((ext) => {
              const isConsentRequired =
                ext.consent_status === "consent_required";
              const isQuarantined = ext.lifecycle_state === "quarantined";
              const isRemoved = ext.lifecycle_state === "removed";
              const isConformant = ext.conformance_status === "passed";
              const isReadyForConsequential =
                isConformant && ext.operator_enabled && !isConsentRequired;

              return (
                <div
                  key={ext.id}
                  className="p-4 bg-obsidian border border-border-edge rounded-lg space-y-4"
                  data-testid={`extension-card-${ext.external_key}`}
                >
                  {/* Header & Badges */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border-edge pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-pure-white text-base">
                          {ext.display_name}
                        </h3>
                        <span className="text-xs text-ash font-mono">
                          ({ext.external_key})
                        </span>
                        <Badge tone="neutral">
                          {ext.protocol.toUpperCase()} Adapter
                        </Badge>
                        <Badge tone="neutral">v{ext.current_version}</Badge>
                      </div>
                      <p className="text-xs text-ash mt-1 font-mono break-all">
                        Endpoint: {ext.endpoint_url}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        tone={
                          ext.lifecycle_state === "active"
                            ? "positive"
                            : isQuarantined
                              ? "warning"
                              : "neutral"
                        }
                      >
                        State: {ext.lifecycle_state.toUpperCase()}
                      </Badge>
                      <Badge
                        tone={
                          isConformant
                            ? "positive"
                            : ext.conformance_status === "failed"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        Conformance: {ext.conformance_status}
                      </Badge>
                      <Badge
                        tone={ext.operator_enabled ? "positive" : "neutral"}
                      >
                        Operator:{" "}
                        {ext.operator_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>

                  {/* Renewed Consent Banner */}
                  {isConsentRequired && (
                    <div
                      className="p-3 bg-ember-hush/60 border border-coral-pulse/40 rounded-lg text-sm text-mist space-y-2"
                      role="alert"
                      aria-live="assertive"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-coral-pulse">
                          ⚠️ Renewed Consent Required
                        </span>
                        <Badge tone="warning">Action Suspended</Badge>
                      </div>
                      <p className="text-xs text-mist">
                        A material change occurred in version{" "}
                        {ext.current_version} (operator transfer or newly
                        declared third-party data recipients). Consequential
                        actions and executions are suspended until you
                        explicitly review and grant consent.
                      </p>
                      <p className="text-xs text-mist">Ask the app operator for the version change details. Consent renewal is unavailable here until Vox can show exactly what changed.</p>
                    </div>
                  )}

                  {/* Operator & Governance Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-ink p-3 rounded border border-border-edge/80">
                    <div>
                      <span className="text-ash">Operator Legal Entity:</span>{" "}
                      <span className="text-mist font-medium">
                        {ext.operator.operator_name}
                      </span>{" "}
                      <span className="text-ash font-mono">
                        ({ext.operator.operator_id})
                      </span>
                    </div>
                    <div>
                      <span className="text-ash">Support Contact:</span>{" "}
                      <span className="text-mist">
                        {ext.operator.support_email ? (
                          <a
                            href={`mailto:${ext.operator.support_email}`}
                            className="underline text-mist hover:text-pure-white"
                          >
                            {ext.operator.support_email}
                          </a>
                        ) : (
                          "None declared"
                        )}
                      </span>
                    </div>
                    {ext.operator.terms_url && (
                      <div className="col-span-full">
                        <span className="text-ash">Terms of Service:</span>{" "}
                        <a
                          href={ext.operator.terms_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-mist hover:text-pure-white"
                        >
                          {ext.operator.terms_url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Declared Capabilities & Consequential Fail-Closed Inspection */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-mist uppercase tracking-wider">
                      Declared Capabilities & Consequential Gates
                    </h4>
                    {!ext.capabilities || ext.capabilities.length === 0 ? (
                      <p className="text-xs text-ash italic">
                        No capabilities declared.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {ext.capabilities.map((cap) => {
                          const isConsequential =
                            cap.consequential ||
                            cap.effect === "write" ||
                            cap.effect === "mixed";
                          return (
                            <div
                              key={cap.external_key}
                              className="p-2.5 bg-ink border border-border-edge/70 rounded text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <span className="font-medium text-mist">
                                  {cap.display_name}{" "}
                                  <code className="text-ash">
                                    ({cap.external_key})
                                  </code>
                                </span>
                                <div className="flex gap-1.5 items-center">
                                  <Badge
                                    tone={
                                      cap.effect === "read"
                                        ? "neutral"
                                        : "warning"
                                    }
                                  >
                                    Effect: {cap.effect}
                                  </Badge>
                                  {isConsequential && (
                                    <Badge
                                      tone={
                                        isReadyForConsequential
                                          ? "positive"
                                          : "warning"
                                      }
                                    >
                                      {isReadyForConsequential
                                        ? "Operator gate passed"
                                        : "Operator gate pending"}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="text-ash flex flex-wrap gap-4 pt-1">
                                <div>
                                  <strong>Data Recipients:</strong>{" "}
                                  {cap.data_recipients &&
                                  cap.data_recipients.length > 0
                                    ? cap.data_recipients.join(", ")
                                    : "None (local processing)"}
                                </div>
                                {cap.access_needs &&
                                  cap.access_needs.length > 0 && (
                                    <div>
                                      <strong>Access Needs:</strong>{" "}
                                      {cap.access_needs.join(", ")}
                                    </div>
                                  )}
                              </div>

                              {isConsequential && !isReadyForConsequential && (
                                <p className="text-coral-pulse/90 text-xs italic">
                                  ⚠️ Consequential execution blocked: Requires
                                  passed conformance (current:{" "}
                                  {ext.conformance_status}) and operator
                                  enablement (current:{" "}
                                  {ext.operator_enabled
                                    ? "enabled"
                                    : "disabled"}
                                  ).
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions & Lifecycle Controls */}
                  {!isRemoved && (
                    <div className="flex items-center justify-between pt-2 border-t border-border-edge flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                      </div>

                      <Button
                        variant="danger"
                        className="text-xs"
                        onClick={() => handleRemove(ext.id)}
                        aria-label={`Remove extension ${ext.display_name}`}
                      >
                        Remove Extension
                      </Button>
                    </div>
                  )}

                  {isRemoved && (
                    <div className="p-2 bg-ink text-ash text-xs italic rounded">
                      This extension was removed and preserved for historical
                      audit evidence.
                    </div>
                  )}
                </div>
              );
            })}
        </Stack>
      </Card>
    </Stack>
  );
}
