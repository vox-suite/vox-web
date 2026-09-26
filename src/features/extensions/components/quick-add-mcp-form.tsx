"use client";

import { useState, type FormEvent } from "react";
import { Button, Field } from "@/components/ui";
import { Callout } from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import type { InstallExtensionRequest } from "@/lib/consumer-auth/core-host-client";
import { useInstallExtension } from "../queries";

/** A URL is enough to save a pending server. Its identity and tools remain unverified. */
export function pendingMcpRequest(
  name: string,
  endpoint: string,
): InstallExtensionRequest {
  const url = new URL(endpoint.trim());
  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    throw new Error(
      "Enter a public HTTPS MCP URL without credentials or a fragment.",
    );
  }
  const host = url.hostname.toLowerCase();
  const displayName = name.trim() || host;
  return {
    external_key: `mcp-${crypto.randomUUID()}`,
    display_name: displayName,
    protocol: "mcp",
    endpoint_url: url.toString(),
    operator: {
      operator_id: `unverified:${host}`,
      operator_name: `Unverified server at ${host}`,
    },
    capabilities: [],
  };
}

export function QuickAddMcpForm({
  onAdded,
  onCancel,
}: {
  onAdded: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const install = useInstallExtension();

  function submit(event: FormEvent) {
    event.preventDefault();
    setValidationError(null);
    try {
      const request = pendingMcpRequest(name, endpoint);
      install.mutate(request, {
        onSuccess: () => onAdded(request.display_name),
      });
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : "Invalid MCP URL",
      );
    }
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Add MCP server"
      className="space-y-5 rounded-xl border border-border-edge bg-ink p-5"
    >
      <div>
        <h2 className="text-lg font-medium text-mist">Add an MCP server</h2>
        <p className="mt-1 max-w-2xl text-sm text-smoke">
          Enter the remote server URL. Vox will save it for your account; tool
          discovery and account authorization are still being built.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id="mcp-name"
          name="name"
          label="Name (optional)"
          placeholder="My workspace"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Field
          id="mcp-url"
          name="endpoint"
          label="MCP server URL"
          type="url"
          placeholder="https://example.com/mcp"
          value={endpoint}
          onChange={(event) => setEndpoint(event.target.value)}
          required
        />
      </div>
      <Callout tone="warning">
        <p>
          Saving a server does not connect an account or give an agent access.
          Never include a token or password in the URL.
        </p>
      </Callout>
      {validationError || install.isError ? (
        <Callout tone="danger" live="assertive">
          <p>
            {validationError ||
              errorMessage(install.error, "Could not save MCP server")}
          </p>
        </Callout>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={install.isPending}>
          {install.isPending ? "Saving…" : "Save server"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
