"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app";
import { ConnectionsPanel } from "@/features/connections/components/connections-panel";
import { ExtensionsPanel } from "@/features/extensions/components/extensions-panel";
import { GrantsPanel } from "@/features/grants/components/grants-panel";
import { SkillsPanel } from "@/features/skills/components/skills-panel";
import {
  InstalledPluginsDock,
  PluginCatalogGrid,
} from "@/features/plugins/components";

export function AppsScreen() {
  const [view, setView] = useState<"plugins" | "skills">("plugins");
  const [source, setSource] = useState<"public" | "personal">("public");

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div
          role="group"
          aria-label="Apps and skills"
          className="inline-flex rounded-full border border-border-edge bg-ink p-1"
        >
          <button
            type="button"
            aria-pressed={view === "plugins"}
            onClick={() => setView("plugins")}
            className={`rounded-full px-8 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist ${view === "plugins" ? "bg-graphite text-pure-white" : "text-smoke hover:text-mist"}`}
          >
            Plugins
          </button>
          <button
            type="button"
            aria-pressed={view === "skills"}
            onClick={() => setView("skills")}
            className={`rounded-full px-8 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist ${view === "skills" ? "bg-graphite text-pure-white" : "text-smoke hover:text-mist"}`}
          >
            Skills
          </button>
        </div>
      </div>
      <PageHeader
        title={view === "plugins" ? "Plugins" : "Skills"}
        description={
          view === "plugins"
            ? "Save MCP servers and review account access. Agents can use a service after it is connected and granted."
            : "Install reusable guidance and choose which agent can load it."
        }
      />
      {view === "plugins" ? (
        <div className="space-y-8">
          <InstalledPluginsDock />

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border-edge pb-4">
              <div
                role="group"
                aria-label="Plugin source"
                className="inline-flex rounded-lg border border-border-edge bg-ink/60 p-1"
              >
                <button
                  type="button"
                  aria-pressed={source === "public"}
                  onClick={() => setSource("public")}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-mist ${
                    source === "public"
                      ? "bg-graphite text-pure-white shadow-xs"
                      : "text-smoke hover:text-mist"
                  }`}
                >
                  Public
                </button>
                <button
                  type="button"
                  aria-pressed={source === "personal"}
                  onClick={() => setSource("personal")}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-mist ${
                    source === "personal"
                      ? "bg-graphite text-pure-white shadow-xs"
                      : "text-smoke hover:text-mist"
                  }`}
                >
                  Personal
                </button>
              </div>
              <p className="text-xs text-smoke hidden sm:block">
                {source === "public"
                  ? "1-click install official consumer integrations"
                  : "Register custom or internal Model Context Protocol servers"}
              </p>
            </div>

            {source === "public" ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-pure-white">
                    Public plugin catalog
                  </h2>
                  <p className="text-xs text-smoke">
                    Explore and install certified everyday tools for your
                    assistant
                  </p>
                </div>
                <PluginCatalogGrid />
              </div>
            ) : (
              <ExtensionsPanel id="apps" />
            )}
          </div>

          <details className="group border-t border-border-edge pt-5">
            <summary className="cursor-pointer list-none text-sm font-medium text-mist hover:text-pure-white focus-visible:outline-2 focus-visible:outline-mist">
              Connected accounts and agent access
              <span
                aria-hidden="true"
                className="ml-2 text-smoke group-open:hidden"
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="ml-2 hidden text-smoke group-open:inline"
              >
                −
              </span>
            </summary>
            <div className="mt-5 grid gap-6 xl:grid-cols-2">
              <ConnectionsPanel id="accounts" />
              <GrantsPanel id="access" />
            </div>
          </details>
        </div>
      ) : (
        <div>
          <SkillsPanel id="skills" />
        </div>
      )}
    </div>
  );
}
