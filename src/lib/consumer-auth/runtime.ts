import "server-only";
import { readCoreHostConfig } from "./config";
import { VoxCoreHostClient } from "./core-host-client";

let coreHostClient: VoxCoreHostClient | null | undefined;

/** The signed host client used by every authenticated `/api/account` feature. */
export function getCoreHostClient(): VoxCoreHostClient | null {
  if (coreHostClient !== undefined) return coreHostClient;
  const config = readCoreHostConfig();
  coreHostClient = config ? new VoxCoreHostClient(config) : null;
  return coreHostClient;
}

export function setCoreHostClientForTests(
  client: VoxCoreHostClient | null | undefined,
) {
  coreHostClient = client;
}

export function resetConsumerAuthRuntimeForTests() {
  coreHostClient = undefined;
}
