import { apiRequest } from "@/lib/api/http";
import type {
  ConnectedAppsStatus,
  RemoteExtension,
} from "@/lib/consumer-auth/core-host-client";
import type { CatalogPlugin } from "./catalog";

export type ConnectPluginResponse =
  | { status: "authorized"; extension: RemoteExtension }
  | {
      status: "authorize";
      extension: RemoteExtension;
      authorizationUrl: string;
    };

export type UninstallPluginResponse = {
  success: boolean;
  extension?: RemoteExtension;
};

export type ConnectedApp = ConnectedAppsStatus["connected"][number];

export async function getPluginCatalog(
  signal?: AbortSignal,
): Promise<CatalogPlugin[]> {
  const data = await apiRequest<CatalogPlugin[] | { plugins: CatalogPlugin[] }>(
    "/api/account/plugins/catalog",
    { signal, fallbackError: "Failed to load plugin catalog" },
  );
  return Array.isArray(data) ? data : (data.plugins ?? []);
}

export async function getConnectedApps(
  signal?: AbortSignal,
): Promise<ConnectedApp[]> {
  const data = await apiRequest<{ connected: ConnectedApp[] }>(
    "/api/account/plugins/status",
    { signal, fallbackError: "Failed to load connected apps" },
  );
  return data.connected ?? [];
}

/** Installs the app if needed and returns where to sign in, if anywhere. */
export async function connectPlugin(
  pluginId: string,
): Promise<ConnectPluginResponse> {
  return apiRequest<ConnectPluginResponse>("/api/account/plugins/connect", {
    method: "POST",
    body: { pluginId },
    fallbackError: "Failed to connect app",
  });
}

export async function uninstallPlugin(
  id: string,
): Promise<UninstallPluginResponse> {
  return apiRequest<UninstallPluginResponse>(
    `/api/account/plugins/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      fallbackError: "Failed to disconnect app",
    },
  );
}
