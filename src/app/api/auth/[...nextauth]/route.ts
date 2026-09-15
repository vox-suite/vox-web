import NextAuth from "next-auth";
import { authConfigured, authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const handler = NextAuth(authOptions);
async function auth(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> },
) {
  if (!authConfigured())
    return Response.json(
      { error: "Sign-in is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  return handler(request, { params: await context.params });
}
export { auth as GET, auth as POST };
