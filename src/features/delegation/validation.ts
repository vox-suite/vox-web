import type { DelegationPermissionRequest } from "@/lib/consumer-auth/core-host-client";
const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i;
export function isAgentKey(value: unknown): value is string {
  return typeof value === "string" && !!value.trim() && value.length <= 255;
}
export function validPermission(
  value: unknown,
): value is DelegationPermissionRequest {
  if (
    !value ||
    typeof value !== "object" ||
    !("requester_agent_key" in value) ||
    !("specialist_agent_key" in value) ||
    !("scope" in value)
  )
    return false;
  if (
    !isAgentKey(value.requester_agent_key) ||
    !isAgentKey(value.specialist_agent_key) ||
    value.requester_agent_key === value.specialist_agent_key
  )
    return false;
  const scope = value.scope;
  if (
    !scope ||
    typeof scope !== "object" ||
    Object.keys(scope).length !== 1 ||
    !("capabilities" in scope) ||
    !Array.isArray(scope.capabilities) ||
    scope.capabilities.length < 1 ||
    scope.capabilities.length > 32
  )
    return false;
  if (
    !scope.capabilities.every(
      (cap) =>
        cap &&
        typeof cap === "object" &&
        Object.keys(cap).length === 2 &&
        typeof cap.connection_id === "string" &&
        uuid.test(cap.connection_id) &&
        isAgentKey(cap.capability_external_key),
    )
  )
    return false;
  if (
    new Set(
      scope.capabilities.map(
        (cap) => `${cap.connection_id}:${cap.capability_external_key}`,
      ),
    ).size !== scope.capabilities.length
  )
    return false;
  if (
    "parent_run_id" in value &&
    value.parent_run_id !== undefined &&
    value.parent_run_id !== null &&
    (typeof value.parent_run_id !== "string" || !uuid.test(value.parent_run_id))
  )
    return false;
  if (
    "preference_keys" in value &&
    value.preference_keys !== undefined &&
    (!Array.isArray(value.preference_keys) ||
      value.preference_keys.length > 8 ||
      !value.preference_keys.every(
        (key) => isAgentKey(key) && new TextEncoder().encode(key).length <= 128,
      ) ||
      new Set(value.preference_keys).size !== value.preference_keys.length)
  )
    return false;
  return Object.keys(value).every((key) =>
    [
      "requester_agent_key",
      "specialist_agent_key",
      "scope",
      "parent_run_id",
      "preference_keys",
    ].includes(key),
  );
}
