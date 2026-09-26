import { apiRequest } from "@/lib/api/http";
import type {
  SetPreferenceInput,
  UserPreference,
} from "@/lib/consumer-auth/core-host-client";
import { SENSITIVE_PREFERENCE_KEYS } from "@/lib/consumer-auth/constants";

export async function listPreferences(signal?: AbortSignal) {
  const { preferences } = await apiRequest<{ preferences: UserPreference[] }>(
    "/api/account/preferences",
    { signal, fallbackError: "Failed to load preferences from Core" },
  );
  return preferences;
}

/** Rejects with an ApiError whose status is 428 when Core requires sensitive-data confirmation. */
export async function savePreference(input: SetPreferenceInput) {
  const { preference } = await apiRequest<{ preference: UserPreference }>(
    "/api/account/preferences",
    { method: "POST", body: input, fallbackError: "Failed to save preference" },
  );
  return preference;
}

export async function deletePreference(key: string) {
  await apiRequest<null>(
    `/api/account/preferences/${encodeURIComponent(key)}`,
    {
      method: "DELETE",
      fallbackError: "Failed to delete preference",
    },
  );
}

export const PREFERENCE_CATEGORIES = [
  {
    id: "locale",
    name: "Locale & Presentation",
    defaultKey: "display_currency",
  },
  { id: "dining", name: "Food & Dietary", defaultKey: null },
  { id: "travel", name: "Travel & Transit", defaultKey: null },
  { id: "notifications", name: "Notification Defaults", defaultKey: null },
  {
    id: "sensitive_personal",
    name: "Sensitive Personal Details",
    defaultKey: "home_address",
  },
] as const;

export function isSensitivePreference(category: string, key: string) {
  return (
    category === "sensitive_personal" ||
    SENSITIVE_PREFERENCE_KEYS.includes(key.trim())
  );
}

/** Values that look like JSON objects or arrays are stored structured; everything else stays a string. */
export function parsePreferenceValue(raw: string): unknown {
  if (!raw.startsWith("{") && !raw.startsWith("[")) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export function formatPreferenceValue(value: unknown) {
  return typeof value === "object" && value !== null
    ? JSON.stringify(value)
    : String(value);
}
