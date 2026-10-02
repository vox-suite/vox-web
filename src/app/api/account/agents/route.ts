import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import type { AgentMutation } from "@/lib/consumer-auth/core-host-client";

export async function GET(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Supabase reads the request cookie store.
  request: NextRequest,
) {
  const account = await currentConsumer();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  try {
    const agents = await core.selectedAgents(account.accountId);
    return NextResponse.json({ agents });
  } catch {
    return NextResponse.json(
      { error: "Unable to load agents" },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  const account = await currentConsumer();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let sameOrigin = false;
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    sameOrigin =
      ["http:", "https:"].includes(origin.protocol) &&
      origin.host === request.headers.get("host");
  } catch {
    /* Missing or malformed origins cannot mutate agents. */
  }
  if (!sameOrigin)
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  let mutation: AgentMutation;
  try {
    const body = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      !["create", "update", "archive"].includes(body.operation)
    )
      return NextResponse.json(
        { error: "Invalid agent operation" },
        { status: 400 },
      );
    mutation = body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  try {
    await core.manageAgent(account.accountId, mutation);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Could not save agent. Reload if its configuration changed." },
      { status: 400 },
    );
  }
}
