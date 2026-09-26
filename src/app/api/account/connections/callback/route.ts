import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";

// A browser callback cannot assert provider account identity or credential custody.
// Core must exchange the provider code and verify those facts server-side.
export async function POST(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(
    { error: "Provider-verified connection setup is not available yet" },
    { status: 503 },
  );
}
