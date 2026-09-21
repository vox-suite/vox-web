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

const editableTypes = new Set(["string", "list", "hash", "set", "zset"]);

export function editableRedisType(type: string) {
  return editableTypes.has(type);
}

export function parseRedisEditor(type: string, input: string): unknown {
  if (type === "string") return input;
  if (!editableRedisType(type))
    throw new Error("This Redis type is read only.");
  let value: unknown;
  try {
    value = JSON.parse(input);
  } catch {
    throw new Error("Enter a valid JSON array.");
  }
  if (!Array.isArray(value) || value.length === 0)
    throw new Error("Enter a non-empty JSON array.");
  if (value.length > (type === "hash" || type === "zset" ? 2000 : 1000))
    throw new Error("This collection is too large to edit here.");
  if ((type === "hash" || type === "zset") && value.length % 2 !== 0)
    throw new Error("Pairs must contain both a name and value.");
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    const score = type === "zset" && index % 2 === 1;
    if (
      score
        ? !(
            (typeof item === "number" && Number.isFinite(item)) ||
            (typeof item === "string" &&
              item.trim() !== "" &&
              Number.isFinite(Number(item)))
          )
        : typeof item !== "string"
    )
      throw new Error(
        score
          ? "Sorted-set scores must be numbers."
          : "Collection values must be strings.",
      );
    if (
      typeof item === "string" &&
      new TextEncoder().encode(item).length > 65536
    )
      throw new Error("Collection values cannot exceed 64 KiB.");
  }
  return value;
}
