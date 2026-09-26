"use client";

import React from "react";
import { Check, Loader2, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { RemoteExtension } from "@/lib/consumer-auth/core-host-client";
import type { CatalogPlugin } from "../catalog";
import { useInstallPlugin } from "../queries";
import { PluginLogo } from "./plugin-logo";

export interface PluginCardProps {
  plugin: CatalogPlugin;
  installedExtension?: RemoteExtension | null;
  onInspect?: (plugin: CatalogPlugin) => void;
  className?: string;
}

export function PluginCard({
  plugin,
  installedExtension,
  onInspect,
  className,
}: PluginCardProps) {
  const installMutation = useInstallPlugin();

  const isInstalled = Boolean(
    installedExtension && installedExtension.lifecycle_state !== "removed",
  );

  const isInstalling =
    installMutation.isPending &&
    (installMutation.variables === plugin.id ||
      (typeof installMutation.variables === "object" &&
        installMutation.variables?.pluginId === plugin.id));

  const handleInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstalling || isInstalled) return;
    installMutation.mutate(plugin.id);
  };

  const handleCardClick = () => {
    onInspect?.(plugin);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onInspect?.(plugin);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      data-testid={`plugin-card-${plugin.id}`}
      aria-label={`View ${plugin.displayName} details`}
      className={cn(
        "group relative flex items-center justify-between gap-3.5 rounded-2xl border border-border-edge bg-ink/80 p-4 transition-all duration-150 hover:border-ash/40 hover:bg-ink hover:shadow-subtle-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ash/50 cursor-pointer select-none",
        isInstalled && "border-border-edge/60 bg-ink/60",
        className,
      )}
    >
      {/* Left: Brand Logo */}
      <PluginLogo
        logoFile={plugin.logoFile}
        alt={plugin.displayName}
        size="md"
        backgroundColor={plugin.backgroundColor}
      />

      {/* Center: Title, Publisher/Category, Tagline */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-pure-white group-hover:text-mist transition-colors">
            {plugin.displayName}
          </h3>
          {plugin.isPopular && (
            <span className="rounded bg-graphite/60 px-1.5 py-0.5 text-[10px] font-medium text-ash">
              Popular
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-smoke truncate">
          {plugin.publisher} · {plugin.category}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ash">
          {plugin.tagline}
        </p>
      </div>

      {/* Right: 1-Click Install / Status Action */}
      <div className="shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {isInstalling ? (
          <div
            className="flex items-center gap-1.5 rounded-lg border border-border-edge bg-obsidian px-2.5 py-1.5 text-xs text-smoke"
            aria-live="polite"
          >
            <Loader2 className="size-3.5 animate-spin text-mist" />
            <span className="hidden sm:inline">Installing…</span>
          </div>
        ) : isInstalled ? (
          <div className="flex items-center gap-1">
            <span
              data-testid={`installed-badge-${plugin.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-success-green/20 bg-success-green/10 px-2 py-1 text-xs font-medium text-success-green"
            >
              <Check className="size-3.5 stroke-[2.5]" />
              <span>Installed</span>
            </span>
            {onInspect && (
              <button
                type="button"
                onClick={() => onInspect(plugin)}
                aria-label={`Options for ${plugin.displayName}`}
                className="flex size-7 items-center justify-center rounded-md text-smoke hover:bg-obsidian hover:text-mist transition-colors focus-visible:outline-2 focus-visible:outline-mist"
              >
                <MoreHorizontal className="size-4" />
              </button>
            )}
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleInstall}
            aria-label={`Install ${plugin.displayName}`}
            className="h-8 rounded-lg px-2.5 text-xs text-mist hover:text-pure-white hover:border-ash transition-colors"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>Install</span>
          </Button>
        )}
      </div>
    </div>
  );
}
