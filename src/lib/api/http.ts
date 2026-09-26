/**
 * The single HTTP boundary between browser code and the account route
 * handlers under `/api/account`. Feature `api.ts` modules call `apiRequest`;
 * components never call `fetch` directly.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  /** 4xx responses are deterministic; retrying them only repeats the failure. */
  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

type QueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
  /** Message used when the server does not provide one. */
  fallbackError?: string;
};

export function buildUrl(path: string, query?: Record<string, QueryValue>) {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

export function errorMessageFrom(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "error" in body) {
    const { error } = body as { error: unknown };
    if (typeof error === "string" && error.trim()) return error;
  }
  return fallback;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  {
    method = "GET",
    body,
    query,
    signal,
    fallbackError = "The request could not be completed.",
  }: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(buildUrl(path, query), {
    method,
    signal,
    cache: "no-store",
    credentials: "same-origin",
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await readJson(response);
  if (!response.ok) {
    throw new ApiError(
      errorMessageFrom(payload, fallbackError),
      response.status,
      payload,
    );
  }
  return payload as T;
}

export function errorMessage(
  error: unknown,
  fallback = "Something went wrong.",
) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
