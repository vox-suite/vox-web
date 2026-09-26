"use client";

import React from "react";
import { Dialog } from "radix-ui";
import { Check, Globe, Loader2, ShieldCheck, Trash2, X, Zap } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { RemoteExtension } from "@/lib/consumer-auth/core-host-client";
import type { CatalogPlugin } from "../catalog";
import { useInstallPlugin, useUninstallPlugin } from "../queries";
import { PluginLogo } from "./plugin-logo";

export interface PluginInspectorModalProps {
  plugin: CatalogPlugin | null;
  installedExtension?: RemoteExtension | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PluginInspectorModal({
  plugin,
  installedExtension,
  isOpen,
  onClose,
}: PluginInspectorModalProps) {
  const installMutation = useInstallPlugin();
  const uninstallMutation = useUninstallPlugin();

  if (!plugin) return null;

  const isInstalled = Boolean(
    installedExtension && installedExtension.lifecycle_state !== "removed",
  );

  const isUninstalling =
    uninstallMutation.isPending &&
    (uninstallMutation.variables === installedExtension?.id ||
      uninstallMutation.variables === plugin.id);

  const isInstalling =
    installMutation.isPending &&
    (installMutation.variables === plugin.id ||
      (typeof installMutation.variables === "object" &&
        installMutation.variables?.pluginId === plugin.id));

  const handleUninstall = () => {
    const targetId = installedExtension?.id || plugin.id;
    uninstallMutation.mutate(targetId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleInstall = () => {
    installMutation.mutate(plugin.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-void-black/80 backdrop-blur-xs transition-opacity data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          data-testid={`plugin-inspector-${plugin.id}`}
          className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-edge bg-ink p-6 shadow-xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border-edge pb-5">
            <div className="flex items-center gap-3.5 min-w-0">
              <PluginLogo
                logoFile={plugin.logoFile}
                alt={plugin.displayName}
                size="lg"
                backgroundColor={plugin.backgroundColor}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Dialog.Title className="truncate text-lg font-semibold text-pure-white">
                    {plugin.displayName}
                  </Dialog.Title>
                  {isInstalled && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-success-green/20 bg-success-green/10 px-2 py-0.5 text-xs font-medium text-success-green">
                      <Check className="size-3 stroke-[2.5]" />
                      Installed
                    </span>
                  )}
                  {plugin.isPopular && (
                    <span className="rounded bg-graphite/60 px-1.5 py-0.5 text-[10px] font-medium text-ash">
                      Popular
                    </span>
                  )}
                </div>
                <Dialog.Description className="mt-0.5 text-xs text-smoke">
                  Published by {plugin.publisher} · {plugin.category}
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close inspector"
                className="text-smoke hover:text-mist"
              >
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="space-y-6 pt-5">
            {/* Description & Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-smoke">
                About this plugin
              </h4>
              <p className="text-sm leading-relaxed text-mist">
                {plugin.description}
              </p>
            </div>

            {/* Service Endpoint & Protocol */}
            <div className="space-y-2 rounded-xl border border-border-edge bg-obsidian/70 p-3.5 text-xs">
              <div className="flex items-center justify-between text-smoke">
                <span className="flex items-center gap-1.5 font-medium text-mist">
                  <Globe className="size-3.5 text-ash" />
                  Service Endpoint
                </span>
                <span className="font-mono uppercase text-[11px] text-ash">
                  {plugin.protocol ?? "mcp"} protocol
                </span>
              </div>
              <p className="font-mono text-ash break-all select-all">
                {plugin.endpointUrl}
              </p>
            </div>

            {/* Capabilities Granted */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-smoke">
                  <ShieldCheck className="size-3.5 text-ash" />
                  Agent Capabilities ({plugin.capabilities.length})
                </h4>
                <span className="text-[11px] text-smoke">
                  Granted upon install
                </span>
              </div>

              <div className="divide-y divide-border-edge rounded-xl border border-border-edge bg-obsidian/50">
                {plugin.capabilities.map((cap) => {
                  const isConsequential =
                    cap.effectKind === "consequential_write";

                  return (
                    <div
                      key={cap.name}
                      className="flex items-start justify-between gap-3 p-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-pure-white">
                            {cap.name}
                          </span>
                        </div>
                        <p className="text-ash leading-relaxed">
                          {cap.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <Badge
                          variant={
                            cap.category === "write"
                              ? "default"
                              : "secondary"
                          }
                          tone={
                            cap.category === "write"
                              ? "warning"
                              : "neutral"
                          }
                          className="capitalize text-[10px]"
                        >
                          {cap.category}
                        </Badge>
                        {isConsequential && (
                          <Badge
                            tone="accent"
                            className="text-[10px] whitespace-nowrap"
                          >
                            Requires Approval
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-between border-t border-border-edge pt-4">
            <div>
              {isInstalled ? (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isUninstalling}
                  onClick={handleUninstall}
                  aria-label={`Uninstall ${plugin.displayName}`}
                  className="gap-1.5"
                >
                  {isUninstalling ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Uninstalling…</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-3.5" />
                      <span>Uninstall Plugin</span>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isInstalling}
                  onClick={handleInstall}
                  aria-label={`Install ${plugin.displayName}`}
                  className="gap-1.5"
                >
                  {isInstalling ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Installing…</span>
                    </>
                  ) : (
                    <>
                      <Zap className="size-3.5" />
                      <span>Install Plugin</span>
                    </>
                  )}
                </Button>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="text-ash hover:text-pure-white"
            >
              Close
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
