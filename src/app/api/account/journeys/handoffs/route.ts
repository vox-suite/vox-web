import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function POST(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const core = getCoreHostClient();
  if (!core) {
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { provider, connection_id, handoff, agent_external_key } = body;

    if (!provider || !connection_id || !handoff) {
      return NextResponse.json(
        { error: "provider, connection_id, and handoff payload are required" },
        { status: 400 },
      );
    }

    let result;
    switch (provider) {
      case "amazon":
        result = await core.createAmazonHandoff(
          account.accountId,
          connection_id,
          handoff,
          agent_external_key,
        );
        break;
      case "zomato":
        result = await core.createZomatoHandoff(
          account.accountId,
          connection_id,
          handoff,
          agent_external_key,
        );
        break;
      case "uber":
        result = await core.createUberRideHandoff(
          account.accountId,
          connection_id,
          handoff,
          agent_external_key,
        );
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported handoff provider: ${provider}` },
          { status: 400 },
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate handoff",
      },
      { status: 400 },
    );
  }
}
