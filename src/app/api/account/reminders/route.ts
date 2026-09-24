import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import type { ReminderScheduleKind } from "@/lib/consumer-auth/core-host-client";

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
    const reminders = await core.listReminders(account.accountId);
    return NextResponse.json({ reminders });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list reminders",
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

    // Invariant check: reminders and notifications must never embed action authority
    const metadata = body.metadata || {};
    if (
      metadata.action_id ||
      metadata.proposal_id ||
      metadata.execution_id ||
      metadata.execute_consequential ||
      body.action_id ||
      body.proposal_id ||
      body.execute_consequential
    ) {
      return NextResponse.json(
        {
          error:
            "Action authority injection prohibited: reminders and notifications cannot authorize actions or execute consequential writes",
        },
        { status: 403 },
      );
    }

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    if (
      !body.message ||
      typeof body.message !== "string" ||
      !body.message.trim()
    ) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 },
      );
    }

    if (
      !body.channel ||
      typeof body.channel !== "string" ||
      !body.channel.trim()
    ) {
      return NextResponse.json(
        { error: "channel is required" },
        { status: 400 },
      );
    }

    if (
      !body.destination ||
      typeof body.destination !== "string" ||
      !body.destination.trim()
    ) {
      return NextResponse.json(
        { error: "destination is required" },
        { status: 400 },
      );
    }

    if (
      !body.timezone ||
      typeof body.timezone !== "string" ||
      !body.timezone.trim()
    ) {
      return NextResponse.json(
        { error: "timezone is required" },
        { status: 400 },
      );
    }

    const validKinds: ReminderScheduleKind[] = [
      "one_time",
      "interval",
      "recurring",
    ];
    if (!body.schedule_kind || !validKinds.includes(body.schedule_kind)) {
      return NextResponse.json(
        { error: "schedule_kind must be one_time, interval, or recurring" },
        { status: 400 },
      );
    }

    const reminder = await core.createReminder(account.accountId, {
      title: body.title.trim(),
      message: body.message.trim(),
      channel: body.channel.trim(),
      destination: body.destination.trim(),
      timezone: body.timezone.trim(),
      schedule_kind: body.schedule_kind,
      run_at: body.run_at || null,
      interval_seconds: body.interval_seconds
        ? Number(body.interval_seconds)
        : null,
      recurrence_expression: body.recurrence_expression || null,
      max_retries: body.max_retries ? Number(body.max_retries) : 3,
      metadata: body.metadata || null,
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create reminder",
      },
      { status: 400 },
    );
  }
}
