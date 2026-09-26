import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import type { PublishSkillRequest } from "@/lib/consumer-auth/core-host-client";

export async function GET(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  try {
    const skills = await core.listSkills(account.accountId);
    return NextResponse.json({ skills });
  } catch {
    return NextResponse.json(
      { error: "Unable to load skills" },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  let skill: PublishSkillRequest;
  try {
    skill = (await request.json()) as PublishSkillRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (
    !skill.external_key ||
    !skill.title ||
    !skill.summary ||
    !skill.instructions
  ) {
    return NextResponse.json(
      { error: "Complete all required skill fields" },
      { status: 400 },
    );
  }
  try {
    const created = await core.publishPrivateSkill(account.accountId, skill);
    return NextResponse.json({ skill: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to save skill" },
      { status: 502 },
    );
  }
}
