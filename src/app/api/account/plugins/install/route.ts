import { NextRequest, NextResponse } from "next/server";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";
import { getCatalogPlugin } from "@/features/plugins/catalog";
import type {
  ExtensionCapability,
  ExtensionOperator,
  CapabilityGrant,
  RemoteExtension,
} from "@/lib/consumer-auth/core-host-client";

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

  try {
    // Check existing extensions for idempotency
    const existingExtensions = await core.listExtensions(account.accountId);
    let extension: RemoteExtension | undefined = existingExtensions.find(
      (ext) =>
        (ext.id === plugin.id || ext.external_key === plugin.id) &&
        ext.lifecycle_state !== "removed",
    );
    let isNewInstall = false;

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

      extension = await core.installExtension(account.accountId, {
        external_key: plugin.id,
        display_name: plugin.displayName,
        protocol: "mcp",
        endpoint_url: plugin.endpointUrl,
        operator,
        capabilities,
      });
      isNewInstall = true;
    }

    // Resolve active agent key (e.g. from core.selectedAgents(account.accountId) or fallback "saathi")
    let agentKey = "saathi";
    try {
      const agents = await core.selectedAgents(account.accountId);
      if (agents && agents.length > 0 && agents[0].definition?.external_key) {
        agentKey = agents[0].definition.external_key;
      }
    } catch {
      agentKey = "saathi";
    }

    // Create capability grants for all declared capabilities
    const grants: CapabilityGrant[] = [];
    try {
      const existingGrants = await core
        .listEffectiveGrants(account.accountId, agentKey)
        .catch(() => []);

      for (const cap of plugin.capabilities) {
        const existingGrant = existingGrants.find(
          (g) =>
            g.connection_id === extension!.id &&
            g.capability_external_key === cap.name,
        );

        if (existingGrant) {
          grants.push(existingGrant);
        } else {
          const grant = await core.createGrant(account.accountId, {
            agent_external_key: agentKey,
            connection_id: extension!.id,
            capability_external_key: cap.name,
          });
          grants.push(grant);
        }
      }
    } catch (grantError) {
      if (isNewInstall && extension?.id) {
        await core
          .removeExtension(account.accountId, extension.id)
          .catch(() => {});
      }
      throw grantError;
    }

    return NextResponse.json({ success: true, extension, grants });
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
