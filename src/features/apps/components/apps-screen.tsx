"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/app";
import { Notice } from "@/components/ui";
import { connectErrorMessage } from "@/lib/consumer-auth/connected-apps-messages";
import { pluginKeys, usePluginCatalog } from "@/features/plugins/queries";
import { extensionKeys } from "@/features/extensions/queries";
import { connectionKeys } from "@/features/connections/queries";
import { ConnectionsPanel } from "@/features/connections/components/connections-panel";
import { GrantsPanel } from "@/features/grants/components/grants-panel";
import { PluginCatalogGrid } from "@/features/plugins/components";

type ConnectResult =
  { kind: "authorized"; name: string } | { kind: "error"; message: string };

/** Read and clear the result the OAuth callback left in the URL. */
function useConnectResult() {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<ConnectResult | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("authorization_complete");
    const error = params.get("connect_error");
    if (!connected && !error) return;
    // Reading the URL once on mount is the point of this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(
      connected
        ? {
            kind: "authorized",
            name: connected,
          }
        : { kind: "error", message: connectErrorMessage(error ?? undefined) },
    );
    params.delete("authorization_complete");
    params.delete("connect_error");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (query ? `?${query}` : ""),
    );
    queryClient.invalidateQueries({ queryKey: pluginKeys.connected() });
    queryClient.invalidateQueries({ queryKey: extensionKeys.all });
    queryClient.invalidateQueries({ queryKey: connectionKeys.all });
  }, [queryClient]);
  return result;
}

export function AppsScreen() {
  const connectResult = useConnectResult();
  const { data: catalog = [] } = usePluginCatalog();
  const connectedName =
    connectResult?.kind === "authorized"
      ? (catalog.find((p) => p.id === connectResult.name)?.displayName ??
        connectResult.name)
      : "";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Connectors"
        description="Connect your accounts, capture activity, and manage access."
      />
      {connectResult?.kind === "authorized" && (
        <Notice title={`${connectedName} account linked`} tone="success">
          Authorization succeeded. Select an agent and grant the reviewed
          capabilities under Agent access before using this account.
        </Notice>
      )}
      {connectResult?.kind === "error" && (
        <Notice title="The account wasn’t connected" tone="error">
          {connectResult.message}
        </Notice>
      )}
      <ConnectionsPanel id="accounts" />
      <section
        aria-labelledby="connector-catalog-heading"
        className="space-y-5"
      >
        <div>
          <h2
            id="connector-catalog-heading"
            className="text-lg font-semibold text-pure-white"
          >
            Available connectors
          </h2>
          <p className="mt-1 text-sm text-smoke">
            Choose a reviewed connector to link another account.
          </p>
        </div>
        <PluginCatalogGrid />
      </section>
      <details
        open={connectResult?.kind === "authorized" || undefined}
        className="group rounded-xl border border-border-edge bg-ink p-5"
      >
        <summary className="cursor-pointer text-sm font-medium text-mist focus-visible:outline-2 focus-visible:outline-mist">
          Agent access
        </summary>
        <div className="mt-5">
          <GrantsPanel id="access" />
        </div>
      </details>
    </div>
  );
}
