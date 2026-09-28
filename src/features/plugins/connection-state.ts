import { useMemo } from "react";
import type { RemoteExtension } from "@/lib/consumer-auth/core-host-client";
import { useExtensions } from "@/features/extensions/queries";
import type { ConnectedApp } from "./api";
import type { CatalogPlugin } from "./catalog";
import { useConnectedApps } from "./queries";

export type PluginConnectionState =
  "reviewed" | "awaiting_review" | "unavailable" | "incomplete" | "none";

export type PluginConnection = {
  state: PluginConnectionState;
  extension?: RemoteExtension;
  connection?: ConnectedApp;
};

/**
 * Provider authorization and operator enablement are distinct states.
 */
export function connectionFor(
  plugin: CatalogPlugin,
  extensions: readonly RemoteExtension[],
  connected: readonly ConnectedApp[],
): PluginConnection {
  const extension = extensions.find(
    (ext) =>
      ext.external_key === plugin.id && ext.lifecycle_state !== "removed",
  );
  if (!extension) return { state: "none" };
  const connection = connected.find((c) => c.extension_id === extension.id);
  if (["disabled", "quarantined"].includes(extension.lifecycle_state)) {
    return { state: "unavailable", extension, connection };
  }
  if (!connection) return { state: "incomplete", extension };
  if (extension.lifecycle_state === "active") {
    return { state: "reviewed", extension, connection };
  }
  if (extension.lifecycle_state === "installed") {
    return { state: "awaiting_review", extension, connection };
  }
  return { state: "unavailable", extension, connection };
}

export function usePluginConnections() {
  const { data: extensions = [] } = useExtensions();
  const { data: connected = [] } = useConnectedApps();
  return useMemo(
    () => (plugin: CatalogPlugin) =>
      connectionFor(plugin, extensions, connected),
    [extensions, connected],
  );
}
