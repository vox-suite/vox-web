import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import type { AgentMemoryChange } from "@/lib/consumer-auth/core-host-client";

type RouteContext = { params: Promise<{ agentKey: string }> };
async function handle(
  request: NextRequest,
  context: RouteContext,
  change: AgentMemoryChange,
) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  try {
    const { agentKey } = await context.params;
    const result = await core.agentMemory(account.accountId, agentKey, change);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to access assistant memory. Reload and try again." },
      { status: 502 },
    );
  }
}
export async function GET(request: NextRequest, context: RouteContext) {
  return handle(request, context, { operation: "read" });
}
export async function POST(request: NextRequest, context: RouteContext) {
  let sameOrigin = false;
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    sameOrigin =
      ["http:", "https:"].includes(origin.protocol) &&
      origin.host === request.headers.get("host");
  } catch {}
  if (!sameOrigin)
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  let change: AgentMemoryChange;
  try {
    const body = await request.json();
    if (body?.operation === "clear") change = { operation: "clear" };
    else if (
      body?.operation === "set_retention" &&
      typeof body.enabled === "boolean"
    )
      change = { operation: "set_retention", enabled: body.enabled };
    else
      return NextResponse.json(
        { error: "Invalid memory change" },
        { status: 400 },
      );
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  return handle(request, context, change);
}
