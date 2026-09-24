import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { decodeAdminE2ESession, isSuperuser } from "./access";

export type AdminUser = {
  email: string;
  name?: string | null;
  image?: string | null;
};

export function extractFirstName(name?: string | null, email?: string): string {
  if (name?.trim()) {
    const first = name.trim().split(/\s+/)[0];
    if (first) return first;
  }
  if (email?.trim()) {
    const rawUser = email.split("@")[0].split(".")[0];
    if (rawUser) {
      return rawUser.charAt(0).toUpperCase() + rawUser.slice(1);
    }
  }
  return "Administrator";
}

export function authConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() &&
    process.env.SUPERUSER_EMAILS?.trim(),
  );
}

function e2eSecret() {
  const secret = process.env.VOX_ADMIN_E2E_SECRET?.trim();
  if (!secret || process.env.NODE_ENV === "production") return null;
  return secret;
}

async function e2eSuperuser(): Promise<AdminUser | null> {
  const secret = e2eSecret();
  if (!secret) return null;
  const raw = (await cookies()).get("vox-admin-session")?.value;
  if (!raw) return null;
  const parsed = decodeAdminE2ESession(raw, secret);
  if (!parsed?.googleVerified) return null;
  if (!isSuperuser(parsed.email, process.env.SUPERUSER_EMAILS)) return null;
  return { email: parsed.email!, name: "Test administrator" };
}

export async function currentSuperuser(): Promise<AdminUser | null> {
  if (!authConfigured()) return null;
  const e2e = await e2eSuperuser();
  if (e2e) return e2e;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user?.email) return null;
    const verified =
      user.email_confirmed_at != null ||
      user.app_metadata?.provider === "google" ||
      user.identities?.some(
        (identity) =>
          identity.provider === "google" &&
          (identity.identity_data as { email_verified?: boolean } | undefined)
            ?.email_verified !== false,
      );
    if (!verified) return null;
    if (!isSuperuser(user.email, process.env.SUPERUSER_EMAILS)) return null;

    const identityData = user.identities?.[0]?.identity_data as
      | {
          avatar_url?: string;
          picture?: string;
          full_name?: string;
          name?: string;
        }
      | undefined;

    const rawName =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      identityData?.full_name ||
      identityData?.name ||
      null;

    const rawImage =
      (user.user_metadata?.avatar_url as string | undefined) ||
      (user.user_metadata?.picture as string | undefined) ||
      identityData?.avatar_url ||
      identityData?.picture ||
      null;

    return {
      email: user.email,
      name: rawName,
      image: rawImage,
    };
  } catch {
    return null;
  }
}

export async function requireSuperuser() {
  const user = await currentSuperuser();
  if (!user) {
    let target = "/admin/login";
    try {
      const headerList = await headers();
      const host = headerList.get("host")?.toLowerCase().split(":")[0];
      if (host === "admin.voxagent.in") {
        target = "/login";
      }
    } catch {}
    redirect(target);
  }
  return user;
}

export function adminHomePath(host?: string | null) {
  const hostname = host?.toLowerCase().split(":")[0];
  return hostname === "admin.voxagent.in" ? "/" : "/admin";
}

export function adminLoginPath(host?: string | null) {
  const hostname = host?.toLowerCase().split(":")[0];
  return hostname === "admin.voxagent.in" ? "/login" : "/admin/login";
}
