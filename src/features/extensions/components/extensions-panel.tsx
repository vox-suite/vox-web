"use client";

import { useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui";
import {
  Callout,
  ItemCard,
  MetaList,
  QueryContent,
  Tag,
  type TagTone,
} from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import type { RemoteExtension } from "@/lib/consumer-auth/core-host-client";
import { useExtensions, useRemoveExtension } from "../queries";
import { InstallExtensionForm } from "./install-extension-form";
import { QuickAddMcpForm } from "./quick-add-mcp-form";

function lifecycleTone(state: RemoteExtension["lifecycle_state"]): TagTone {
  if (state === "active") return "positive";
  if (state === "quarantined") return "warning";
  return "neutral";
}

function ExtensionCard({
  extension,
  onRemoved,
}: {
  extension: RemoteExtension;
  onRemoved: () => void;
}) {
  const remove = useRemoveExtension();
  const consentRequired = extension.consent_status === "consent_required";
  const conformant = extension.conformance_status === "passed";
  const readyForConsequential =
    conformant && extension.operator_enabled && !consentRequired;
  const removed = extension.lifecycle_state === "removed";
  const unverifiedOperator =
    extension.operator.operator_id.startsWith("unverified:");

  return (
    <ItemCard
      testId={`extension-card-${extension.external_key}`}
      title={extension.display_name}
      eyebrow={extension.external_key}
      subtitle={
        <span className="font-mono text-xs break-all">
          Endpoint: {extension.endpoint_url}
        </span>
      }
      badges={
        <>
          <Tag>{extension.protocol.toUpperCase()}</Tag>
          <Tag>v{extension.current_version}</Tag>
        </>
      }
      actions={
        !removed ? (
          <Button
            variant="danger"
            size="sm"
            disabled={remove.isPending}
            aria-label={`Remove extension ${extension.display_name}`}
            onClick={() =>
              remove.mutate(extension.id, { onSuccess: onRemoved })
            }
          >
            {remove.isPending ? "Removing…" : "Remove"}
          </Button>
        ) : null
      }
    >
      <div className="flex flex-wrap gap-2">
        <Tag tone={lifecycleTone(extension.lifecycle_state)}>
          State: {extension.lifecycle_state}
        </Tag>
        <Tag
          tone={
            conformant
              ? "positive"
              : extension.conformance_status === "failed"
                ? "warning"
                : "neutral"
          }
        >
          Conformance: {extension.conformance_status}
        </Tag>
        <Tag tone={extension.operator_enabled ? "positive" : "neutral"}>
          Operator: {extension.operator_enabled ? "enabled" : "disabled"}
        </Tag>
      </div>
      {consentRequired ? (
        <Callout
          tone="warning"
          title="Renewed consent required · actions suspended"
        >
          <p>
            A material change occurred in version {extension.current_version}{" "}
            (operator transfer or newly declared third-party data recipients).
            Consequential actions are suspended until you review and grant
            consent.
          </p>
          <p>
            Ask the app operator for the version change details. Consent renewal
            is unavailable here until Vox can show exactly what changed.
          </p>
        </Callout>
      ) : null}
      {unverifiedOperator ? (
        <Callout tone="warning" title="Server details not verified">
          <p>
            Vox has saved this MCP URL, but has not verified the server
            operator, discovered its tools, or connected an account. No agent
            can use it yet.
          </p>
        </Callout>
      ) : null}
      <MetaList
        items={[
          {
            label: unverifiedOperator
              ? "Saved endpoint"
              : "Operator legal entity",
            value: unverifiedOperator
              ? extension.endpoint_url
              : `${extension.operator.operator_name} (${extension.operator.operator_id})`,
          },
          {
            label: "Support contact",
            value: extension.operator.support_email ? (
              <a
                className="underline underline-offset-2"
                href={`mailto:${extension.operator.support_email}`}
              >
                {extension.operator.support_email}
              </a>
            ) : (
              "None declared"
            ),
          },
          extension.operator.terms_url
            ? {
                label: "Terms of service",
                wide: true,
                value: (
                  <a
                    className="break-all underline underline-offset-2"
                    href={extension.operator.terms_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {extension.operator.terms_url}
                  </a>
                ),
              }
            : null,
        ]}
      />
      <div className="space-y-2">
        <p className="text-xs font-medium text-mist">
          Declared capabilities &amp; consequential gates
        </p>
        {!extension.capabilities?.length ? (
          <p className="text-xs text-smoke">No capabilities declared.</p>
        ) : (
          <ul className="space-y-2">
            {extension.capabilities.map((capability) => {
              const consequential =
                capability.consequential || capability.effect !== "read";
              return (
                <li
                  key={capability.external_key}
                  className="space-y-1.5 rounded-md border border-border-edge bg-ink p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-mist">
                      {capability.display_name}{" "}
                      <code className="text-smoke">
                        ({capability.external_key})
                      </code>
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      <Tag
                        tone={
                          capability.effect === "read" ? "neutral" : "warning"
                        }
                      >
                        Effect: {capability.effect}
                      </Tag>
                      {consequential ? (
                        <Tag
                          tone={readyForConsequential ? "positive" : "warning"}
                        >
                          {readyForConsequential
                            ? "Operator gate passed"
                            : "Operator gate pending"}
                        </Tag>
                      ) : null}
                    </span>
                  </div>
                  <p className="text-smoke">
                    <strong className="font-medium text-ash">
                      Data recipients:
                    </strong>{" "}
                    {capability.data_recipients?.length
                      ? capability.data_recipients.join(", ")
                      : "None (local processing)"}
                    {capability.access_needs?.length ? (
                      <>
                        {" · "}
                        <strong className="font-medium text-ash">
                          Access needs:
                        </strong>{" "}
                        {capability.access_needs.join(", ")}
                      </>
                    ) : null}
                  </p>
                  {consequential && !readyForConsequential ? (
                    <p className="text-amber-200">
                      Consequential execution blocked: requires passed
                      conformance (current: {extension.conformance_status}) and
                      operator enablement (current:{" "}
                      {extension.operator_enabled ? "enabled" : "disabled"}).
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {remove.isError ? (
        <Callout tone="danger" live="assertive">
          <p>{errorMessage(remove.error, "Failed to remove extension")}</p>
        </Callout>
      ) : null}
      {removed ? (
        <p className="text-xs text-smoke italic">
          This extension was removed and preserved for historical audit
          evidence.
        </p>
      ) : null}
    </ItemCard>
  );
}

export function ExtensionsPanel({ id }: { id?: string }) {
  const extensions = useExtensions();
  const [showForm, setShowForm] = useState(false);
  const [advancedForm, setAdvancedForm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <section id={id} aria-label="Plugin library" className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-smoke"
          />
          <input
            type="search"
            aria-label="Search saved extensions"
            placeholder="Search saved extensions"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-full border border-border-edge bg-obsidian pl-10 pr-4 text-sm text-pure-white outline-none placeholder:text-smoke focus-visible:border-mist"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            aria-label="Refresh plugins"
            disabled={extensions.isRefetching}
            onClick={() => void extensions.refetch()}
          >
            <RefreshCw
              aria-hidden="true"
              className={extensions.isRefetching ? "animate-spin" : ""}
            />
          </Button>
          <Button
            size="sm"
            variant={showForm ? "secondary" : "primary"}
            aria-expanded={showForm}
            onClick={() => {
              setNotice(null);
              setShowForm((open) => !open);
            }}
          >
            {showForm ? (
              "Close"
            ) : (
              <>
                <Plus aria-hidden="true" /> Add server
              </>
            )}
          </Button>
        </div>
      </div>
      {notice ? (
        <Callout title="Extension update" live="polite">
          <p>{notice}</p>
        </Callout>
      ) : null}
      {showForm ? (
        <div className="space-y-3">
          {advancedForm ? (
            <InstallExtensionForm
              onCancel={() => setShowForm(false)}
              onInstalled={(name) => {
                setShowForm(false);
                setNotice(
                  `Extension "${name}" registered (no authority granted).`,
                );
              }}
            />
          ) : (
            <QuickAddMcpForm
              onCancel={() => setShowForm(false)}
              onAdded={(name) => {
                setShowForm(false);
                setNotice(
                  `"${name}" saved. Vox still needs to verify and connect this server before an agent can use it.`,
                );
              }}
            />
          )}
          <button
            type="button"
            onClick={() => setAdvancedForm((value) => !value)}
            className="text-sm text-ash underline underline-offset-4 hover:text-mist focus-visible:outline-2 focus-visible:outline-mist"
          >
            {advancedForm
              ? "Use simple MCP setup"
              : "Advanced developer registration"}
          </button>
        </div>
      ) : null}
      <QueryContent
        query={extensions}
        loadingLabel="Loading extension registry"
        errorTitle="Extensions could not be loaded"
        isEmpty={() => false}
        empty={null}
      >
        {(data) => {
          const installed = data.filter(
            (extension) => extension.lifecycle_state !== "removed",
          );
          const matches = installed.filter((extension) =>
            [
              extension.display_name,
              extension.external_key,
              extension.operator.operator_name,
            ].some((value) =>
              value.toLowerCase().includes(search.trim().toLowerCase()),
            ),
          );
          const selected = matches.find(
            (extension) => extension.id === selectedId,
          );
          return (
            <div className="space-y-8">
              {installed.length ? (
                <section aria-label="Saved extensions" className="space-y-4">
                  <h2 className="text-base font-medium text-mist">Saved</h2>
                  <div className="border-t border-border-edge pt-4">
                    <div className="flex flex-wrap gap-3">
                      {installed.map((extension) => (
                        <button
                          key={extension.id}
                          type="button"
                          title={extension.display_name}
                          aria-label={`Show ${extension.display_name}`}
                          onClick={() => setSelectedId(extension.id)}
                          className="flex size-12 items-center justify-center rounded-xl border border-border-edge bg-obsidian text-lg font-semibold text-mist transition-colors hover:border-ash hover:bg-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist"
                        >
                          {extension.display_name.slice(0, 1).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}

              <section aria-label="Personal plugins" className="space-y-4">
                <h2 className="text-base font-medium text-mist">
                  Your saved extensions
                </h2>
                {matches.length ? (
                  <div className="grid gap-x-10 lg:grid-cols-2">
                    {matches.map((extension) => (
                      <button
                        key={extension.id}
                        type="button"
                        onClick={() =>
                          setSelectedId(
                            extension.id === selectedId ? null : extension.id,
                          )
                        }
                        aria-expanded={extension.id === selectedId}
                        className="group flex w-full items-center gap-4 border-b border-border-edge/60 px-2 py-4 text-left transition-colors hover:bg-ink focus-visible:outline-2 focus-visible:outline-mist"
                      >
                        <span
                          aria-hidden="true"
                          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border-edge bg-obsidian text-lg font-semibold text-mist"
                        >
                          {extension.display_name.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-mist">
                            {extension.display_name}
                          </span>
                          <span className="block truncate text-xs text-smoke">
                            {extension.protocol.toUpperCase()} ·{" "}
                            {extension.operator.operator_name}
                          </span>
                        </span>
                        <span className="text-sm text-smoke group-hover:text-mist">
                          {extension.id === selectedId ? "−" : "+"}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-smoke">
                    {search
                      ? "No plugins match your search."
                      : "No extensions saved yet. Add a server to start."}
                  </p>
                )}
                {selected ? (
                  <ExtensionCard
                    extension={selected}
                    onRemoved={() => {
                      setSelectedId(null);
                      setNotice("Extension removed from active state.");
                    }}
                  />
                ) : null}
              </section>
            </div>
          );
        }}
      </QueryContent>
    </section>
  );
}
