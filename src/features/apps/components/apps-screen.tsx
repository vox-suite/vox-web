"use client";

import { useState } from "react";
import { PageHeader } from "@/components/app";
import { ConnectionsPanel } from "@/features/connections/components/connections-panel";
import { ExtensionsPanel } from "@/features/extensions/components/extensions-panel";
import { GrantsPanel } from "@/features/grants/components/grants-panel";
import { SkillsPanel } from "@/features/skills/components/skills-panel";

export function AppsScreen() {
  const [view, setView] = useState<"plugins" | "skills">("plugins");

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
          <ExtensionsPanel id="apps" />
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
