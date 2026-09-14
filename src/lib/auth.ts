import "server-only";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { redirect } from "next/navigation";
import { isSuperuser, maySignIn, safeCallback } from "./access";

export function authConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.NEXTAUTH_SECRET &&
    process.env.SUPERUSER_EMAILS?.trim(),
  );
}
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: { scope: "openid email profile", prompt: "select_account" },
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login", error: "/admin/login" },
  callbacks: {
    async signIn({ account, profile }) {
      return (
        authConfigured() &&
        maySignIn(
          account?.provider,
          profile as { email?: string; email_verified?: boolean },
          process.env.SUPERUSER_EMAILS,
        )
      );
    },
    async jwt({ token, account, profile }) {
      if (account)
        token.googleVerified =
          account.provider === "google" &&
          (profile as { email_verified?: boolean })?.email_verified === true;
      return token;
    },
    async session({ session, token }) {
      if (
        !token.googleVerified ||
        !isSuperuser(session.user?.email, process.env.SUPERUSER_EMAILS)
      )
        session.user = undefined;
      return session;
    },
    async redirect({ url, baseUrl }) {
      return safeCallback(url, baseUrl);
    },
  },
};
export async function currentSuperuser() {
  if (!authConfigured()) return null;
  const session = await getServerSession(authOptions);
  return isSuperuser(session?.user?.email, process.env.SUPERUSER_EMAILS)
    ? session!.user!
    : null;
}
export async function requireSuperuser() {
  const user = await currentSuperuser();
  if (!user) redirect("/admin/login");
  return user;
}
