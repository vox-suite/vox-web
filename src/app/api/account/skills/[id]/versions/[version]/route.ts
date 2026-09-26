import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; version: string }> },
) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  const { id, version } = await context.params;
  const versionNumber = Number(version);
  if (!Number.isSafeInteger(versionNumber) || versionNumber < 1) {
    return NextResponse.json({ error: "Invalid version" }, { status: 400 });
  }
  try {
    const skill = await core.getSkillVersion(
      account.accountId,
      id,
      versionNumber,
    );
    return NextResponse.json({ skill });
  } catch {
    return NextResponse.json(
      { error: "Skill version unavailable" },
      { status: 404 },
    );
  }
}
