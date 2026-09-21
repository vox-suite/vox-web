import "server-only";
export class CoreAdminError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function coreRedis(
  method: "GET" | "PUT" | "DELETE",
  params?: URLSearchParams,
  body?: unknown,
) {
  const baseUrl = process.env.VOX_CORE_ADMIN_URL;
  const token = process.env.VOX_ADMIN_TOKEN;

  if (!baseUrl || !token)
    throw new CoreAdminError(
      503,
      "The Redis connection has not been configured. Contact the workspace owner.",
    );

  const url = new URL("/v1/admin/redis", baseUrl);
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    )
  )
    throw new CoreAdminError(
      503,
      "The Redis connection requires a secure endpoint.",
    );
  if (params) url.search = params.toString();

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
      redirect: "error",
    });
  } catch {
    throw new CoreAdminError(
      503,
      "Redis could not be reached. Try again in a moment.",
    );
  }

  if (!response.ok) {
    if (response.status === 429)
      throw new CoreAdminError(
        429,
        "The explorer is busy. Wait a moment and try again.",
      );
    if (response.status === 400)
      throw new CoreAdminError(
        400,
        "This search or key is not supported. Try another search.",
      );
    if (response.status === 404)
      throw new CoreAdminError(404, "This Redis entry no longer exists.");
    if (response.status === 409)
      throw new CoreAdminError(
        409,
        "This Redis entry changed. Refresh it before trying again.",
      );
    throw new CoreAdminError(
      503,
      "Redis is unavailable. Try again, or ask the workspace owner to check the connection.",
    );
  }
  return response.json();
}

export function readCoreRedis(params: URLSearchParams) {
  return coreRedis("GET", params);
}

export function updateCoreRedis(body: unknown) {
  return coreRedis("PUT", undefined, body);
}

export function deleteCoreRedis(key: string) {
  return coreRedis("DELETE", new URLSearchParams({ key }));
}
