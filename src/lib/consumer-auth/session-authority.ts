import type { SupabaseClient } from "@supabase/supabase-js";

export type ConsumerSession = {
  accountId: string;
  name: string;
  email: string;
  image: string | null;
};

/** Supabase verifies the token with its auth service; local cookie claims are never authority. */
export async function resolveConsumer(
  auth: Pick<SupabaseClient["auth"], "getUser">,
): Promise<ConsumerSession | null> {
  try {
    const {
      data: { user },
      error,
    } = await auth.getUser();
    if (error || !user || !user.id || user.is_anonymous) return null;
    const metadata = user.user_metadata;
    const displayName =
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : metadata.name;
    return {
      accountId: user.id,
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
