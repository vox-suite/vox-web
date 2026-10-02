import { NextRequest, NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/consumer-auth/request";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
export async function POST(request: NextRequest) {
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
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (
    typeof body?.agentKey !== "string" ||
    !body.agentKey ||
    body.agentKey.length > 255 ||
    typeof body?.conversationId !== "string" ||
    !/^[a-f0-9-]{36}$/.test(body.conversationId) ||
    typeof body?.text !== "string" ||
    !body.text.trim() ||
    body.text.length > 16000
  )
    return NextResponse.json(
      { error: "Choose an agent and enter a message" },
      { status: 400 },
    );
  try {
    return NextResponse.json(
      await core.respondConversation(
        account.accountId,
        body.agentKey,
        body.conversationId,
        body.text,
      ),
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "The agent could not respond. Your message was not retried automatically.",
      },
      { status: 502 },
    );
  }
}
