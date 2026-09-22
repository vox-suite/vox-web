import "server-only";
import { getConsumerAuthRuntime } from "./runtime";

export type ConsumerSession = {
  accountId: string;
  coreUserContextId: string;
  name: string;
  email: string;
  image: string | null;
  authenticationMethod: "google" | "email-otp" | "unknown";
  expiresAt: Date;
  recoveryEnabled: boolean;
};

export async function currentConsumer(
  requestHeaders: Headers | globalThis.Headers,
): Promise<ConsumerSession | null> {
  const runtime = getConsumerAuthRuntime();
  if (!runtime) return null;
  const session = await runtime.auth.api.getSession({
    headers: requestHeaders,
  });
  if (!session) return null;

  const result = await runtime.pool.query<{
    id: string;
    name: string;
    email: string;
    image: string | null;
    account_state: string;
    core_user_context_id: string | null;
    recovery_enabled_at: Date | null;
    authentication_method: "google" | "email-otp" | "unknown";
  }>(
    `SELECT u.id, u.name, u.email, u.image,
            u."accountState" AS account_state,
            u."coreUserContextId" AS core_user_context_id,
            u."recoveryEnabledAt" AS recovery_enabled_at,
            s."authenticationMethod" AS authentication_method
       FROM vox_web_auth."user" u
       JOIN vox_web_auth.session s ON s."userId" = u.id
      WHERE u.id = $1 AND s.id = $2`,
    [session.user.id, session.session.id],
  );
  const account = result.rows[0];
  if (
    !account ||
    account.account_state !== "active" ||
    !account.core_user_context_id
  ) {
    return null;
  }
  return {
    accountId: account.id,
    coreUserContextId: account.core_user_context_id,
    name: account.name,
    email: account.email,
    image: account.image,
    authenticationMethod: account.authentication_method,
    expiresAt: new Date(session.session.expiresAt),
    recoveryEnabled: account.recovery_enabled_at !== null,
  };
}
