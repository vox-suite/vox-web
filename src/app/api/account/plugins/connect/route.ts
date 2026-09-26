import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import {
  APPROVED_APPS,
  getCatalogPlugin,
  type CatalogPlugin,
} from "@/features/plugins/catalog";
import {
  CoreHostRequestError,
  type RemoteExtension,
  type VoxCoreHostClient,
} from "@/lib/consumer-auth/core-host-client";
import {
  connectErrorMessage,
  connectedAppsRedirectUri,
} from "@/lib/consumer-auth/connected-apps";

type ConnectResult =
  | { status: "connected"; extension: RemoteExtension }
  | {
      status: "authorize";
      extension: RemoteExtension;
      authorizationUrl: string;
    };

/**
 * A second click or a second card for the same app easily overlaps the
 * first. Overlapping requests for one account and app share one attempt.
 */
const inFlight = new Map<string, Promise<ConnectResult>>();

function isCoreConflict(error: unknown) {
  return error instanceof CoreHostRequestError && error.status === 409;
}

async function ensureInstalled(
  core: VoxCoreHostClient,
  accountId: string,
  plugin: CatalogPlugin,
): Promise<RemoteExtension> {
  const findInstalled = async () =>
    (await core.listExtensions(accountId)).find(
      (ext) =>
        ext.external_key === plugin.id && ext.lifecycle_state !== "removed",
    );
  const existing = await findInstalled();
  if (existing) return existing;
  try {
    return await core.installExtension(accountId, {
      external_key: plugin.id,
      display_name: plugin.displayName,
      protocol: "mcp",
      endpoint_url: plugin.endpointUrl,
      operator: {
        operator_id: plugin.operator.operatorId,
        operator_name: plugin.operator.operatorName,
      },
      // The app's real tools are recorded by Core once the user connects.
      capabilities: [],
    });
  } catch (error) {
    // Core answers 409 when another request installed it first.
    if (!isCoreConflict(error)) throw error;
    const winner = await findInstalled();
    if (!winner) throw error;
    return winner;
  }
}

async function connect(
  core: VoxCoreHostClient,
  accountId: string,
  plugin: CatalogPlugin,
  redirectUri: string,
): Promise<ConnectResult> {
  const extension = await ensureInstalled(core, accountId, plugin);
  const status = await core.connectedAppsStatus(accountId);
  if (status.connected.some((c) => c.extension_id === extension.id)) {
    return { status: "connected", extension };
  }
  const start = await core.authorizeExtension(
    accountId,
    extension.id,
    redirectUri,
  );
  return {
    status: "authorize",
    extension,
    authorizationUrl: start.authorization_url,
  };
}

export async function POST(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { pluginId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.pluginId !== "string" || !body.pluginId) {
    return NextResponse.json(
      { error: "Plugin ID is required" },
      { status: 400 },
    );
  }
  const plugin = getCatalogPlugin(body.pluginId);
  if (!plugin) {
    return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
  }
  // The provider would reject Vox's callback after the user signs in.
  if (
    plugin.registration === "allowlisted" &&
    !APPROVED_APPS.includes(plugin.id)
  ) {
    return NextResponse.json(
      {
        error: `${plugin.displayName} hasn't approved Vox as a client yet.`,
        code: "provider_approval_required",
      },
      { status: 409 },
    );
  }

  const core = getCoreHostClient();
  if (!core) {
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  }

  const key = `${account.accountId}:${plugin.id}`;
  let attempt = inFlight.get(key);
  if (!attempt) {
    attempt = connect(
      core,
      account.accountId,
      plugin,
      connectedAppsRedirectUri(request),
    ).finally(() => inFlight.delete(key));
    inFlight.set(key, attempt);
  }

  try {
    return NextResponse.json(await attempt);
  } catch (error) {
    const code = error instanceof CoreHostRequestError ? error.code : undefined;
    return NextResponse.json(
      { error: connectErrorMessage(code), code },
      { status: 502 },
    );
  }
}
