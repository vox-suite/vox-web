import { apiRequest } from "@/lib/api/http";
import type {
  InstallExtensionRequest,
  RemoteExtension,
} from "@/lib/consumer-auth/core-host-client";

export async function listExtensions(signal?: AbortSignal) {
  const { extensions } = await apiRequest<{ extensions: RemoteExtension[] }>(
    "/api/account/extensions",
    { signal, fallbackError: "Failed to load extensions" },
  );
  return extensions;
}

export async function installExtension(input: InstallExtensionRequest) {
  const { extension } = await apiRequest<{ extension: RemoteExtension }>(
    "/api/account/extensions",
    {
      method: "POST",
      body: input,
      fallbackError: "Extension installation failed",
    },
  );
  return extension;
}

export async function removeExtension(extensionId: string) {
  const { extension } = await apiRequest<{ extension: RemoteExtension }>(
    `/api/account/extensions/${encodeURIComponent(extensionId)}`,
    { method: "DELETE", fallbackError: "Failed to remove extension" },
  );
  return extension;
}
