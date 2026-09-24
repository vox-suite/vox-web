import "server-only";
import { createClient } from "@/lib/supabase/server";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future host/tenant-aware lookups; Supabase reads the session from cookies today
  _requestHeaders?: Headers | globalThis.Headers,
): Promise<ConsumerSession | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const provider = user.app_metadata?.provider ?? "unknown";
    const name =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      user.email?.split("@")[0] ||
      "Vox User";
    const image = (user.user_metadata?.avatar_url as string) || null;

    return {
      accountId: user.id,
      coreUserContextId: user.id,
      name,
      email: user.email || "",
      image,
      authenticationMethod: provider === "google" ? "google" : "email-otp",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      recoveryEnabled: true,
    };
  } catch {
    return null;
  }
}
