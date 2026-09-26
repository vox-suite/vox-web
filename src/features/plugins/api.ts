import { apiRequest } from "@/lib/api/http";
import type {
  CapabilityGrant,
  RemoteExtension,
} from "@/lib/consumer-auth/core-host-client";
import type { CatalogPlugin } from "./catalog";

export type InstallPluginResponse = {
  success: boolean;
  extension: RemoteExtension;
  grants: CapabilityGrant[];
};

export type UninstallPluginResponse = {
  success: boolean;
  extension?: RemoteExtension;
};

export async function getPluginCatalog(
  signal?: AbortSignal,
): Promise<CatalogPlugin[]> {
  const data = await apiRequest<CatalogPlugin[] | { plugins: CatalogPlugin[] }>(
    "/api/account/plugins/catalog",
    { signal, fallbackError: "Failed to load plugin catalog" },
  );
  return Array.isArray(data) ? data : (data.plugins ?? []);
}

export async function installPlugin(
  input: string | { pluginId: string },
): Promise<InstallPluginResponse> {
  const pluginId = typeof input === "string" ? input : input.pluginId;
  return apiRequest<InstallPluginResponse>("/api/account/plugins/install", {
    method: "POST",
    body: { pluginId },
    fallbackError: "Failed to install plugin",
  });
}

export async function uninstallPlugin(
  id: string,
): Promise<UninstallPluginResponse> {
  return apiRequest<UninstallPluginResponse>(
    `/api/account/plugins/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      fallbackError: "Failed to uninstall plugin",
    },
  );
}
