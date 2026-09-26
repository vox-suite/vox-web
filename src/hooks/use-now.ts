import { useSyncExternalStore } from "react";

const TICK_MS = 30_000;

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, TICK_MS);
  return () => window.clearInterval(id);
}

/** Snapshots are bucketed so React sees a stable value between ticks. */
function snapshot() {
  return Math.floor(Date.now() / TICK_MS) * TICK_MS;
}

/** Current time, refreshed every 30 s, for time-relative states such as expiry. */
export function useNow() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
