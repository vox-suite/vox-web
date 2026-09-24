import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

export async function GET(request: NextRequest) {
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
    const extensions = await core.listExtensions(account.accountId);
    return NextResponse.json({ extensions });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list extensions",
      },
      { status: 400 },
    );
  }
}

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
    if (
      !body.external_key ||
      !body.display_name ||
      !body.endpoint_url ||
      !body.operator
    ) {
      return NextResponse.json(
        { error: "Missing required fields for extension installation" },
        { status: 400 },
      );
    }

    const extension = await core.installExtension(account.accountId, {
      external_key: body.external_key,
      display_name: body.display_name,
      protocol: body.protocol || "mcp",
      endpoint_url: body.endpoint_url,
      operator: body.operator,
      capabilities: body.capabilities || [],
    });
    return NextResponse.json({ extension }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to install extension",
      },
      { status: 400 },
    );
  }
}
