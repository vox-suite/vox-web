import type { SupabaseClient } from "@supabase/supabase-js";

export type ConsumerSession = {
  accountId: string;
  name: string;
  email: string;
  image: string | null;
};

/** Verified hook claims bind each session to an immutable identity, never a merged user UUID. */
export async function resolveConsumer(
  auth: Pick<SupabaseClient["auth"], "getUser"> & {
    getClaims(): Promise<{
      data: { claims: Record<string, unknown> } | null;
      error: unknown;
    }>;
  },
  issuer: string,
): Promise<ConsumerSession | null> {
  try {
    const {
      data: { user },
      error,
    } = await auth.getUser();
    if (error || !user || !user.id || user.is_anonymous) return null;
    const { data, error: claimsError } = await auth.getClaims();
    const claims = data?.claims;
    if (
      claimsError ||
      !claims ||
      claims.sub !== user.id ||
      claims.iss !== issuer ||
      claims.role !== "authenticated" ||
      claims.aud !== "authenticated" ||
      claims.is_anonymous !== false ||
      typeof claims.session_id !== "string" ||
      !claims.session_id
    )
      return null;
    const pin = claims.vox_identity;
    if (!pin || typeof pin !== "object" || Array.isArray(pin)) return null;
    const proof = pin as Record<string, unknown>;
    const identities = user.identities;
    if (!identities || identities.length !== 1) return null;
    const identity = identities[0];
    if (
      proof.version !== 1 ||
      proof.session_id !== claims.session_id ||
      proof.user_id !== user.id ||
      identity.user_id !== user.id ||
      proof.identity_id !== identity.identity_id ||
      proof.provider !== identity.provider ||
      !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(
        identity.identity_id,
      )
    )
      return null;
    const methods = Array.isArray(claims.amr)
      ? claims.amr.map((entry: unknown) =>
          entry && typeof entry === "object" && "method" in entry
            ? entry.method
            : undefined,
        )
      : [];
    const allowed =
      identity.provider === "google"
        ? ["oauth"]
        : identity.provider === "email"
          ? ["otp", "magiclink", "email/signup"]
          : [];
    if (
      !methods?.length ||
      !allowed.length ||
      !methods.some(
        (method) => typeof method === "string" && allowed.includes(method),
      ) ||
      methods.some(
        (method) =>
          !(typeof method === "string" && allowed.includes(method)) &&
          method !== "token_refresh" &&
          method !== "totp",
      )
    )
      return null;
    const metadata = user.user_metadata;
    const displayName =
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : metadata.name;
    return {
      accountId: `supabase:${identity.provider}:${identity.identity_id}`,
      name:
        typeof displayName === "string" && displayName.trim()
          ? displayName
          : user.email?.split("@")[0] || "Vox User",
      email: user.email || "",
      image:
        typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    };
  } catch {
    return null;
  }
}
