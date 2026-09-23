"use client";

import React from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Play,
  Pause,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFitView: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onExportSvg?: () => void;
}

export function Toolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onFitView,
  isSimulating,
  onToggleSimulation,
  onExportSvg,
}: ToolbarProps) {
  return (
    <div className="pointer-events-auto absolute bottom-6 right-6 z-20 flex items-center gap-1.5 rounded-md border border-border-edge bg-ink p-1.5 shadow-subtle-3">
      <button
        onClick={onToggleSimulation}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-xs font-semibold transition-all",
          isSimulating
            ? "border-coral-pulse bg-coral-pulse text-pure-white"
            : "border-border-edge bg-obsidian text-mist hover:border-smoke hover:bg-graphite hover:text-pure-white",
        )}
        title={isSimulating ? "Pause Simulation" : "Simulate Flow Trace"}
      >
        {isSimulating ? (
          <Pause size={13} />
        ) : (
          <Play size={13} fill="currentColor" />
        )}
        <span>{isSimulating ? "PAUSE" : "SIMULATE"}</span>
      </button>

      <div className="mx-0.5 h-4 w-px bg-slate" />

      <div className="flex items-center rounded-md border border-border-edge bg-obsidian px-1 py-0.5">
        <button
          onClick={onZoomOut}
          className="rounded-md p-1 text-ash transition-colors hover:bg-graphite hover:text-pure-white"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <span className="w-11 select-none text-center font-mono text-[11px] font-medium text-pure-white">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="rounded-md p-1 text-ash transition-colors hover:bg-graphite hover:text-pure-white"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
      </div>

      <button
        onClick={onFitView}
        className="rounded-md border border-transparent p-1.5 text-ash transition-colors hover:border-border-edge hover:bg-obsidian hover:text-pure-white"
        title="Fit View"
        aria-label="Fit View"
      >
        <Maximize2 size={15} />
      </button>

      <button
        onClick={onResetView}
        className="rounded-md border border-transparent p-1.5 text-ash transition-colors hover:border-border-edge hover:bg-obsidian hover:text-pure-white"
        title="Reset View"
        aria-label="Reset View"
      >
        <RotateCcw size={15} />
      </button>

      {onExportSvg && (
        <>
          <div className="mx-0.5 h-4 w-px bg-slate" />
          <button
            onClick={onExportSvg}
            className="rounded-md border border-transparent p-1.5 text-ash transition-colors hover:border-border-edge hover:bg-obsidian hover:text-pure-white"
            title="Export SVG"
            aria-label="Export SVG"
          >
            <Download size={15} />
          </button>
        </>
      )}
    </div>
  );
}
