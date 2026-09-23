"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, Field, Notice, Row, Select, Stack, Text } from "@/components/ui";
import type {
  ExtensionCapability,
  ExtensionEffect,
  ExtensionProtocol,
  RemoteExtension,
} from "@/lib/consumer-auth/core-host-client";

const SAMPLE_PRESETS = [
  {
    name: "Weather MCP Service (Read-only)",
    external_key: "weather-mcp-service",
    display_name: "Weather Updates MCP",
    protocol: "mcp" as ExtensionProtocol,
    endpoint_url: "https://mcp.weather.example.com/sse",
    operator_id: "weather-inc",
    operator_name: "Weather Analytics Inc.",
    support_email: "support@weather.example.com",
    terms_url: "https://weather.example.com/terms",
    capabilities: [
      {
        external_key: "weather.get_forecast",
        display_name: "Get Weather Forecast",
        effect: "read" as ExtensionEffect,
        consequential: false,
        data_recipients: ["Weather Analytics Cloud"],
        access_needs: ["location.coordinates"],
      },
    ],
  },
  {
    name: "Travel Booking Partner (Consequential Write)",
    external_key: "travel-booking-partner",
    display_name: "Travel Booking Direct API",
    protocol: "direct" as ExtensionProtocol,
    endpoint_url: "https://api.travel.example.com/v1",
    operator_id: "travel-global",
    operator_name: "Global Travel Systems Corp.",
    support_email: "api@travel.example.com",
    terms_url: "https://travel.example.com/legal/terms",
    capabilities: [
      {
        external_key: "travel.search_flights",
        display_name: "Search Flights",
        effect: "read" as ExtensionEffect,
        consequential: false,
        data_recipients: ["Global Travel Cloud"],
        access_needs: ["travel.dates"],
      },
      {
        external_key: "travel.book_flight",
        display_name: "Book Flight Reservation",
        effect: "write" as ExtensionEffect,
        consequential: true,
        data_recipients: ["Global Travel Cloud", "Airlines Clearinghouse Ltd"],
        access_needs: ["travel.passenger_details", "payment.mandate"],
      },
    ],
  },
];

