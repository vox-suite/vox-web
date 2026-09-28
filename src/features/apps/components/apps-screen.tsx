"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/app";
import { Notice } from "@/components/ui";
import { connectErrorMessage } from "@/lib/consumer-auth/connected-apps-messages";
import { pluginKeys, usePluginCatalog } from "@/features/plugins/queries";
import { extensionKeys } from "@/features/extensions/queries";
import { ConnectionsPanel } from "@/features/connections/components/connections-panel";
import { ExtensionsPanel } from "@/features/extensions/components/extensions-panel";
import { GrantsPanel } from "@/features/grants/components/grants-panel";
import { SkillsPanel } from "@/features/skills/components/skills-panel";
import {
  InstalledPluginsDock,
  PluginCatalogGrid,
} from "@/features/plugins/components";

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
  }, [queryClient]);
  return result;
}

export function AppsScreen() {
  const [view, setView] = useState<"plugins" | "skills">("plugins");
  const [source, setSource] = useState<"public" | "personal">("public");
  const connectResult = useConnectResult();
  const { data: catalog = [] } = usePluginCatalog();
  const connectedName =
    connectResult?.kind === "authorized"
      ? (catalog.find((p) => p.id === connectResult.name)?.displayName ??
        connectResult.name)
      : "";

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div
          role="group"
          aria-label="Apps and skills"
          className="inline-flex rounded-full border border-border-edge bg-ink p-1"
        >
          <button
            type="button"
            aria-pressed={view === "plugins"}
            onClick={() => setView("plugins")}
            className={`rounded-full px-8 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist ${view === "plugins" ? "bg-graphite text-pure-white" : "text-smoke hover:text-mist"}`}
          >
            Plugins
          </button>
          <button
            type="button"
            aria-pressed={view === "skills"}
            onClick={() => setView("skills")}
            className={`rounded-full px-8 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist ${view === "skills" ? "bg-graphite text-pure-white" : "text-smoke hover:text-mist"}`}
          >
            Skills
          </button>
        </div>
      </div>
      <PageHeader
        title={view === "plugins" ? "Plugins" : "Skills"}
        description={
          view === "plugins"
            ? "Link an account through its provider. Operator review and an agent access grant are separate steps."
            : "Install reusable guidance and choose which agent can load it."
        }
      />
      {connectResult?.kind === "authorized" && (
        <Notice title={`${connectedName} account linked`} tone="success">
          Authorization succeeded. Select an agent and grant the reviewed
          capabilities under Agent access before using this account.
        </Notice>
      )}
      {connectResult?.kind === "error" && (
        <Notice title="The app wasn’t connected" tone="error">
          {connectResult.message}
        </Notice>
      )}
      {view === "plugins" ? (
        <div className="space-y-8">
          <InstalledPluginsDock />

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border-edge pb-4">
              <div
                role="group"
                aria-label="Plugin source"
                className="inline-flex rounded-lg border border-border-edge bg-ink/60 p-1"
              >
                <button
                  type="button"
                  aria-pressed={source === "public"}
                  onClick={() => setSource("public")}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-mist ${
                    source === "public"
                      ? "bg-graphite text-pure-white shadow-xs"
                      : "text-smoke hover:text-mist"
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  aria-pressed={source === "personal"}
                  onClick={() => setSource("personal")}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-mist ${
                    source === "personal"
                      ? "bg-graphite text-pure-white shadow-xs"
                      : "text-smoke hover:text-mist"
                  }`}
                >
                  Personal
                </button>
              </div>
              <p className="text-xs text-smoke hidden sm:block">
                {source === "public"
                  ? "Reviewed connectors you sign in to with your own account"
                  : "Register custom or internal Model Context Protocol servers"}
              </p>
            </div>

            {source === "public" ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-pure-white">
                    Apps
                  </h2>
                  <p className="text-xs text-smoke">
                    Connector versions reviewed by your platform operator
                  </p>
                </div>
                <PluginCatalogGrid />
              </div>
            ) : (
              <ExtensionsPanel id="apps" />
            )}
          </div>

          <details className="group border-t border-border-edge pt-5">
            <summary className="cursor-pointer list-none text-sm font-medium text-mist hover:text-pure-white focus-visible:outline-2 focus-visible:outline-mist">
              Connected accounts and agent access
              <span
                aria-hidden="true"
                className="ml-2 text-smoke group-open:hidden"
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="ml-2 hidden text-smoke group-open:inline"
              >
                −
              </span>
            </summary>
            <div className="mt-5 grid gap-6 xl:grid-cols-2">
              <ConnectionsPanel id="accounts" />
              <GrantsPanel id="access" />
            </div>
          </details>
        </div>
      ) : (
        <div>
          <SkillsPanel id="skills" />
        </div>
      )}
    </div>
  );
}
