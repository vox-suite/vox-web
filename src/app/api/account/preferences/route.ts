import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { SENSITIVE_PREFERENCE_KEYS } from "@/lib/consumer-auth/constants";

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
    const preferences = await core.listPreferences(account.accountId);
    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to list preferences",
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

    if (!body.category || typeof body.category !== "string" || !body.category.trim()) {
      return NextResponse.json(
        { error: "category is required" },
        { status: 400 },
      );
    }

    if (!body.preference_key || typeof body.preference_key !== "string" || !body.preference_key.trim()) {
      return NextResponse.json(
        { error: "preference_key is required" },
        { status: 400 },
      );
    }

    if (body.value === undefined) {
      return NextResponse.json(
        { error: "value is required" },
        { status: 400 },
      );
    }

    // Invariant: Preferences provide advisory context only and grant NO execution authority
    if (
      body.action_id ||
      body.grant_id ||
      body.execution_id ||
      body.execute_consequential ||
      (typeof body.value === "object" &&
        body.value !== null &&
        ("action_id" in body.value || "grant_id" in body.value || "execute_consequential" in body.value))
    ) {
      return NextResponse.json(
        {
          error:
            "Authority injection prohibited: preferences cannot grant capability, payment, or action authority",
        },
        { status: 403 },
      );
    }

    const key = body.preference_key.trim();
    const isSensitive =
      body.is_sensitive === true || SENSITIVE_PREFERENCE_KEYS.includes(key);

    // FR-PRF-003: Platform shall ask before saving sensitive information or replacing an existing preference
    if (isSensitive && body.confirmed !== true) {
      return NextResponse.json(
        {
          error:
            "Sensitive preference confirmation required: explicit user consent is required before saving or replacing sensitive personal preferences.",
          requires_confirmation: true,
          preference_key: key,
        },
        { status: 428 },
      );
    }

    const preference = await core.setPreference(account.accountId, {
      category: body.category.trim(),
      preference_key: key,
      value: body.value,
      is_sensitive: isSensitive,
      confirmed: body.confirmed === true,
    });

    return NextResponse.json({ preference }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to set preference",
      },
      { status: 400 },
    );
  }
}