export function ExtensionsManager() {
  const [extensions, setExtensions] = useState<RemoteExtension[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Install Form State
  const [showInstallForm, setShowInstallForm] = useState(false);
  const [externalKey, setExternalKey] = useState("weather-mcp-service");
  const [displayName, setDisplayName] = useState("Weather Updates MCP");
  const [protocol, setProtocol] = useState<ExtensionProtocol>("mcp");
  const [endpointUrl, setEndpointUrl] = useState("https://mcp.weather.example.com/sse");
  const [operatorId, setOperatorId] = useState("weather-inc");
  const [operatorName, setOperatorName] = useState("Weather Analytics Inc.");
  const [supportEmail, setSupportEmail] = useState("support@weather.example.com");
  const [termsUrl, setTermsUrl] = useState("https://weather.example.com/terms");
  const [capabilities, setCapabilities] = useState<ExtensionCapability[]>([
    {
      external_key: "weather.get_forecast",
      display_name: "Get Weather Forecast",
      effect: "read",
      consequential: false,
      data_recipients: ["Weather Analytics Cloud"],
      access_needs: ["location.coordinates"],
    },
  ]);

  async function loadExtensions() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/account/extensions");
      if (!res.ok) throw new Error("Failed to load extensions");
      const data = await res.json();
      setExtensions(data.extensions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load extensions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExtensions();
  }, []);

  function applyPreset(presetIndex: number) {
    const p = SAMPLE_PRESETS[presetIndex];
    if (!p) return;
    setExternalKey(p.external_key);
    setDisplayName(p.display_name);
    setProtocol(p.protocol);
    setEndpointUrl(p.endpoint_url);
    setOperatorId(p.operator_id);
    setOperatorName(p.operator_name);
    setSupportEmail(p.support_email);
    setTermsUrl(p.terms_url);
    setCapabilities(p.capabilities);
  }

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
          capabilities,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Extension installation failed");
      }

      setActionSuccess(`Extension "${displayName}" registered successfully (default-denied, no authority granted).`);
      setShowInstallForm(false);
      await loadExtensions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to install extension");
    }
  }

  async function handleToggleEnable(id: string, currentEnabled: boolean) {
    try {
      setError(null);
      setActionSuccess(null);
      const res = await fetch(`/api/account/extensions/${encodeURIComponent(id)}/enable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update enablement");
      }
      setActionSuccess(`Operator enablement ${!currentEnabled ? "enabled" : "disabled"}.`);
      await loadExtensions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle operator enablement");
    }
  }

  async function handleRenewConsent(id: string, currentVersion: number) {
    try {
      setError(null);
      setActionSuccess(null);
      const res = await fetch(`/api/account/extensions/${encodeURIComponent(id)}/renew-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: currentVersion }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to renew consent");
      }
      setActionSuccess("Consent renewed successfully. Suspended capabilities unpaused.");
      await loadExtensions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to renew consent");
    }
  }

  async function handleSimulateMaterialUpdate(ext: RemoteExtension) {
    try {
      setError(null);
      setActionSuccess(null);
      // Simulate an update with expanded data recipients
      const expandedCaps = (ext.capabilities || []).map((c) => ({
        ...c,
        data_recipients: [...(c.data_recipients || []), "ThirdPartyAuditor.example.com"],
      }));
      const res = await fetch(`/api/account/extensions/${encodeURIComponent(ext.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capabilities: expandedCaps,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Update simulation failed");
      }
      setActionSuccess("Extension manifest updated with expanded data recipients. Renewed consent is now REQUIRED.");
      await loadExtensions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update extension");
    }
  }

  async function handleRemove(id: string) {
    try {
      setError(null);
      setActionSuccess(null);
      const res = await fetch(`/api/account/extensions/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove extension");
      }
      setActionSuccess("Extension removed from active state.");
      await loadExtensions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove extension");
    }
  }

  return (
    <Stack gap="normal">
      <Card
        title="Remote Integrations & Extension Governance"
        description="Inspect third-party remote extension operators, data recipients, and conformance without granting silent access."
        tone="soft"
      >
        <Stack gap="normal">
          {/* Default-Deny & Remote-Only Notice */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-neutral-300">
            <p className="font-semibold text-neutral-100 mb-1">
              Zero-Authority Remote Lifecycle Guarantees:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-400">
              <li>
                <strong>Remote-Only Execution:</strong> Untrusted code is never uploaded or executed inside Core. Extensions only communicate via declared HTTPS/SSE remote endpoints.
              </li>
              <li>
                <strong>Default-Deny Authority:</strong> Installation grants <strong>zero</strong> connection, context, capability, or action authority automatically.
              </li>
              <li>
                <strong>Consequential Fail-Closed:</strong> Consequential actions remain blocked until the extension passes conformance verification <em>and</em> operator enablement is toggled on.
              </li>
              <li>
                <strong>Renewed Consent Requirement:</strong> Any material change (operator transfer or expanded data recipients) immediately suspends affected actions until you explicitly review and renew consent.
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
            <span className="text-sm font-medium text-neutral-200">
              Installed Remote Extensions ({extensions.length})
            </span>
            <Button
              variant={showInstallForm ? "secondary" : "primary"}
              onClick={() => setShowInstallForm(!showInstallForm)}
              aria-label={showInstallForm ? "Close installation form" : "Install new remote extension"}
            >
              {showInstallForm ? "Cancel Installation" : "+ Register Remote Extension"}
            </Button>
          </Row>

          {/* Install Form */}
          {showInstallForm && (
            <form
              onSubmit={handleInstall}
              className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg space-y-4"
              aria-label="Register remote extension form"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-100">
                  Register Remote Extension
                </h3>
                <div className="flex gap-2">
                  <span className="text-xs text-neutral-400 self-center">Presets:</span>
                  {SAMPLE_PRESETS.map((p, idx) => (
                    <button
                      key={p.external_key}
                      type="button"
                      className="text-xs px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded"
                      onClick={() => applyPreset(idx)}
                    >
                      {p.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
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
                  onChange={(e) => setProtocol(e.target.value as ExtensionProtocol)}
                >
                  <option value="mcp">Model Context Protocol (MCP / SSE)</option>
                  <option value="direct">Direct HTTP / REST Service</option>
                </Select>
                <Field
                  id="ext-url"
                  label="Remote Endpoint URL"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  hint="Must be HTTPS (or localhost for development)"
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

              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-400">
                <strong>Declared Capabilities:</strong>{" "}
                {capabilities.map((c) => `${c.display_name} (${c.effect}${c.consequential ? ", consequential" : ""})`).join("; ")}
              </div>

              <div className="p-2 bg-neutral-900 text-xs text-amber-300 rounded border border-amber-900/50">
                ⚠️ Installation only saves metadata and endpoint contracts. It does NOT authorize any account tokens, context, or capabilities.
              </div>

              <Row>
                <Button type="submit" variant="primary" aria-label="Confirm extension registration">
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
            <div className="p-6 text-center border border-dashed border-neutral-800 rounded-lg text-neutral-400 text-sm">
              No remote extensions installed yet. Use the button above to register a remote MCP or Direct service.
            </div>
          )}

          {!loading &&
            extensions.map((ext) => {
              const isConsentRequired = ext.consent_status === "consent_required";
              const isQuarantined = ext.lifecycle_state === "quarantined";
              const isRemoved = ext.lifecycle_state === "removed";
              const isConformant = ext.conformance_status === "passed";
              const isReadyForConsequential = isConformant && ext.operator_enabled && !isConsentRequired;

              return (
                <div
                  key={ext.id}
                  className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-4"
                  data-testid={`extension-card-${ext.external_key}`}
                >
                  {/* Header & Badges */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-neutral-100 text-base">
                          {ext.display_name}
                        </h3>
                        <span className="text-xs text-neutral-400 font-mono">
                          ({ext.external_key})
                        </span>
                        <Badge tone="neutral">
                          {ext.protocol.toUpperCase()} Adapter
                        </Badge>
                        <Badge tone="neutral">v{ext.current_version}</Badge>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 font-mono break-all">
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
                      <Badge tone={isConformant ? "positive" : ext.conformance_status === "failed" ? "warning" : "neutral"}>
                        Conformance: {ext.conformance_status}
                      </Badge>
                      <Badge tone={ext.operator_enabled ? "positive" : "neutral"}>
                        Operator: {ext.operator_enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>

                  {/* Renewed Consent Banner */}
                  {isConsentRequired && (
                    <div
                      className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-sm text-red-200 space-y-2"
                      role="alert"
                      aria-live="assertive"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-400">⚠️ Renewed Consent Required</span>
                        <Badge tone="warning">Action Suspended</Badge>
                      </div>
                      <p className="text-xs text-red-300">
                        A material change occurred in version {ext.current_version} (operator transfer or newly declared third-party data recipients). Consequential actions and executions are suspended until you explicitly review and grant consent.
                      </p>
                      <Button
                        variant="primary"
                        className="text-xs bg-red-600 hover:bg-red-500 text-white"
                        onClick={() => handleRenewConsent(ext.id, ext.current_version)}
                        aria-label={`Renew consent for ${ext.display_name} version ${ext.current_version}`}
                      >
                        Review & Renew Consent (v{ext.current_version})
                      </Button>
                    </div>
                  )}

                  {/* Operator & Governance Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-neutral-950 p-3 rounded border border-neutral-800/80">
                    <div>
                      <span className="text-neutral-400">Operator Legal Entity:</span>{" "}
                      <span className="text-neutral-200 font-medium">{ext.operator.operator_name}</span>{" "}
                      <span className="text-neutral-400 font-mono">({ext.operator.operator_id})</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Support Contact:</span>{" "}
                      <span className="text-neutral-200">
                        {ext.operator.support_email ? (
                          <a href={`mailto:${ext.operator.support_email}`} className="underline text-blue-400">
                            {ext.operator.support_email}
                          </a>
                        ) : (
                          "None declared"
                        )}
                      </span>
                    </div>
                    {ext.operator.terms_url && (
                      <div className="col-span-full">
                        <span className="text-neutral-400">Terms of Service:</span>{" "}
                        <a
                          href={ext.operator.terms_url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline text-blue-400"
                        >
                          {ext.operator.terms_url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Declared Capabilities & Consequential Fail-Closed Inspection */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                      Declared Capabilities & Consequential Gates
                    </h4>
                    {(!ext.capabilities || ext.capabilities.length === 0) ? (
                      <p className="text-xs text-neutral-400 italic">No capabilities declared.</p>
                    ) : (
                      <div className="space-y-2">
                        {ext.capabilities.map((cap) => {
                          const isConsequential = cap.consequential || cap.effect === "write" || cap.effect === "mixed";
                          return (
                            <div
                              key={cap.external_key}
                              className="p-2.5 bg-neutral-950 border border-neutral-800/70 rounded text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <span className="font-medium text-neutral-200">
                                  {cap.display_name}{" "}
                                  <code className="text-neutral-400">({cap.external_key})</code>
                                </span>
                                <div className="flex gap-1.5 items-center">
                                  <Badge tone={cap.effect === "read" ? "neutral" : "warning"}>
                                    Effect: {cap.effect}
                                  </Badge>
                                  {isConsequential && (
                                    <Badge tone={isReadyForConsequential ? "positive" : "warning"}>
                                      {isReadyForConsequential
                                        ? "Consequential Action Ready"
                                        : "Consequential: Fails Closed"}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="text-neutral-400 flex flex-wrap gap-4 pt-1">
                                <div>
                                  <strong>Data Recipients:</strong>{" "}
                                  {cap.data_recipients && cap.data_recipients.length > 0
                                    ? cap.data_recipients.join(", ")
                                    : "None (local processing)"}
                                </div>
                                {cap.access_needs && cap.access_needs.length > 0 && (
                                  <div>
                                    <strong>Access Needs:</strong> {cap.access_needs.join(", ")}
                                  </div>
                                )}
                              </div>

                              {isConsequential && !isReadyForConsequential && (
                                <p className="text-amber-400/90 text-xs italic">
                                  ⚠️ Consequential execution blocked: Requires passed conformance (current: {ext.conformance_status}) and operator enablement (current: {ext.operator_enabled ? "enabled" : "disabled"}).
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
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={ext.operator_enabled ? "secondary" : "primary"}
                          className="text-xs"
                          onClick={() => handleToggleEnable(ext.id, ext.operator_enabled)}
                          aria-label={`${ext.operator_enabled ? "Disable" : "Enable"} operator for ${ext.display_name}`}
                        >
                          {ext.operator_enabled ? "Disable Operator" : "Enable Operator"}
                        </Button>

                        <Button
                          variant="ghost"
                          className="text-xs text-neutral-300 hover:text-white"
                          onClick={() => handleSimulateMaterialUpdate(ext)}
                          aria-label={`Simulate material update on ${ext.display_name}`}
                        >
                          Simulate Material Update (Add Recipient)
                        </Button>
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
                    <div className="p-2 bg-neutral-950 text-neutral-400 text-xs italic rounded">
                      This extension was removed and preserved for historical audit evidence.
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
