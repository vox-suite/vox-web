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
  const api = runtime.auth.api as unknown as {
    createVerificationOTP(input: {
      body: { email: string; type: "email-verification" };
    }): Promise<string>;
  };
  const code = await api.createVerificationOTP({
    body: { email: account.email, type: "email-verification" },
  });
  await runtime.emailSender.sendOneTimeCode({
    email: account.email,
    code,
    expiresInMinutes: 10,
  });
  return privateJson({ success: true });
}
