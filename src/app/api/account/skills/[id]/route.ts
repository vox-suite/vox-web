import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { CoreHostRequestError } from "@/lib/consumer-auth/core-host-client";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  const { id } = await context.params;
  let action: "install" | "disable";
  let version: number | undefined;
  try {
    const body = (await request.json()) as {
      action?: string;
      version?: number;
    };
    if (body.action !== "install" && body.action !== "disable") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    action = body.action;
    version = body.version;
    if (
      action === "install" &&
      (!Number.isInteger(version) || !version || version < 1)
    ) {
      return NextResponse.json(
        { error: "Reviewed version is required" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    await core.changeSkillInstallation(account.accountId, id, action, version);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof CoreHostRequestError && error.status === 409) {
      return NextResponse.json(
        { error: "Skill version changed; review it again" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Unable to update skill" },
      { status: 502 },
    );
  }
}
