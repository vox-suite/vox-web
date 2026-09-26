import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

type RouteContext = { params: Promise<{ agentKey: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const account = await currentConsumer(request.headers);
  if (!account) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core) return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  try {
    const { agentKey } = await context.params;
    const skills = await core.effectiveSkills(account.accountId, agentKey);
    return NextResponse.json({ skills });
  } catch {
    return NextResponse.json({ error: "Unable to load agent skills" }, { status: 502 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const account = await currentConsumer(request.headers);
  if (!account) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core) return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  try {
    const { agentKey } = await context.params;
    const body = (await request.json()) as { skill_id?: string; enabled?: boolean };
    if (!body.skill_id || typeof body.enabled !== "boolean") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    await core.setSkillAgentEnabled(account.accountId, agentKey, body.skill_id, body.enabled);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Unable to update agent skill" }, { status: 502 });
  }
}
