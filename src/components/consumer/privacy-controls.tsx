"use client";

import { useEffect, useState, useId } from "react";
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
import type { UserPreference } from "@/lib/consumer-auth/core-host-client";
import { SENSITIVE_PREFERENCE_KEYS } from "@/lib/consumer-auth/constants";

const PREFERENCE_CATEGORIES = [
  { id: "locale", name: "Locale & Presentation" },
  { id: "dining", name: "Food & Dietary" },
  { id: "travel", name: "Travel & Transit" },
  { id: "notifications", name: "Notification Defaults" },
  { id: "sensitive_personal", name: "Sensitive Personal Details" },
];

export function PrivacyControls() {
  const formId = useId();
  const [activeTab, setActiveTab] = useState<
    "preferences" | "history" | "governance"
  >("preferences");
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Preference Form
  const [category, setCategory] = useState("locale");
  const [prefKey, setPrefKey] = useState("display_currency");
  const [prefValue, setPrefValue] = useState("USD");
  const isSensitive =
    category === "sensitive_personal" ||
    SENSITIVE_PREFERENCE_KEYS.includes(prefKey);
  const [prevIsSensitive, setPrevIsSensitive] = useState(isSensitive);
  const [confirmedSensitive, setConfirmedSensitive] = useState(false);
  const [pendingConfirmationKey, setPendingConfirmationKey] = useState<
    string | null
  >(null);

  if (isSensitive !== prevIsSensitive) {
    setPrevIsSensitive(isSensitive);
    if (!isSensitive) {
      setConfirmedSensitive(false);
      setPendingConfirmationKey(null);
    }
  }

  // Deletion state
  const [deletingHistory, setDeletingHistory] = useState(false);
  const [deletionResult, setDeletionResult] = useState<{
    tasks: number;
    conversations: number;
    disclosure: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [understandNoUndo, setUnderstandNoUndo] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{
    export_id: string;
    disclosure: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      await loadPreferences();
    })();
  }, []);

  async function loadPreferences() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/account/preferences");
      if (!res.ok) throw new Error("Failed to load preferences from Core");
      const data = await res.json();
      setPreferences(data.preferences || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load preferences",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePreference(e: React.FormEvent) {
    e.preventDefault();
    if (!prefKey.trim()) return;

    // Check if sensitive and not yet confirmed
    if (isSensitive && !confirmedSensitive) {
      setPendingConfirmationKey(prefKey.trim());
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      let parsedValue: unknown = prefValue;
      try {
        if (prefValue.startsWith("{") || prefValue.startsWith("[")) {
          parsedValue = JSON.parse(prefValue);
        }
      } catch {
        parsedValue = prefValue;
      }

      const res = await fetch("/api/account/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          preference_key: prefKey.trim(),
          value: parsedValue,
          is_sensitive: isSensitive,
          confirmed: confirmedSensitive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 428) {
          setPendingConfirmationKey(prefKey.trim());
          setError(data.error);
          return;
        }
        throw new Error(data.error || "Failed to save preference");
      }

      setPreferences((prev) => {
        const filtered = prev.filter(
          (p) => p.preference_key !== data.preference.preference_key,
        );
        return [data.preference, ...filtered];
      });

      setSuccess(
        `Preference "${data.preference.preference_key}" saved successfully.`,
      );
      setPendingConfirmationKey(null);
      setConfirmedSensitive(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save preference",
      );
    }
  }

  async function handleDeletePreference(key: string) {
    try {
      setError(null);
      const res = await fetch(
        `/api/account/preferences/${encodeURIComponent(key)}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error("Failed to delete preference");
      setPreferences((prev) => prev.filter((p) => p.preference_key !== key));
      setSuccess(`Preference "${key}" deleted.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete preference",
      );
    }
  }

  async function handleDeleteTaskHistory() {
    if (!understandNoUndo) {
      setError(
        "Please confirm your acknowledgment that deleting history does not undo external transactions.",
      );
      return;
    }

    try {
      setDeletingHistory(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(
        "/api/account/privacy/history?delete_conversations=true",
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to delete task history");

      setDeletionResult({
        tasks: data.deleted_tasks_count,
        conversations: data.deleted_conversations_count,
        disclosure: data.disclosure,
      });
      setSuccess(
        "Task and conversation history removed from active platform database.",
      );
      setShowDeleteModal(false);
      setUnderstandNoUndo(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete history");
    } finally {
      setDeletingHistory(false);
    }
  }

  async function handleExport() {
    try {
      setExporting(true);
      setError(null);
      const res = await fetch("/api/account/privacy/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: ["preferences", "config", "tasks"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Export failed");

      setExportResult({
        export_id: data.export.export_id,
        disclosure: data.disclosure,
      });
      setSuccess(
        "Portable export generated. Excludes raw credentials and active authority.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Stack gap="normal">
      <Card
        title="Privacy, Preferences & Data Governance"
        description="Manage saved preferences separately from conversation and task history. Understand platform-controlled retention limits."
        tone="soft"
      >
        <Stack gap="normal">
          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-800 gap-2 pb-2">
            <Button
              variant={activeTab === "preferences" ? "primary" : "secondary"}
              className="text-xs"
              onClick={() => setActiveTab("preferences")}
            >
              Saved Preferences
            </Button>
            <Button
              variant={activeTab === "history" ? "primary" : "secondary"}
              className="text-xs"
              onClick={() => setActiveTab("history")}
            >
              Task & History Deletion
            </Button>
            <Button
              variant={activeTab === "governance" ? "primary" : "secondary"}
              className="text-xs"
              onClick={() => setActiveTab("governance")}
            >
              Data Sharing & Portability
            </Button>
          </div>

          {error && (
            <div role="alert" aria-live="assertive">
              <Notice title="Notice" tone="error">
                {error}
              </Notice>
            </div>
          )}

          {success && (
            <div role="status" aria-live="polite">
              <Notice title="Success" tone="success">
                {success}
              </Notice>
            </div>
          )}

          {/* TAB 1: SAVED PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded text-xs space-y-1 text-neutral-400">
                <div className="font-semibold text-neutral-300">
                  Advisory Context Invariant (PRD FR-PRF-006 & FR-PRF-008):
                </div>
                <p>
                  Saved preferences are user-managed and strictly separated from
                  task history and agent code. Preferences provide advisory
                  context only and grant NO capability, account, payment, or
                  action authority. Authoritative provider facts (currency,
                  inventory, booking deadlines, timezone) always supersede saved
                  preferences.
                </p>
              </div>

              {/* Preference Form */}
              <form onSubmit={handleSavePreference} className="space-y-3">
                <Row spread>
                  <div className="w-1/3">
                    <Select
                      id={`${formId}-category`}
                      label="Category"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (e.target.value === "sensitive_personal") {
                          setPrefKey("home_address");
                        } else if (e.target.value === "locale") {
                          setPrefKey("display_currency");
                        }
                      }}
                    >
                      {PREFERENCE_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="w-1/3 ml-2">
                    <Field
                      id={`${formId}-key`}
                      label="Preference Key"
                      value={prefKey}
                      onChange={(e) => setPrefKey(e.target.value)}
                      placeholder="e.g. display_currency"
                      required
                    />
                  </div>
                  <div className="flex-1 ml-2">
                    <Field
                      id={`${formId}-val`}
                      label="Value"
                      value={prefValue}
                      onChange={(e) => setPrefValue(e.target.value)}
                      placeholder='e.g. "USD" or {"city": "Bengaluru"}'
                      required
                    />
                  </div>
                </Row>

                {/* SENSITIVE PREFERENCE CONFIRMATION MODAL / INLINE WARNING */}
                {(isSensitive || pendingConfirmationKey) && (
                  <div className="p-3 bg-amber-950/50 border border-amber-800 rounded text-xs text-amber-200 space-y-2">
                    <div className="font-semibold">
                      Sensitive Personal Preference Confirmation Required:
                    </div>
                    <p>
                      Key <strong>{prefKey}</strong> contains sensitive personal
                      data (e.g. address, medical/dietary, ID, or payment
                      preference). Vox requires explicit confirmation before
                      saving or replacing this context.
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={confirmedSensitive}
                        onChange={(e) =>
                          setConfirmedSensitive(e.target.checked)
                        }
                        className="rounded border-amber-700 bg-neutral-900"
                      />
                      <span>
                        I explicitly authorize Vox to save/replace this
                        sensitive preference.
                      </span>
                    </label>
                  </div>
                )}

                <Button type="submit" variant="primary">
                  Save Preference
                </Button>
              </form>

              {/* Preference List */}
              <div className="pt-3 border-t border-neutral-800 space-y-2">
                <Row spread>
                  <h4 className="text-sm font-semibold text-neutral-200">
                    Saved Preferences ({preferences.length})
                  </h4>
                  <Button
                    variant="secondary"
                    className="text-xs py-1 px-2"
                    disabled={loading}
                    onClick={loadPreferences}
                  >
                    {loading ? "Loading..." : "Refresh"}
                  </Button>
                </Row>

                {preferences.length === 0 && !loading && (
                  <Text muted>
                    No saved preferences found. Add advisory preferences using
                    the form above.
                  </Text>
                )}

                <div className="space-y-2">
                  {preferences.map((pref) => (
                    <div
                      key={pref.id}
                      role="region"
                      aria-labelledby={`pref-key-${pref.preference_key}`}
                      className="p-3 border border-neutral-800 bg-neutral-950 rounded flex justify-between items-center text-xs"
                      data-testid={`pref-${pref.preference_key}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <strong
                            id={`pref-key-${pref.preference_key}`}
                            className="text-neutral-100"
                          >
                            {pref.preference_key}
                          </strong>
                          <Badge
                            tone={pref.is_sensitive ? "warning" : "neutral"}
                          >
                            {pref.category.toUpperCase()}
                          </Badge>
                          {pref.is_sensitive && (
                            <span
                              className="text-[10px] text-amber-400 font-mono"
                              aria-label="Sensitive personal preference requiring explicit confirmation"
                            >
                              🔒 [SENSITIVE - CONFIRMED]
                            </span>
                          )}
                        </div>
                        <div className="text-neutral-400 font-mono">
                          {typeof pref.value === "object"
                            ? JSON.stringify(pref.value)
                            : String(pref.value)}
                        </div>
                        <div className="text-[10px] text-neutral-600">
                          {pref.authority_disclaimer}
                        </div>
                      </div>

                      <Button
                        variant="danger"
                        className="text-xs py-1 px-2"
                        aria-label={`Delete preference: ${pref.preference_key}`}
                        onClick={() =>
                          handleDeletePreference(pref.preference_key)
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASK & HISTORY DELETION */}
          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-3 text-xs">
                <div className="font-semibold text-neutral-100 text-sm">
                  Platform Task History Deletion (PRD FR-DAT-005, FR-DAT-006,
                  FR-DAT-007)
                </div>
                <p className="text-neutral-300">
                  Users can request deletion of platform-controlled conversation
                  sessions and durable task executions.
                </p>

                {/* MANDATORY DELETION DISCLOSURE COPY */}
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded space-y-2 text-neutral-400">
                  <div className="font-semibold text-rose-300">
                    Mandatory Deletion Disclosure & Boundaries:
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      <strong>No Transaction Undo:</strong> Deleting task
                      history removes internal Vox logs. It{" "}
                      <strong className="text-rose-200">
                        DOES NOT undo, cancel, or refund completed external
                        actions
                      </strong>{" "}
                      (e.g. hotel bookings, rides, food orders, or calendar
                      events).
                    </li>
                    <li>
                      <strong>External Records:</strong> Third-party services
                      (Amazon, Expedia, Uber, Twilio carrier receipts) retain
                      transaction logs under their own retention policies
                      outside Vox control.
                    </li>
                    <li>
                      <strong>Remote Operators & Audit Retention:</strong>{" "}
                      Deployment operators may maintain mandatory legal audit
                      logs and compliance records that are exempt from immediate
                      user deletion.
                    </li>
                    <li>
                      <strong>Backup Timing:</strong> Database backup snapshots
                      retain records for up to 30 days before natural rolling
                      expiration.
                    </li>
                  </ul>
                </div>

                {!showDeleteModal ? (
                  <Button
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete Platform Task History
                  </Button>
                ) : (
                  <div className="p-4 bg-rose-950/40 border border-rose-900 rounded space-y-3">
                    <div className="font-semibold text-rose-200">
                      Confirm Deletion of Task & Conversation History
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-rose-100">
                      <input
                        type="checkbox"
                        checked={understandNoUndo}
                        onChange={(e) => setUnderstandNoUndo(e.target.checked)}
                        className="rounded border-rose-700 bg-neutral-900"
                      />
                      <span>
                        I understand that this deletes internal Vox task records
                        and CANNOT undo or refund completed external actions.
                      </span>
                    </label>
                    <Row spread>
                      <Button
                        variant="danger"
                        disabled={!understandNoUndo || deletingHistory}
                        onClick={handleDeleteTaskHistory}
                      >
                        {deletingHistory
                          ? "Purging Task Records..."
                          : "Permanently Delete Task History"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowDeleteModal(false);
                          setUnderstandNoUndo(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </Row>
                  </div>
                )}
              </div>

              {deletionResult && (
                <div
                  role="status"
                  aria-live="polite"
                  className="p-3 bg-neutral-900 border border-neutral-800 rounded text-xs space-y-2"
                >
                  <div className="font-semibold text-neutral-200">
                    Deletion Summary:
                  </div>
                  <p className="text-neutral-400">
                    Purged <strong>{deletionResult.tasks}</strong> tasks and{" "}
                    <strong>{deletionResult.conversations}</strong> conversation
                    turns from platform database.
                  </p>
                  <p className="text-neutral-500 italic">
                    {deletionResult.disclosure}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DATA SHARING & PORTABILITY */}
          {activeTab === "governance" && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded space-y-2">
                <div className="font-semibold text-neutral-200">
                  Data Recipient Disclosures (PRD FR-DAT-006):
                </div>
                <p className="text-neutral-400">
                  External services only receive data necessary to execute
                  approved actions:
                </p>
                <div className="space-y-1 text-neutral-300">
                  <div>
                    • <strong>Expedia:</strong> Receives travel dates,
                    destination, guest count, and payment details strictly
                    during approved booking.
                  </div>
                  <div>
                    • <strong>Uber:</strong> Receives pickup/dropoff coordinates
                    during ride request handoff.
                  </div>
                  <div>
                    • <strong>Amazon:</strong> Receives ASIN item reference and
                    quantity for cart continuation.
                  </div>
                  <div>
                    • <strong>Twilio / WhatsApp:</strong> Receives destination
                    phone number and notification text for dispatch.
                  </div>
                </div>
                <div className="pt-2 text-neutral-400">
                  To disconnect integrations or revoke agent capabilities, use
                  the separate management panels below:
                </div>
                <Row>
                  <a
                    href="#connections"
                    className="text-xs text-sky-400 underline hover:text-sky-300 mr-4"
                  >
                    → Manage & Disconnect Integrations
                  </a>
                  <a
                    href="#grants"
                    className="text-xs text-sky-400 underline hover:text-sky-300"
                  >
                    → Inspect & Revoke Agent Grants
                  </a>
                </Row>
              </div>

              {/* Portable Export */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded space-y-3">
                <div className="font-semibold text-neutral-200">
                  Portable Data Export (PRD FR-PRT-001 - FR-PRT-005)
                </div>
                <p className="text-neutral-400">
                  Download a documented portable representation of your
                  non-secret preferences, configuration, and task history. In
                  accordance with platform safety guarantees,{" "}
                  <strong>
                    credentials, active approvals, and reusable authority are
                    never exported
                  </strong>
                  .
                </p>
                <Button
                  variant="secondary"
                  disabled={exporting}
                  onClick={handleExport}
                >
                  {exporting
                    ? "Packaging Export..."
                    : "Generate Portable Export"}
                </Button>

                {exportResult && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-3 bg-neutral-950 border border-neutral-800 rounded space-y-1"
                  >
                    <div className="font-semibold text-emerald-400">
                      Export Ready: {exportResult.export_id}
                    </div>
                    <p className="text-neutral-400">
                      {exportResult.disclosure}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
