"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RemoteExtension } from "@/lib/consumer-auth/core-host-client";
import {
  PLUGIN_CATALOG,
  getCatalogPlugin,
  type CatalogPlugin,
} from "../catalog";
import { useExtensions } from "@/features/extensions/queries";
import { PluginLogo } from "./plugin-logo";
import { PluginInspectorModal } from "./plugin-inspector-modal";

export interface InstalledPluginsDockProps {
  onInspect?: (plugin: CatalogPlugin, extension: RemoteExtension) => void;
  className?: string;
}

function resolvePlugin(ext: RemoteExtension): CatalogPlugin {
  const found =
    getCatalogPlugin(ext.external_key) ||
    getCatalogPlugin(ext.id) ||
    PLUGIN_CATALOG.find(
      (p) =>
        p.displayName.toLowerCase() === ext.display_name.toLowerCase() ||
        p.brandKey?.toLowerCase() === ext.external_key.toLowerCase(),
    );

  if (found) return found;

  return {
    id: ext.external_key || ext.id,
    displayName: ext.display_name,
    tagline: `MCP service at ${ext.endpoint_url}`,
    description: `Active MCP extension configured at ${ext.endpoint_url}.`,
    category: "Lifestyle & Essentials",
    isPopular: false,
    logoFile: "",
    backgroundColor: "#111214",
    capabilities: (ext.capabilities ?? []).map((c) => ({
      name: c.external_key,
      description: c.display_name,
      category: c.effect === "write" ? "write" : "read",
      effectKind: c.consequential ? "consequential_write" : "read",
    })),
    endpointUrl: ext.endpoint_url,
    authType: "none",
    publisher: ext.operator?.operator_name || "Custom Extension",
    rating: 5.0,
    installsCount: 1,
  };
}

export function InstalledPluginsDock({
  onInspect,
  className,
}: InstalledPluginsDockProps) {
  const [inspected, setInspected] = useState<{
    plugin: CatalogPlugin;
    ext: RemoteExtension;
  } | null>(null);

  const { data: extensions = [], isLoading } = useExtensions();

  const activeExtensions = extensions.filter(
    (ext) => ext.lifecycle_state !== "removed",
  );

  const handleInspect = (plugin: CatalogPlugin, ext: RemoteExtension) => {
    onInspect?.(plugin, ext);
    setInspected({ plugin, ext });
  };

  if (!isLoading && activeExtensions.length === 0) {
    return (
      <div
        data-testid="installed-plugins-dock-empty"
        className={cn(
          "flex items-center justify-between rounded-2xl border border-dashed border-border-edge bg-ink/40 px-4 py-3 text-xs text-smoke",
          className,
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg border border-border-edge bg-obsidian text-ash">
            <Sparkles className="size-3.5" />
          </div>
          <div>
            <p className="font-medium text-mist">No plugins installed yet</p>
            <p className="text-[11px] text-smoke">
              Install everyday apps below to grant tools and capabilities to
              your assistant.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        data-testid="installed-plugins-dock"
        className={cn(
          "flex items-center gap-3 overflow-x-auto rounded-2xl border border-border-edge bg-ink/70 px-4 py-3 backdrop-blur shadow-subtle-3",
          className,
        )}
      >
        <div className="flex flex-col shrink-0 pr-3 border-r border-border-edge">
          <span className="text-xs font-semibold text-pure-white">
            Installed Apps
          </span>
          <span className="text-[11px] text-smoke">
            {activeExtensions.length} active{" "}
            {activeExtensions.length === 1 ? "tool" : "tools"}
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto py-0.5">
          {activeExtensions.map((ext) => {
            const plugin = resolvePlugin(ext);
            const isQuarantined = ext.lifecycle_state === "quarantined";

            return (
              <button
                key={ext.id}
                type="button"
                onClick={() => handleInspect(plugin, ext)}
                title={`${plugin.displayName} · ${isQuarantined ? "Quarantined" : "Active"}`}
                aria-label={`Inspect ${plugin.displayName} (${isQuarantined ? "quarantined" : "active"})`}
                className="group relative flex items-center justify-center rounded-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ash/50"
              >
                <PluginLogo
                  logoFile={plugin.logoFile}
                  alt={plugin.displayName}
                  size="md"
                  backgroundColor={plugin.backgroundColor}
                />
                <span
                  className={cn(
                    "absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-void-black shadow-xs",
                    isQuarantined ? "bg-amber-400" : "bg-success-green",
                  )}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>

      <PluginInspectorModal
        plugin={inspected?.plugin ?? null}
        installedExtension={inspected?.ext ?? null}
        isOpen={Boolean(inspected)}
        onClose={() => setInspected(null)}
      />
    </>
  );
}
