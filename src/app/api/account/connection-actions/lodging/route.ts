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

  const { searchParams } = new URL(request.url);
  const connectionId = searchParams.get("connectionId");
  const destination = searchParams.get("destination");
  const checkIn = searchParams.get("checkIn") || "2026-10-01";
  const checkOut = searchParams.get("checkOut") || "2026-10-05";
  const occupancy = parseInt(searchParams.get("occupancy") || "2", 10);

  if (!connectionId || !destination) {
    return NextResponse.json(
      { error: "connectionId and destination are required" },
      { status: 400 },
    );
  }

  try {
    const results = await core.searchLodging(account.accountId, {
      connection_id: connectionId,
      destination,
      check_in: checkIn,
      check_out: checkOut,
      occupancy,
    });
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to search lodging",
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
    if (!body.connection_id || !body.booking_request) {
      return NextResponse.json(
        { error: "connection_id and booking_request are required" },
        { status: 400 },
      );
    }

    const booking = await core.bookLodging(account.accountId, {
      connection_id: body.connection_id,
      agent_external_key: body.agent_external_key || "saathi",
      booking_request: body.booking_request,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to book lodging",
      },
      { status: 400 },
    );
  }
}
