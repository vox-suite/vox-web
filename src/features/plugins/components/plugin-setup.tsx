"use client";
import { useState } from "react";
import { Button, Notice } from "@/components/ui";
import { useAgents } from "@/features/agents/queries";
import type { CatalogPlugin } from "../catalog";
import { useConnectPlugin, useIsConnectingPlugin } from "../queries";

/** The reviewed package digest keys this form so changed declarations reset consent. */
export function PluginSetup({ plugin }: { plugin: CatalogPlugin }) {
  const agents = useAgents();
  const [picked, setPicked] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState(() =>
    plugin.capabilities
      .filter((cap) => cap.effect === "read" && !cap.consequential)
      .map((cap) => cap.external_key),
  );
  const [skills, setSkills] = useState(Boolean(plugin.metadata?.skills.length));
  const mutation = useConnectPlugin();
  const pending = useIsConnectingPlugin(plugin.id);
  const agentKey =
    picked ??
    agents.data?.find((agent) => agent.is_default)?.external_key ??
    "";
  const agent = agents.data?.find((agent) => agent.external_key === agentKey);
  const accountOnly = picked === "";
  return (
    <section
      className="space-y-3 rounded-xl border border-border-edge p-4"
      aria-label="Assistant access"
    >
      <label className="block space-y-1 text-sm text-mist">
        <span>Who can use {plugin.displayName}?</span>
        <select
          className="w-full rounded-lg border border-border-edge bg-obsidian p-2"
          value={agentKey}
          disabled={pending || agents.isPending}
          onChange={(event) => {
            setPicked(event.target.value);
            mutation.reset();
          }}
        >
          <option value="">Connect account only</option>
          {agents.data?.map((agent) => (
            <option key={agent.external_key} value={agent.external_key}>
              {agent.display_name}
            </option>
          ))}
        </select>
      </label>
      {!accountOnly && (
        <>
          <p className="text-xs text-ash">
            Enable only the capabilities you choose for this assistant.
          </p>
          {plugin.capabilities.map((cap) => (
            <label
              key={cap.external_key}
              className="flex items-start gap-2 text-sm text-mist"
            >
              <input
                type="checkbox"
                disabled={pending}
                checked={capabilities.includes(cap.external_key)}
                onChange={(event) => {
                  setCapabilities((keys) =>
                    event.target.checked
                      ? [...keys, cap.external_key]
                      : keys.filter((key) => key !== cap.external_key),
                  );
                  mutation.reset();
                }}
              />
              <span>
                {cap.display_name}
                {cap.consequential
                  ? " · Changes external data; each action needs approval"
                  : ""}
              </span>
            </label>
          ))}
          {Boolean(plugin.metadata?.skills.length) && (
            <label className="flex items-start gap-2 text-sm text-mist">
              <input
                type="checkbox"
                checked={skills}
                disabled={pending}
                onChange={(event) => {
                  setSkills(event.target.checked);
                  mutation.reset();
                }}
              />
              <span>
                Enable included guidance:{" "}
                {plugin.metadata?.skills
                  .map((skill) => `${skill.external_key} v${skill.version}`)
                  .join(", ")}
              </span>
            </label>
          )}
        </>
      )}
      {agents.isError && (
        <Notice tone="error" title="Assistants unavailable">
          Try again after your assistants load, or connect the account only.
        </Notice>
      )}
      <Button
        size="sm"
        disabled={pending || (!accountOnly && !agent) || !plugin.packageDigest}
        onClick={() =>
          mutation.mutate({
            plugin,
            consent: accountOnly
              ? null
              : {
                  agent_external_key: agent!.external_key,
                  agent_instruction_version: agent!.instruction_version,
                  capability_external_keys: capabilities,
                  enable_bundled_skills: skills,
                },
          })
        }
      >
        {pending
          ? "Connecting…"
          : accountOnly
            ? "Connect account only"
            : `Connect and enable for ${agent?.display_name ?? "assistant"}`}
      </Button>
      {mutation.isError && (
        <Notice tone="error" title="Setup could not finish">
          {mutation.error.message}
        </Notice>
      )}
      {mutation.data?.status === "needs_review" && (
        <Notice title="Account linked; review access" tone="info">
          The package or assistant changed. Review your choices and try setup
          again.
        </Notice>
      )}
      {mutation.data?.status === "authorized" && (
        <Notice title="Setup completed" tone="success">
          Your connection and chosen access have been saved. Manage current
          permissions under Agent access.
        </Notice>
      )}
    </section>
  );
}
