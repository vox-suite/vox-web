export type RedisEntry = { key: string; type: string; ttl: number };
export type RedisPage = {
  cursor: string;
  entries: RedisEntry[];
  match: string;
};
export type RedisDetail = RedisEntry & {
  size: number;
  truncated: boolean;
  value: unknown;
};
export function expiry(ttl: number) {
  if (ttl === -1) return "No expiry";
  if (ttl === -2) return "Expired or removed";
  if (ttl < 60) return `${ttl}s remaining`;
  if (ttl < 3600) return `${Math.floor(ttl / 60)}m ${ttl % 60}s remaining`;
  if (ttl < 86400)
    return `${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m remaining`;
  return `${Math.floor(ttl / 86400)}d remaining`;
}
export function formatValue(value: unknown) {
  if (typeof value === "string") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2) ?? "";
}
