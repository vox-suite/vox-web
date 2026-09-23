import { currentConsumer } from "@/lib/consumer-auth/session";
import { getConsumerAuthRuntime } from "@/lib/consumer-auth/runtime";
import { isSameOriginRequest, privateJson } from "@/lib/consumer-auth/request";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request))
    return privateJson({ error: "Forbidden" }, 403);
  const runtime = getConsumerAuthRuntime();
  if (!runtime) return privateJson({ error: "Unavailable" }, 503);
  const account = await currentConsumer(request.headers);
  if (!account) return privateJson({ error: "Authentication required" }, 401);
  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
  } | null;
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!/^\d{8}$/.test(code)) return privateJson({ error: "Invalid code" }, 400);
  try {
    const api = runtime.auth.api as unknown as {
      verifyEmailOTP(input: {
        body: { email: string; otp: string };
        headers: Headers;
      }): Promise<unknown>;
    };
    await api.verifyEmailOTP({
      body: { email: account.email, otp: code },
      headers: request.headers,
    });
    await runtime.accounts.enableRecovery(account.accountId, account.email);
    return privateJson({ success: true });
  } catch {
    return privateJson({ error: "The code could not be verified" }, 400);
  }
}
