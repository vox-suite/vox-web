import { useMemo } from "react";
import type { RemoteExtension } from "@/lib/consumer-auth/core-host-client";
import { useExtensions } from "@/features/extensions/queries";
import type { ConnectedApp } from "./api";
import type { CatalogPlugin } from "./catalog";
import { useConnectedApps } from "./queries";

export type PluginConnectionState = "connected" | "incomplete" | "none";

export type PluginConnection = {
  state: PluginConnectionState;
  extension?: RemoteExtension;
  connection?: ConnectedApp;
};

/**
 * "connected": the provider accepted the user's sign-in and Vox holds a live
 * token. "incomplete": the app was added but sign-in never finished.
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
  return connection
    ? { state: "connected", extension, connection }
    : { state: "incomplete", extension };
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
