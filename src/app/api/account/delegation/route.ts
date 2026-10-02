import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { isSameOriginRequest } from "@/lib/consumer-auth/request";
import { validPermission } from "@/features/delegation/validation";
export async function GET() {
  const account = await currentConsumer();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  try {
    return NextResponse.json(
      await core.listDelegationPermissions(account.accountId),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Specialist permissions could not be loaded" },
      { status: 502 },
    );
  }
}
export async function POST(request: NextRequest) {
  const account = await currentConsumer();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json({ error: "Core unavailable" }, { status: 503 });
  if (!isSameOriginRequest(request))
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid permission" }, { status: 400 });
  }
  if (!validPermission(body))
    return NextResponse.json(
      { error: "Choose named assistants, accounts and tools" },
      { status: 400 },
    );
  try {
    return NextResponse.json(
      await core.createDelegationPermission(account.accountId, body),
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Specialist permission changed or is unavailable. Review your selection and try again.",
      },
      { status: 409 },
    );
  }
}
