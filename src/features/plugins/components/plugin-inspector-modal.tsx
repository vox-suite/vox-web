"use client";

import React from "react";
import { Dialog } from "radix-ui";
import {
  Check,
  Globe,
  KeyRound,
  Loader2,
  Plug,
  ShieldCheck,
  Unplug,
  X,
} from "lucide-react";
import { Badge, Button, Notice } from "@/components/ui";
import type { ConnectedAppTool } from "@/lib/consumer-auth/core-host-client";
import type { CatalogPlugin } from "../catalog";
import type { PluginConnection } from "../connection-state";
import {
  useConnectPlugin,
  useIsConnectingPlugin,
  useUninstallPlugin,
} from "../queries";
import { PluginLogo } from "./plugin-logo";

export interface PluginInspectorModalProps {
  plugin: CatalogPlugin | null;
  connection: PluginConnection;
  isOpen: boolean;
  onClose: () => void;
}

function toolBadge(tool: ConnectedAppTool): {
  label: string;
  tone: "neutral" | "accent" | "warning";
} {
  const policy =
    tool.policy ??
    (tool.read_only
      ? "read"
      : tool.asks_first === false
        ? "change"
        : "confirm");
  if (policy === "read") return { label: "Read", tone: "neutral" };
  if (policy === "change") return { label: "Makes changes", tone: "warning" };
  return { label: "Asks you first", tone: "accent" };
}

export function PluginInspectorModal({
  plugin,
  connection,
  isOpen,
  onClose,
}: PluginInspectorModalProps) {
  const connectMutation = useConnectPlugin();
  const uninstallMutation = useUninstallPlugin();
  const isConnecting = useIsConnectingPlugin(plugin?.id ?? "");

  if (!plugin) return null;

  const { state, extension, connection: live } = connection;
  const tools = live?.tools ?? [];
  const isDisconnecting =
    uninstallMutation.isPending &&
    uninstallMutation.variables === extension?.id;

  const handleDisconnect = () => {
    if (!extension) return;
    uninstallMutation.mutate(extension.id, { onSuccess: onClose });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-void-black/80 backdrop-blur-xs transition-opacity data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <Dialog.Content
          data-testid={`plugin-inspector-${plugin.id}`}
          className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-edge bg-ink p-6 shadow-xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 max-h-[90vh] overflow-y-auto"
        >
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
                  {state === "connected" && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-success-green/20 bg-success-green/10 px-2 py-0.5 text-xs font-medium text-success-green">
                      <Check className="size-3 stroke-[2.5]" />
                      Connected
                    </span>
                  )}
                </div>
                <Dialog.Description className="mt-0.5 text-xs text-smoke">
                  Official app by {plugin.publisher} · {plugin.category}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close"
                className="text-smoke hover:text-mist"
              >
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="space-y-6 pt-5">
            <p className="text-sm leading-relaxed text-mist">
              {plugin.description}
            </p>

            {state === "connected" ? (
              <div className="space-y-3">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-smoke">
                  <ShieldCheck className="size-3.5 text-ash" />
                  What Vox can use ({tools.length})
                </h4>
                {tools.length > 0 ? (
                  <div className="divide-y divide-border-edge rounded-xl border border-border-edge bg-obsidian/50">
                    {tools.map((tool) => (
                      <div
                        key={tool.name}
                        className="flex items-start justify-between gap-3 p-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <span className="font-medium text-pure-white">
                            {tool.title || tool.name}
                          </span>
                          {tool.description && (
                            <p className="text-ash leading-relaxed line-clamp-3">
                              {tool.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          tone={toolBadge(tool).tone}
                          className="shrink-0 text-[10px] whitespace-nowrap"
                        >
                          {toolBadge(tool).label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-smoke">
                    {plugin.displayName} did not report any tools.
                  </p>
                )}
                <p className="text-[11px] leading-relaxed text-smoke">
                  This list comes from {plugin.displayName} itself. Vox asks you
                  before running anything marked “Asks you first”.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-smoke">
                    What Vox can help with
                  </h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-mist">
                    {plugin.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 rounded-xl border border-border-edge bg-obsidian/70 p-3.5 text-xs leading-relaxed text-ash">
                  <p className="flex items-center gap-1.5 font-medium text-mist">
                    <KeyRound className="size-3.5 text-ash" />
                    How connecting works
                  </p>
                  <p>
                    You sign in on {plugin.displayName}’s own page and choose
                    what to allow. Vox never sees your password. The access it
                    gets is stored encrypted, and Vox asks you before doing
                    anything that changes your {plugin.displayName} account. You
                    can disconnect at any time.
                  </p>
                </div>
              </>
            )}

            <div className="space-y-1 rounded-xl border border-border-edge bg-obsidian/40 p-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-mist">
                <Globe className="size-3.5 text-ash" />
                Official MCP server
              </span>
              <p className="font-mono text-ash break-all select-all">
                {plugin.endpointUrl}
              </p>
            </div>

            {connectMutation.isError && (
              <Notice title="Couldn't connect" tone="error">
                {connectMutation.error.message}
              </Notice>
            )}
            {uninstallMutation.isError && (
              <Notice title="Couldn't disconnect" tone="error">
                {uninstallMutation.error.message}
              </Notice>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border-edge pt-4">
            <div className="flex items-center gap-2">
              {state !== "connected" && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isConnecting}
                  onClick={() => connectMutation.mutate(plugin.id)}
                  className="gap-1.5"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Opening {plugin.displayName}…</span>
                    </>
                  ) : (
                    <>
                      <Plug className="size-3.5" />
                      <span>
                        {state === "incomplete"
                          ? "Finish connecting"
                          : `Connect ${plugin.displayName}`}
                      </span>
                    </>
                  )}
                </Button>
              )}
              {extension && (
                <Button
                  variant={state === "connected" ? "destructive" : "ghost"}
                  size="sm"
                  disabled={isDisconnecting}
                  onClick={handleDisconnect}
                  className="gap-1.5"
                >
                  {isDisconnecting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Unplug className="size-3.5" />
                  )}
                  <span>{state === "connected" ? "Disconnect" : "Remove"}</span>
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
