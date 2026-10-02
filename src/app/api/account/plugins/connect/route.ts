import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import {
  CoreHostRequestError,
  type ConnectorSetupConsent,
} from "@/lib/consumer-auth/core-host-client";
import {
  connectErrorMessage,
  connectedAppsRedirectUri,
} from "@/lib/consumer-auth/connected-apps";

/** Core serializes package installation across hosts; this route holds no process-local lock. */
export async function POST(request: NextRequest) {
  const account = await currentConsumer();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let sameOrigin = false;
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    sameOrigin =
      ["http:", "https:"].includes(origin.protocol) &&
      origin.host === request.headers.get("host");
  } catch {
    /* Missing origins cannot enable capabilities. */
  }
  if (!sameOrigin)
    return NextResponse.json(
      { error: "Invalid request origin" },
      { status: 403 },
    );
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json(
      { error: "Invalid install request" },
      { status: 400 },
    );
  }
  const body = input as {
    pluginId?: unknown;
    version?: unknown;
    digest?: unknown;
    consent?: unknown;
  };
  if (
    typeof body.pluginId !== "string" ||
    !body.pluginId ||
    body.pluginId.length > 255 ||
    !Number.isSafeInteger(body.version) ||
    (body.version as number) < 1 ||
    typeof body.digest !== "string" ||
    !/^[a-f0-9]{64}$/.test(body.digest)
  ) {
    return NextResponse.json(
      { error: "Select a reviewed connector version" },
      { status: 400 },
    );
  }
  const consent = body.consent;
  if (
    consent !== null &&
    (!consent ||
      typeof consent !== "object" ||
      Array.isArray(consent) ||
      typeof (consent as ConnectorSetupConsent).agent_external_key !==
        "string" ||
      !(consent as ConnectorSetupConsent).agent_external_key ||
      (consent as ConnectorSetupConsent).agent_external_key.length > 255 ||
      !Number.isSafeInteger(
        (consent as ConnectorSetupConsent).agent_instruction_version,
      ) ||
      (consent as ConnectorSetupConsent).agent_instruction_version < 1 ||
      !Array.isArray(
        (consent as ConnectorSetupConsent).capability_external_keys,
      ) ||
      (consent as ConnectorSetupConsent).capability_external_keys.length > 64 ||
      (consent as ConnectorSetupConsent).capability_external_keys.some(
        (key) => typeof key !== "string" || !key || key.length > 511,
      ) ||
      typeof (consent as ConnectorSetupConsent).enable_bundled_skills !==
        "boolean")
  )
    return NextResponse.json(
      { error: "Review assistant access before connecting" },
      { status: 400 },
    );
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  try {
    const setup = await core.setupConnectorPackage(account.accountId, {
      external_key: body.pluginId,
      version: body.version as number,
      digest: body.digest,
      redirect_uri: connectedAppsRedirectUri(request),
      consent: consent as ConnectorSetupConsent | null,
    });
    return NextResponse.json({
      status: setup.state === "complete" ? "authorized" : setup.state,
      setup,
      ...(setup.authorization_url
        ? { authorizationUrl: setup.authorization_url }
        : {}),
    });
  } catch (error) {
    const code = error instanceof CoreHostRequestError ? error.code : undefined;
    const status =
      error instanceof CoreHostRequestError && [404, 409].includes(error.status)
        ? error.status
        : 502;
    return NextResponse.json(
      { error: connectErrorMessage(code), code },
      { status },
    );
  }
}
