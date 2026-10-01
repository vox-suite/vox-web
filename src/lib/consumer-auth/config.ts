import type { VoxCoreHostClientConfig } from "./core-host-client";

type Environment = Record<string, string | undefined>;

function required(environment: Environment, name: string) {
  const value = environment[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function secureSecret(environment: Environment, name: string) {
  const value = required(environment, name);
  if (value.length < 32)
    throw new Error(`${name} must be at least 32 characters`);
  return value;
}

function origin(value: string, name: string) {
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol) || url.pathname !== "/") {
    throw new Error(`${name} must be an HTTP(S) origin`);
  }
  if (
    url.protocol !== "https:" &&
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
  ) {
    throw new Error(`${name} must use HTTPS outside loopback development`);
  }
  return url.origin;
}

/**
 * Everything the account features need to call Core: its URL and this host's
 * credential, issued by `POST /v1/host-apps`. Returns null when Core is not
 * configured, so routes answer 503 instead of failing.
 */
export function readCoreHostConfig(
  environment: Environment = process.env,
): VoxCoreHostClientConfig | null {
  if (!environment.VOX_CORE_URL?.trim()) return null;
  return {
    baseUrl: origin(required(environment, "VOX_CORE_URL"), "VOX_CORE_URL"),
    hostCredential: {
      credentialId: required(environment, "VOX_HOST_CREDENTIAL_ID"),
      audience: required(environment, "VOX_HOST_AUDIENCE"),
      secret: secureSecret(environment, "VOX_HOST_SECRET"),
    },
  };
}
