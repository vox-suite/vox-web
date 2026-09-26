"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLUGIN_CATALOG, type CatalogPlugin } from "../catalog";
import { usePluginConnections } from "../connection-state";
import { PluginLogo } from "./plugin-logo";
import { PluginInspectorModal } from "./plugin-inspector-modal";

export interface InstalledPluginsDockProps {
  onInspect?: (plugin: CatalogPlugin) => void;
  className?: string;
}

/** The apps the user has connected, with a shortcut to each one's details. */
export function InstalledPluginsDock({
  onInspect,
  className,
}: InstalledPluginsDockProps) {
  const [inspected, setInspected] = useState<CatalogPlugin | null>(null);
  const connectionOf = usePluginConnections();

  const connected = PLUGIN_CATALOG.filter(
    (plugin) => connectionOf(plugin).state === "connected",
  );

  const handleInspect = (plugin: CatalogPlugin) => {
    onInspect?.(plugin);
    setInspected(plugin);
  };

  if (connected.length === 0) {
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
            <p className="font-medium text-mist">No apps connected yet</p>
            <p className="text-[11px] text-smoke">
              Connect an app below with your own account and Vox can use it when
              you ask.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const toolCount = connected.reduce(
    (sum, plugin) => sum + (connectionOf(plugin).connection?.tools.length ?? 0),
    0,
  );

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
            Connected apps
          </span>
          <span className="text-[11px] text-smoke">
            {connected.length} {connected.length === 1 ? "app" : "apps"} ·{" "}
            {toolCount} {toolCount === 1 ? "tool" : "tools"}
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto py-0.5">
          {connected.map((plugin) => (
            <button
              key={plugin.id}
              type="button"
              onClick={() => handleInspect(plugin)}
              title={`${plugin.displayName} · Connected`}
              aria-label={`${plugin.displayName} connected`}
              className="group relative flex items-center justify-center rounded-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ash/50"
            >
              <PluginLogo
                logoFile={plugin.logoFile}
                alt={plugin.displayName}
                size="md"
                backgroundColor={plugin.backgroundColor}
              />
              <span
                className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-void-black bg-success-green shadow-xs"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>

      <PluginInspectorModal
        plugin={inspected}
        connection={inspected ? connectionOf(inspected) : { state: "none" }}
        isOpen={Boolean(inspected)}
        onClose={() => setInspected(null)}
      />
    </>
  );
}
