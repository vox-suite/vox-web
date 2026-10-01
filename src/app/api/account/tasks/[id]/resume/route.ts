import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { isSameOriginRequest } from "@/lib/consumer-auth/request";
import { CoreHostRequestError } from "@/lib/consumer-auth/core-host-client";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const account = await currentConsumer();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  let reply: string | undefined;
  try {
    const text = await request.text();
    const body = text ? JSON.parse(text) : {};
    if (
      body.reply !== undefined &&
      (typeof body.reply !== "string" ||
        !body.reply.trim() ||
        Buffer.byteLength(body.reply, "utf8") > 8192)
    )
      return NextResponse.json(
        { error: "Enter an answer of at most 8192 bytes" },
        { status: 400 },
      );
    reply = body.reply;
  } catch {
    return NextResponse.json({ error: "Invalid task reply" }, { status: 400 });
  }
  try {
    const { id } = await params;
    const task = await core.resumeTask(account.accountId, id, reply);
    return NextResponse.json(
      { task },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const status =
      error instanceof CoreHostRequestError && error.status === 409 ? 409 : 502;
    return NextResponse.json(
      {
        error:
          "Task cannot continue yet. Resolve its current wait and refresh status.",
      },
      { status },
    );
  }
}
