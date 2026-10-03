"use client";

import React, { useMemo, useState } from "react";
import { ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Notice } from "@/components/ui";
import {
  PLUGIN_CATEGORIES,
  type CatalogPlugin,
  type PluginCategory,
} from "../catalog";
import { usePluginConnections } from "../connection-state";
import { usePluginCatalog } from "../queries";
import { PluginCard } from "./plugin-card";
import { PluginInspectorModal } from "./plugin-inspector-modal";

export interface PluginCatalogGridProps {
  onInspect?: (plugin: CatalogPlugin) => void;
  className?: string;
}

type FilterCategory = "All" | PluginCategory;

const FILTER_PILLS: FilterCategory[] = ["All", ...PLUGIN_CATEGORIES];

export function PluginCatalogGrid({
  onInspect,
  className,
}: PluginCatalogGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("All");
  const [inspectedPlugin, setInspectedPlugin] = useState<CatalogPlugin | null>(
    null,
  );

  const { data: catalog = [], isPending, error } = usePluginCatalog();
  const connectionOf = usePluginConnections();

  const matchesSearch = (plugin: CatalogPlugin, query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      plugin.displayName.toLowerCase().includes(q) ||
      plugin.tagline.toLowerCase().includes(q) ||
      plugin.description.toLowerCase().includes(q) ||
      plugin.publisher.toLowerCase().includes(q) ||
      plugin.category.toLowerCase().includes(q) ||
      plugin.highlights.some((h) => h.toLowerCase().includes(q))
    );
  };

  const handleInspect = (plugin: CatalogPlugin) => {
    onInspect?.(plugin);
    setInspectedPlugin(plugin);
  };

  const isFiltering =
    searchQuery.trim().length > 0 || selectedCategory !== "All";

  // Filtered list when searching or filtering by a specific category
  const filteredPlugins = useMemo(() => {
    return catalog.filter((plugin) => {
      if (selectedCategory === "Popular") {
        if (!plugin.isPopular) return false;
      } else if (selectedCategory !== "All") {
        if (plugin.category !== selectedCategory) return false;
      }
      return matchesSearch(plugin, searchQuery);
    });
  }, [catalog, selectedCategory, searchQuery]);

  return (
    <div
      data-testid="plugin-catalog-grid"
      className={cn("space-y-6", className)}
    >
      {/* Controls: Search Bar and Category Pills */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-smoke" />
          <input
            type="search"
            placeholder="Search connectors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border-edge bg-ink/90 py-2.5 pl-10 pr-9 text-sm text-pure-white placeholder-smoke transition-colors focus:border-ash focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-smoke hover:text-mist"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div
          role="group"
          aria-label="Filter by category"
          className="flex flex-wrap items-center gap-2"
        >
          {FILTER_PILLS.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ash/50",
                  isSelected
                    ? "bg-mist text-iron font-semibold shadow-xs"
                    : "border border-border-edge bg-ink/80 text-smoke hover:border-ash/40 hover:text-mist",
                )}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {isPending && (
        <p role="status" className="text-sm text-smoke">
          Loading reviewed connectors…
        </p>
      )}
      {error && (
        <Notice title="Connector catalog unavailable" tone="error">
          {error.message}
        </Notice>
      )}
      {!isPending && !error && catalog.length === 0 && (
        <p className="text-sm text-smoke">
          No reviewed connectors are available in this deployment.
        </p>
      )}
      {/* Grid Content */}
      {isFiltering ? (
        /* Filtered View */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-smoke">
            <span>
              {searchQuery.trim()
                ? `Results for "${searchQuery}"`
                : selectedCategory}
            </span>
            <span>
              {filteredPlugins.length}{" "}
              {filteredPlugins.length === 1 ? "app" : "apps"}
            </span>
          </div>

          {filteredPlugins.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              {filteredPlugins.map((plugin) => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  connection={connectionOf(plugin)}
                  onInspect={handleInspect}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border-edge bg-ink/40 p-8 text-center text-sm text-smoke">
              No apps match your search.
            </div>
          )}
        </div>
      ) : (
        /* Default Categorized Sections */
        <div className="space-y-8">
          {PLUGIN_CATEGORIES.map((category) => {
            const sectionPlugins = catalog.filter((plugin) => {
              if (category === "Popular") {
                return plugin.isPopular;
              }
              return plugin.category === category;
            });

            if (sectionPlugins.length === 0) return null;

            return (
              <section
                key={category}
                aria-label={category}
                className="space-y-3"
              >
                {/* Section Header */}
                <div className="flex items-center gap-1 text-sm font-semibold text-pure-white">
                  <span>{category}</span>
                  <ChevronRight className="size-4 text-smoke" />
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                  {sectionPlugins.map((plugin) => (
                    <PluginCard
                      key={`${category}-${plugin.id}`}
                      plugin={plugin}
                      connection={connectionOf(plugin)}
                      onInspect={handleInspect}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Inspector Modal */}
      <PluginInspectorModal
        plugin={inspectedPlugin}
        connection={
          inspectedPlugin ? connectionOf(inspectedPlugin) : { state: "none" }
        }
        isOpen={Boolean(inspectedPlugin)}
        onClose={() => setInspectedPlugin(null)}
      />
    </div>
  );
}
