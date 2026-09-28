import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { CoreHostRequestError } from "@/lib/consumer-auth/core-host-client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!id)
    return NextResponse.json(
      { error: "Extension ID is required" },
      { status: 400 },
    );
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  let body: { version?: unknown; confirmed?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!Number.isSafeInteger(body.version) || body.confirmed !== true) {
    return NextResponse.json(
      { error: "Review and confirm the displayed version" },
      { status: 400 },
    );
  }
  try {
    const extension = await core.renewExtensionConsent(
      account.accountId,
      id,
      body.version as number,
    );
    return NextResponse.json({ extension });
  } catch (error) {
    const status = error instanceof CoreHostRequestError ? error.status : 502;
    return NextResponse.json(
      { error: "Consent could not be renewed" },
      { status },
    );
  }
}
