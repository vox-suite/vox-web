import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import {
  getCatalogPlugin,
  type CatalogPlugin,
} from "@/features/plugins/catalog";
import {
  CoreHostRequestError,
  type VoxCoreHostClient,
} from "@/lib/consumer-auth/core-host-client";
import type {
  ExtensionCapability,
  ExtensionOperator,
  RemoteExtension,
} from "@/lib/consumer-auth/core-host-client";

/**
 * Installing an MCP plugin is one Core remote-extension install. Remote
 * extensions carry their own conformance/enablement lifecycle; they are not
 * external connections, so `/v1/capability-grants` rejects them with 403.
 */
type InstallResult = { extension: RemoteExtension };

/**
 * A second click or a second card for the same plugin easily overlaps the first.
 * Overlapping requests for one account and plugin share a single attempt.
 */
const inFlightInstalls = new Map<string, Promise<InstallResult>>();

function isCoreConflict(error: unknown) {
  return error instanceof CoreHostRequestError && error.status === 409;
}

async function installPlugin(
  core: VoxCoreHostClient,
  accountId: string,
  plugin: CatalogPlugin,
): Promise<InstallResult> {
  const findInstalled = async () =>
    (await core.listExtensions(accountId)).find(
      (ext) =>
        (ext.id === plugin.id || ext.external_key === plugin.id) &&
        ext.lifecycle_state !== "removed",
    );

  // Check existing extensions for idempotency
  let extension: RemoteExtension | undefined = await findInstalled();

  if (!extension) {
    const operator: ExtensionOperator = plugin.operator
      ? {
          operator_id:
            (plugin.operator as { operator_id?: string; operatorId?: string })
              .operator_id ||
            (plugin.operator as { operator_id?: string; operatorId?: string })
              .operatorId ||
            plugin.id,
          operator_name:
            (
              plugin.operator as {
                operator_name?: string;
                operatorName?: string;
              }
            ).operator_name ||
            (
              plugin.operator as {
                operator_name?: string;
                operatorName?: string;
              }
            ).operatorName ||
            plugin.publisher,
        }
      : {
          operator_id: plugin.id,
          operator_name: plugin.publisher,
        };

    const capabilities: ExtensionCapability[] = plugin.capabilities.map(
      (c) => ({
        external_key: c.name,
        display_name: c.description,
        effect: c.category === "write" ? "write" : "read",
        consequential: c.effectKind === "consequential_write",
      }),
    );

    try {
      extension = await core.installExtension(accountId, {
        external_key: plugin.id,
        display_name: plugin.displayName,
        protocol: "mcp",
        endpoint_url: plugin.endpointUrl,
        operator,
        capabilities,
      });
    } catch (error) {
      // Core answers 409 when this key is already installed for the account,
      // e.g. an install from another tab or server instance won the race.
      // That is the outcome we wanted, so continue with the existing one.
      if (!isCoreConflict(error)) throw error;
      extension = await findInstalled();
      if (!extension) throw error;
    }
  }

  return { extension };
}

export async function POST(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { pluginId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { pluginId } = body;
  if (!pluginId || typeof pluginId !== "string") {
    return NextResponse.json(
      { error: "Plugin ID is required" },
      { status: 400 },
    );
  }

  const plugin = getCatalogPlugin(pluginId);
  if (!plugin) {
    return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
  }

  const core = getCoreHostClient();
  if (!core) {
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  }

  const key = `${account.accountId}:${plugin.id}`;
  let attempt = inFlightInstalls.get(key);
  if (!attempt) {
    attempt = installPlugin(core, account.accountId, plugin).finally(() =>
      inFlightInstalls.delete(key),
    );
    inFlightInstalls.set(key, attempt);
  }

  try {
    const { extension } = await attempt;
    return NextResponse.json({ success: true, extension });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to install plugin",
      },
      { status: 500 },
    );
  }
}
