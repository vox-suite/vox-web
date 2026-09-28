import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { CoreHostRequestError } from "@/lib/consumer-auth/core-host-client";

export async function POST(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  try {
    const body = await request.json();
    const files = body?.files;
    if (
      !files ||
      typeof files !== "object" ||
      Array.isArray(files) ||
      Object.keys(files).length > 32 ||
      !Object.values(files).every((value) => typeof value === "string") ||
      JSON.stringify(files).length > 96000 ||
      typeof body.preview !== "boolean"
    )
      return NextResponse.json(
        { error: "Import a bounded declarative skill bundle" },
        { status: 400 },
      );
    return NextResponse.json(
      await core.importSkill(account.accountId, files, body.preview),
    );
  } catch (error) {
    const invalid =
      error instanceof SyntaxError ||
      (error instanceof CoreHostRequestError && error.status === 400);
    return NextResponse.json(
      {
        error: invalid
          ? "Unsupported skill. Use SKILL.md and local text references/assets; executable files and unresolved resource links are unsupported."
          : "Could not import skill",
      },
      { status: invalid ? 400 : 502 },
    );
  }
}
