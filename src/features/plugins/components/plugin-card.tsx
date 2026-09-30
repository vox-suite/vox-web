"use client";

import React from "react";
import { Check, Loader2, Plug, RotateCw } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { CatalogPlugin } from "../catalog";
import type { PluginConnection } from "../connection-state";
import { useIsConnectingPlugin } from "../queries";
import { PluginLogo } from "./plugin-logo";

export interface PluginCardProps {
  plugin: CatalogPlugin;
  connection: PluginConnection;
  onInspect?: (plugin: CatalogPlugin) => void;
  className?: string;
}

export function PluginCard({
  plugin,
  connection,
  onInspect,
  className,
}: PluginCardProps) {
  const isConnecting = useIsConnectingPlugin(plugin.id);
  const { state } = connection;
  const noAccount = plugin.metadata?.auth_mode === "none";

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting || !["none", "incomplete"].includes(state)) return;
    onInspect?.(plugin);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onInspect?.(plugin);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onInspect?.(plugin)}
        onKeyDown={handleKeyDown}
        data-testid={`plugin-card-${plugin.id}`}
        aria-label={`View ${plugin.displayName} details`}
        className={cn(
          "group relative flex items-center justify-between gap-3.5 rounded-2xl border border-border-edge bg-ink/80 p-4 transition-all duration-150 hover:border-ash/40 hover:bg-ink hover:shadow-subtle-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ash/50 cursor-pointer select-none",
          state === "reviewed" && "border-border-edge/60 bg-ink/60",
          className,
        )}
      >
        <PluginLogo
          logoFile={plugin.logoFile}
          alt={plugin.displayName}
          size="md"
          backgroundColor={plugin.backgroundColor}
        />

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

        <div
          className="shrink-0 flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {isConnecting ? (
            <div
              className="flex items-center gap-1.5 rounded-lg border border-border-edge bg-obsidian px-2.5 py-1.5 text-xs text-smoke"
              aria-live="polite"
            >
              <Loader2 className="size-3.5 animate-spin text-mist" />
              <span className="hidden sm:inline">
                Opening {plugin.displayName}…
              </span>
            </div>
          ) : state === "reviewed" ? (
            <span
              data-testid={`connected-badge-${plugin.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-success-green/20 bg-success-green/10 px-2 py-1 text-xs font-medium text-success-green"
            >
              <Check className="size-3.5 stroke-[2.5]" />
              <span>{noAccount ? "Installed" : "Account linked"}</span>
            </span>
          ) : state === "awaiting_review" || state === "unavailable" ? (
            <span className="inline-flex items-center rounded-lg border border-border-edge bg-obsidian px-2 py-1 text-xs font-medium text-ash">
              {state === "awaiting_review" ? "Awaiting review" : "Unavailable"}
            </span>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleConnect}
              aria-label={`${state === "incomplete" ? "Finish connecting" : noAccount ? "Install" : "Connect"} ${plugin.displayName}`}
              className="h-8 rounded-lg px-2.5 text-xs text-mist hover:text-pure-white hover:border-ash transition-colors"
            >
              {state === "incomplete" ? (
                <RotateCw className="size-3.5 stroke-[2.5]" />
              ) : (
                <Plug className="size-3.5 stroke-[2.5]" />
              )}
              <span>
                {state === "incomplete"
                  ? "Finish connecting"
                  : noAccount
                    ? "Install"
                    : "Connect"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
