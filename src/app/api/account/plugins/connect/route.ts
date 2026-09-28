import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { CoreHostRequestError } from "@/lib/consumer-auth/core-host-client";
import {
  connectErrorMessage,
  connectedAppsRedirectUri,
} from "@/lib/consumer-auth/connected-apps";

/** Core serializes package installation across hosts; this route holds no process-local lock. */
export async function POST(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  try {
    const extension = await core.installConnectorPackage(
      account.accountId,
      body.pluginId,
      body.version as number,
      body.digest,
    );
    const status = await core.connectedAppsStatus(account.accountId);
    if (status.connected.some((c) => c.extension_id === extension.id)) {
      return NextResponse.json({ status: "authorized", extension });
    }
    const packages = await core.listConnectorPackages(account.accountId);
    const reviewed = packages.find((candidate) => candidate.manifest.external_key === body.pluginId && candidate.version === body.version && candidate.digest === body.digest);
    if (!reviewed) return NextResponse.json({error: "Package changed; review it again"}, {status: 409});
    if (reviewed.metadata.auth_mode === "none") {
      await core.connectPublicExtension(account.accountId, extension.id);
      return NextResponse.json({status: "authorized", extension});
    }
    const start = await core.authorizeExtension(
      account.accountId,
      extension.id,
      connectedAppsRedirectUri(request),
    );
    return NextResponse.json({
      status: "authorize",
      extension,
      authorizationUrl: start.authorization_url,
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
