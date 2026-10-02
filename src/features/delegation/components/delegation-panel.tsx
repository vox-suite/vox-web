"use client";
import { useState } from "react";
import { Button, Select } from "@/components/ui";
import { Callout, Panel, Tag } from "@/components/app";
import { useAgents } from "@/features/agents/queries";
import { useConnections } from "@/features/connections/queries";
import { errorMessage } from "@/lib/api/http";
import type {
  DurableTask,
  DelegationPermission,
  DelegationCapability,
} from "@/lib/consumer-auth/core-host-client";
import { isTaskTerminal } from "@/features/tasks/api";
import {
  useScopes,
  usePermissions,
  useCreatePermission,
  useRevokePermission,
} from "../queries";
const readable = (key: string) => key.replace(/[_.-]/g, " ");
function PermissionCard({ permission }: { permission: DelegationPermission }) {
  const agents = useAgents();
  const connections = useConnections();
  const scopes = useScopes(
    permission.requester_agent_key,
    permission.specialist_agent_key,
  );
  const revoke = useRevokePermission();
  const name = (key: string) =>
    agents.data?.find((agent) => agent.external_key === key)?.display_name ??
    "Unavailable assistant";
  return (
    <section
      className="space-y-2 rounded-lg border border-border-edge p-4"
      aria-label={`${name(permission.requester_agent_key)} to ${name(permission.specialist_agent_key)} permission`}
    >
      <p>
        {name(permission.requester_agent_key)} →{" "}
        {name(permission.specialist_agent_key)}
      </p>
      <Tag>
        {permission.mode === "once"
          ? "Once for this task"
          : "Remembered for future tasks"}
      </Tag>{" "}
      <Tag>
        {permission.state === "revoked"
          ? "Revoked"
          : permission.mode === "once" && permission.used
            ? "Used"
            : "Enabled"}
      </Tag>
      <ul>
        {permission.scope.capabilities.map((cap) => {
          const metadata = scopes.data?.capabilities.find(
            (item) =>
              item.connection_id === cap.connection_id &&
              item.capability_external_key === cap.capability_external_key,
          );
          const account = connections.data?.find(
            (connection) => connection.id === cap.connection_id,
          );
          return (
            <li key={`${cap.connection_id}:${cap.capability_external_key}`}>
              {metadata?.tool_name ?? readable(cap.capability_external_key)} ·{" "}
              {metadata?.integration_name ??
                readable(account?.integration_external_key ?? "Service")}{" "}
              ·{" "}
              {metadata?.account_display_id ??
                account?.account_display_id ??
                "Connected account"}
            </li>
          );
        })}
      </ul>
      {permission.state === "enabled" &&
      (scopes.error ||
        (scopes.data &&
          !permission.scope.capabilities.every((cap) =>
            scopes.data?.capabilities.some(
              (current) =>
                current.connection_id === cap.connection_id &&
                current.capability_external_key === cap.capability_external_key,
            ),
          ))) ? (
        <Callout tone="warning" title="Review specialist access">
          Current account access is unavailable or changed. Saved permission
          does not restore revoked access.
        </Callout>
      ) : null}
      <p>
        Shared saved preferences:{" "}
        {permission.selected_shared_preferences.length
          ? permission.selected_shared_preferences
              .map(({ key }) => readable(key))
              .join(", ")
          : "None"}
      </p>
      {permission.state === "enabled" ? (
        <Button
          size="sm"
          variant="danger"
          disabled={revoke.isPending}
          onClick={() => revoke.mutate(permission.id)}
        >
          {revoke.isPending ? "Revoking…" : "Revoke permission"}
        </Button>
      ) : null}
      {revoke.error ? (
        <Callout tone="danger" live="assertive">
          {errorMessage(revoke.error)}
        </Callout>
      ) : null}
    </section>
  );
}
export function DelegationConsentForm({
  requester,
  specialist,
  tasks,
  boundTask,
  requested,
  onSaved,
  continuing,
}: {
  requester: string;
  specialist: string;
  tasks: DurableTask[];
  boundTask?: DurableTask;
  requested?: DelegationCapability[];
  onSaved?: () => void;
  continuing?: boolean;
}) {
  const scopes = useScopes(requester, specialist);
  const create = useCreatePermission();
  const [mode, setMode] = useState<"once" | "remembered">("once");
  const [taskId, setTaskId] = useState(boundTask?.id ?? "");
  const [selected, setSelected] = useState<string[]>(
    requested?.map(
      (cap) => `${cap.connection_id}:${cap.capability_external_key}`,
    ) ?? [],
  );
  const [preferences, setPreferences] = useState<string[]>([]);
  const eligibleTasks = tasks.filter(
    (task) =>
      !task.parent_task_id &&
      task.agent_external_key === requester &&
      !isTaskTerminal(task),
  );
  const task = eligibleTasks.find((task) => task.id === taskId);
  const capabilities = (scopes.data?.capabilities ?? []).filter(
    (cap) =>
      !requested ||
      requested.some(
        (reference) =>
          reference.connection_id === cap.connection_id &&
          reference.capability_external_key === cap.capability_external_key,
      ),
  );
  const selectedCapabilities = capabilities.filter((cap) =>
    selected.includes(`${cap.connection_id}:${cap.capability_external_key}`),
  );
  function toggle(
    key: string,
    current: string[],
    update: (next: string[]) => void,
  ) {
    update(
      current.includes(key)
        ? current.filter((value) => value !== key)
        : [...current, key],
    );
  }
  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!selectedCapabilities.length || (mode === "once" && !task)) return;
        create.mutate(
          {
            requester_agent_key: requester,
            specialist_agent_key: specialist,
            scope: {
              capabilities: selectedCapabilities.map(
                ({ connection_id, capability_external_key }) => ({
                  connection_id,
                  capability_external_key,
                }),
              ),
            },
            parent_run_id: mode === "once" ? task!.run_id : null,
            preference_keys: preferences,
          },
          {
            onSuccess: () => {
              setSelected([]);
              setPreferences([]);
              onSaved?.();
            },
          },
        );
      }}
    >
      <fieldset>
        <legend>How long may this assistant involve the specialist?</legend>
        <label>
          <input
            type="radio"
            name="delegation-mode"
            checked={mode === "once"}
            onChange={() => setMode("once")}
          />{" "}
          Once for this task
        </label>
        <label>
          <input
            type="radio"
            name="delegation-mode"
            checked={mode === "remembered"}
            onChange={() => setMode("remembered")}
          />{" "}
          Remember for future tasks
        </label>
      </fieldset>
      {mode === "once" && boundTask ? (
        <p>Once for: {boundTask.title}</p>
      ) : mode === "once" ? (
        <Select
          id="delegation-task"
          label="Task for one-time permission"
          value={taskId}
          onChange={(event) => setTaskId(event.target.value)}
        >
          <option value="">Choose a current task</option>
          {eligibleTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </Select>
      ) : (
        <p>You can revoke this remembered permission at any time.</p>
      )}
      <fieldset>
        <legend>Accounts and tools this specialist may use</legend>
        {scopes.isPending ? <p>Loading specialist access…</p> : null}
        {capabilities.map((cap) => {
          const key = `${cap.connection_id}:${cap.capability_external_key}`;
          return (
            <label key={key} className="block">
              <input
                type="checkbox"
                checked={selected.includes(key)}
                disabled={!selected.includes(key) && selected.length >= 32}
                onChange={() => toggle(key, selected, setSelected)}
              />{" "}
              {cap.tool_name} · {cap.integration_name} ·{" "}
              {cap.account_display_id ?? "Connected account"}
            </label>
          );
        })}
        {scopes.data && !capabilities.length ? (
          <p>
            This specialist has no eligible account tools. Add its account
            access in Library first.
          </p>
        ) : null}
      </fieldset>
      {scopes.data?.preferences.length ? (
        <fieldset>
          <legend>Saved preferences to share</legend>
          {scopes.data.preferences.map(({ key }) => (
            <label key={key} className="block">
              <input
                type="checkbox"
                checked={preferences.includes(key)}
                disabled={!preferences.includes(key) && preferences.length >= 8}
                onChange={() => toggle(key, preferences, setPreferences)}
              />{" "}
              Share {readable(key)}
            </label>
          ))}
        </fieldset>
      ) : null}
      <p>
        This permission shares only the selected preferences and relevant work
        results. Private memories and full conversations stay separate. External
        changes still need exact action approval.
      </p>
      <Button
        type="submit"
        disabled={
          create.isPending ||
          continuing ||
          !selectedCapabilities.length ||
          (mode === "once" && !task)
        }
      >
        {create.isPending
          ? "Saving…"
          : continuing
            ? "Continuing…"
            : boundTask
              ? "Allow and continue task"
              : "Allow specialist work"}
      </Button>
      {create.isSuccess ? (
        <Callout live="polite" title="Specialist permission saved">
          Only your selected accounts, tools and saved preferences are available
          through this permission.
        </Callout>
      ) : null}
      {scopes.error || create.error ? (
        <Callout tone="danger" live="assertive">
          {errorMessage(scopes.error ?? create.error)}
        </Callout>
      ) : null}
    </form>
  );
}
export function DelegationPanel({ tasks }: { tasks: DurableTask[] }) {
  const agents = useAgents();
  const permissions = usePermissions();
  const [pickedRequester, setRequester] = useState("");
  const [specialist, setSpecialist] = useState("");
  const requester =
    agents.data?.find((agent) => agent.external_key === pickedRequester)
      ?.external_key ??
    agents.data?.find((agent) => agent.is_default)?.external_key ??
    "";
  const selectedSpecialist =
    agents.data?.find(
      (agent) =>
        agent.external_key === specialist && agent.external_key !== requester,
    )?.external_key ?? "";
  return (
    <Panel
      title="Specialist permissions"
      description="Choose who can ask a named specialist to use specific accounts and tools."
    >
      <div className="space-y-4">
        <Select
          id="delegation-requester"
          label="Requesting assistant"
          value={requester}
          onChange={(event) => setRequester(event.target.value)}
        >
          {agents.data?.map((agent) => (
            <option key={agent.external_key} value={agent.external_key}>
              {agent.display_name}
            </option>
          ))}
        </Select>
        <Select
          id="delegation-specialist"
          label="Specialist assistant"
          value={selectedSpecialist}
          onChange={(event) => setSpecialist(event.target.value)}
        >
          <option value="">Choose a specialist</option>
          {agents.data
            ?.filter((agent) => agent.external_key !== requester)
            .map((agent) => (
              <option key={agent.external_key} value={agent.external_key}>
                {agent.display_name}
              </option>
            ))}
        </Select>
        {selectedSpecialist ? (
          <DelegationConsentForm
            key={`${requester}:${selectedSpecialist}`}
            requester={requester}
            specialist={selectedSpecialist}
            tasks={tasks}
          />
        ) : (
          <p>Select a specialist to review its current account tools.</p>
        )}
        <h3>Saved permissions</h3>
        {permissions.isPending ? (
          <p>Loading permissions…</p>
        ) : permissions.error ? (
          <Callout tone="danger" live="assertive">
            {errorMessage(permissions.error)}
            <Button
              variant="secondary"
              onClick={() => void permissions.refetch()}
            >
              Try again
            </Button>
          </Callout>
        ) : permissions.data?.length ? (
          permissions.data.map((permission) => (
            <PermissionCard key={permission.id} permission={permission} />
          ))
        ) : (
          <p>
            No specialist permissions. Assistants do not inherit one another’s
            account access.
          </p>
        )}
      </div>
    </Panel>
  );
}
