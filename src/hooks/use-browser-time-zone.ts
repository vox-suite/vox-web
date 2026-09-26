import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** The browser's IANA time zone; "UTC" during server rendering. */
export function useBrowserTimeZone() {
  return useSyncExternalStore(noopSubscribe, browserTimeZone, () => "UTC");
}
