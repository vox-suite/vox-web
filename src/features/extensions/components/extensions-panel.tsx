"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui";
import {
  Callout,
  EmptyMessage,
  ItemCard,
  MetaList,
  Panel,
  QueryContent,
  Tag,
  type TagTone,
} from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import type { RemoteExtension } from "@/lib/consumer-auth/core-host-client";
import { useExtensions, useRemoveExtension } from "../queries";
import { InstallExtensionForm } from "./install-extension-form";

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
      {extension.protocol === "mcp" ? (
        <Callout tone="warning" title="MCP server registered, not connected">
          <p>
            This server and its declared tools are saved in Vox. Account
            authorization and agent tool use are not available yet. Registering
            the server does not give any agent access to it.
          </p>
        </Callout>
      ) : null}
      <MetaList
        items={[
          {
            label: "Operator legal entity",
            value: `${extension.operator.operator_name} (${extension.operator.operator_id})`,
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
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <Panel
      id={id}
      title="MCP servers and remote apps"
      description="Add a remote server and review its operator, declared tools, and access status."
      actions={
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
            "Cancel installation"
          ) : (
            <>
              <Plus aria-hidden="true" /> Add MCP server or remote app
            </>
          )}
        </Button>
      }
    >
      <Callout title="What adding an MCP server does today">
        <ul className="list-disc space-y-1 pl-4">
          <li>
            Enter a public HTTPS endpoint, identify its operator, and declare
            the tools you expect it to expose.
          </li>
          <li>
            Vox saves that declaration for your account. It does not yet
            discover tools, authorize an external account, or let an agent call
            the server.
          </li>
          <li>
            Agent use will require a verified connection, a capability grant to
            that agent, and approval for each consequential action.
          </li>
        </ul>
      </Callout>
      {notice ? (
        <Callout tone="success" title="Status update" live="polite">
          <p>{notice}</p>
        </Callout>
      ) : null}
      {showForm ? (
        <InstallExtensionForm
          onCancel={() => setShowForm(false)}
          onInstalled={(name) => {
            setShowForm(false);
            setNotice(
              `"${name}" registered. It is not connected and no agent can use it yet.`,
            );
          }}
        />
      ) : null}
      <QueryContent
        query={extensions}
        loadingLabel="Loading extension registry"
        errorTitle="Extensions could not be loaded"
        isEmpty={(data) => data.length === 0}
        empty={
          <EmptyMessage title="No remote extensions installed yet">
            Register a remote MCP or Direct service to inspect its operator and
            declared tools.
          </EmptyMessage>
        }
      >
        {(data) => (
          <div className="space-y-3">
            {data.map((extension) => (
              <ExtensionCard
                key={extension.id}
                extension={extension}
                onRemoved={() =>
                  setNotice("Extension removed from active state.")
                }
              />
            ))}
          </div>
        )}
      </QueryContent>
    </Panel>
  );
}
